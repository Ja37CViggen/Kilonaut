/**
 * Kilonaut: Space Science Mission Control & Academy
 * Master Application Controller
 * Handles Onboarding, Top Bar, Deck, Sector Maps, Stage Labs, Auto-Advance, and I18n.
 */

class AcademyApp {
  constructor() {
    this.currentView = 'deck'; // 'deck' | 'sector' | 'lab' | 'challenge'
    this.currentSectorId = null;
    this.currentStageId = null;
  }

  init() {
    // 1. Audio init on first interaction
    document.addEventListener('click', () => {
      window.cosmicAudio.init();
    }, { once: true });

    // 2. Initialize Subsystems
    window.passportManager.init();

    // 3. Bind Top Bar & Global Controls
    this.bindTopBar();

    // 4. State synchronization
    window.cadetState.onChange(() => {
      this.updateTopBar();
      this.renderCurrentView();
    });

    // 5. Check Onboarding
    const state = window.cadetState.state;
    if (!state.hasOnboarded) {
      this.showOnboarding();
    } else {
      this.applyLanguage(state.lang);
      this.showDeck();
    }
  }

  // --- Onboarding Flow ---
  showOnboarding() {
    const modal = document.getElementById('onboarding-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    window.cosmicAudio.playWelcomeChime();

    const callSignInput = document.getElementById('onboarding-callsign');
    if (callSignInput && window.cadetState.state.callSign) {
      callSignInput.value = window.cadetState.state.callSign;
    }

    if (this._onboardingBound) return;
    this._onboardingBound = true;

    const randomBtn = document.getElementById('random-callsign-btn');
    const launchBtn = document.getElementById('launch-academy-btn');
    const avatars = document.querySelectorAll('.avatar-option');
    let selectedAvatar = window.cadetState.state.avatar || 'bear';

    // Random generator names
    const randomNamesEn = ['Nova Ranger', 'Cosmic Scout', 'Orion Pilot', 'Starlight Ace', 'Nebula Voyager', 'Solar Phoenix', 'Astro Fox'];
    const randomNamesAr = ['صقر الفضاء', 'رائد المجرة', 'شهاب الأوربيط', 'نسر النجوم', 'كشاف السدم', 'فارس المذنبات'];

    if (randomBtn && callSignInput) {
      randomBtn.addEventListener('click', () => {
        window.cosmicAudio.playClick();
        const isAr = window.cadetState.state.lang === 'ar';
        const list = isAr ? randomNamesAr : randomNamesEn;
        callSignInput.value = list[Math.floor(Math.random() * list.length)];
      });
    }

    avatars.forEach(av => {
      av.addEventListener('click', () => {
        window.cosmicAudio.playClick();
        avatars.forEach(a => a.classList.remove('ring-4', 'ring-amber-400', 'bg-amber-950/40'));
        av.classList.add('ring-4', 'ring-amber-400', 'bg-amber-950/40');
        selectedAvatar = av.dataset.avatar;
      });
    });

    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        const sign = (callSignInput && callSignInput.value.trim()) ? callSignInput.value.trim() : 'Nova Scout';
        window.cadetState.setCadetProfile(sign, selectedAvatar);
        window.cosmicAudio.playLaunchWarp();

        modal.classList.add('hidden');
        this.updateTopBar();
        this.showDeck();

        const lang = window.cadetState.state.lang;
        window.cosmicSpeech.speak(window.t('spokenWelcome'), lang);
      });
    }
  }

  logout() {
    window.cosmicAudio.playClick();
    window.simEngine.stop();
    window.challengeManager.cleanup();
    if (window.astronautTraining) window.astronautTraining.cleanup();
    window.cadetState.logout();
    this.showOnboarding();
  }

  // --- Top Bar Controls ---
  bindTopBar() {
    const langBtn = document.getElementById('lang-toggle-btn');
    const audioBtn = document.getElementById('audio-toggle-btn');
    const passportBtn = document.getElementById('passport-btn');
    const navTrainingBtn = document.getElementById('nav-training-btn');
    const navLogoutBtn = document.getElementById('nav-logout-btn');

    if (navLogoutBtn) {
      navLogoutBtn.addEventListener('click', () => {
        const isAr = window.cadetState.state.lang === 'ar';
        const confirmMsg = isAr ? 'هل أنت متأكد من رغبتك في تسجيل الخروج؟' : 'Are you sure you want to sign out?';
        if (confirm(confirmMsg)) {
          this.logout();
        }
      });
    }

    if (navTrainingBtn) {
      navTrainingBtn.addEventListener('click', () => {
        if (!window.cadetState.isTrainingUnlocked()) {
          window.cosmicAudio.playWrong();
          alert(window.t('trainingLockedAlert'));
          return;
        }
        window.cosmicAudio.playClick();
        this.showTraining();
      });
    }

    if (langBtn) {
      langBtn.addEventListener('click', () => {
        window.cosmicAudio.playClick();
        const currentLang = window.cadetState.state.lang;
        const newLang = currentLang === 'ar' ? 'en' : 'ar';
        this.applyLanguage(newLang);
      });
    }

    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isMuted = !window.cadetState.state.muted;
        window.cadetState.setMuted(isMuted);
        window.cosmicAudio.setMuted(isMuted);
        window.cosmicSpeech.stop();
        this.updateAudioButton(isMuted);
      });
    }


    if (passportBtn) {
      passportBtn.addEventListener('click', () => {
        window.passportManager.openModal();
      });
    }
  }

  applyLanguage(lang) {
    window.cadetState.setLang(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    if (lang === 'ar') {
      document.body.classList.add('font-arabic');
      document.body.classList.remove('font-latin');
    } else {
      document.body.classList.add('font-latin');
      document.body.classList.remove('font-arabic');
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = window.t(key);
    });

    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      langBtn.textContent = lang === 'ar' ? 'English' : 'العربية';
    }

    this.updateTopBar();
    this.renderCurrentView();
  }

  updateAudioButton(isMuted) {
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.innerHTML = isMuted ? '🔇 <span class="hidden sm:inline">Muted</span>' : '🔊 <span class="hidden sm:inline">Audio</span>';
    }
  }

  updateTopBar() {
    const state = window.cadetState.state;
    const isAr = state.lang === 'ar';
    const rankInfo = window.cadetState.getRank();

    const csEl = document.getElementById('deck-callsign');
    if (csEl) csEl.textContent = state.callSign;

    const rankBadgeEl = document.getElementById('deck-rank-badge');
    if (rankBadgeEl) {
      rankBadgeEl.innerHTML = `
        <span class="mr-1">${rankInfo.current.badgeIcon}</span>
        <span>${isAr ? rankInfo.current.titleAr : rankInfo.current.titleEn}</span>
      `;
    }

    const avatarMap = { rover: '🚜', bear: '🐻', cat: '🐱', explorer: '🧑‍🚀' };
    const avatarEl = document.getElementById('deck-avatar-icon');
    if (avatarEl) avatarEl.textContent = avatarMap[state.avatar] || '🧑‍🚀';

    const xpEl = document.getElementById('deck-xp-counter');
    if (xpEl) xpEl.textContent = `⭐ ${state.xp || 0} XP`;

    const navTrainingBtn = document.getElementById('nav-training-btn');
    if (navTrainingBtn) {
      const isUnlocked = window.cadetState.isTrainingUnlocked();
      if (!isUnlocked) {
        navTrainingBtn.classList.remove('from-cyan-600', 'to-blue-600', 'hover:from-cyan-500', 'hover:to-blue-500');
        navTrainingBtn.classList.add('from-slate-700', 'to-slate-800', 'opacity-70', 'border-slate-600');
        navTrainingBtn.title = isAr ? '🔒 مغلق حتى إتمام جميع المراحل الثلاث' : '🔒 Locked until all 3 stages/sectors completed';
      } else {
        navTrainingBtn.classList.add('from-cyan-600', 'to-blue-600', 'hover:from-cyan-500', 'hover:to-blue-500');
        navTrainingBtn.classList.remove('from-slate-700', 'to-slate-800', 'opacity-70', 'border-slate-600');
        navTrainingBtn.title = isAr ? 'مركز تدريب رواد الفضاء' : 'Astronaut Training Facility';
      }
    }
  }

  // --- Views Router ---
  showDeck() {
    this.currentView = 'deck';
    this.currentSectorId = null;
    this.currentStageId = null;
    window.simEngine.stop();
    window.challengeManager.cleanup();
    if (window.astronautTraining) window.astronautTraining.cleanup();

    document.getElementById('view-deck').classList.remove('hidden');
    document.getElementById('view-sector').classList.add('hidden');
    document.getElementById('view-lab').classList.add('hidden');
    document.getElementById('view-challenge').classList.add('hidden');
    const viewTraining = document.getElementById('view-training');
    if (viewTraining) viewTraining.classList.add('hidden');

    this.renderDeckSectors();
  }

  showSector(sectorId) {
    this.currentView = 'sector';
    this.currentSectorId = sectorId;
    this.currentStageId = null;
    window.simEngine.stop();
    window.challengeManager.cleanup();
    if (window.astronautTraining) window.astronautTraining.cleanup();

    document.getElementById('view-deck').classList.add('hidden');
    document.getElementById('view-sector').classList.remove('hidden');
    document.getElementById('view-lab').classList.add('hidden');
    document.getElementById('view-challenge').classList.add('hidden');
    const viewTraining = document.getElementById('view-training');
    if (viewTraining) viewTraining.classList.add('hidden');

    this.renderSectorStages(sectorId);
  }

  showStageLab(stageId) {
    this.currentView = 'lab';
    this.currentStageId = stageId;
    window.challengeManager.cleanup();
    if (window.astronautTraining) window.astronautTraining.cleanup();

    document.getElementById('view-deck').classList.add('hidden');
    document.getElementById('view-sector').classList.add('hidden');
    document.getElementById('view-lab').classList.remove('hidden');
    document.getElementById('view-challenge').classList.add('hidden');
    const viewTraining = document.getElementById('view-training');
    if (viewTraining) viewTraining.classList.add('hidden');

    this.renderStageLab(stageId);
  }

  showStageChallenge(stageId) {
    this.currentView = 'challenge';
    this.currentStageId = stageId;
    window.simEngine.stop();
    if (window.astronautTraining) window.astronautTraining.cleanup();

    document.getElementById('view-deck').classList.add('hidden');
    document.getElementById('view-sector').classList.add('hidden');
    document.getElementById('view-lab').classList.add('hidden');
    document.getElementById('view-challenge').classList.remove('hidden');
    const viewTraining = document.getElementById('view-training');
    if (viewTraining) viewTraining.classList.add('hidden');

    this.renderChallenge(stageId);
  }

  showTraining(moduleId = null) {
    if (!window.cadetState.isTrainingUnlocked()) {
      window.cosmicAudio.playWrong();
      alert(window.t('trainingLockedAlert'));
      this.showDeck();
      return;
    }

    this.currentView = 'training';
    this.currentSectorId = null;
    this.currentStageId = null;
    window.simEngine.stop();
    window.challengeManager.cleanup();
    window.cosmicSpeech.stop();

    document.getElementById('view-deck').classList.add('hidden');
    document.getElementById('view-sector').classList.add('hidden');
    document.getElementById('view-lab').classList.add('hidden');
    document.getElementById('view-challenge').classList.add('hidden');
    const viewTraining = document.getElementById('view-training');
    if (viewTraining) viewTraining.classList.remove('hidden');

    const container = document.getElementById('training-content-area');
    if (container && window.astronautTraining) {
      window.astronautTraining.init(container);
      if (moduleId) {
        window.astronautTraining.startModule(moduleId);
      }
    }
  }

  // Auto-advance seamlessly into the second / next stage!
  autoAdvanceToNextStage(stageId) {
    const STAGE_ORDER = [
      's1_1', 's1_2', 's1_3',
      's2_1', 's2_2', 's2_3',
      's3_1', 's3_2', 's3_3'
    ];
    const currentIndex = STAGE_ORDER.indexOf(stageId);
    if (currentIndex !== -1 && currentIndex + 1 < STAGE_ORDER.length) {
      const nextStageId = STAGE_ORDER[currentIndex + 1];
      this.showStageLab(nextStageId);
    } else {
      window.passportManager.openModal();
    }
  }

  renderCurrentView() {
    if (this.currentView === 'deck') this.renderDeckSectors();
    else if (this.currentView === 'sector') this.renderSectorStages(this.currentSectorId);
    else if (this.currentView === 'lab') this.renderStageLab(this.currentStageId);
    else if (this.currentView === 'challenge') this.renderChallenge(this.currentStageId);
    else if (this.currentView === 'training') {
      const container = document.getElementById('training-content-area');
      if (container && window.astronautTraining && !window.astronautTraining.activeModule) {
        window.astronautTraining.renderHub();
      }
    }
  }

  // --- View 1: Deck Sectors ---
  renderDeckSectors() {
    const container = document.getElementById('sectors-grid');
    if (!container) return;

    const lang = window.cadetState.state.lang;
    const isAr = lang === 'ar';

    container.innerHTML = window.ACADEMY_SECTORS.map(sec => {
      const progress = window.cadetState.getSectorProgress(sec.id);
      const title = window.t(sec.titleKey);
      const desc = window.t(sec.descKey);
      const theme = window.t(sec.themeKey);

      return `
        <div class="sector-card p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-[${sec.color}] shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer relative overflow-hidden group" data-sector="${sec.id}">
          <div class="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" style="background: ${sec.color};"></div>

          <div class="flex items-center justify-between mb-4">
            <span class="text-3xl p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-inner">${sec.icon}</span>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-full ${progress.completed === progress.total ? 'bg-emerald-950 text-emerald-400 border border-emerald-500' : 'bg-slate-800 text-slate-300'}">
                ${progress.completed} / ${progress.total} ${isAr ? 'مراحل' : 'Stages'}
              </span>
            </div>
          </div>

          <h3 class="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
            ${title}
          </h3>

          <p class="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
            ${desc}
          </p>

          <div class="mt-4 pt-4 border-t border-slate-800/80">
            <div class="text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1">${theme}</div>
            <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
              <div class="h-full rounded-full transition-all duration-500" style="width: ${progress.percent}%; background: ${sec.color};"></div>
            </div>
            <div class="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1">
              <span>${progress.percent}% ${isAr ? 'إنجاز' : 'Complete'}</span>
              <span class="text-cyan-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform font-bold">
                ${isAr ? 'دخول القطاع ←' : 'Enter Sector →'}
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.sector-card').forEach(card => {
      card.addEventListener('click', () => {
        window.cosmicAudio.playClick();
        const sectorId = parseInt(card.dataset.sector, 10);
        this.showSector(sectorId);
      });
    });

    // Astronaut Training Deck Card
    const trainingCard = document.getElementById('deck-training-card');
    if (trainingCard) {
      const isUnlocked = window.cadetState.isTrainingUnlocked();
      const iconBox = document.getElementById('deck-training-icon-box');
      const badgeTag = document.getElementById('deck-training-badge-tag');
      const statusTag = document.getElementById('deck-training-status-tag');
      const descEl = document.getElementById('deck-training-desc');
      const countEl = document.getElementById('deck-training-progress-count');
      const subEl = document.getElementById('deck-training-progress-sub');
      const ctaBtn = document.getElementById('deck-training-cta-btn');
      const btnIcon = document.getElementById('deck-training-btn-icon');
      const btnText = document.getElementById('deck-training-btn-text');

      if (!isUnlocked) {
        trainingCard.onclick = () => {
          window.cosmicAudio.playWrong();
          alert(window.t('trainingLockedAlert'));
        };
        trainingCard.className = "mb-6 p-6 rounded-3xl bg-slate-900/60 border-2 border-slate-700/70 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 opacity-80 cursor-pointer group";
        if (iconBox) {
          iconBox.className = "w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-3xl shadow-inner text-slate-400";
          iconBox.textContent = "🔒";
        }
        if (badgeTag) {
          badgeTag.className = "badge-tag bg-slate-800 text-slate-400 border-slate-600 font-mono uppercase";
          badgeTag.textContent = window.t('trainingLockedBadge');
        }
        if (statusTag) {
          statusTag.className = "text-xs text-rose-400 font-mono font-bold";
          statusTag.textContent = isAr ? "🔒 مغلق حالياً" : "🔒 CURRENTLY LOCKED";
        }
        if (descEl) {
          descEl.textContent = window.t('trainingLockedSub');
        }
        if (countEl) {
          const completedStages = window.cadetState.getCompletedCount();
          countEl.className = "text-amber-400 font-bold text-sm block";
          countEl.textContent = isAr ? `${completedStages} / 9 مراحل مكتملة` : `${completedStages} / 9 Stages Done`;
        }
        if (subEl) {
          subEl.textContent = isAr ? "يتطلب إتمام 9 مراحل لفتح المركز" : "Requires all 9 cosmic stages";
        }
        if (ctaBtn) {
          ctaBtn.className = "w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs shadow border border-slate-600 transition active:scale-95 flex items-center justify-center gap-2";
        }
        if (btnIcon) btnIcon.textContent = "🔒";
        if (btnText) btnText.textContent = window.t('trainingLockedBtn');
      } else {
        trainingCard.onclick = () => {
          window.cosmicAudio.playClick();
          this.showTraining();
        };
        trainingCard.className = "mb-6 p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-2 border-cyan-400/60 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 hover:border-cyan-300 transition-all duration-300 cursor-pointer group";
        if (iconBox) {
          iconBox.className = "w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform";
          iconBox.textContent = "🧑‍🚀";
        }
        if (badgeTag) {
          badgeTag.className = "badge-tag bg-cyan-950/80 text-cyan-300 border-cyan-400 font-mono uppercase";
          badgeTag.textContent = window.t('trainingBadgeTag');
        }
        if (statusTag) {
          statusTag.className = "text-xs text-amber-400 font-mono font-bold";
          statusTag.textContent = "★ SPECIAL SECTION";
        }
        if (descEl) {
          descEl.textContent = window.t('trainingFacilitySub');
        }
        const prog = window.cadetState.getTrainingProgress();
        if (countEl) {
          countEl.className = "text-cyan-400 font-bold text-sm block";
          countEl.textContent = isAr ? `${prog.completed} / ${prog.total} معتمد` : `${prog.completed} / ${prog.total} Certified`;
        }
        if (subEl) {
          subEl.textContent = isAr ? "6 مختبرات تفاعلية" : "6 Interactive Labs";
        }
        if (ctaBtn) {
          ctaBtn.className = "w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2";
        }
        if (btnIcon) btnIcon.textContent = "🧑‍🚀";
        if (btnText) btnText.textContent = window.t('enterTrainingSection');
      }
    }
  }

  // --- View 2: Sector Stages Map ---
  renderSectorStages(sectorId) {
    const sector = window.ACADEMY_SECTORS.find(s => s.id === sectorId);
    if (!sector) return;

    const lang = window.cadetState.state.lang;
    const isAr = lang === 'ar';
    const state = window.cadetState.state;

    document.getElementById('sector-title').textContent = window.t(sector.titleKey);
    document.getElementById('sector-desc').textContent = window.t(sector.descKey);

    const backBtn = document.getElementById('back-to-deck-btn');
    if (backBtn) {
      backBtn.onclick = () => {
        window.cosmicAudio.playClick();
        this.showDeck();
      };
    }

    const container = document.getElementById('stages-grid');
    if (!container) return;

    container.innerHTML = sector.stages.map((st, idx) => {
      const stageState = state.stages[st.id] || { completed: false, unlocked: idx === 0 };
      const isUnlocked = stageState.unlocked || stageState.completed;
      const isDone = stageState.completed;

      const title = window.t(st.titleKey);
      const sub = window.t(st.subKey);
      const badge = st.badge;
      const badgeName = isAr ? badge.nameAr : badge.nameEn;

      return `
        <div class="stage-card p-5 rounded-2xl border ${isDone ? 'bg-gradient-to-b from-slate-900 to-amber-950/20 border-amber-500/80 shadow-lg shadow-amber-500/10' : (isUnlocked ? 'bg-slate-900/90 border-cyan-500/80 ring-2 ring-cyan-500/20' : 'bg-slate-900/40 border-slate-800 opacity-60')} relative overflow-hidden transition-all duration-300 ${isUnlocked ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-not-allowed'}" data-stage="${st.id}">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full ${isDone ? 'bg-emerald-950 text-emerald-400 border border-emerald-500' : (isUnlocked ? 'bg-cyan-950 text-cyan-400 border border-cyan-500' : 'bg-slate-800 text-slate-500')}">
              ${isDone ? `✓ ${window.t('completed')}` : (isUnlocked ? `⚡ ${window.t('unlocked')}` : `🔒 ${window.t('locked')}`)}
            </span>
            <span class="text-xs font-mono text-amber-400 font-bold">+${st.xpReward} XP</span>
          </div>

          <div class="flex items-center space-x-3 rtl:space-x-reverse mb-2">
            <div class="w-12 h-12 rounded-xl ${isDone ? 'bg-amber-500/20 border border-amber-400' : 'bg-slate-800 border border-slate-700'} flex items-center justify-center text-2xl shadow">
              ${isDone ? badge.icon : (isUnlocked ? '🔬' : '🔒')}
            </div>
            <div>
              <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">${isAr ? `المرحلة ${st.stageNum}` : `STAGE ${st.stageNum}`}</div>
              <h4 class="text-base font-bold text-white">${title}</h4>
            </div>
          </div>

          <p class="text-xs text-slate-400 mt-2 line-clamp-2">${sub}</p>

          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-[10px] text-amber-300 font-medium">🏅 ${badgeName}</span>
            <button class="px-3 py-1.5 rounded-lg text-xs font-bold ${isUnlocked ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-600'} transition">
              ${isDone ? (isAr ? 'مراجعة المختبر' : 'Review Lab') : (isUnlocked ? (isAr ? 'دخول المختبر' : 'Enter Lab') : (isAr ? 'مقفلة' : 'Locked'))}
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.stage-card').forEach(card => {
      card.addEventListener('click', () => {
        const stageId = card.dataset.stage;
        const stageState = state.stages[stageId];
        if (stageState && (stageState.unlocked || stageState.completed)) {
          window.cosmicAudio.playClick();
          this.showStageLab(stageId);
        } else {
          window.cosmicAudio.playWrong();
        }
      });
    });
  }

  // --- View 3: Stage Lab (Split Layout) ---
  renderStageLab(stageId) {
    const found = window.getStageById(stageId);
    if (!found) return;
    const { sector, stage } = found;

    const lang = window.cadetState.state.lang;
    const isAr = lang === 'ar';

    const backBtn = document.getElementById('back-to-sector-btn');
    if (backBtn) {
      backBtn.onclick = () => {
        window.cosmicAudio.playClick();
        this.showSector(sector.id);
      };
    }

    document.getElementById('lab-stage-num').textContent = isAr ? `قطاع ${sector.id} • مرحلة ${stage.stageNum}` : `SECTOR ${sector.id} • STAGE ${stage.stageNum}`;
    document.getElementById('lab-title').textContent = window.t(stage.titleKey);
    document.getElementById('lab-brief').textContent = window.t(stage.briefKey);
    document.getElementById('lab-fact1').textContent = window.t(stage.fact1Key);
    document.getElementById('lab-fact2').textContent = window.t(stage.fact2Key);

    // Planetary Visual Showcase for Sector 1 Stages
    let showcaseEl = document.getElementById('lab-planets-showcase');
    if (!showcaseEl) {
      showcaseEl = document.createElement('div');
      showcaseEl.id = 'lab-planets-showcase';
      const briefEl = document.getElementById('lab-brief');
      if (briefEl && briefEl.parentNode) {
        briefEl.parentNode.insertBefore(showcaseEl, briefEl.nextSibling);
      }
    }
    if (showcaseEl) {
      if (stage.id === 's1_1') {
        const planets8 = [
          { name: isAr ? 'عطارد' : 'Mercury', img: 'images/mercury.jpg', color: '#94A3B8' },
          { name: isAr ? 'الزهرة' : 'Venus', img: 'images/venus.jpg', color: '#F59E0B' },
          { name: isAr ? 'الأرض' : 'Earth', img: 'images/earth.jpg', color: '#0EA5E9' },
          { name: isAr ? 'المريخ' : 'Mars', img: 'images/mars.jpg', color: '#EF4444' },
          { name: isAr ? 'المشتري' : 'Jupiter', img: 'images/jupiter.jpg', color: '#D97706' },
          { name: isAr ? 'زحل' : 'Saturn', img: 'images/saturn.jpg', color: '#EAB308' },
          { name: isAr ? 'أورانوس' : 'Uranus', img: 'images/uranus.jpg', color: '#06B6D4' },
          { name: isAr ? 'نبتون' : 'Neptune', img: 'images/neptune.jpg', color: '#1D4ED8' }
        ];
        showcaseEl.className = 'my-3 p-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl';
        showcaseEl.innerHTML = `
          <div class="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>🪐 ${isAr ? 'كواكب المجموعة الشمسية الثمانية' : 'All 8 Solar System Worlds'}</span>
            <span class="text-slate-500 font-normal">0.39 AU ➔ 30.1 AU</span>
          </div>
          <div class="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            ${planets8.map(p => `
              <div class="flex flex-col items-center min-w-[44px]">
                <img src="${p.img}" alt="${p.name}" class="w-9 h-9 sm:w-10 sm:h-10 object-cover rounded-full border-2 shadow" style="border-color: ${p.color}; box-shadow: 0 0 10px ${p.color}88" onerror="this.src='/${p.img}'" />
                <span class="text-[9px] font-bold text-slate-300 mt-1 truncate max-w-[48px]">${p.name}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else if (stage.id === 's1_2') {
        showcaseEl.className = 'my-3 p-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl';
        showcaseEl.innerHTML = `
          <div class="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
            <span>🚀 ${isAr ? 'مسار المهمة الاستكشافية' : 'Mission Flight Corridor'}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <img src="images/mars.jpg" class="w-9 h-9 object-cover rounded-full border-2 border-red-500 shadow" style="box-shadow: 0 0 10px #EF444488" onerror="this.src='/images/mars.jpg'" />
              <div class="text-[10px] leading-tight font-bold text-red-400">${isAr ? 'المريخ' : 'Mars'}</div>
            </div>
            <div class="flex-1 flex flex-col items-center px-1">
              <span class="text-[9px] font-mono text-amber-400">🪨 Ceres Asteroids</span>
              <div class="w-full h-1 bg-gradient-to-r from-red-500 via-amber-400 to-amber-600 rounded-full"></div>
            </div>
            <div class="flex items-center gap-2">
              <div class="text-[10px] leading-tight font-bold text-amber-400">${isAr ? 'المشتري' : 'Jupiter'}</div>
              <img src="images/jupiter.jpg" class="w-9 h-9 object-cover rounded-full border-2 border-amber-600 shadow" style="box-shadow: 0 0 10px #D9770688" onerror="this.src='/images/jupiter.jpg'" />
            </div>
          </div>
        `;
      } else if (stage.id === 's1_3') {
        const planets7 = [
          { name: isAr ? 'عطارد' : 'Mercury', img: 'images/mercury.jpg', color: '#94A3B8' },
          { name: isAr ? 'الزهرة' : 'Venus', img: 'images/venus.jpg', color: '#F59E0B' },
          { name: isAr ? 'المريخ' : 'Mars', img: 'images/mars.jpg', color: '#EF4444' },
          { name: isAr ? 'المشتري' : 'Jupiter', img: 'images/jupiter.jpg', color: '#D97706' },
          { name: isAr ? 'زحل' : 'Saturn', img: 'images/saturn.jpg', color: '#EAB308' },
          { name: isAr ? 'أورانوس' : 'Uranus', img: 'images/uranus.jpg', color: '#06B6D4' },
          { name: isAr ? 'نبتون' : 'Neptune', img: 'images/neptune.jpg', color: '#1D4ED8' }
        ];
        showcaseEl.className = 'my-3 p-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl';
        showcaseEl.innerHTML = `
          <div class="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>🪐 ${isAr ? 'عوالم الرحلات الاستكشافية السبعة' : '7 Expedition Worlds'}</span>
            <span class="text-slate-500 font-normal">7 Dedicated Labs</span>
          </div>
          <div class="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            ${planets7.map(p => `
              <div class="flex flex-col items-center min-w-[44px]">
                <img src="${p.img}" alt="${p.name}" class="w-9 h-9 sm:w-10 sm:h-10 object-cover rounded-full border-2 shadow" style="border-color: ${p.color}; box-shadow: 0 0 10px ${p.color}88" onerror="this.src='/${p.img}'" />
                <span class="text-[9px] font-bold text-slate-300 mt-1 truncate max-w-[48px]">${p.name}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        showcaseEl.className = 'hidden';
        showcaseEl.innerHTML = '';
      }
    }

    const canvas = document.getElementById('simulation-canvas');
    if (canvas) {
      window.simEngine.mount(canvas, stage.id);
    }

    const narrationBtn = document.getElementById('lab-narration-btn');
    if (narrationBtn) {
      narrationBtn.innerHTML = `🔊 ${window.t('listenBriefing')}`;
      narrationBtn.onclick = () => {
        if (window.cosmicSpeech.isSpeaking) {
          window.cosmicSpeech.stop();
          narrationBtn.innerHTML = `🔊 ${window.t('listenBriefing')}`;
        } else {
          window.cosmicAudio.playClick();
          const speechText = `${window.t(stage.titleKey)}. ${window.t(stage.briefKey)}`;
          narrationBtn.innerHTML = `⏹ ${window.t('stopAudio')}`;
          window.cosmicSpeech.speak(speechText, lang, () => {
            narrationBtn.innerHTML = `🔊 ${window.t('listenBriefing')}`;
          });
        }
      };
    }

    const launchChallengeBtn = document.getElementById('launch-challenge-btn');
    if (launchChallengeBtn) {
      launchChallengeBtn.innerHTML = `🚀 ${window.t('launchChallenge')}`;
      launchChallengeBtn.onclick = () => {
        window.cosmicSpeech.stop();
        window.cosmicAudio.playLaunchWarp();
        this.showStageChallenge(stage.id);
      };
    }
  }

  // --- View 4: Challenge Arena ---
  renderChallenge(stageId) {
    const found = window.getStageById(stageId);
    if (!found) return;
    const { sector, stage } = found;

    const backBtn = document.getElementById('back-to-lab-btn');
    if (backBtn) {
      backBtn.onclick = () => {
        window.cosmicAudio.playClick();
        this.showStageLab(stage.id);
      };
    }

    const arenaContainer = document.getElementById('challenge-arena-container');
    if (arenaContainer) {
      window.challengeManager.mount(arenaContainer, stage.id);
    }

    // NASA CCMC DONKI Space Weather Banner for all challenges
    const donkiBanner = document.getElementById('donki-space-weather-ribbon');
    if (donkiBanner && window.NasaData) {
      window.NasaData.getSolarFlareAlertHTML(window.cadetState?.state?.lang || 'en').then(html => {
        if (donkiBanner) donkiBanner.innerHTML = html;
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.academyApp = new AcademyApp();
  window.academyApp.init();
});
