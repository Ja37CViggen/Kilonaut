/**
 * NASA Junior Astronaut Academy - Cosmo's Space Radio Comms
 * Interactive child-safe astronaut radio uplink with Gemini AI backend & offline fallback.
 */

class CosmoRadioManager {
  constructor() {
    this.modal = null;
    this.isOpen = false;
    this.isAsking = false;
  }

  init() {
    this.modal = document.getElementById('cosmo-modal');
    if (!this.modal) return;

    // Close buttons
    this.modal.querySelectorAll('.close-cosmo-modal').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    // Close on backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Send button
    const sendBtn = document.getElementById('cosmo-send-btn');
    const input = document.getElementById('cosmo-input');
    const voiceBtn = document.getElementById('cosmo-voice-btn');

    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) {
          this.ask(text);
          input.value = '';
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const text = input.value.trim();
          if (text) {
            this.ask(text);
            input.value = '';
          }
        }
      });
    }

    // Voice recognition button
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        window.cosmicAudio.playClick();
        const lang = window.cadetState.state.lang;
        const statusEl = document.getElementById('cosmo-status');

        if (statusEl) {
          statusEl.textContent = window.t('cosmoStatusListening');
          statusEl.className = 'text-xs font-mono text-cyan-400 animate-pulse';
        }

        window.cosmicSpeech.listen(
          lang,
          (transcript) => {
            if (input) input.value = transcript;
            if (statusEl) statusEl.textContent = window.t('cosmoStatusReady');
            this.ask(transcript);
          },
          (err) => {
            console.warn('Voice recognition error:', err);
            if (statusEl) statusEl.textContent = window.t('cosmoStatusReady');
          }
        );
      });
    }

    // Quick prompt chips
    this.bindQuickChips();
  }

  bindQuickChips() {
    const container = document.getElementById('cosmo-quick-chips');
    if (!container) return;

    const lang = window.cadetState.state.lang;
    const isAr = lang === 'ar';
    const chips = isAr ? [
      "لماذا يبدو المريخ أحمراً؟",
      "هل يمكن لثقب أسود أن يبتلع الشمس؟",
      "كيف تتكون النجوم في الفضاء؟",
      "ما هي المنطقة الصالحة للحياة؟",
      "لماذا يمتلك زحل تلك الحلقات المذهلة؟"
    ] : [
      "Why is Mars red?",
      "Can a black hole swallow the Sun?",
      "How are stars born?",
      "What is the Goldilocks zone?",
      "Why does Saturn have rings?"
    ];

    container.innerHTML = chips.map(q => `
      <button class="quick-chip px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-900 border border-slate-700 hover:border-cyan-500 rounded-full text-xs text-cyan-300 font-medium transition text-left rtl:text-right">
        📡 ${q}
      </button>
    `).join('');

    container.querySelectorAll('.quick-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.textContent.replace('📡', '').trim();
        window.cosmicAudio.playClick();
        this.ask(query);
      });
    });
  }

  openModal() {
    if (!this.modal) this.init();
    this.modal.classList.remove('hidden');
    this.isOpen = true;
    window.cosmicAudio.playThruster();
    this.bindQuickChips();

    const input = document.getElementById('cosmo-input');
    if (input) setTimeout(() => input.focus(), 100);
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    this.isOpen = false;
    window.cosmicSpeech.stop();
  }

  async ask(question) {
    if (this.isAsking || !question.trim()) return;
    this.isAsking = true;

    const lang = window.cadetState.state.lang;
    const isAr = lang === 'ar';
    const log = document.getElementById('cosmo-dialogue-log');
    const statusEl = document.getElementById('cosmo-status');
    const cosmoAvatar = document.getElementById('cosmo-avatar-img');

    // Display user question
    if (log) {
      const userBubble = document.createElement('div');
      userBubble.className = 'flex items-start gap-3 justify-end';
      userBubble.innerHTML = `
        <div class="p-3 bg-cyan-950/80 border border-cyan-500/60 rounded-2xl rounded-tr-none text-xs text-cyan-100 max-w-sm shadow">
          <div class="text-[10px] font-bold text-cyan-400 mb-0.5">${window.cadetState.state.callSign}</div>
          ${this.escapeHTML(question)}
        </div>
        <div class="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center text-sm shadow">
          🚀
        </div>
      `;
      log.appendChild(userBubble);
      log.scrollTop = log.scrollHeight;
    }

    if (statusEl) {
      statusEl.textContent = window.t('cosmoStatusSending');
      statusEl.className = 'text-xs font-mono text-amber-400 animate-pulse';
    }

    // Call /api/cosmo/ask
    let answerText = '';
    let source = 'curated';

    try {
      const res = await fetch('/api/cosmo/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, lang })
      });

      if (res.ok) {
        const data = await res.json();
        answerText = data.answer;
        source = data.source;
      } else {
        throw new Error('API server unavailable');
      }
    } catch (err) {
      console.warn('API error, switching to curated knowledge:', err);
      answerText = window.getCuratedCosmoAnswer(question, lang);
      source = 'curated-client';
    }

    if (statusEl) {
      statusEl.textContent = window.t('cosmoStatusReady');
      statusEl.className = 'text-xs font-mono text-emerald-400';
    }

    // Display Cosmo's answer
    if (log) {
      const cosmoBubble = document.createElement('div');
      cosmoBubble.className = 'flex items-start gap-3 justify-start';
      cosmoBubble.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-sm shadow animate-pulse">
          🤖
        </div>
        <div class="p-3 bg-purple-950/80 border border-purple-500/60 rounded-2xl rounded-tl-none text-xs text-purple-100 max-w-md shadow">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-purple-300">Cosmo AI • Mission Radio</span>
            <span class="text-[9px] px-1.5 py-0.5 bg-purple-900 border border-purple-600 rounded text-purple-300">${source.includes('gemini') ? 'Gemini 3.8 Flash' : 'Curated Science'}</span>
          </div>
          <p class="leading-relaxed">${this.escapeHTML(answerText)}</p>
          <div class="mt-2 pt-2 border-t border-purple-800/60 flex items-center gap-2">
            <button class="replay-speech-btn text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold">
              🔊 ${isAr ? 'إعادة القراءة' : 'Read Aloud'}
            </button>
            <button class="stop-speech-btn text-[10px] text-rose-400 hover:text-rose-300 font-bold">
              ⏹ ${isAr ? 'إيقاف' : 'Stop'}
            </button>
          </div>
        </div>
      `;

      log.appendChild(cosmoBubble);
      log.scrollTop = log.scrollHeight;

      // Bind speech replay & stop
      const replayBtn = cosmoBubble.querySelector('.replay-speech-btn');
      const stopBtn = cosmoBubble.querySelector('.stop-speech-btn');
      replayBtn.addEventListener('click', () => {
        window.cosmicSpeech.speak(answerText, lang);
      });
      stopBtn.addEventListener('click', () => {
        window.cosmicSpeech.stop();
      });
    }

    // Speak aloud automatically
    window.cosmicSpeech.speak(answerText, lang);
    this.isAsking = false;
  }

  escapeHTML(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
  }
}

window.cosmoRadio = new CosmoRadioManager();
