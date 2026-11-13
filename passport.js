/**
 * NASA Junior Astronaut Academy - Flight Log, Passport & Graduation Certificate
 * Displays earned NASA patches, flight stats, native share with copy fallback,
 * and a personalized printable Junior Astronaut Certificate.
 */

class PassportManager {
  constructor() {
    this.modal = null;
    this.isOpen = false;
  }

  init() {
    this.modal = document.getElementById('passport-modal');
    if (!this.modal) return;

    this.modal.querySelectorAll('.close-passport-modal').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    const shareBtn = document.getElementById('share-passport-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.handleShare());
    }

    const printBtn = document.getElementById('print-cert-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.cosmicAudio.playClick();
        window.print();
      });
    }

    const resetBtn = document.getElementById('reset-progress-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (window.astronautTraining && typeof window.astronautTraining._showResetConfirmationModal === 'function') {
          this.closeModal();
          window.astronautTraining._showResetConfirmationModal();
        } else {
          const lang = window.cadetState.state.lang;
          const confirmMsg = lang === 'ar'
            ? '⚠️ هل أنت متأكد من إعادة ضبط كل شيء والبدء من جديد؟'
            : '⚠️ Are you sure about resetting everything?';
          if (confirm(confirmMsg)) {
            window.cadetState.resetProgress();
            location.reload();
          }
        }
      });
    }
  }

  openModal() {
    if (!this.modal) this.init();
    this.render();
    this.modal.classList.remove('hidden');
    this.isOpen = true;
    window.cosmicAudio.playClick();
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    this.isOpen = false;
  }

  render() {
    const state = window.cadetState.state;
    const lang = state.lang;
    const isAr = lang === 'ar';
    const rankInfo = window.cadetState.getRank();
    const completedCount = window.cadetState.getCompletedCount();

    // Fill stats
    const callSignEl = document.getElementById('passport-callsign');
    const rankTitleEl = document.getElementById('passport-rank-title');
    const xpEl = document.getElementById('passport-xp-count');
    const missionsEl = document.getElementById('passport-missions-count');
    const rankBarEl = document.getElementById('passport-rank-bar');

    if (callSignEl) callSignEl.textContent = state.callSign;
    if (rankTitleEl) rankTitleEl.textContent = isAr ? rankInfo.current.titleAr : rankInfo.current.titleEn;
    if (xpEl) xpEl.textContent = `${state.xp || 0} XP`;
    if (missionsEl) missionsEl.textContent = `${completedCount} / 9`;
    if (rankBarEl) rankBarEl.style.width = `${rankInfo.progressPercent}%`;

    // Render Patches Grid
    const patchesContainer = document.getElementById('passport-patches-grid');
    if (patchesContainer) {
      const allStages = [];
      window.ACADEMY_SECTORS.forEach(sec => {
        sec.stages.forEach(st => allStages.push(st));
      });

      const trainingBadges = [
        {
          id: 'weightlessness',
          icon: '🪐',
          nameEn: 'Inertia & Microgravity Master',
          nameAr: 'خبير القصور الذاتي وانعدام الوزن',
          descEn: 'Mastered Newton’s 1st Law: objects in motion remain in motion indefinitely in zero-g.',
          descAr: 'أتقن قانون نيوتن الأول: استمرار حركة الأجسام في المدار بدون احتكاك.'
        },
        {
          id: 'spacesuit',
          icon: '👨‍🚀',
          nameEn: 'EVA Spacesuit Specialist',
          nameAr: 'مهندس بدلات السير الفضائي',
          descEn: 'Assembled 6-layer EMU suit, completed 100% O2 pre-breathe, and 4.3 PSI leak check.',
          descAr: 'ركّب طبقات بدلة EMU الست وأتم تنفس الأكسجين النقي وفحص الضغط.'
        },
        {
          id: 'stationDay',
          icon: '🛰️',
          nameEn: 'ISS Daily Life Specialist',
          nameAr: 'أخصائي روتين المحطة الفضائية',
          descEn: 'Simulated zero-g sleep with airflow fans, T2 countermeasure workout, and space dining.',
          descAr: 'حاكى النوم الآمن بالتهوية، والتمارين الإلزامية، وتناول طعام الفضاء.'
        },
        {
          id: 'emergency',
          icon: '🚨',
          nameEn: 'Crisis Flight Commander',
          nameAr: 'قائد إدارة طوارئ الفضاء',
          descEn: 'Resolved orbital depressurization, ammonia leak, avionics fire, and space debris.',
          descAr: 'تصدى لطوارئ انخفاض الضغط، وتسرب الأمونيا، وحريق الكابينة، وحطام الفضاء.'
        },
        {
          id: 'teamwork',
          icon: '🤝',
          nameEn: 'Crew Synchronization Lead',
          nameAr: 'خبير التنسيق والعمل الجماعي',
          descEn: 'Coordinated Read-and-Do checklists, dual-key switch resets, and spacewalk voice relays.',
          descAr: 'أدار قوائم القراءة المزدوجة، وتزامن مفاتيح الطاقة، وإرشاد السير الفضائي.'
        },
        {
          id: 'docking',
          icon: '🦾',
          nameEn: 'Canadarm2 Docking Ace',
          nameAr: 'قبطان الذراع الآلية والإرساء',
          descEn: 'Grappled visiting cargo spacecraft using precision mouse-controlled robotic end-effector.',
          descAr: 'التقط وثبت مركبة الشحن الفضائية القادمة بالذراع الآلية باستخدام الفأرة.'
        }
      ];

      const cosmicHTML = allStages.map(st => {
        const stageState = state.stages[st.id] || {};
        const isDone = stageState.completed;
        const badge = st.badge;
        const name = isAr ? badge.nameAr : badge.nameEn;
        const desc = isAr ? badge.descAr : badge.descEn;

        return `
          <div class="patch-card p-3 rounded-xl border ${isDone ? 'bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10' : 'bg-slate-900/60 border-slate-800 opacity-60'} flex flex-col items-center text-center">
            <div class="w-14 h-14 rounded-full ${isDone ? 'bg-amber-500/20 border-2 border-amber-400 ring-4 ring-amber-500/20' : 'bg-slate-800 border border-slate-700'} flex items-center justify-center text-2xl shadow mb-2 transition-transform hover:scale-110">
              ${isDone ? badge.icon : '🔒'}
            </div>
            <div class="text-xs font-bold ${isDone ? 'text-amber-300' : 'text-slate-400'}">${name}</div>
            <div class="text-[10px] text-slate-400 mt-1 line-clamp-2">${desc}</div>
            <div class="mt-2 text-[9px] font-mono ${isDone ? 'text-emerald-400 font-bold' : 'text-slate-500'}">
              ${isDone ? `✓ ${isAr ? 'تم الاعتماد' : 'EARNED'}` : (isAr ? 'قيد التدريب' : 'LOCKED')}
            </div>
          </div>
        `;
      }).join('');

      const trainingHTML = trainingBadges.map(tb => {
        const trainState = (state.training && state.training[tb.id]) || {};
        const isDone = Boolean(trainState.completed);
        const name = isAr ? tb.nameAr : tb.nameEn;
        const desc = isAr ? tb.descAr : tb.descEn;

        return `
          <div class="patch-card p-3 rounded-xl border ${isDone ? 'bg-gradient-to-b from-blue-950/40 to-slate-900 border-cyan-400/80 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/60 border-slate-800 opacity-60'} flex flex-col items-center text-center">
            <div class="w-14 h-14 rounded-full ${isDone ? 'bg-cyan-500/20 border-2 border-cyan-400 ring-4 ring-cyan-500/20' : 'bg-slate-800 border border-slate-700'} flex items-center justify-center text-2xl shadow mb-2 transition-transform hover:scale-110">
              ${isDone ? tb.icon : '🔒'}
            </div>
            <div class="text-xs font-bold ${isDone ? 'text-cyan-300' : 'text-slate-400'}">${name}</div>
            <div class="text-[10px] text-slate-400 mt-1 line-clamp-2">${desc}</div>
            <div class="mt-2 text-[9px] font-mono ${isDone ? 'text-cyan-400 font-bold' : 'text-slate-500'}">
              ${isDone ? `✓ ${isAr ? 'معتمد رسمياً' : 'CERTIFIED'}` : (isAr ? 'قيد التدريب' : 'LOCKED')}
            </div>
          </div>
        `;
      }).join('');

      patchesContainer.innerHTML = cosmicHTML + trainingHTML;
    }

    // Render Certificate Preview (only unlocked when all 9 stages are finished)
    const isAllDone = window.cadetState.isAllStagesCompleted();
    this.renderCertificate(state, rankInfo, completedCount, isAr, isAllDone);
  }

  renderCertificate(state, rankInfo, completedCount, isAr, isAllDone) {
    const certArea = document.getElementById('printable-certificate-area');
    const printBtn = document.getElementById('print-cert-btn');
    const placeholder = document.getElementById('cert-locked-placeholder');
    const lockedTitle = document.getElementById('cert-locked-title');
    const lockedDesc = document.getElementById('cert-locked-desc');

    if (!isAllDone) {
      // Leave certificate section blank / locked until all stages across the 3 sectors are complete
      if (printBtn) printBtn.classList.add('hidden');
      if (certArea) certArea.classList.add('hidden');
      if (placeholder) {
        placeholder.classList.remove('hidden');
        if (lockedTitle) {
          lockedTitle.textContent = isAr ? 'شهادة التخرج مغلقة' : 'Graduation Certificate Locked';
        }
        if (lockedDesc) {
          lockedDesc.textContent = isAr
            ? `أكمل جميع المراحل التسع عبر "رحلة المجموعة الشمسية"، و"أسرار الثقوب السوداء"، و"حدود المجرات" لفتح شهادة رائد الفضاء واعتمادها رسمياً (${completedCount} / 9 مهمات مكتملة).`
            : `Complete all stages across Solar System Odyssey, Black Holes & Cosmic Mysteries, and Galactic Frontiers to unlock and certify your official Junior Astronaut Certificate (${completedCount} / 9 completed).`;
        }
      }
      return;
    }

    // Unlocked: reveal certificate and print button
    if (placeholder) placeholder.classList.add('hidden');
    if (printBtn) printBtn.classList.remove('hidden');
    if (certArea) certArea.classList.remove('hidden');

    const certCallSign = document.getElementById('cert-cadet-name');
    const certRank = document.getElementById('cert-cadet-rank');
    const certMissions = document.getElementById('cert-cadet-missions');
    const certDate = document.getElementById('cert-date');
    const certHash = document.getElementById('cert-hash');

    if (certCallSign) certCallSign.textContent = state.callSign.toUpperCase();
    if (certRank) certRank.textContent = (isAr ? rankInfo.current.titleAr : rankInfo.current.titleEn).toUpperCase();
    if (certMissions) certMissions.textContent = `${completedCount} / 9`;

    const now = new Date();
    const dateStr = now.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (certDate) certDate.textContent = dateStr;

    // Deterministic cadet code
    const hash = 'KILONAUT-' + Math.abs((state.callSign + (state.xp || 0)).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16).toUpperCase().slice(0, 8);
    if (certHash) certHash.textContent = hash;
  }

  async handleShare() {
    window.cosmicAudio.playClick();
    const state = window.cadetState.state;
    const rankInfo = window.cadetState.getRank();
    const lang = state.lang;
    const isAr = lang === 'ar';
    const rankTitle = isAr ? rankInfo.current.titleAr : rankInfo.current.titleEn;
    const completed = window.cadetState.getCompletedCount();

    const shareTitle = isAr ? 'شهادة رائد فضاء ناسا الصغير' : 'NASA Junior Astronaut Academy Flight Certification';
    const shareText = isAr
      ? `🚀 رائع! حقق الرائد الفضائي "${state.callSign}" رتبة "${rankTitle}" في أكاديمية رواد الفضاء الصغار لناسا برصيد ${state.xp} نقطة وإنجاز ${completed}/9 مهمات علمية! جربها واستكشف الفضاء مع كوزمو!`
      : `🚀 Cadet "${state.callSign}" earned rank "${rankTitle}" at the Kilonaut Space Academy with ${state.xp} Star Points and ${completed}/9 missions completed! Explore space science at Kilonaut Academy!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      const toast = document.getElementById('share-toast');
      if (toast) {
        toast.textContent = window.t('copySuccess');
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
      }
    } catch (err) {
      alert(shareText);
    }
  }
}

window.passportManager = new PassportManager();
