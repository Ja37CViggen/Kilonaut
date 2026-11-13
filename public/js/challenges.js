/**
 * Kilonaut: Space Science Mission Control & Academy
 * Hands-On Challenge Arenas
 * Implements all 9 interactive astronomy challenges with full game logic,
 * auto-advance between stages, mouse/touch controls, 7 planet expeditions (5 games each),
 * JWST beam calibration, Galactic radar triangulation, and non-resetting language preservation.
 */

class ChallengeManager {
  constructor() {
    this.container = null;
    this.currentStageId = null;
    this.activeGameLoop = null;
    // Session states preserved across language switches
    this.sessionState = {};
    this.autoAdvanceTimer = null;
  }

  mount(containerEl, stageId) {
    this.cleanup();
    this.container = containerEl;
    this.currentStageId = stageId;
    const lang = window.cadetState.state.lang;

    switch (stageId) {
      case 's1_1': this.initStage1_1(lang); break;
      case 's1_2': this.initStage1_2(lang); break;
      case 's1_3': this.initStage1_3(lang); break;
      case 's2_1': this.initStage2_1(lang); break;
      case 's2_2': this.initStage2_2(lang); break;
      case 's2_3': this.initStage2_3(lang); break;
      case 's3_1': this.initStage3_1(lang); break;
      case 's3_2': this.initStage3_2(lang); break;
      case 's3_3': this.initStage3_3(lang); break;
      default:
        this.container.innerHTML = `<p class="text-slate-400">Kilonaut Arena Initializing...</p>`;
    }
  }

  cleanup() {
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
    if (this.activeGameLoop) {
      cancelAnimationFrame(this.activeGameLoop);
      this.activeGameLoop = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  // --- 1. S1_1: ALL 8 Planets Solar System Distance Ordering ---
  initStage1_1(lang) {
    const isAr = lang === 'ar';

    const defaultPlanets = [
      { id: 'jupiter', nameEn: 'Jupiter', nameAr: 'المشتري', dist: '5.20 AU', correctPos: 4, icon: '🪐', color: 'border-amber-600', hexColor: '#D97706', image: 'images/jupiter.jpg', descEn: 'Great Red Spot & gas giant', descAr: 'عملاق الغاز والبقعة الحمراء' },
      { id: 'mercury', nameEn: 'Mercury', nameAr: 'عطارد', dist: '0.39 AU', correctPos: 0, icon: '⚪', color: 'border-slate-400', hexColor: '#94A3B8', image: 'images/mercury.jpg', descEn: 'Fastest orbital velocity', descAr: 'الأسرع مداراً والأقرب للشمس' },
      { id: 'neptune', nameEn: 'Neptune', nameAr: 'نبتون', dist: '30.1 AU', correctPos: 7, icon: '🔵', color: 'border-blue-700', hexColor: '#1D4ED8', image: 'images/neptune.jpg', descEn: 'Supersonic winds & deep azure', descAr: 'أسرع رياح في الفضاء' },
      { id: 'earth',   nameEn: 'Earth',   nameAr: 'الأرض',   dist: '1.00 AU', correctPos: 2, icon: '🌍', color: 'border-sky-500',   hexColor: '#0EA5E9', image: 'images/earth.jpg',   descEn: 'Our blue oasis with liquid water', descAr: 'واحتنا الزرقاء بالمياه السائلة' },
      { id: 'saturn',  nameEn: 'Saturn',  nameAr: 'زحل',    dist: '9.58 AU', correctPos: 5, icon: '✨', color: 'border-yellow-500', hexColor: '#EAB308', image: 'images/saturn.jpg',  descEn: 'Spectacular ice & rock rings', descAr: 'حلقات الجليد الباهرة' },
      { id: 'venus',   nameEn: 'Venus',   nameAr: 'الزهرة',  dist: '0.72 AU', correctPos: 1, icon: '🟡', color: 'border-amber-400', hexColor: '#F59E0B', image: 'images/venus.jpg',   descEn: 'Runaway greenhouse atmosphere', descAr: 'الأسخن حرارة بسبب الاحتباس' },
      { id: 'uranus',  nameEn: 'Uranus',  nameAr: 'أورانوس', dist: '19.2 AU', correctPos: 6, icon: '🌐', color: 'border-cyan-400',   hexColor: '#06B6D4', image: 'images/uranus.jpg',  descEn: 'Tilted on its side ice giant', descAr: 'الكوكب الجليدي المتدحرج' },
      { id: 'mars',    nameEn: 'Mars',    nameAr: 'المريخ',  dist: '1.52 AU', correctPos: 3, icon: '🔴', color: 'border-red-500',    hexColor: '#EF4444', image: 'images/mars.jpg',    descEn: 'Dusty red rover exploration', descAr: 'الكوكب الأحمر وبحيراته القديمة' }
    ];

    if (!this.sessionState.s1_1 || !this.sessionState.s1_1.planets || !this.sessionState.s1_1.planets[0].image) {
      this.sessionState.s1_1 = { planets: defaultPlanets };
    }
    const stateObj = this.sessionState.s1_1;

    const safeRender = () => {
      const scrollY = window.scrollY;
      const listEl = this.container.querySelector('#order-list');
      const listScrollTop = listEl ? listEl.scrollTop : 0;
      render();
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      const newListEl = this.container.querySelector('#order-list');
      if (newListEl) newListEl.scrollTop = listScrollTop;
    };

    const render = () => {
      this.container.innerHTML = `
        <div class="challenge-box">
          <div class="challenge-header">
            <span class="badge-tag">CHALLENGE 1 • ALL 8 PLANETS</span>
            <h3 class="text-xl font-bold text-amber-400 mt-1">
              ${isAr ? 'ترتيب كواكب المجموعة الشمسية الثمانية حسب بعدها عن الشمس' : 'Order All 8 Planets by Distance from the Sun'}
            </h3>
            <p class="text-sm text-slate-300 mt-1">
              ${isAr ? 'اسحب صناديق الكواكب وأفلتها بالفأرة (أو استخدم أزرار الأسهم) لترتيب الكواكب الثمانية كاملة في مساراتها الصحيحة بدءاً من أقرب كوكب للشمس إلى أبعدها دون القفز لأعلى الصفحة.' : 'Drag and drop the planet boxes with your mouse (or use Up/Down arrows) to arrange all 8 planets in sequence, starting from closest to farthest from the Sun without scroll jumps.'}
            </p>
          </div>

          <div class="sun-marker flex items-center justify-center p-3 my-3 bg-amber-950/40 border border-amber-500/50 rounded-xl text-amber-300 font-bold">
            ☀️ ${isAr ? 'الشمس (نقطة البداية المركزية)' : 'THE SUN (Central Anchor Point)'}
          </div>

          <div class="flex items-center justify-between px-1 mb-2 text-xs font-mono text-slate-400">
            <span class="text-amber-400 font-bold flex items-center gap-1.5">
              <span>✋</span> ${isAr ? 'اسحب الصناديق بالفأرة لإعادة الترتيب' : 'Drag boxes with mouse to reorder'}
            </span>
            <span>1 AU = ${isAr ? '150 مليون كم' : '150 Million km'}</span>
          </div>

          <div id="order-list" class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            ${stateObj.planets.map((p, idx) => `
              <div class="planet-drag-item drag-item flex items-center justify-between p-3 bg-slate-800/90 border-2 ${p.color} rounded-xl gap-2 cursor-grab active:cursor-grabbing hover:border-amber-400 transition-all select-none group" draggable="true" data-idx="${idx}">
                <div class="flex items-center gap-3 pointer-events-none">
                  <span class="text-slate-500 text-xs font-mono select-none px-1">⠿</span>
                  <span class="font-mono text-xs font-bold text-slate-400 w-5">#${idx + 1}</span>
                  <div class="relative flex-shrink-0">
                    <img
                      src="${p.image || `images/${p.id}.jpg`}"
                      alt="${isAr ? p.nameAr : p.nameEn}"
                      class="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-full border-2 shadow-lg transition-transform duration-300 group-hover:scale-105"
                      style="border-color: ${p.hexColor || '#F59E0B'}; box-shadow: 0 0 16px ${(p.hexColor || '#F59E0B')}66, 0 0 4px ${(p.hexColor || '#F59E0B')}44"
                      onerror="this.outerHTML='<span class=\\'text-2xl\\'>${p.icon}</span>'"
                    />
                  </div>
                  <div>
                    <div class="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                      <span>${isAr ? p.nameAr : p.nameEn}</span>
                      <span class="text-xs text-slate-400 font-normal">(${isAr ? p.nameEn : p.nameAr})</span>
                    </div>
                    <div class="text-[11px] text-slate-400">${isAr ? p.descAr : p.descEn}</div>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <span class="font-mono text-xs text-amber-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-700 pointer-events-none mr-1">${p.dist}</span>
                  <button class="arrow-btn p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white" data-action="up" data-idx="${idx}" ${idx === 0 ? 'disabled style="opacity:0.3"' : ''} title="Move Up">⬆</button>
                  <button class="arrow-btn p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white" data-action="down" data-idx="${idx}" ${idx === stateObj.planets.length - 1 ? 'disabled style="opacity:0.3"' : ''} title="Move Down">⬇</button>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button id="verify-btn" class="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition">
              ${isAr ? '🔍 التحقق من محاذاة الكواكب الثمانية' : '🔍 Verify 8-Planet Alignment'}
            </button>
            <div id="feedback-msg" class="text-sm font-medium"></div>
          </div>
        </div>
      `;

      const dragItems = this.container.querySelectorAll('.planet-drag-item');
      dragItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', item.dataset.idx);
          e.dataTransfer.effectAllowed = 'move';
          item.classList.add('is-dragging');
        });
        item.addEventListener('dragend', () => {
          item.classList.remove('is-dragging');
          dragItems.forEach(el => el.classList.remove('drop-zone-active'));
        });
        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          item.classList.add('drop-zone-active');
        });
        item.addEventListener('dragleave', () => {
          item.classList.remove('drop-zone-active');
        });
        item.addEventListener('drop', (e) => {
          e.preventDefault();
          item.classList.remove('drop-zone-active');
          const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
          const toIdx = parseInt(item.dataset.idx, 10);
          if (!isNaN(fromIdx) && !isNaN(toIdx) && fromIdx !== toIdx) {
            const [moved] = stateObj.planets.splice(fromIdx, 1);
            stateObj.planets.splice(toIdx, 0, moved);
            window.cosmicAudio.playClick();
            safeRender();
          }
        });
      });

      this.container.querySelectorAll('.arrow-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          window.cosmicAudio.playClick();
          const action = btn.dataset.action;
          const idx = parseInt(btn.dataset.idx, 10);
          if (action === 'up' && idx > 0) {
            const temp = stateObj.planets[idx];
            stateObj.planets[idx] = stateObj.planets[idx - 1];
            stateObj.planets[idx - 1] = temp;
          } else if (action === 'down' && idx < stateObj.planets.length - 1) {
            const temp = stateObj.planets[idx];
            stateObj.planets[idx] = stateObj.planets[idx + 1];
            stateObj.planets[idx + 1] = temp;
          }
          safeRender();
        });
      });

      const verifyBtn = this.container.querySelector('#verify-btn');
      const feedback = this.container.querySelector('#feedback-msg');

      verifyBtn.addEventListener('click', () => {
        let isCorrect = true;
        stateObj.planets.forEach((p, idx) => {
          if (p.correctPos !== idx) isCorrect = false;
        });

        if (isCorrect) {
          window.cosmicAudio.playCorrect();
          window.cosmicConfetti.burst();
          feedback.innerHTML = `
            <div class="p-4 bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl text-emerald-300 shadow-xl">
              <p class="font-black text-sm sm:text-base flex items-center gap-2">
                <span>✨</span> ${isAr ? 'محاذاة مدارية خارقة لكواكب المجموعة الشمسية الثمانية!' : 'Flawless 8-Planet Solar Alignment!'}
              </p>
              <p class="text-xs mt-1 text-slate-300">
                ${isAr
                  ? 'ترتيب دقيق يبدأ من عطارد الأقرب للشمس حتى نبتون في أطراف الفضاء!'
                  : 'Perfect sequence from sun-scorched Mercury to frigid Neptune!'}
              </p>
              <div class="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-3 mt-3 border-t border-emerald-800/60 scrollbar-thin">
                ${stateObj.planets.map((p, pIdx) => `
                  <div class="flex flex-col items-center flex-shrink-0 min-w-[52px]">
                    <img
                      src="${p.image || `images/${p.id}.jpg`}"
                      alt="${isAr ? p.nameAr : p.nameEn}"
                      class="w-10 h-10 object-cover rounded-full border-2 shadow-lg"
                      style="border-color: ${p.hexColor}; box-shadow: 0 0 12px ${p.hexColor}88"
                      onerror="this.outerHTML='<span class=\\'text-lg\\'>${p.icon}</span>'"
                    />
                    <span class="text-[10px] font-bold text-white mt-1 truncate max-w-[55px]">${isAr ? p.nameAr : p.nameEn}</span>
                    <span class="text-[9px] font-mono text-emerald-400">#${pIdx + 1}</span>
                  </div>
                  ${pIdx < stateObj.planets.length - 1 ? '<span class="text-slate-500 text-xs self-center">➔</span>' : ''}
                `).join('')}
              </div>

              <!-- NASA Planetary Portals Links -->
              <div class="flex flex-wrap items-center justify-center gap-2 mt-3 pt-2.5 border-t border-emerald-800/40 text-[11px]">
                <a href="https://ccmc.gsfc.nasa.gov/tools/DONKI/" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 rounded-lg text-amber-300 font-bold flex items-center gap-1 no-underline shadow-sm transition">
                  <span>⚪ ${isAr ? 'عطارد: CCMC DONKI لطقس الفضاء ↗' : 'Mercury: NASA CCMC DONKI ↗'}</span>
                </a>
                <a href="https://trek.nasa.gov/mars/" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/60 rounded-lg text-red-300 font-bold flex items-center gap-1 no-underline shadow-sm transition">
                  <span>🔴 ${isAr ? 'المريخ: خرائط NASA Mars Trek ↗' : 'Mars: NASA Mars Trek Portal ↗'}</span>
                </a>
              </div>
            </div>
          `;
          verifyBtn.disabled = true;
          verifyBtn.style.opacity = '0.5';
          this.triggerStageSuccess('s1_1', 120, 100);
        } else {
          window.cosmicAudio.playWrong();
          feedback.innerHTML = `
            <div class="p-3 bg-rose-950/80 border border-rose-500 rounded-xl text-rose-300">
              ⚠️ ${isAr
                ? 'محاذاة غير متطابقة! فكر في الترتيب: الكواكب الصخرية الداخلية أولاً، ثم عمالقة الغاز، وأخيراً عمالقة الجليد في الأطراف!'
                : 'Orbital mismatch! Hint: Inner rocky worlds orbit closest, followed by the colossal gas giants, and ice giants reside in the deep cold!'}
            </div>
          `;
        }
      });
    };

    render();
  }

  // --- 2. S1_2: Asteroid Lane Navigation with MOUSE / TOUCH Tracking ---
  initStage1_2(lang) {
    const isAr = lang === 'ar';
    this.container.innerHTML = `
      <div class="challenge-box">
        <div class="challenge-header">
          <div class="flex items-center justify-between">
            <span class="badge-tag">CHALLENGE 2 • PROBE NAVIGATION</span>
            <span class="text-xs font-mono text-cyan-400 font-bold">1.52 AU ➔ 2.77 AU ➔ 5.20 AU</span>
          </div>
          <h3 class="text-xl font-bold text-cyan-400 mt-1">
            ${isAr ? 'قيادة المسبار عبر حزام الكويكبات' : 'Steer Probe Through the Asteroid Lane'}
          </h3>
          <p class="text-sm text-slate-300 mt-1">
            ${isAr ? 'يمكنك تحريك الفأرة مباشرة على الشاشة (أو استخدام الأسهم/الأزرار) لمناورة مسبارك وجمع 5 منارات ذهبية!' : 'Move your mouse across the canvas (or use arrow keys/touch buttons) to steer the probe and collect 5 golden science beacons!'}
          </p>

          <!-- Trajectory Indicators: Mars ➔ Ceres/Asteroids ➔ Jupiter -->
          <div class="flex items-center justify-between gap-3 p-3 my-3 bg-slate-900/90 border border-slate-800 rounded-2xl">
            <div class="flex items-center gap-2">
              <img
                src="images/mars.jpg"
                alt="Mars"
                class="w-10 h-10 object-cover rounded-full border-2 border-red-500 shadow-lg"
                style="box-shadow: 0 0 12px #EF444488"
                onerror="this.src='/images/mars.jpg'"
              />
              <div class="leading-tight">
                <span class="text-[10px] text-slate-400 font-mono block">${isAr ? 'نقطة الانطلاق' : 'Origin World'}</span>
                <span class="text-xs font-bold text-red-400">${isAr ? 'المريخ (1.52 AU)' : 'Mars (1.52 AU)'}</span>
              </div>
            </div>

            <div class="flex-1 flex flex-col items-center px-2">
              <span class="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
                <span>🪨</span> ${isAr ? 'حزام سيريس' : 'Ceres Asteroid Lane'}
              </span>
              <div class="w-full h-1 bg-slate-800 rounded-full my-1 relative overflow-hidden">
                <div class="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-red-500 via-amber-400 to-amber-600 opacity-60"></div>
              </div>
              <span class="text-[9px] text-slate-500 font-mono">🛸 Deep Space Probe</span>
            </div>

            <div class="flex items-center gap-2">
              <div class="leading-tight text-right rtl:text-left">
                <span class="text-[10px] text-slate-400 font-mono block">${isAr ? 'الوجهة المدارية' : 'Destination'}</span>
                <span class="text-xs font-bold text-amber-400">${isAr ? 'المشتري (5.20 AU)' : 'Jupiter (5.20 AU)'}</span>
              </div>
              <img
                src="images/jupiter.jpg"
                alt="Jupiter"
                class="w-10 h-10 object-cover rounded-full border-2 border-amber-600 shadow-lg"
                style="box-shadow: 0 0 12px #D9770688"
                onerror="this.src='/images/jupiter.jpg'"
              />
            </div>
          </div>
        </div>

        <div class="relative mt-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner">
          <canvas id="game-canvas" width="560" height="340" class="w-full block cursor-crosshair"></canvas>
          <div id="game-overlay" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-center">
            <h4 class="text-lg font-bold text-white mb-2">${isAr ? 'جاهز للمناورة الفضائية؟' : 'Ready for Asteroid Navigation?'}</h4>
            <p class="text-xs text-slate-300 mb-4 max-w-sm">
              ${isAr ? 'حرك الفأرة يساراً ويميناً على الشاشة لتوجيه المسبار، وتفادَ الاصطدام بصخور الكويكبات!' : 'Slide your mouse or finger left and right to guide the probe and collect 5 golden telemetry beacons!'}
            </p>
            <button id="start-game-btn" class="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg">
              ${isAr ? '🚀 انطلاق المسبار' : '🚀 Launch Probe'}
            </button>
          </div>
        </div>

        <!-- Optional Touch & Keyboard fallback -->
        <div class="flex justify-between items-center mt-3 gap-3">
          <button id="btn-left" class="flex-1 py-2.5 bg-slate-800 active:bg-cyan-600 border border-slate-700 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2">
            ◀ ${isAr ? 'يسار' : 'Left'}
          </button>
          <div class="text-xs text-slate-400 font-mono text-center px-2">
            <span id="beacon-counter" class="text-amber-400 font-bold text-sm">0/5</span> BEACONS<br>
            <span id="shield-counter" class="text-emerald-400 font-bold text-sm">100%</span> SHIELDS
          </div>
          <button id="btn-right" class="flex-1 py-2.5 bg-slate-800 active:bg-cyan-600 border border-slate-700 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2">
            ${isAr ? 'يمين' : 'Right'} ▶
          </button>
        </div>
      </div>
    `;

    const canvas = this.container.querySelector('#game-canvas');
    const ctx = canvas.getContext('2d');
    const overlay = this.container.querySelector('#game-overlay');
    const startBtn = this.container.querySelector('#start-game-btn');
    const beaconCounter = this.container.querySelector('#beacon-counter');
    const shieldCounter = this.container.querySelector('#shield-counter');

    let probe = { x: 280, y: 300, speed: 6, vx: 0 };
    let asteroids = [];
    let beacons = [];
    let beaconsCollected = 0;
    let shields = 100;
    let isRunning = false;

    // Mouse movement controller
    canvas.addEventListener('mousemove', (e) => {
      if (!isRunning) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
      probe.x = Math.max(20, Math.min(canvas.width - 20, mouseX));
    });

    // Touch movement controller for mobile
    canvas.addEventListener('touchmove', (e) => {
      if (!isRunning || !e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      const touchX = ((e.touches[0].clientX - rect.left) / rect.width) * canvas.width;
      probe.x = Math.max(20, Math.min(canvas.width - 20, touchX));
      e.preventDefault();
    }, { passive: false });

    const spawnObstacle = () => {
      if (!isRunning) return;
      if (Math.random() > 0.45) {
        asteroids.push({
          x: Math.random() * (canvas.width - 30) + 15,
          y: -20,
          r: 10 + Math.random() * 12,
          speed: 2 + Math.random() * 2.5
        });
      }
      if (Math.random() > 0.75 && beacons.length + beaconsCollected < 10) {
        beacons.push({
          x: Math.random() * (canvas.width - 40) + 20,
          y: -20,
          r: 9,
          speed: 1.8
        });
      }
    };

    let spawnTimer = null;

    const gameLoop = () => {
      if (!isRunning) return;

      probe.x += probe.vx;
      if (probe.x < 20) probe.x = 20;
      if (probe.x > canvas.width - 20) probe.x = canvas.width - 20;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Starfield background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 30; i++) {
        const sx = (i * 73) % canvas.width;
        const sy = (Date.now() * 0.05 + i * 50) % canvas.height;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Draw Beacons
      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 10;
      for (let i = beacons.length - 1; i >= 0; i--) {
        const b = beacons[i];
        b.y += b.speed;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();

        const dist = Math.hypot(b.x - probe.x, b.y - probe.y);
        if (dist < b.r + 16) {
          beacons.splice(i, 1);
          beaconsCollected++;
          beaconCounter.textContent = `${beaconsCollected}/5`;
          window.cosmicAudio.playClick();
          if (beaconsCollected >= 5) {
            endGame(true);
            return;
          }
        } else if (b.y > canvas.height + 20) {
          beacons.splice(i, 1);
        }
      }
      ctx.shadowBlur = 0;

      // Draw Asteroids
      ctx.fillStyle = '#78716C';
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.y += a.speed;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();

        const dist = Math.hypot(a.x - probe.x, a.y - probe.y);
        if (dist < a.r + 14) {
          asteroids.splice(i, 1);
          shields = Math.max(0, shields - 25);
          shieldCounter.textContent = `${shields}%`;
          window.cosmicAudio.playWrong();
          if (shields <= 0) {
            endGame(false);
            return;
          }
        } else if (a.y > canvas.height + 30) {
          asteroids.splice(i, 1);
        }
      }

      // Draw Probe
      ctx.fillStyle = '#38BDF8';
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(probe.x, probe.y - 14);
      ctx.lineTo(probe.x - 12, probe.y + 12);
      ctx.lineTo(probe.x + 12, probe.y + 12);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Thruster flame
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(probe.x - 6, probe.y + 12);
      ctx.lineTo(probe.x, probe.y + 20 + Math.random() * 6);
      ctx.lineTo(probe.x + 6, probe.y + 12);
      ctx.fill();

      this.activeGameLoop = requestAnimationFrame(gameLoop);
    };

    const endGame = (victory) => {
      isRunning = false;
      clearInterval(spawnTimer);
      overlay.style.display = 'flex';

      if (victory) {
        window.cosmicAudio.playCorrect();
        window.cosmicConfetti.burst();
        overlay.innerHTML = `
          <h4 class="text-xl font-bold text-emerald-400 mb-1">🎉 ${isAr ? 'تم عبور مسار الكويكبات بنجاح!' : 'Asteroid Belt Cleared!'}</h4>
          <p class="text-xs text-slate-200 mb-4 max-w-sm">
            ${isAr
              ? 'أحسنت صنعاً! جمعت 5 منارات علمية وسجلت مساراً آمناً عبر صخور الكويكبات وصولاً لمدار المشتري العظيم.'
              : 'Stellar flying, Cadet! You collected all 5 science beacons and safely navigated past Ceres into the realm of Jupiter!'}
          </p>
          <div class="text-sm font-bold text-amber-400 mb-3">+140 XP Awarded!</div>
        `;
        this.triggerStageSuccess('s1_2', 140, 100);
      } else {
        overlay.innerHTML = `
          <h4 class="text-xl font-bold text-rose-400 mb-1">💥 ${isAr ? 'نفدت طاقة الدروع!' : 'Shields Depleted!'}</h4>
          <p class="text-xs text-slate-200 mb-4">
            ${isAr ? 'اصطدم المسبار بصخور الكويكبات. أعد المحاولة وحرك الفأرة لتفادي الصخور!' : 'The probe took too many asteroid hits. Re-engage thrusters and try again!'}
          </p>
          <button id="retry-game-btn" class="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl">
            🔄 ${isAr ? 'إعادة الإطلاق' : 'Relaunch Probe'}
          </button>
        `;
        overlay.querySelector('#retry-game-btn').addEventListener('click', () => {
          this.initStage1_2(lang);
        });
      }
    };

    startBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
      isRunning = true;
      beaconsCollected = 0;
      shields = 100;
      asteroids = [];
      beacons = [];
      spawnTimer = setInterval(spawnObstacle, 500);
      window.cosmicAudio.playLaunchWarp();
      gameLoop();
    });

    const keyHandler = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') probe.vx = -probe.speed;
      if (e.key === 'ArrowRight' || e.key === 'd') probe.vx = probe.speed;
    };
    const keyUpHandler = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) probe.vx = 0;
    };
    window.addEventListener('keydown', keyHandler);
    window.addEventListener('keyup', keyUpHandler);

    const leftBtn = this.container.querySelector('#btn-left');
    const rightBtn = this.container.querySelector('#btn-right');
    const handleTouch = (btn, val) => {
      btn.addEventListener('mousedown', () => { probe.vx = val; window.cosmicAudio.playClick(); });
      btn.addEventListener('mouseup', () => { probe.vx = 0; });
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); probe.vx = val; });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); probe.vx = 0; });
    };
    handleTouch(leftBtn, -probe.speed);
    handleTouch(rightBtn, probe.speed);
  }

// --- 3. S1_3: Solar System Planetary Expeditions (7 Worlds & Final Fact Challenge) ---
  initStage1_3(lang) {
    const isAr = lang === 'ar';

    const planets = [
      {
        id: 'mercury',
        nameEn: 'Mercury', nameAr: 'عطارد',
        color: '#94A3B8', icon: '⚪',
        image: 'images/mercury.jpg',
        sectionsEn: {
          characteristics: 'Smallest planet in the solar system and closest to the Sun. Surface heavily cratered, resembling Earth\'s Moon.',
          atmosphere: 'Virtually no atmosphere (a razor-thin exosphere of sodium, magnesium, and oxygen blown by solar wind).',
          temperature: 'Extreme temperature swing of 610°C: scorching +430°C in sunlight, plummeting to −180°C in deep night shadow.',
          discoveries: 'Permanently shadowed polar craters harbor billions of tons of frozen water ice shielded from direct solar radiation.'
        },
        sectionsAr: {
          characteristics: 'أصغر كواكب مجموعتنا الشمسية وأقربها إلى الشمس. سطحه مليء بالفوهات الصدمية ويشبه سطح قمر الأرض.',
          atmosphere: 'شبه معدوم الغلاف الجوي (إكسوسفير فائق الرقة من جزيئات الصوديوم والمغنيسيوم والأكسجين التي تدفعها الرياح الشمسية).',
          temperature: 'تأرجح حراري هائل يصل إلى 610 درجات مئوية: لاهب نهاراً عند +430°م، ويتجمد ليلاً عند −180°م في الظلام الدامس.',
          discoveries: 'تحتوي فوهاته القطبية الغارقة في الظل الدائم على مليارات الأطنان من الجليد المائي المحمي من حرارة الشمس المباشرة.'
        },
        gameType: 'mercury_route_planner',
        gameTitleEn: 'Terminator Route: Mercury Crater Shadow Navigation',
        gameTitleAr: 'مخطط مسار الظلال القطبية: عطارد',
        gameDescEn: 'Navigate the thermal rover from landing zone to polar water ice! Mercury has no atmosphere to distribute heat: direct sun scorches at +430°C while shadows freeze at −180°C. Keep your rover core between −50°C and +80°C to reach the ice crater safely!',
        gameDescAr: 'وجّه المستكشف الحراري من موقع الهبوط إلى فوهة الجليد القطبي! لا يمتلك عطارد غلافاً جوياً لتوزيع الحرارة: شمس النهار تلهب عند +430°م بينما ظلال الفوهات تتجمد عند −180°م. حافظ على حرارة المستكشف بين −50°م و +80°م للوصول بسلام!'
      },
      {
        id: 'venus',
        nameEn: 'Venus', nameAr: 'الزهرة',
        color: '#F59E0B', icon: '🟡',
        image: 'images/venus.jpg',
        sectionsEn: {
          characteristics: 'Often called Earth\'s \'sister world\' in size and mass, but with a hellish surface environment.',
          atmosphere: 'Crushing carbon dioxide (96.5% CO₂) atmosphere with sulfuric acid clouds; surface pressure is 92 times Earth\'s!',
          temperature: 'The hottest planet in the solar system at ~465°C, hot enough to melt lead, driven by runaway greenhouse heat.',
          discoveries: 'Spins backward (retrograde rotation), meaning the Sun rises in the west and sets in the east!'
        },
        sectionsAr: {
          characteristics: 'يُطلق عليه توأم الأرض لتشابه حجمه وكتلته، إلا أنه يمتلك بيئة سطحية جحيمية لا مثيل لها.',
          atmosphere: 'غلاف جوي ساحق يتكون بنسبة 96.5% من ثاني أكسيد الكربون مع غيوم من حمض الكبريتيك؛ وضغطه يعادل 92 ضعف ضغط سطح الأرض!',
          temperature: 'أسخن كواكب النظام الشمسي على الإطلاق بحرارة تتجاوز 465°م تكفي لإذابة معدن الرصاص، بسبب الاحتباس الحراري الجامح.',
          discoveries: 'يدور حول نفسه في اتجاه معاكس (دوران تراجعي)، ما يجعل الشمس تشرق على سطحه من الغرب وتغرب في الشرق!'
        },
        gameType: 'greenhouse_sequence',
        gameTitleEn: '🏭 Runaway Greenhouse Sequencer',
        gameTitleAr: '🏭 تسلسل الاحتباس الحراري الجامح على الزهرة',
        gameDescEn: 'Drag and sequence the 4 chronological stages of Venus\'s runaway greenhouse effect using science emojis instead of numbers!',
        gameDescAr: 'اسحب ورتب المراحل الأربع للاحتباس الحراري على كوكب الزهرة بالرموز العلمية دون أرقام مسبقة!',
        gameItems: [
          { stepId: 'gh1', correctPos: 0, emoji: '☀️', textEn: 'Intense solar radiation penetrates dense clouds and heats volcanic basalt rocks', textAr: 'تخترق الأشعة الشمسية الغيوم لتسخن صخور البازلت البركانية على السطح' },
          { stepId: 'gh2', correctPos: 1, emoji: '♨️', textEn: 'Scorched planetary surface radiates heat back upward as infrared thermal waves', textAr: 'يشع السطح الساخن الحرارة للأعلى على هيئة موجات تحت حمراء حرارية' },
          { stepId: 'gh3', correctPos: 2, emoji: '☁️', textEn: 'Ultra-dense 96.5% CO₂ cloud layers trap infrared heat with zero atmospheric release', textAr: 'تحبس طبقات غاز CO₂ الكثيفة بنسبة 96.5% الأشعة الحرارية مانعة تسربها للفضاء' },
          { stepId: 'gh4', correctPos: 3, emoji: '🌡️', textEn: 'Surface temperatures surge to a lead-melting 465°C with 92 atmospheres of crushing pressure', textAr: 'تقفز حرارة السطح إلى 465°م القادرة على صهر الرصاص تحت ضغط ساحق 92 بار' }
        ]
      },
      {
        id: 'mars',
        nameEn: 'Mars', nameAr: 'المريخ',
        color: '#EF4444', icon: '🔴',
        image: 'images/mars.jpg',
        sectionsEn: {
          characteristics: 'The Red Planet, home to the solar system\'s tallest volcano (Olympus Mons) and deepest canyon (Valles Marineris).',
          atmosphere: 'Thin atmosphere mostly of carbon dioxide (95%), offering little protection from cosmic radiation.',
          temperature: 'A cold desert world averaging −60°C; can reach +20°C at noon on the equator but drops to −125°C at winter poles.',
          discoveries: 'Ancient river valleys and delta deposits prove liquid water once flowed abundantly on its surface billions of years ago.'
        },
        sectionsAr: {
          characteristics: 'الكوكب الأحمر، وموطن أعلى بركان في النظام الشمسي (أوليمبوس مونس) وأعمق الأخاديد (فاليس مارينيريس).',
          atmosphere: 'غلاف جوي رقيق يتكون بنسبة 95% من ثاني أكسيد الكربون، ويوفر حماية ضئيلة للغاية من الإشعاعات الكونية.',
          temperature: 'عالم صحراوي متجمد بمتوسط حرارة −60°م؛ قد يبلغ +20°م ظهراً عند خط الاستواء ويهبط إلى −125°م في قطبيه شتاءً.',
          discoveries: 'أثبتت الدلتا والوديان الجافة تدفق المياه السائلة بوفرة في بحيراته وأنهاره القديمة قبل مليارات السنين.'
        },
        gameType: 'mars_quiz',
        gameTitleEn: '🏔️ Mars Science Explorer Console',
        gameTitleAr: '🏔️ منصة استكشاف علوم كوكب المريخ',
        gameDescEn: 'Answer the 4 scientific exploration queries correctly. Options are dynamically shuffled on each attempt!',
        gameDescAr: 'أجب عن التساؤلات العلمية الأربعة لمركبات استكشاف المريخ بدقة، حيث يتم خلط خيارات الإجابة عشوائياً!',
        gameItems: [
          {
            qEn: 'Why does planet Mars exhibit its famous distinct rusty-red coloration?',
            qAr: 'ما السبب العلمي وراء ظهور كوكب المريخ باللون الأحمر الصدئ المميز؟',
            optsEn: ['Iron oxide (rust) covering the soil', 'Red volcanic sulfur lakes', 'Alien red vegetation', 'Scattering of red laser light'],
            optsAr: ['أكسيد الحديد (الصدأ) المغطي للتربة', 'بحيرات كبريت بركاني حمراء', 'نباتات فضائية حمراء', 'تشتت ضوء الليزر الأحمر'],
            correct: 0
          },
          {
            qEn: 'How high is Olympus Mons compared to Earth\'s Mount Everest (8.8 km)?',
            qAr: 'كم يبلغ ارتفاع بركان أوليمبوس مونس مقارنة بقمة إفرست على الأرض (8.8 كم)؟',
            optsEn: ['21 km high (3x Mount Everest!)', '8.8 km high (same as Everest)', '50 km high', '3 km high'],
            optsAr: ['21 كم ارتفاعاً (3 أضعاف إفرست!)', '8.8 كم (نفس ارتفاع إفرست)', '50 كم ارتفاعاً', '3 كم فقط'],
            correct: 0
          },
          {
            qEn: 'What are the names of Mars\'s two captured asteroid-like moons?',
            qAr: 'ما هما اسما قمري المريخ الصغيرين الشبيهين بالكويكبات؟',
            optsEn: ['Phobos & Deimos', 'Io & Europa', 'Titan & Enceladus', 'Triton & Charon'],
            optsAr: ['فوبوس وديموس', 'إيو وأوروبا', 'تيتان وإنسيلادوس', 'ترايتون وشارون'],
            correct: 0
          },
          {
            qEn: 'What is the principal gas composing over 95% of the thin Martian atmosphere?',
            qAr: 'ما هو الغاز الرئيسي الذي يشكل أكثر من 95% من غلاف المريخ الجوي الرقيق؟',
            optsEn: ['Carbon Dioxide (CO₂)', 'Oxygen (O₂)', 'Nitrogen (N₂)', 'Hydrogen (H₂)'],
            optsAr: ['ثاني أكسيد الكربون (CO₂)', 'الأكسجين (O₂)', 'النيتروجين (N₂)', 'الهيدروجين (H₂)'],
            correct: 0
          }
        ]
      },
      {
        id: 'jupiter',
        nameEn: 'Jupiter', nameAr: 'المشتري',
        color: '#D97706', icon: '🪐',
        image: 'images/jupiter.jpg',
        sectionsEn: {
          characteristics: 'The giant king of planets, more than twice as massive as all other solar system planets combined.',
          atmosphere: 'Atmosphere composed of hydrogen and helium, featuring swirling storms and belts of ammonia crystal clouds.',
          temperature: 'Cloud-top temperature sits at a frosty −110°C, while its dense core scorches at an estimated 24,000°C.',
          discoveries: 'The Great Red Spot is a persistent anticyclonic storm larger than planet Earth that has raged for over 300 years.'
        },
        sectionsAr: {
          characteristics: 'عملاق الكواكب وأضخمها، فكتلته تعادل أكثر من ضعفي كتلة جميع كواكب النظام الشمسي مجتمعة.',
          atmosphere: 'يتألف غلافه من الهيدروجين والهيليوم، ويتميز بأحزمة سحابية ملونة وعواصف دوامية من بلورات الأمونيا.',
          temperature: 'تبلغ الحرارة عند قمم سحبه حوالي −110°م، بينما ترتفع في قلبه المضغوط إلى ما يقارب 24,000°م.',
          discoveries: 'البقعة الحمراء العظيمة عاصفة إعصارية هائلة تتسع لكوكب الأرض كاملاً ومستمرة منذ أكثر من 300 عام.'
        },
        gameType: 'galilean_match',
        gameTitleEn: '🔭 Galilean Moons Discovery Matcher',
        gameTitleAr: '🔭 مطابقة اكتشافات أقمار غاليليو الأربعة',
        gameDescEn: 'Match each of the 4 Galilean moons to its unique scientific hallmark. Answers are randomized in order!',
        gameDescAr: 'طابق كل قمر من أقمار غاليليو الأربعة باكتشافه العلمي الفريد، حيث تعرض كروت الاكتشافات بترتيب عشوائي!',
        gameItems: [
          {
            moonId: 'io', nameEn: 'Io', nameAr: 'إيو', icon: '🌋',
            featEn: 'Most geologically active body with 400+ active erupting sulfur volcanoes',
            featAr: 'أكثر أجرام النظام الشمسي نشاطاً بركانياً مع أكثر من 400 بركان كبريتي ثائر'
          },
          {
            moonId: 'europa', nameEn: 'Europa', nameAr: 'أوروبا', icon: '🌊',
            featEn: 'Smooth cracked ice crust concealing a vast global subsurface liquid water ocean',
            featAr: 'قشرة جليدية متشققة تخفي تحتها محيطاً مائياً سائلاً عملاقاً يحتوي ضعفي مياه الأرض'
          },
          {
            moonId: 'ganymede', nameEn: 'Ganymede', nameAr: 'غانيميد', icon: '🌐',
            featEn: 'Largest moon in the entire solar system (even larger than planet Mercury!) with its own magnetic field',
            featAr: 'أكبر قمر في النظام الشمسي على الإطلاق (أكبر من كوكب عطارد نفسه!) وله مجاله المغناطيسي الخاص'
          },
          {
            moonId: 'callisto', nameEn: 'Callisto', nameAr: 'كاليستو', icon: '🌑',
            featEn: 'Most heavily cratered ancient surface in the solar system, virtually unchanged for 4 billion years',
            featAr: 'أقدم وأكثر أسطح النظام الشمسي امتلاءً بالفوهات القديمة الصامدة منذ 4 مليارات عام'
          }
        ]
      },
      {
        id: 'saturn',
        nameEn: 'Saturn', nameAr: 'زحل',
        color: '#EAB308', icon: '✨',
        image: 'images/saturn.jpg',
        sectionsEn: {
          characteristics: 'Famed for its spectacular ring system extending up to 282,000 km from the planet yet only tens of meters thick.',
          atmosphere: 'Composed primarily of hydrogen and helium, featuring high-speed equatorial winds reaching 1,800 km/h.',
          temperature: 'Upper atmosphere averages −140°C. Saturn radiates 2.5 times more heat into space than it receives from the Sun.',
          discoveries: 'Its density is lower than water (0.687 g/cm³) — Saturn would literally float if placed in a large enough ocean!'
        },
        sectionsAr: {
          characteristics: 'يشتهر بنظام حلقاته البديع الممتد حتى 282,000 كم، لكن سُمكها لا يتجاوز بضع عشرات من الأمتار.',
          atmosphere: 'يتكون غلافه أساساً من الهيدروجين والهيليوم، مع رياح استوائية فائقة السرعة تبلغ 1800 كم/ساعة.',
          temperature: 'متوسط حرارة طبقاته العليا −140°م، ويشع حرارة إلى الفضاء تعادل 2.5 ضعف ما تصله من الشمس.',
          discoveries: 'كثافته أقل من كثافة الماء (0.687 جم/سم³) — ما يعني أن كوكب زحل سيطفو فعلياً لو وجد محيط كافٍ لاستيعابه!'
        },
        gameType: 'saturn_true_false',
        gameTitleEn: '⚖️ Saturnian Ring & Moon Truth Analyzer',
        gameTitleAr: '⚖️ مختبر حقائق حلقات وأقمار زحل',
        gameDescEn: 'Evaluate 5 scientific statements about Saturn\'s rings, atmosphere, and exotic moons as TRUE or FALSE.',
        gameDescAr: 'قيّم 5 حقائق علمية دقيقة حول حلقات كوكب زحل وغلافه وأقماره العجيبة وصنفها: صح أم خطأ.',
        gameItems: [
          { textEn: 'Saturn\'s rings are solid sheets of polished metal and stone.', textAr: 'تتكون حلقات زحل من صفائح صلبة متصلة من المعدن والصخور المصقولة.', isTrue: false, explainEn: 'False! The rings are made of billions of individual particles of water ice and rock ranging from dust grains to house-sized boulders.', explainAr: 'خطأ! الحلقات تتكون من مليارات القطع المنفصلة من جليد الماء والصخور، بحجم حبات الغبار حتى الصخور الكبيرة.' },
          { textEn: 'Saturn\'s average density is lower than water (0.687 g/cm³), meaning it would float in a gigantic ocean.', textAr: 'متوسط كثافة كوكب زحل أقل من كثافة الماء (0.687 جم/سم³)، ما يعني أنه سيطفو في حوض ماء عملاق.', isTrue: true, explainEn: 'True! Saturn is the only planet in our solar system whose overall density is lower than liquid water.', explainAr: 'صحيح! زحل هو الكوكب الوحيد في نظامنا الشمسي الذي تقل كثافته الكلية عن كثافة الماء السائل.' },
          { textEn: 'Saturn\'s moon Titan has rivers and lakes of liquid methane on its surface.', textAr: 'يمتلك قمر تيتان التابع لزحل أنهاراً وبحيرات من غاز الميثان السائل على سطحه.', isTrue: true, explainEn: 'True! Titan has a thick nitrogen atmosphere and a complete hydrological cycle of liquid methane and ethane.', explainAr: 'صحيح! يمتلك تيتان غلافاً نتروجينياً كثيفاً ودورة هيدرولوجية نشطة بأمطار وبحيرات من الميثان السائل.' },
          { textEn: 'Planet Saturn has fewer moons than planet Mars.', textAr: 'يمتلك كوكب زحل عدداً من الأقمار أقل مما يمتلكه كوكب المريخ.', isTrue: false, explainEn: 'False! Mars has only 2 tiny moons, while Saturn leads the solar system with over 140 confirmed moons!', explainAr: 'خطأ! المريخ يمتلك قمرين صغيرين فقط، بينما يمتلك زحل أكثر من 140 قمراً مؤكداً في مداره!' },
          { textEn: 'Enceladus sprays plumes of water vapor and ice grains into space from geysers at its south pole.', textAr: 'ينفث قمر إنسيلادوس ينابيع مائية عملاقة من بخار الماء وجزيئات الجليد من قطبه الجنوبي.', isTrue: true, explainEn: 'True! NASA\'s Cassini spacecraft sampled these geysers and detected organic molecules from its subsurface ocean.', explainAr: 'صحيح! حلقت مركبة كاسيني عبر هذه الينابيع واكتشفت جزيئات عضوية من المحيط القابع تحت جليده.' }
        ]
      },
      {
        id: 'uranus',
        nameEn: 'Uranus', nameAr: 'أورانوس',
        color: '#06B6D4', icon: '🌐',
        image: 'images/uranus.jpg',
        sectionsEn: {
          characteristics: 'An ice giant that appears pale blue-green because atmospheric methane gas absorbs red light.',
          atmosphere: 'Rich in hydrogen, helium, and methane; features supersonic atmospheric jets reaching 900 km/h.',
          temperature: 'The coldest planetary atmosphere in the solar system, plunging to an extreme record −224°C.',
          discoveries: 'Orbits tilted 98 degrees on its side! Scientists believe an ancient proto-planet collided with it billions of years ago.'
        },
        sectionsAr: {
          characteristics: 'عملاق جليدي يبدو بلون أزرق مخضر بديع لأن غاز الميثان في غلافه يمتص موجات الضوء الأحمر.',
          atmosphere: 'غني بالهيدروجين والهيليوم والميثان؛ وتتحرك في غلافه تيارات رياح نفاثة فائقة تصل إلى 900 كم/ساعة.',
          temperature: 'أبرد غلاف جوي كوكبي في النظام الشمسي على الإطلاق، حيث تهبط حرارته القياسية إلى −224°م.',
          discoveries: 'يدور متدحرجاً على جانبه بانحراف محوري هائل يبلغ 98 درجة، إثر تصادم كوني عنيف مع كوكب أولي قديم.'
        },
        gameType: 'tilt_match',
        gameTitleEn: '🌀 Planetary Axial Tilt Laboratory',
        gameTitleAr: '🌀 مختبر زوايا الانحراف المحوري للكواكب',
        gameDescEn: 'Match Uranus\'s extreme 98° sideways tilt and 3 other worlds to their corresponding axial inclination tilts.',
        gameDescAr: 'طابق ميلان أورانوس الجانبي المتطرف 98° وثلاثة عوالم أخرى بزوايا ميل محاور دورانها الصحيحة.',
        gameItems: [
          { planetId: 'uranus', nameEn: 'Uranus', nameAr: 'أورانوس', tiltDeg: '98°', factEn: 'Extreme sideways barrel-roll rotation', factAr: 'دوران جانبي متطرف كأنه يتدحرج على مساره' },
          { planetId: 'earth', nameEn: 'Earth', nameAr: 'الأرض', tiltDeg: '23.5°', factEn: 'Produces our 4 annual temperate seasons', factAr: 'يمنحنا الفصول الأربعة السنوية المعتدلة' },
          { planetId: 'mars', nameEn: 'Mars', nameAr: 'المريخ', tiltDeg: '25°', factEn: 'Similar tilt causing distinct polar ice cap growth', factAr: 'ميل مقارب للأرض ينتج دورة فصول ونمو القمم القطبية' },
          { planetId: 'mercury', nameEn: 'Mercury', nameAr: 'عطارد', tiltDeg: '0.03°', factEn: 'Virtually upright with permanent polar shadow traps', factAr: 'شبه عمودي تماماً بدون فصول مع مصائد جليد مظلمة' }
        ]
      },
      {
        id: 'neptune',
        nameEn: 'Neptune', nameAr: 'نبتون',
        color: '#1D4ED8', icon: '🔵',
        image: 'images/neptune.jpg',
        sectionsEn: {
          characteristics: 'The most distant major planet in our solar system, completing one orbit every 165 Earth years.',
          atmosphere: 'Its atmosphere is rich in hydrogen, helium, and methane (which absorbs red wavelengths to impart deep azure blue).',
          temperature: 'Frigid and stormy (−214°C). Despite receiving only 0.1% of the sunlight Earth gets, it drives fierce internal heat.',
          discoveries: 'Neptune was the first planet discovered through pure mathematical prediction rather than empirical telescope searching!'
        },
        sectionsAr: {
          characteristics: 'أبعد الكواكب الرئيسية في نظامنا الشمسي عن الشمس، ويكمل دورة واحدة كل 165 سنة أرضية.',
          atmosphere: 'غلافه غني بالهيدروجين والهيليوم والميثان (الذي يمتص الضوء الأحمر ليمنحه لونه الأزرق السماوي العميق).',
          temperature: 'متجمد وعاصف (−214°م)، ورغم أنه لا يتلقى سوى 0.1% من ضوء الشمس مقارنة بالأرض، فإنه يمتلك محرك حرارة داخلي نشط.',
          discoveries: 'كان نبتون أول كوكب يُكتشف عبر الحسابات الرياضية الدقيقة قبل رصده بالتلسكوبات الفلكية!'
        },
        gameType: 'neptune_wind_sorter',
        gameTitleEn: '💨 Supersonic Atmospheric Wind Sorter',
        gameTitleAr: '💨 مصنف سرعات الرياح فوق الصوتية لنبتون',
        gameDescEn: 'Neptune has the fastest winds in the solar system! Click the 5 wind readings in order from slowest to fastest supersonic speed.',
        gameDescAr: 'يمتلك نبتون أعنف وأسرع رياح في المجموعة الشمسية! رتب قراءات الرياح الخمس من الأبطأ إلى الأسرع.',
        gameItems: [
          { speedVal: 400, labelEn: '400 km/h • Earth Category 5 Super-Hurricane', labelAr: '400 كم/ساعة • أعتى أعاصير الأرض' },
          { speedVal: 900, labelEn: '900 km/h • Uranus Polar Atmospheric Jet', labelAr: '900 كم/ساعة • التيارات النفاثة لأورانوس' },
          { speedVal: 1400, labelEn: '1,400 km/h • Speed of Sound Threshold (Mach 1.1)', labelAr: '1400 كم/ساعة • حاجز سرعة الصوت' },
          { speedVal: 1800, labelEn: '1,800 km/h • Saturn Equatorial Super-Jetstream', labelAr: '1800 كم/ساعة • عاصفة زحل الاستوائية' },
          { speedVal: 2100, labelEn: '2,100 km/h • Neptune Supersonic Polar Storm', labelAr: '2100 كم/ساعة • عاصفة نبتون فوق الصوتية الخارقة' }
        ]
      }
    ];

    const finalFacts = [
      {
        planetId: 'mercury',
        factEn: 'A year on this world lasts only 88 Earth days — making its orbit around the Sun shorter than a single day-night cycle (176 Earth days)!',
        factAr: 'سنة هذا العالم تبلغ 88 يوماً أرضياً فقط — ما يجعل دورته حول الشمس أقصر من يومه الكامل بين شروق وآخر (176 يوماً)!'
      },
      {
        planetId: 'venus',
        factEn: 'Experiences a runaway greenhouse effect under crushing CO₂ clouds that drives surface temperatures to 465°C — hot enough to melt solid lead!',
        factAr: 'يشهد احتباساً حرارياً جامحاً تحت غيوم CO₂ الساحقة لترتفع حرارة سطحه إلى 465°م — ما يكفي لإذابة معدن الرصاص!'
      },
      {
        planetId: 'mars',
        factEn: 'Home to Olympus Mons, an ancient volcanic giant standing 21 km into the sky — three times taller than Mount Everest!',
        factAr: 'يحتضن بركان أوليمبوس مونس الهائل الذي يرتفع 21 كم في السماء — قرابة ثلاثة أضعاف قمة جبل إفرست!'
      },
      {
        planetId: 'jupiter',
        factEn: 'Features the Great Red Spot, a colossal swirling atmospheric storm larger than planet Earth that has raged continuously for over 300 years!',
        factAr: 'يتميز بالبقعة الحمراء العظيمة، وهي عاصفة إعصارية عملاقة أوسع من كوكب الأرض ومستمرة منذ أكثر من 300 عام!'
      },
      {
        planetId: 'saturn',
        factEn: 'Has an average density lower than liquid water (0.687 g/cm³), meaning this massive giant would actually float in a large enough ocean!',
        factAr: 'كثافته أقل من كثافة الماء السائل (0.687 جم/سم³)، ما يعني أن هذا العملاق سيطفو على سطح الماء لو وجد محيط كافٍ!'
      },
      {
        planetId: 'uranus',
        factEn: 'Rolls around the Sun on its side with an extreme 98° axial tilt, leaving each pole in 42 years of continuous sunlight and 42 years of darkness!',
        factAr: 'يتدحرج حول الشمس على جانبه بانحراف محوري متطرف يبلغ 98 درجة، ليعيش كل قطب 42 عاماً من الشمس المتواصلة و42 عاماً من الظلام!'
      },
      {
        planetId: 'neptune',
        factEn: 'The windiest world in the entire solar system, where ferocious supersonic atmospheric storms blast past 2,100 km/h — faster than sound!',
        factAr: 'أعتا عوالم النظام الشمسي رياحاً على الإطلاق، حيث تعصف فيه رياح فوق صوتية شرسة تتجاوز سرعتها 2100 كم/ساعة — أسرع من الصوت!'
      }
    ];

    // ===== SESSION STATE WITH CRASH DEFENSE =====
    if (!this.sessionState.s1_3) {
      this.sessionState.s1_3 = {
        phase: 'planet',          // 'planet' | 'final'
        planetIdx: 0,
        planetPhase: 'info',      // 'info' | 'game'
        completedPlanets: [],     // completed planet IDs
        gameState: null,
        finalFacts: [...finalFacts].sort(() => Math.random() - 0.5),
        finalMatches: {},         // factIdx -> planetId
        finalSelectedFact: null,
        finalFeedback: null,
        stageSuccessTriggered: false
      };
    }
    const st = this.sessionState.s1_3;
    if (!st.finalFacts || !st.finalFacts.length) {
      st.finalFacts = [...finalFacts].sort(() => Math.random() - 0.5);
    }
    if (!st.completedPlanets) st.completedPlanets = [];

    // Is the entire 7-planet challenge conquered?
    const isWholeChallengeComplete = st.completedPlanets.length >= 7 || st.stageSuccessTriggered;

    // Helper: Universal Planet Navigation Bar
    const renderPlanetNavBarHTML = () => {
      return `
        <div class="mb-3 p-2 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-lg">
          <div class="flex items-center justify-between px-2 mb-1.5 text-[11px] font-mono">
            <span class="text-amber-400 font-bold flex items-center gap-1.5">
              <span>🪐</span> ${isAr ? 'لوحة الملاحة والانتقال بين الكواكب' : 'Planetary Expedition Navigator'}
            </span>
            <span class="text-slate-400">
              ${st.completedPlanets.length}/7 ${isAr ? 'عوالم مكتملة' : 'Worlds Conquered'}
            </span>
          </div>
          <div class="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
            ${planets.map((pl, idx) => {
              const isDone = st.completedPlanets.includes(pl.id);
              const isActive = (st.phase === 'planet' && st.planetIdx === idx);
              const isAccessible = isDone || isWholeChallengeComplete || idx <= st.completedPlanets.length;
              return `
                <button class="planet-nav-tab flex-1 min-w-[70px] sm:min-w-[85px] py-1.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 border ${
                  isActive ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400 shadow-md scale-105' :
                  isDone ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/70 hover:bg-emerald-900' :
                  isAccessible ? 'bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-400' :
                  'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                }" data-planetidx="${idx}" ${!isAccessible ? 'disabled' : ''}>
                  <img
                    src="${pl.image}"
                    alt="${isAr ? pl.nameAr : pl.nameEn}"
                    class="w-6 h-6 sm:w-7 sm:h-7 object-cover rounded-full border shadow-sm pointer-events-none mb-0.5 ${isActive ? 'ring-2 ring-slate-950' : ''}"
                    style="border-color: ${pl.color}; box-shadow: 0 0 8px ${pl.color}88"
                    onerror="this.outerHTML='<span class=\\'text-base pointer-events-none\\'>${pl.icon}</span>'"
                  />
                  <span class="text-[10px] sm:text-xs truncate max-w-full pointer-events-none">${isAr ? pl.nameAr : pl.nameEn}</span>
                  <span class="text-[9px] font-mono pointer-events-none ${isDone ? 'text-emerald-400' : (isActive ? 'text-slate-950 font-bold' : 'text-slate-400')}">
                    ${isDone ? '✓' : (idx + 1)}
                  </span>
                </button>
              `;
            }).join('')}
            <!-- Final 7-Planet Fact Challenge Tab -->
            <button class="planet-nav-tab flex-1 min-w-[70px] sm:min-w-[85px] py-1.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 border ${
              st.phase === 'final' ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400 shadow-md scale-105' :
              st.stageSuccessTriggered ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/70' :
              isWholeChallengeComplete ? 'bg-purple-900/80 text-purple-200 border-purple-500 animate-pulse' :
              'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
            }" data-nav="final" ${(!isWholeChallengeComplete && !st.stageSuccessTriggered) ? 'disabled' : ''}>
              <span class="text-base pointer-events-none">🏆</span>
              <span class="text-[10px] sm:text-xs truncate max-w-full pointer-events-none">${isAr ? 'التحدي النهائي' : 'Final Fact'}</span>
              <span class="text-[9px] font-mono pointer-events-none ${st.stageSuccessTriggered ? 'text-emerald-400' : 'text-slate-400'}">
                ${st.stageSuccessTriggered ? '✓' : '★'}
              </span>
            </button>
          </div>
        </div>
      `;
    };

    const attachNavBarListeners = () => {
      this.container.querySelectorAll('.planet-nav-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          const navTarget = btn.dataset.nav;
          if (navTarget === 'final') {
            window.cosmicAudio.playClick();
            st.phase = 'final';
            st.finalFeedback = null;
            render();
            return;
          }
          const pIdx = parseInt(btn.dataset.planetidx, 10);
          if (!isNaN(pIdx) && pIdx >= 0 && pIdx < planets.length) {
            window.cosmicAudio.playClick();
            st.phase = 'planet';
            st.planetIdx = pIdx;
            // Retain game or info phase
            st.gameState = null;
            render();
          }
        });
      });
    };

    // Helper: Next / Done button after finishing a planet game
    const makeGameDoneHTML = (p, isAr) => {
      const isLast = st.planetIdx === planets.length - 1;
      return `
        <button id="game-done-btn" class="mt-4 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl shadow-lg transition active:scale-95 text-sm flex items-center justify-center gap-2">
          ${isLast
            ? (isAr ? '🏆 فتح تحدي الحقائق الكوكبية النهائي!' : '🏆 Unlock Final 7-Planet Fact Challenge!')
            : (isAr ? `➔ انطلق إلى كوكب ${planets[st.planetIdx + 1].nameAr}` : `➔ Expedition to ${planets[st.planetIdx + 1].nameEn}`)
          }
        </button>
      `;
    };

    const attachGameDoneBtn = (p) => {
      const btn = this.container.querySelector('#game-done-btn');
      if (!btn) return;
      btn.addEventListener('click', () => {
        window.cosmicAudio.playLaunchWarp();
        if (!st.completedPlanets.includes(p.id)) st.completedPlanets.push(p.id);
        if (st.planetIdx < planets.length - 1) {
          st.planetIdx++;
          st.planetPhase = 'info';
          st.gameState = null;
          render();
        } else {
          // All 7 individual worlds conquered! Unlock Final Challenge
          st.phase = 'final';
          if (!st.finalFacts || !st.finalFacts.length) {
            st.finalFacts = [...finalFacts].sort(() => Math.random() - 0.5);
          }
          st.finalMatches = {};
          st.finalSelectedFact = null;
          st.finalFeedback = null;
          render();
        }
      });
    };

    // ===== RENDER DISPATCHER =====
    const render = () => {
      if (st.phase === 'planet') {
        if (st.planetPhase === 'info') renderPlanetInfo();
        else renderPlanetGame();
      } else {
        renderFinalChallenge();
      }
      attachNavBarListeners();
    };

    // ===== SCREEN 1: DEDICATED EDUCATIONAL BRIEF FOR EACH PLANET =====
    const renderPlanetInfo = () => {
      const p = planets[st.planetIdx];
      const done = st.completedPlanets.includes(p.id);
      const sec = isAr ? p.sectionsAr : p.sectionsEn;

      this.container.innerHTML = `
        <div class="challenge-box">
          ${renderPlanetNavBarHTML()}

          <div class="challenge-header">
            <div class="flex items-center justify-between">
              <span class="badge-tag">CHALLENGE 3 • PLANET ${st.planetIdx + 1} OF 7</span>
              ${done ? `<span class="px-2.5 py-0.5 bg-emerald-950 border border-emerald-500 rounded-full text-[10px] text-emerald-300 font-bold">${isAr ? 'منجز مسبقاً ✓' : 'Completed ✓'}</span>` : ''}
            </div>
            <h3 class="text-2xl font-black mt-1 flex items-center gap-2" style="color: ${p.color}">
              <span class="text-3xl">${p.icon}</span> ${isAr ? p.nameAr : p.nameEn} ${done ? '✅' : ''}
            </h3>
          </div>

          <!-- NASA Planet Image -->
          ${p.image ? `
          <div class="flex justify-center my-4">
            <div class="relative group">
              <img
                src="${p.image}"
                alt="${isAr ? p.nameAr : p.nameEn}"
                class="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-full shadow-2xl border-4 transition-transform duration-500 group-hover:scale-105"
                style="border-color: ${p.color}; box-shadow: 0 0 32px ${p.color}66, 0 0 8px ${p.color}44"
                onerror="if(!this.src.startsWith('/')) this.src='/' + this.getAttribute('src'); else this.style.display='none';"
              />
            </div>
          </div>
          ` : ''}

          <!-- Structured Educational Knowledge Dossier -->
          <div class="space-y-3 my-4 max-h-[380px] overflow-y-auto pr-1">
            <!-- Characteristics -->
            <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700">
              <div class="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>🌐</span> ${isAr ? 'الخصائص العامة وتكوين الكوكب' : 'Characteristics & Structure'}
              </div>
              <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">${sec.characteristics}</p>
            </div>

            <!-- Atmosphere -->
            <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700">
              <div class="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>💨</span> ${isAr ? 'الغلاف الجوي والضغط' : 'Atmosphere & Pressure'}
              </div>
              <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">${sec.atmosphere}</p>
            </div>

            <!-- Temperature -->
            <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700">
              <div class="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>🌡️</span> ${isAr ? 'درجات الحرارة والمناخ' : 'Temperature & Climate'}
              </div>
              <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">${sec.temperature}</p>
            </div>

            <!-- Unique Features & Discoveries -->
            <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700">
              <div class="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>✨</span> ${isAr ? 'ميزات فريدة واكتشافات بارزة' : 'Unique Features & Discoveries'}
              </div>
              <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">${sec.discoveries}</p>
            </div>

            ${p.id === 'mars' ? `
              <!-- NASA Mars Trek Geographical Cartography (From NASA Trek Portal) -->
              <div class="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/60 border-2 border-red-500/70 shadow-xl">
                <div class="text-[12px] font-mono font-bold text-red-400 uppercase tracking-wider mb-2.5 flex items-center justify-between flex-wrap gap-2">
                  <span class="flex items-center gap-1.5 text-red-300">🗺️ ${isAr ? 'خرائط ناسا المريخية (NASA Mars Trek)' : 'NASA Mars Trek Surface Cartography'}</span>
                  <a href="https://trek.nasa.gov/mars/" target="_blank" rel="noopener noreferrer" class="text-[11px] px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow transition transform hover:scale-105 no-underline">
                    <span>trek.nasa.gov/mars</span> <span>↗</span>
                  </a>
                </div>
                <div class="space-y-2 mb-3">
                  ${(window.NasaData ? window.NasaData.getMarsTrekFacts(lang) : []).map(f => `
                    <div class="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs hover:border-red-500/40 transition">
                      <div class="flex items-center justify-between gap-1 mb-1">
                        <span class="font-bold text-red-300">📍 ${f.name}</span>
                        <span class="font-mono text-[10px] text-slate-400">${f.coords}</span>
                      </div>
                      <div class="text-slate-300 text-[11px] leading-relaxed">${f.fact}</div>
                    </div>
                  `).join('')}
                </div>
                
                <!-- Direct Clickable Button to Open NASA Mars Trek Portal -->
                <a href="https://trek.nasa.gov/mars/" target="_blank" rel="noopener noreferrer" class="w-full py-3 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 no-underline border border-red-400/50">
                  <span>🪐</span>
                  <span>${isAr ? 'اضغط هنا لفتح بوابة ناسا التفاعلية لاستكشاف تضاريس المريخ (NASA Mars Trek) ↗' : 'Click Here to Open NASA Mars Trek 3D Explorer ↗'}</span>
                </a>
              </div>
            ` : ''}

            ${p.id === 'mercury' ? `
              <!-- NASA CCMC DONKI Solar Weather Telemetry for Mercury -->
              <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border-2 border-amber-500/70 shadow-xl">
                <div class="text-[12px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center justify-between flex-wrap gap-2">
                  <span class="flex items-center gap-1.5 text-amber-300">☀️ ${isAr ? 'بيانات طقس الفضاء من ناسا (CCMC DONKI)' : 'NASA CCMC DONKI Live Solar Weather'}</span>
                  <a href="https://ccmc.gsfc.nasa.gov/tools/DONKI/" target="_blank" rel="noopener noreferrer" class="text-[11px] px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold flex items-center gap-1.5 shadow transition transform hover:scale-105 no-underline">
                    <span>ccmc.gsfc.nasa.gov</span> <span>↗</span>
                  </a>
                </div>
                <p class="text-xs text-slate-300 mb-2 leading-relaxed">
                  ${isAr ? 'يرصد نظام CCMC DONKI التوهجات الشمسية والانبعاثات الكتلية الإكليلية (CME) التي تضرب كوكب عطارد بأعلى شدة حرارية نظراً لقربه الشديد من الشمس!' : 'NASA CCMC DONKI tracks real-time solar flares, radiation storms, and coronal mass ejections that blast Mercury with immense solar heat!'}
                </p>
                <div id="mercury-donki-dossier" class="text-xs mb-3"></div>

                <!-- Direct Clickable Button to Open NASA CCMC DONKI -->
                <a href="https://ccmc.gsfc.nasa.gov/tools/DONKI/" target="_blank" rel="noopener noreferrer" class="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 no-underline border border-amber-400/50">
                  <span>☀️</span>
                  <span>${isAr ? 'اضغط هنا لزيارة بوابة ناسا لطقس الفضاء والتوهجات الشمسية (CCMC DONKI) ↗' : 'Click Here to Visit NASA CCMC DONKI Space Weather Portal ↗'}</span>
                </a>
              </div>
            ` : ''}
          </div>

          <!-- Launch Mission Game CTA Row -->
          <div class="flex gap-2 sm:gap-3 flex-wrap">
            ${st.planetIdx > 0 ? `
              <button id="prev-planet-btn" class="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-bold transition">
                ← ${isAr ? 'الكوكب السابق' : 'Previous World'}
              </button>
            ` : ''}
            <button id="start-game-btn" class="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg transition active:scale-95 text-xs sm:text-sm flex items-center justify-center gap-2">
              <span>🎮</span> ${isAr ? p.gameTitleAr : p.gameTitleEn}
            </button>
            ${(done || isWholeChallengeComplete) && st.planetIdx < planets.length - 1 ? `
              <button id="next-planet-btn" class="px-4 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold transition">
                ${isAr ? 'الكوكب التالي' : 'Next World'} →
              </button>
            ` : ''}
          </div>
        </div>
      `;

      if (p.id === 'mercury' && window.NasaData) {
        window.NasaData.getSolarFlareAlertHTML(lang).then(alertHtml => {
          const el = this.container.querySelector('#mercury-donki-dossier');
          if (el && alertHtml) el.innerHTML = alertHtml;
        });
      }

      this.container.querySelector('#start-game-btn').addEventListener('click', () => {
        window.cosmicAudio.playClick();
        st.planetPhase = 'game';
        st.gameState = null;
        render();
      });

      const prevBtn = this.container.querySelector('#prev-planet-btn');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          window.cosmicAudio.playClick();
          st.planetIdx--;
          st.planetPhase = 'info';
          st.gameState = null;
          render();
        });
      }

      const nextBtn = this.container.querySelector('#next-planet-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          window.cosmicAudio.playClick();
          st.planetIdx++;
          st.planetPhase = 'info';
          st.gameState = null;
          render();
        });
      }
    };

    // Helper: Game top toolbar with Back, Replay mode status, Prev & Next
    const makeGameHeaderHTML = (p) => {
      const isDone = st.completedPlanets.includes(p.id);
      const canGoNext = isDone || isWholeChallengeComplete;
      return `
        ${renderPlanetNavBarHTML()}
        <div class="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl mb-3">
          <button id="game-back-to-info-btn" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5">
            <img src="${p.image}" alt="${p.nameEn}" class="w-5 h-5 rounded-full object-cover border" style="border-color: ${p.color}" onerror="this.remove()" />
            <span>← ${isAr ? 'شرح الكوكب' : 'Dossier'}</span>
          </button>
          <div class="text-[11px] font-mono text-center flex items-center justify-center gap-2">
            <img
              src="${p.image}"
              alt="${isAr ? p.nameAr : p.nameEn}"
              class="w-7 h-7 sm:w-8 sm:h-8 object-cover rounded-full border-2 shadow flex-shrink-0"
              style="border-color: ${p.color}; box-shadow: 0 0 10px ${p.color}88"
              onerror="this.remove()"
            />
            <span class="font-bold text-xs sm:text-sm" style="color: ${p.color}">${isAr ? p.nameAr : p.nameEn}</span>
            <span class="text-slate-600">•</span>
            ${isDone ? `<span class="text-emerald-400 font-bold">✓ ${isAr ? 'مكتمل' : 'Completed'}</span>` : `<span class="text-amber-400 font-bold">${isAr ? 'مهمة نشطة' : 'Active Mission'}</span>`}
          </div>
          <div class="flex items-center gap-1">
            ${st.planetIdx > 0 ? `
              <button id="game-prev-planet-btn" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition" title="${isAr ? 'الكوكب السابق' : 'Prev Planet'}">
                ←
              </button>
            ` : ''}
            ${canGoNext && st.planetIdx < planets.length - 1 ? `
              <button id="game-next-planet-btn" class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition" title="${isAr ? 'الكوكب التالي' : 'Next Planet'}">
                →
              </button>
            ` : ''}
          </div>
        </div>
      `;
    };

    const attachGameHeaderListeners = () => {
      const backBtn = this.container.querySelector('#game-back-to-info-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          window.cosmicAudio.playClick();
          st.planetPhase = 'info';
          render();
        });
      }
      const prevBtn = this.container.querySelector('#game-prev-planet-btn');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          window.cosmicAudio.playClick();
          st.planetIdx--;
          st.planetPhase = 'game';
          st.gameState = null;
          render();
        });
      }
      const nextBtn = this.container.querySelector('#game-next-planet-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          window.cosmicAudio.playClick();
          st.planetIdx++;
          st.planetPhase = 'game';
          st.gameState = null;
          render();
        });
      }
    };

    // ===== SCREEN 2: DEDICATED INTERACTIVE GAMES =====
    const renderPlanetGame = () => {
      const p = planets[st.planetIdx];
      switch (p.gameType) {
        case 'mercury_route_planner': renderMercuryRoverGame(p); break;
        case 'greenhouse_sequence':   renderGreenhouseSeq(p); break;
        case 'mars_quiz':             renderMarsQuiz(p); break;
        case 'galilean_match':        renderGalileanMatch(p); break;
        case 'saturn_true_false':     renderSaturnTrueFalse(p); break;
        case 'tilt_match':            renderTiltMatch(p); break;
        case 'neptune_wind_sorter':   renderNeptuneWindSorter(p); break;
        default: renderPlanetInfo();
      }
      attachGameHeaderListeners();
    };

    // --- GAME 1: Mercury Twilight Terminator: Polar Shadow Route Planner (THINKING STRATEGY GAME) ---
    const renderMercuryRoverGame = (p) => {
      // 6x5 Grid: (0,0) Start, (5,4) Polar Ice Crater Destination
      // Tiles:
      // 'sun': +30°C thermal gain
      // 'shadow': -25°C cooling
      // 'ridge': impassable obstacle
      // 'shield': player-deployed thermal shield (safe 0°C)
      // 'ice': destination!
      if (!st.gameState) {
        st.gameState = {
          rover: { x: 0, y: 0 },
          coreTemp: 20,            // Start at 20°C (Safe range: -50°C to +80°C)
          shieldsLeft: 2,
          shieldsPlaced: [],       // Array of {x, y}
          status: 'playing',       // 'playing' | 'won' | 'overheat' | 'frozen'
          stepsTaken: 0,
          pathHistory: [{ x: 0, y: 0 }],
          feedback: null
        };
      }
      const gs = st.gameState;

      const gridCols = 6;
      const gridRows = 5;

      // Fixed terrain layout with crater shadows and ridges
      // Ridges at: (1,1), (3,2), (4,1)
      // Shadows at: (1,0), (2,1), (2,2), (3,3), (4,3), (4,4)
      const isRidge = (x, y) => (x === 1 && y === 1) || (x === 3 && y === 2) || (x === 4 && y === 1);
      const isNaturalShadow = (x, y) => (x === 1 && y === 0) || (x === 2 && y === 1) || (x === 2 && y === 2) || (x === 3 && y === 3) || (x === 4 && y === 3) || (x === 4 && y === 4);
      const isDestination = (x, y) => (x === 5 && y === 4);

      const getTileType = (x, y) => {
        if (isDestination(x, y)) return 'ice';
        if (isRidge(x, y)) return 'ridge';
        if (gs.shieldsPlaced.some(s => s.x === x && s.y === y)) return 'shield';
        if (isNaturalShadow(x, y)) return 'shadow';
        return 'sun';
      };

      const moveRover = (dx, dy) => {
        if (gs.status !== 'playing') return;
        const nx = gs.rover.x + dx;
        const ny = gs.rover.y + dy;

        // Bounds check
        if (nx < 0 || nx >= gridCols || ny < 0 || ny >= gridRows) return;
        // Ridge collision check
        if (isRidge(nx, ny)) {
          window.cosmicAudio.playWrong();
          gs.feedback = {
            type: 'wrong',
            text: isAr ? '⚠️ تضاريس جبلية وعرة مسدودة! لا يمكن للمستكشف عبور الحافة الصخرية.' : '⚠️ Impassable rocky ridge! Rover cannot scale steep mountain ridges.'
          };
          render();
          return;
        }

        // Apply movement
        gs.rover.x = nx;
        gs.rover.y = ny;
        gs.stepsTaken++;
        gs.pathHistory.push({ x: nx, y: ny });
        window.cosmicAudio.playClick();

        const tileType = getTileType(nx, ny);

        if (tileType === 'sun') {
          gs.coreTemp += 30; // +30°C solar load
        } else if (tileType === 'shadow') {
          gs.coreTemp -= 25; // -25°C cooling
        } else if (tileType === 'shield') {
          // Shield maintains temperature
          gs.coreTemp += 0;
        }

        // Check thermal limits
        if (gs.coreTemp > 80) {
          gs.status = 'overheat';
          window.cosmicAudio.playWrong();
          gs.feedback = {
            type: 'wrong',
            text: isAr 
              ? '🔥 إنذار حراري خطير (+80°م)! احترقت دارات المستكشف بتعرضه الطويل للشمس المباشرة دون غلاف جوي يحميه!'
              : '🔥 Thermal Overheat (+80°C)! Direct solar radiation fried rover circuits without atmospheric shielding!'
          };
        } else if (gs.coreTemp < -50) {
          gs.status = 'frozen';
          window.cosmicAudio.playWrong();
          gs.feedback = {
            type: 'wrong',
            text: isAr 
              ? '❄️ إنذار تجمد مفرط (−50°م)! تجمدت سوائل البطاريات في ظل الفوهة الدامس!'
              : '❄️ Cryo-Freeze (−50°C)! Battery fluids froze solid in deep crater shadow!'
          };
        } else if (tileType === 'ice') {
          gs.status = 'won';
          window.cosmicAudio.playCorrect();
          window.cosmicConfetti.burst();
          if (!st.completedPlanets.includes(p.id)) st.completedPlanets.push(p.id);
          gs.feedback = {
            type: 'success',
            text: isAr 
              ? '🎉 انتصار علمي باهر! وصل المستكشف إلى فوهة الجليد القطبي بسلام وبحرارة معتدلة!'
              : '🎉 Brilliant navigation! Rover reached the polar ice crater with intact thermal equilibrium!'
          };
        } else {
          gs.feedback = null;
        }
        render();
      };

      const deployShield = () => {
        if (gs.status !== 'playing' || gs.shieldsLeft <= 0) return;
        const rx = gs.rover.x;
        const ry = gs.rover.y;
        if (isDestination(rx, ry) || isRidge(rx, ry)) return;
        if (gs.shieldsPlaced.some(s => s.x === rx && s.y === ry)) return;

        gs.shieldsPlaced.push({ x: rx, y: ry });
        gs.shieldsLeft--;
        // Deploying shield cools down current heat load
        gs.coreTemp = Math.max(-20, gs.coreTemp - 20);
        window.cosmicAudio.playCorrect();
        gs.feedback = {
          type: 'success',
          text: isAr ? '🛡️ تم نشر الدرع العاكس للحرارة! وفرت واحة آمنة وخفضت حرارة المستكشف!' : '🛡️ Thermal sun-shield deployed! Safe haven created and core temperature cooled!'
        };
        render();
      };

      const resetGame = () => {
        st.gameState = null;
        window.cosmicAudio.playClick();
        render();
      };

      // Thermal gauge color calculation
      const tempPercent = Math.min(100, Math.max(0, ((gs.coreTemp - (-50)) / (80 - (-50))) * 100));
      const isDangerousTemp = gs.coreTemp >= 60 || gs.coreTemp <= -30;

      this.container.innerHTML = `
        <div class="challenge-box">
          ${makeGameHeaderHTML(p)}

          <div class="challenge-header">
            <span class="badge-tag">CHALLENGE 3 • MERCURY THINKING LAB</span>
            <h3 class="text-xl font-bold mt-1 text-slate-200">${isAr ? p.gameTitleAr : p.gameTitleEn}</h3>
            <p class="text-xs text-slate-300 mt-1">${isAr ? p.gameDescAr : p.gameDescEn}</p>
          </div>

          <!-- NASA CCMC DONKI Space Weather Official Portal Link -->
          <a href="https://ccmc.gsfc.nasa.gov/tools/DONKI/" target="_blank" rel="noopener noreferrer" class="my-2.5 p-2 px-3 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/60 rounded-xl text-xs text-amber-300 flex items-center justify-between transition no-underline shadow">
            <span class="flex items-center gap-1.5 font-bold">☀️ ${isAr ? 'نظام ناسا لطقس الفضاء والتوهجات الشمسية (NASA CCMC DONKI)' : 'Official NASA Space Weather Portal (NASA CCMC DONKI)'}</span>
            <span class="text-[11px] font-mono font-bold text-slate-950 bg-amber-400 px-2 py-0.5 rounded shadow">ccmc.gsfc.nasa.gov ↗</span>
          </a>

          <!-- Thermal Telemetry Bar -->
          <div class="my-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div class="flex items-center justify-between text-xs font-mono mb-1.5">
              <span class="text-slate-400">${isAr ? 'حرارة قلب المستكشف:' : 'Rover Core Temp:'}</span>
              <span class="font-bold text-sm ${isDangerousTemp ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}">
                ${gs.coreTemp > 0 ? '+' : ''}${gs.coreTemp}°C
                <span class="text-[10px] text-slate-400">(${isAr ? 'المدى الآمن: −50°م إلى +80°م' : 'Safe: −50°C to +80°C'})</span>
              </span>
            </div>
            <!-- Meter -->
            <div class="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700">
              <div class="h-full transition-all duration-300 ${gs.coreTemp >= 60 ? 'bg-gradient-to-r from-amber-500 to-rose-600' : gs.coreTemp <= -30 ? 'bg-gradient-to-r from-sky-600 to-cyan-400' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'}" style="width: ${tempPercent}%"></div>
              <!-- Ideal marker (20C) -->
              <div class="absolute top-0 bottom-0 w-0.5 bg-white/70" style="left: ${((20 - (-50)) / 130) * 100}%" title="Optimal 20°C"></div>
            </div>
            <div class="flex items-center justify-between mt-2 text-[11px] font-mono">
              <span class="text-slate-400">${isAr ? 'الدروع الشمسية المتوفرة:' : 'Deployable Shields:'} <span class="text-amber-400 font-bold">${gs.shieldsLeft}</span></span>
              <span class="text-slate-400">${isAr ? 'الخطوات:' : 'Steps:'} <span class="text-white font-bold">${gs.stepsTaken}</span></span>
            </div>
          </div>

          <!-- 6x5 Tactical Grid -->
          <div class="my-2 p-2 bg-slate-950 border border-slate-800 rounded-2xl select-none">
            <div class="grid grid-cols-6 gap-1 sm:gap-1.5">
              ${Array.from({ length: gridRows }).map((_, r) => {
                return Array.from({ length: gridCols }).map((__, c) => {
                  const isRoverHere = (gs.rover.x === c && gs.rover.y === r);
                  const type = getTileType(c, r);
                  const isAdj = Math.abs(gs.rover.x - c) + Math.abs(gs.rover.y - r) === 1 && type !== 'ridge';
                  
                  let bgStyle = 'bg-slate-900 border-slate-800 text-slate-400';
                  let icon = '☀️';
                  let label = isAr ? '+30°م' : '+30°C';

                  if (type === 'ice') {
                    bgStyle = 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-inner';
                    icon = '🧊';
                    label = isAr ? 'جليد' : 'Ice';
                  } else if (type === 'ridge') {
                    bgStyle = 'bg-stone-900/90 border-stone-700 text-stone-500 opacity-60';
                    icon = '🪨';
                    label = isAr ? 'حافة' : 'Ridge';
                  } else if (type === 'shield') {
                    bgStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300';
                    icon = '🛡️';
                    label = isAr ? 'درع' : 'Shield';
                  } else if (type === 'shadow') {
                    bgStyle = 'bg-indigo-950/80 border-indigo-700/80 text-indigo-300';
                    icon = '🌑';
                    label = isAr ? '−25°م' : '−25°C';
                  }

                  return `
                    <button class="grid-cell p-1 sm:p-2 rounded-xl border flex flex-col items-center justify-center min-h-[52px] sm:min-h-[62px] transition active:scale-95 ${bgStyle} ${
                      isRoverHere ? 'ring-2 ring-amber-400 shadow-lg scale-105 z-10' :
                      isAdj && gs.status === 'playing' ? 'hover:border-amber-400 cursor-pointer' : ''
                    }" data-col="${c}" data-row="${r}" ${gs.status !== 'playing' ? 'disabled' : ''}>
                      <span class="text-base sm:text-xl pointer-events-none">${isRoverHere ? '🚜' : icon}</span>
                      <span class="text-[9px] font-mono pointer-events-none mt-0.5 ${isRoverHere ? 'text-amber-300 font-bold' : ''}">
                        ${isRoverHere ? (isAr ? 'المركبة' : 'Rover') : label}
                      </span>
                    </button>
                  `;
                }).join('');
              }).join('')}
            </div>
          </div>

          <!-- Feedback message -->
          ${gs.feedback ? `
            <div class="my-2 p-2.5 rounded-xl text-xs font-bold ${gs.feedback.type === 'success' ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-rose-950 border border-rose-500 text-rose-300'}">
              ${gs.feedback.text}
            </div>
          ` : ''}

          <!-- Controls & Actions -->
          ${gs.status === 'playing' ? `
            <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
              <!-- Directional Pad -->
              <div class="flex items-center gap-1.5">
                <button id="move-up-btn" class="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition active:scale-95" title="Move Up">⬆</button>
                <button id="move-down-btn" class="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition active:scale-95" title="Move Down">⬇</button>
                <button id="move-left-btn" class="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition active:scale-95" title="Move Left">⬅</button>
                <button id="move-right-btn" class="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition active:scale-95" title="Move Right">➡</button>
              </div>

              <!-- Deploy Shield & Reset -->
              <div class="flex items-center gap-2">
                <button id="deploy-shield-btn" class="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs shadow transition active:scale-95 flex items-center gap-1.5 ${gs.shieldsLeft <= 0 ? 'opacity-40 cursor-not-allowed' : ''}" ${gs.shieldsLeft <= 0 ? 'disabled' : ''}>
                  <span>🛡️</span> ${isAr ? `نشر درع (${gs.shieldsLeft})` : `Deploy Shield (${gs.shieldsLeft})`}
                </button>
                <button id="reset-route-btn" class="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition">
                  🔄 ${isAr ? 'إعادة' : 'Reset'}
                </button>
              </div>
            </div>
          ` : gs.status === 'won' ? `
            <div class="mt-3 p-3 bg-emerald-950/90 border border-emerald-500 rounded-2xl text-center">
              <div class="text-sm font-bold text-emerald-300 mb-1">
                🌟 ${isAr ? 'مستكشف عطارد أنجز المهمة بنجاح!' : 'Mercury Polar Crater Reached!'}
              </div>
              <p class="text-xs text-slate-300">
                ${isAr
                  ? 'برهنت بنجاح كيف تحفظ الفوهات القطبية المظلمة الجليد المائي على كوكب عطارد اللاهب بلا غلاف جوي!'
                  : 'You proved how permanently shadowed craters preserve water ice on a planet scorched by extreme sun!'}
              </p>
            </div>
            ${makeGameDoneHTML(p, isAr)}
          ` : `
            <div class="mt-3 flex gap-2">
              <button id="retry-rover-btn" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow transition active:scale-95">
                🔄 ${isAr ? 'إعادة المحاولة وتعديل مسار الظلال' : 'Retry & Plan Route Through Crater Shadows'}
              </button>
            </div>
          `}
        </div>
      `;

      // Movement button listeners
      const upBtn = this.container.querySelector('#move-up-btn');
      const downBtn = this.container.querySelector('#move-down-btn');
      const leftBtn = this.container.querySelector('#move-left-btn');
      const rightBtn = this.container.querySelector('#move-right-btn');
      if (upBtn) upBtn.addEventListener('click', () => moveRover(0, -1));
      if (downBtn) downBtn.addEventListener('click', () => moveRover(0, 1));
      if (leftBtn) leftBtn.addEventListener('click', () => moveRover(-1, 0));
      if (rightBtn) rightBtn.addEventListener('click', () => moveRover(1, 0));

      // Click on adjacent cells to move
      this.container.querySelectorAll('.grid-cell').forEach(cell => {
        cell.addEventListener('click', () => {
          if (gs.status !== 'playing') return;
          const col = parseInt(cell.dataset.col, 10);
          const row = parseInt(cell.dataset.row, 10);
          const dx = col - gs.rover.x;
          const dy = row - gs.rover.y;
          if (Math.abs(dx) + Math.abs(dy) === 1) {
            moveRover(dx, dy);
          }
        });
      });

      const shieldBtn = this.container.querySelector('#deploy-shield-btn');
      if (shieldBtn) shieldBtn.addEventListener('click', deployShield);

      const resetBtn = this.container.querySelector('#reset-route-btn');
      if (resetBtn) resetBtn.addEventListener('click', resetGame);

      const retryBtn = this.container.querySelector('#retry-rover-btn');
      if (retryBtn) retryBtn.addEventListener('click', resetGame);

      if (gs.status === 'won') attachGameDoneBtn(p);
    };

    // --- GAME 2: Venus Runaway Greenhouse Sequencer (EMOJIS INSTEAD OF NUMBERS) ---
    const renderGreenhouseSeq = (p) => {
      if (!st.gameState) {
        st.gameState = {
          seq: [...p.gameItems].sort(() => Math.random() - 0.5),
          verified: false,
          feedback: null
        };
      }
      const gs = st.gameState;
      const isSequenceCorrect = gs.seq.every((item, i) => item.correctPos === i);

      const safeRender = () => {
        const scrollY = window.scrollY;
        render();
        window.scrollTo({ top: scrollY, behavior: 'instant' });
      };

      this.container.innerHTML = `
        <div class="challenge-box">
          ${makeGameHeaderHTML(p)}

          <div class="challenge-header">
            <span class="badge-tag">CHALLENGE 3 • VENUS GAME</span>
            <h3 class="text-xl font-bold mt-1 text-amber-400">${isAr ? p.gameTitleAr : p.gameTitleEn}</h3>
            <p class="text-xs text-slate-300 mt-1">${isAr ? p.gameDescAr : p.gameDescEn}</p>
          </div>

          <div class="flex items-center justify-between px-1 mt-3 mb-1 text-xs font-mono text-slate-400">
            <span class="text-amber-400 font-bold flex items-center gap-1.5">
              <span>✋</span> ${isAr ? 'اسحب الصناديق بالفأرة لترتيب المراحل بحسب الرموز' : 'Drag boxes with mouse to reorder by stages'}
            </span>
            <span class="text-slate-400">CO₂ 96.5% • 465°C</span>
          </div>

          <!-- Interactive Ordered Steps with EMOJIS instead of numbers -->
          <div class="space-y-2 mt-1" id="gh-list">
            ${gs.seq.map((item, idx) => `
              <div class="gh-drag-item drag-item flex items-center justify-between p-3 bg-slate-800/90 border border-slate-700 rounded-xl gap-2 cursor-grab active:cursor-grabbing hover:border-amber-400 transition-all select-none" draggable="true" data-idx="${idx}">
                <div class="flex items-center gap-2.5 flex-1 pointer-events-none">
                  <span class="text-slate-500 text-xs font-mono select-none px-1">⠿</span>
                  <span class="text-2xl p-1 bg-slate-900 rounded-lg border border-slate-700/80 shadow-inner flex items-center justify-center">${item.emoji}</span>
                  <span class="text-xs sm:text-sm text-slate-100 font-bold leading-relaxed">${isAr ? item.textAr : item.textEn}</span>
                </div>
                <div class="flex items-center gap-1">
                  <button class="gh-move-btn p-2 bg-slate-700 hover:bg-amber-500 hover:text-slate-950 rounded-lg text-xs font-bold text-white transition ${idx === 0 ? 'opacity-30 cursor-not-allowed' : ''}" data-dir="up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}>⬆</button>
                  <button class="gh-move-btn p-2 bg-slate-700 hover:bg-amber-500 hover:text-slate-950 rounded-lg text-xs font-bold text-white transition ${idx === gs.seq.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}" data-dir="down" data-idx="${idx}" ${idx === gs.seq.length - 1 ? 'disabled' : ''}>⬇</button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Feedback Box -->
          ${gs.feedback ? `
            <div class="mt-3 p-3 rounded-xl text-xs font-bold ${gs.feedback.type === 'success' ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-rose-950 border border-rose-500 text-rose-300'}">
              ${gs.feedback.text}
            </div>
          ` : ''}

          ${gs.verified && isSequenceCorrect ? `
            ${makeGameDoneHTML(p, isAr)}
          ` : `
            <div class="mt-4">
              <button id="verify-gh-btn" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm shadow transition active:scale-95">
                🔍 ${isAr ? 'التحقق من التسلسل الفيزيائي' : 'Verify Greenhouse Cycle'}
              </button>
            </div>
          `}
        </div>
      `;

      // Mouse drag & drop reordering
      const ghItems = this.container.querySelectorAll('.gh-drag-item');
      ghItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', item.dataset.idx);
          e.dataTransfer.effectAllowed = 'move';
          item.classList.add('is-dragging');
        });
        item.addEventListener('dragend', () => {
          item.classList.remove('is-dragging');
          ghItems.forEach(el => el.classList.remove('drop-zone-active'));
        });
        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          item.classList.add('drop-zone-active');
        });
        item.addEventListener('dragleave', () => {
          item.classList.remove('drop-zone-active');
        });
        item.addEventListener('drop', (e) => {
          e.preventDefault();
          item.classList.remove('drop-zone-active');
          const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
          const toIdx = parseInt(item.dataset.idx, 10);
          if (!isNaN(fromIdx) && !isNaN(toIdx) && fromIdx !== toIdx) {
            const [moved] = gs.seq.splice(fromIdx, 1);
            gs.seq.splice(toIdx, 0, moved);
            gs.feedback = null;
            window.cosmicAudio.playClick();
            safeRender();
          }
        });
      });

      this.container.querySelectorAll('.gh-move-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const dir = btn.dataset.dir;
          const idx = parseInt(btn.dataset.idx, 10);
          if (dir === 'up' && idx > 0) {
            const temp = gs.seq[idx];
            gs.seq[idx] = gs.seq[idx - 1];
            gs.seq[idx - 1] = temp;
          } else if (dir === 'down' && idx < gs.seq.length - 1) {
            const temp = gs.seq[idx];
            gs.seq[idx] = gs.seq[idx + 1];
            gs.seq[idx + 1] = temp;
          }
          gs.feedback = null;
          window.cosmicAudio.playClick();
          safeRender();
        });
      });

      const verifyBtn = this.container.querySelector('#verify-gh-btn');
      if (verifyBtn) {
        verifyBtn.addEventListener('click', () => {
          if (isSequenceCorrect) {
            gs.verified = true;
            window.cosmicAudio.playCorrect();
            window.cosmicConfetti.burst();
            if (!st.completedPlanets.includes(p.id)) st.completedPlanets.push(p.id);
            gs.feedback = {
              type: 'success',
              text: isAr ? '🎉 ممتاز! رتبت دورة الاحتباس الحراري على كوكب الزهرة بالترتيب العلمي الدقيق!' : '🎉 Outstanding! You mastered Venus\'s runaway greenhouse cycle!'
            };
          } else {
            window.cosmicAudio.playWrong();
            gs.feedback = {
              type: 'wrong',
              text: isAr 
                ? '⚠️ الترتيب غير صحيح بعد! فكر في التسلسل: أولاً ضوء الشمس ☀️، ثم تسخين الصخور ♨️، ثم حبس السحب ☁️، ثم الحرارة الساحقة 🌡️!'
                : '⚠️ Sequence error! Think of cause and effect: Sunlight ☀️, Heated rocks ♨️, Cloud trapping ☁️, Crushing heat 🌡️!'
            };
          }
          render();
        });
      }

      if (gs.verified && isSequenceCorrect) attachGameDoneBtn(p);
    };

    // --- GAME 3: Mars Science Explorer Console (RANDOMIZED OPTIONS PLACEMENT) ---
    const renderMarsQuiz = (p) => {
      if (!st.gameState) {
        st.gameState = {
          qIdx: 0,
          score: 0,
          answered: false,
          done: false,
          feedback: null,
          // Generate shuffled indices for current question
          shuffledIndices: [0, 1, 2, 3].sort(() => Math.random() - 0.5)
        };
      }
      const gs = st.gameState;

      if (gs.done) {
        this.container.innerHTML = `
          <div class="challenge-box text-center">
            ${makeGameHeaderHTML(p)}
            <div class="challenge-header">
              <span class="badge-tag">CHALLENGE 3 • MARS GAME</span>
              <h3 class="text-xl font-bold mt-1 text-red-400">${isAr ? p.gameTitleAr : p.gameTitleEn}</h3>
            </div>
            <div class="my-4 p-5 bg-gradient-to-b from-red-950/40 to-slate-900 border-2 border-red-500 rounded-2xl">
              <div class="text-4xl mb-2">🏆</div>
              <div class="text-base font-bold text-white mb-1">
                ${isAr ? 'أجبت بنجاح على أسئلة مستكشف المريخ!' : 'Mars Surface Science Exploration Complete!'}
              </div>
              <div class="text-xs text-red-300 font-mono">Score: ${gs.score} / ${p.gameItems.length}</div>
            </div>
            ${makeGameDoneHTML(p, isAr)}
          </div>
        `;
        attachGameDoneBtn(p);
        return;
      }

      const q = p.gameItems[gs.qIdx];
      const opts = isAr ? q.optsAr : q.optsEn;

      this.container.innerHTML = `
        <div class="challenge-box">
          ${makeGameHeaderHTML(p)}

          <div class="challenge-header">
            <span class="badge-tag">CHALLENGE 3 • MARS QUIZ • ${gs.qIdx + 1} OF ${p.gameItems.length}</span>
            <h3 class="text-xl font-bold mt-1 text-red-400">${isAr ? p.gameTitleAr : p.gameTitleEn}</h3>
          </div>

          <!-- NASA Mars Trek Live Resource Link -->
          <a href="https://trek.nasa.gov/mars/" target="_blank" rel="noopener noreferrer" class="my-2.5 p-2 px-3 bg-red-950/70 hover:bg-red-900/80 border border-red-500/60 rounded-xl text-xs text-red-300 flex items-center justify-between transition no-underline shadow">
            <span class="flex items-center gap-1.5 font-bold">🗺️ ${isAr ? 'خرائط وتضاريس ناسا للمريخ (NASA Mars Trek)' : 'Official NASA Mars Trek 3D Surface Maps'}</span>
            <span class="text-[11px] font-mono font-bold text-white bg-red-600 px-2 py-0.5 rounded shadow">trek.nasa.gov ↗</span>
          </a>

          <div class="my-3 p-4 bg-slate-900 border border-slate-700 rounded-2xl">
            <p class="font-bold text-slate-100 text-sm leading-relaxed">${isAr ? q.qAr : q.qEn}</p>
          </div>

          <!-- Options randomized in place with vibrant font feedback -->
          <div class="space-y-2" id="mars-options">
            ${gs.shuffledIndices.map((origIdx, slotIdx) => {
              let btnClass = "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white";
              let textClass = "text-white";
              let badgeClass = "text-slate-400";
              let badgeText = String.fromCharCode(65 + slotIdx);

              if (gs.answered) {
                if (origIdx === q.correct) {
                  btnClass = "bg-emerald-950/90 border-2 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/50 shadow-lg";
                  textClass = "text-emerald-400 font-bold text-sm";
                  badgeClass = "text-emerald-400 font-black";
                  badgeText = `${String.fromCharCode(65 + slotIdx)} ✓`;
                } else if (origIdx === gs.chosenIdx) {
                  btnClass = "bg-rose-950/90 border-2 border-rose-500 text-rose-300";
                  textClass = "text-rose-300 line-through font-semibold";
                  badgeClass = "text-rose-400 font-bold";
                  badgeText = `${String.fromCharCode(65 + slotIdx)} ✗`;
                } else {
                  btnClass = "bg-slate-900 border-slate-800 text-slate-500 opacity-50";
                  textClass = "text-slate-500";
                }
              }

              return `
                <button class="mars-opt-btn w-full p-3 text-left rtl:text-right rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-between ${btnClass}" data-origidx="${origIdx}" ${gs.answered ? 'disabled' : ''}>
                  <span class="${textClass}">${opts[origIdx]}</span>
                  <span class="font-mono text-xs ${badgeClass}">${badgeText}</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Feedback Box -->
          ${gs.feedback ? `
            <div class="mt-3 p-3 rounded-xl text-xs font-bold ${gs.feedback.type === 'success' ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-rose-950 border border-rose-500 text-rose-300'}">
              ${gs.feedback.text}
            </div>
          ` : ''}

          ${gs.answered ? `
            <div class="mt-4">
              <button id="mars-next-btn" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow transition">
                ${gs.qIdx < p.gameItems.length - 1 ? (isAr ? 'السؤال التالي ←' : 'Next Question →') : (isAr ? 'عرض النتيجة النهائية 🏆' : 'View Mission Results 🏆')}
              </button>
            </div>
          ` : ''}
        </div>
      `;

      if (!gs.answered) {
        this.container.querySelectorAll('.mars-opt-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            gs.answered = true;
            const chosenOrig = parseInt(btn.dataset.origidx, 10);
            gs.chosenIdx = chosenOrig;

            if (chosenOrig === q.correct) {
              gs.score++;
              window.cosmicAudio.playCorrect();
              gs.feedback = {
                type: 'success',
                text: isAr ? '✅ إجابة علمية صحيحة 100%!' : '✅ 100% Scientifically accurate answer!'
              };
            } else {
              window.cosmicAudio.playWrong();
              gs.feedback = {
                type: 'wrong',
                text: isAr ? '⚠️ إجابة غير دقيقة! الإجابة الصحيحة موضحة بالخط الأخضر أعلاه.' : '⚠️ Incorrect! The correct answer font is highlighted in green above.'
              };
            }
            render();
          });
        });
      }

      const nextBtn = this.container.querySelector('#mars-next-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          window.cosmicAudio.playClick();
          gs.qIdx++;
          gs.answered = false;
          gs.feedback = null;
          // Randomize option order for the next question!
          gs.shuffledIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
          if (gs.qIdx >= p.gameItems.length) {
            gs.done = true;
            if (!st.completedPlanets.includes(p.id)) st.completedPlanets.push(p.id);
          }
          render();
        });
      }
    };

    // --- GAME 4: Jupiter Galilean Moons Discovery Matcher (RANDOMIZED DISCOVERY ORDER) ---
    const renderGalileanMatch = (p) => {
      if (!st.gameState) {
        st.gameState = {
          selectedMoon: null,
          matches: {}, // moonId -> true
          feedback: null,
          // Randomize order of discovery cards so they don't match moons 1:1 in order!
          shuffledDiscoveries: [...p.gameItems].sort(() => Math.random() - 0.5)
        };
      }
      const gs = st.gameState;
      const allMatched = Object.keys(gs.matches).length === p.gameItems.length;

      this.container.innerHTML = `
        <div class="challenge-box">
          ${makeGameHeaderHTML(p)}

          <div class="challenge-header">
            <span class="badge-tag">CHALLENGE 3 • JUPITER GAME</span>
            <h3 class="text-xl font-bold mt-1 text-amber-500">${isAr ? p.gameTitleAr : p.gameTitleEn}</h3>
            <p class="text-xs text-slate-300 mt-1">${isAr ? p.gameDescAr : p.gameDescEn}</p>
          </div>

          <!-- Progress -->
          <div class="flex items-center justify-between my-2 text-xs font-mono">
            <span class="text-slate-400">${isAr ? 'الأقمار المطابقة:' : 'Moons Matched:'}</span>
            <span class="text-amber-400 font-bold">${Object.keys(gs.matches).length} / ${p.gameItems.length}</span>
          </div>

          <!-- 4 Moons Grid -->
          <div class="my-2">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">${isAr ? '1. اختر قمر غاليليو:' : '1. Select a Galilean Moon:'}</div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              ${p.gameItems.map(item => {
                const isDone = gs.matches[item.moonId];
                const isSelected = gs.selectedMoon === item.moonId;
                return `
                  <button class="gal-moon-btn p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                    isDone ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' :
                    isSelected ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400' :
                    'bg-slate-800 border-slate-700 text-white hover:border-amber-400'
                  }" data-moonid="${item.moonId}" ${isDone ? 'disabled' : ''}>
                    <span class="text-2xl">${item.icon}</span>
                    <span>${isAr ? item.nameAr : item.nameEn}</span>
                    ${isDone ? '<span class="text-[10px] text-emerald-400">✓ Locked</span>' : ''}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 4 Discovery Cards (Randomized order) -->
          <div class="my-2">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">${isAr ? '2. طابق باكتشافه العلمي الفريد (ترتيب عشوائي):' : '2. Match to its Scientific Discovery (Randomized Order):'}</div>
            <div class="space-y-1.5">
              ${gs.shuffledDiscoveries.map(item => {
                const isDone = gs.matches[item.moonId];
                return `
                  <button class="gal-feat-btn w-full p-2.5 rounded-xl border text-left rtl:text-right text-xs transition ${
                    isDone ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 cursor-default' :
                    'bg-slate-800/90 border-slate-700 text-slate-200 hover:border-amber-400 cursor-pointer'
                  }" data-moonid="${item.moonId}" ${isDone ? 'disabled' : ''}>
                    ${isDone ? '✅ ' : '🔭 '} ${isAr ? item.featAr : item.featEn}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Feedback Box -->
          ${gs.feedback ? `
            <div class="mt-2 p-2.5 rounded-xl text-xs font-bold ${gs.feedback.type === 'success' ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-rose-950 border border-rose-500 text-rose-300'}">
              ${gs.feedback.text}
            </div>
          ` : ''}

          ${allMatched ? `
            <div class="mt-3 p-3 bg-emerald-950 border border-emerald-500 rounded-xl text-emerald-300 font-bold text-center text-xs">
              🎉 ${isAr ? 'رائع! طابقت جميع أقمار غاليليو باكتشافاتها العلمية بدقة!' : 'Outstanding! All 4 Galilean moons matched to their unique discoveries!'}
            </div>
            ${makeGameDoneHTML(p, isAr)}
          ` : ''}
        </div>
      `;

      this.container.querySelectorAll('.gal-moon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          gs.selectedMoon = btn.dataset.moonid;
          gs.feedback = null;
          window.cosmicAudio.playClick();
          render();
        });
      });

      this.container.querySelectorAll('.gal-feat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (!gs.selectedMoon) {
            gs.feedback = {
              type: 'wrong',
              text: isAr ? '⚠️ الرجاء اختيار أحد الأقمار أولاً من القائمة العلوية!' : '⚠️ Please select a moon first above!'
            };
            render();
            return;
          }
          const featMoonId = btn.dataset.moonid;
          if (featMoonId === gs.selectedMoon) {
            gs.matches[featMoonId] = true;
            gs.selectedMoon = null;
            window.cosmicAudio.playCorrect();
            gs.feedback = {
              type: 'success',
              text: isAr ? '✅ مطابقة صحيحة تماماً!' : '✅ Correct discovery match!'
            };
            if (Object.keys(gs.matches).length === p.gameItems.length) {
              if (!st.completedPlanets.includes(p.id)) st.completedPlanets.push(p.id);
            }
          } else {
            window.cosmicAudio.playWrong();
            gs.selectedMoon = null;
            gs.feedback = {
              type: 'wrong',
              text: isAr ? '⚠️ غير صحيح! فكر في الميزات الخاصة بكل قمر (براكين إيو، محيط أوروبا، حجم غانيميد، فوهات كاليستو)!' : '⚠️ Incorrect match! Consider each moon\'s signature: Io\'s volcanoes, Europa\'s ocean, Ganymede\'s giant size, Callisto\'s craters!'
            };
          }
          render();
        });
      });

      if (allMatched) attachGameDoneBtn(p);
    };

    // --- GAME 5: Saturn True / False ---
    const renderSaturnTrueFalse = (p) => {
      if (!st.gameState) {
        st.gameState = { qIdx: 0, score: 0, answered: false, done: false, feedback: null };
      }
      const gs = st.gameState;

      if (gs.done) {
        this.container.innerHTML = `
          <div class="challenge-box text-center">
            ${makeGameHeaderHTML(p)}
            <div class="challenge-header">
              <span class="badge-tag">CHALLENGE 3 • SATURN GAME</span>
              <h3 class="text-xl font-bold mt-1 text-yellow-400">${isAr ? p.gameTitleAr : p.gameTitleEn}</h3>
            </div>
            <div class="my-4 p-5 bg-gradient-to-b from-yellow-950/40 to-slate-900 border-2 border-yellow-500 rounded-2xl">
              <div class="text-4xl mb-2">🪐</div>
              <div class="text-base font-bold text-white mb-1">
                ${isAr ? 'أتممت اختبار حقائق زحل وحلقاته!' : 'Saturn Truth Analyzer Complete!'}
              </div>
              <div class="text-xs text-yellow-300 font-mono">Score: ${gs.score} / ${p.gameItems.length}</div>
            </div>
            ${makeGameDoneHTML(p, isAr)}
          </div>
        `;
        attachGameDoneBtn(p);
        return;
      }

      const q = p.gameItems[gs.qIdx];
      this.container.innerHTML = `
        <div class="challenge-box">
          ${makeGameHeaderHTML(p)}

          <div class="challenge-header">
            <span class="badge-tag">CHALLENGE 3 • SATURN LAB • ${gs.qIdx + 1} OF ${p.gameItems.length}</span>
            <h3 class="text-xl font-bold mt-1 text-yellow-400">${isAr ? p.gameTitleAr : p.gameTitleEn}</h3>
          </div>

          <div class="my-4 p-4 bg-slate-900 border border-slate-700 rounded-2xl">
            <div class="text-xs font-mono text-yellow-400 mb-1">${isAr ? 'العبارة العلمية:' : 'Scientific Statement:'}</div>
            <p class="font-bold text-slate-100 text-sm leading-relaxed">${isAr ? q.textAr : q.textEn}</p>
          </div>

          <!-- True / False Buttons with green font on correct answer -->
          <div class="grid grid-cols-2 gap-3 mt-3">
            ${(() => {
              let trueClass = "py-3.5 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 rounded-xl text-white font-bold text-sm transition active:scale-95 shadow flex items-center justify-center gap-2";
              let falseClass = "py-3.5 bg-rose-700 hover:bg-rose-600 border border-rose-500 rounded-xl text-white font-bold text-sm transition active:scale-95 shadow flex items-center justify-center gap-2";
              
              if (gs.answered) {
                if (q.isTrue === true) {
                  trueClass = "py-3.5 bg-emerald-950 border-2 border-emerald-400 rounded-xl text-emerald-400 font-bold text-sm ring-2 ring-emerald-500/50 shadow-lg flex items-center justify-center gap-2";
                  falseClass = gs.chosen === false 
                    ? "py-3.5 bg-rose-950 border-2 border-rose-500 rounded-xl text-rose-300 line-through font-bold text-sm opacity-80 flex items-center justify-center gap-2"
                    : "py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-sm opacity-50 flex items-center justify-center gap-2";
                } else {
                  falseClass = "py-3.5 bg-emerald-950 border-2 border-emerald-400 rounded-xl text-emerald-400 font-bold text-sm ring-2 ring-emerald-500/50 shadow-lg flex items-center justify-center gap-2";
                  trueClass = gs.chosen === true 
                    ? "py-3.5 bg-rose-950 border-2 border-rose-500 rounded-xl text-rose-300 line-through font-bold text-sm opacity-80 flex items-center justify-center gap-2"
                    : "py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-sm opacity-50 flex items-center justify-center gap-2";
                }
              }
              return `
                <button id="btn-true" class="${trueClass}" ${gs.answered ? 'disabled' : ''}>
                  <span>✓</span> <span class="${gs.answered && q.isTrue === true ? 'text-emerald-400 font-bold' : ''}">${isAr ? 'صحيح (True)' : 'TRUE'}</span>
                </button>
                <button id="btn-false" class="${falseClass}" ${gs.answered ? 'disabled' : ''}>
                  <span>✗</span> <span class="${gs.answered && q.isTrue === false ? 'text-emerald-400 font-bold' : ''}">${isAr ? 'خطأ (False)' : 'FALSE'}</span>
                </button>
              `;
            })()}
          </div>

          <!-- Feedback Box -->
          ${gs.feedback ? `
            <div class="mt-3 p-3 rounded-xl text-xs font-bold ${gs.feedback.type === 'success' ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-rose-950 border border-rose-500 text-rose-300'}">
              <div>${gs.feedback.title}</div>
              <div class="mt-1 font-normal opacity-90">${gs.feedback.explain}</div>
            </div>
          ` : ''}

          ${gs.answered ? `
            <div class="mt-4">
              <button id="saturn-next-btn" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow transition">
                ${gs.qIdx < p.gameItems.length - 1 ? (isAr ? 'العبارة التالية ←' : 'Next Statement →') : (isAr ? 'عرض النتيجة النهائية 🏆' : 'View Results 🏆')}
              </button>
            </div>
          ` : ''}
        </div>
      `;

      const handleAnswer = (cadetGuess) => {
        gs.answered = true;
        gs.chosen = cadetGuess;
        const isRight = cadetGuess === q.isTrue;
        if (isRight) {
          gs.score++;
          window.cosmicAudio.playCorrect();
          gs.feedback = {
            type: 'success',
            title: isAr ? '✅ تقييم علمي صحيح!' : '✅ Correct Evaluation!',
            explain: isAr ? q.explainAr : q.explainEn
          };
        } else {
          window.cosmicAudio.playWrong();
          gs.feedback = {
            type: 'wrong',
            title: isAr ? '⚠️ تقييم غير دقيق!' : '⚠️ Incorrect Evaluation!',
            explain: isAr ? q.explainAr : q.explainEn
          };
        }
        render();
      };

      const trueBtn = this.container.querySelector('#btn-true');
      const falseBtn = this.container.querySelector('#btn-false');
      if (trueBtn) trueBtn.addEventListener('click', () => handleAnswer(true));
      if (falseBtn) falseBtn.addEventListener('click', () => handleAnswer(false));

      const nextBtn = this.container.querySelector('#saturn-next-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          window.cosmicAudio.playClick();
          gs.qIdx++;
          gs.answered = false;
          gs.feedback = null;
          if (gs.qIdx >= p.gameItems.length) {
            gs.done = true;
            if (!st.completedPlanets.includes(p.id)) st.completedPlanets.push(p.id);
          }
          render();
        });
      }
    };

    // --- GAME 6: Uranus Planetary Axial Tilt Matcher (DRAG & DROP ENABLED) ---
    const renderTiltMatch = (p) => {
      if (!st.gameState) {
        st.gameState = {
          selectedTile: null,
          matches: {}, // planetId -> true
          feedback: null,
          shuffledSolves: [...p.gameItems].sort(() => Math.random() - 0.5)
        };
      }
      const gs = st.gameState;
      const allMatched = Object.keys(gs.matches).length === p.gameItems.length;

      const safeRender = () => {
        const scrollY = window.scrollY;
        render();
        window.scrollTo({ top: scrollY, behavior: 'instant' });
      };

      const handleMatch = (planetId, targetPlanetId) => {
        if (!planetId || !targetPlanetId) return;
        if (planetId === targetPlanetId) {
          gs.matches[planetId] = true;
          gs.selectedTile = null;
          window.cosmicAudio.playCorrect();
          gs.feedback = {
            type: 'success',
            text: isAr ? '✅ مطابقة صحيحة تماماً لزاوية الميل المحوري!' : '✅ Perfect axial tilt match!'
          };
          if (Object.keys(gs.matches).length === p.gameItems.length) {
            window.cosmicConfetti.burst();
            if (!st.completedPlanets.includes(p.id)) st.completedPlanets.push(p.id);
          }
        } else {
          window.cosmicAudio.playWrong();
          gs.selectedTile = null;
          gs.feedback = {
            type: 'wrong',
            text: isAr ? '⚠️ زاوية غير متطابقة! تذكر: أورانوس يتدحرج على 98°، الأرض 23.5°، المريخ 25°، وعطارد عمودي 0.03°!' : '⚠️ Tilt mismatch! Remember: Uranus rolls at 98°, Earth 23.5°, Mars 25°, Mercury upright at 0.03°!'
          };
        }
        safeRender();
      };

      this.container.innerHTML = `
        <div class="challenge-box">
          ${makeGameHeaderHTML(p)}

          <div class="challenge-header">
            <span class="badge-tag">CHALLENGE 3 • URANUS GAME</span>
            <h3 class="text-xl font-bold mt-1 text-cyan-400">${isAr ? p.gameTitleAr : p.gameTitleEn}</h3>
            <p class="text-xs text-slate-300 mt-1">
              ${isAr ? 'اسحب كرت الكوكب وأفلته فوق زاوية انحرافه المحوري (أو انقر للاختيار).' : 'Drag and drop each planet box onto its axial tilt angle (or click to select).'}
            </p>
          </div>

          <!-- Progress -->
          <div class="flex items-center justify-between my-2 text-xs font-mono">
            <span class="text-slate-400">${isAr ? 'الانحرافات المطابقة:' : 'Tilts Matched:'}</span>
            <span class="text-cyan-400 font-bold">${Object.keys(gs.matches).length} / ${p.gameItems.length}</span>
          </div>

          <!-- 4 Worlds (Draggable) -->
          <div class="my-2">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>${isAr ? '1. اسحب الكوكب (أو انقر للاختيار):' : '1. Drag Planet World (or click):'}</span>
              <span class="text-cyan-400 text-[10px] font-mono">✋ Drag & Drop</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              ${p.gameItems.map(item => {
                const isDone = gs.matches[item.planetId];
                const isSelected = gs.selectedTile === item.planetId;
                return `
                  <button class="tilt-planet-btn drag-item p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing select-none ${
                    isDone ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 cursor-default opacity-60' :
                    isSelected ? 'bg-cyan-500 text-slate-950 border-cyan-400 ring-2 ring-cyan-400 shadow-md' :
                    'bg-slate-800 border-slate-700 text-white hover:border-cyan-400'
                  }" draggable="${!isDone}" data-planetid="${item.planetId}" ${isDone ? 'disabled' : ''}>
                    <span class="text-xl pointer-events-none">${item.planetId === 'uranus' ? '🌐' : item.planetId === 'earth' ? '🌍' : item.planetId === 'mars' ? '🔴' : '⚪'}</span>
                    <span class="pointer-events-none">${isAr ? item.nameAr : item.nameEn}</span>
                    ${isDone ? '<span class="text-[10px] text-emerald-400 pointer-events-none">✓ ' + item.tiltDeg + '</span>' : ''}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 4 Tilts in randomized order (Drop Targets) -->
          <div class="my-2">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">${isAr ? '2. طابق بزاوية الميل المحوري الدقيقة (أسقط هنا):' : '2. Match to Axial Tilt Angle (Drop Here):'}</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${gs.shuffledSolves.map(item => {
                const isDone = gs.matches[item.planetId];
                return `
                  <div class="tilt-angle-target p-3 rounded-xl border text-left rtl:text-right text-xs transition flex items-center justify-between cursor-pointer ${
                    isDone ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 cursor-default' :
                    'bg-slate-800/90 border-slate-700 text-slate-200 hover:border-cyan-400'
                  }" data-planetid="${item.planetId}">
                    <div class="flex-1 pr-2 rtl:pr-0 rtl:pl-2 pointer-events-none">
                      <div class="font-bold text-cyan-300 font-mono text-sm">${item.tiltDeg}</div>
                      <div class="text-[11px] text-slate-400 mt-0.5">${isAr ? item.factAr : item.factEn}</div>
                    </div>
                    <span class="pointer-events-none text-base">${isDone ? '✅' : '🌀'}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Feedback Box -->
          ${gs.feedback ? `
            <div class="mt-2 p-2.5 rounded-xl text-xs font-bold ${gs.feedback.type === 'success' ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-rose-950 border border-rose-500 text-rose-300'}">
              ${gs.feedback.text}
            </div>
          ` : ''}

          ${allMatched ? `
            <div class="mt-3 p-3 bg-emerald-950 border border-emerald-500 rounded-xl text-emerald-300 font-bold text-center text-xs">
              🎉 ${isAr ? 'أحسنت! أتقنت زوايا انحراف محاور دوران الكواكب بدقة تامة!' : 'Outstanding! Planetary axial tilts mastered perfectly!'}
            </div>
            ${makeGameDoneHTML(p, isAr)}
          ` : ''}
        </div>
      `;

      // Drag and drop event listeners
      const planetBtns = this.container.querySelectorAll('.tilt-planet-btn');
      planetBtns.forEach(btn => {
        btn.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', btn.dataset.planetid);
          e.dataTransfer.effectAllowed = 'move';
          btn.classList.add('is-dragging');
        });
        btn.addEventListener('dragend', () => {
          btn.classList.remove('is-dragging');
          this.container.querySelectorAll('.tilt-angle-target').forEach(el => el.classList.remove('drop-zone-active'));
        });
        btn.addEventListener('click', () => {
          gs.selectedTile = btn.dataset.planetid;
          gs.feedback = null;
          window.cosmicAudio.playClick();
          safeRender();
        });
      });

      this.container.querySelectorAll('.tilt-angle-target').forEach(box => {
        box.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          box.classList.add('drop-zone-active');
        });
        box.addEventListener('dragleave', () => {
          box.classList.remove('drop-zone-active');
        });
        box.addEventListener('drop', (e) => {
          e.preventDefault();
          box.classList.remove('drop-zone-active');
          const draggedPlanetId = e.dataTransfer.getData('text/plain');
          const targetPlanetId = box.dataset.planetid;
          handleMatch(draggedPlanetId, targetPlanetId);
        });
        box.addEventListener('click', () => {
          if (!gs.selectedTile) {
            gs.feedback = {
              type: 'wrong',
              text: isAr ? '⚠️ الرجاء اختيار أحد الكواكب أولاً من القائمة العلوية!' : '⚠️ Please select a planet first above!'
            };
            safeRender();
            return;
          }
          handleMatch(gs.selectedTile, box.dataset.planetid);
        });
      });

      if (allMatched) attachGameDoneBtn(p);
    };

    // --- GAME 7: Neptune Supersonic Wind Speed Sorter ---
    const renderNeptuneWindSorter = (p) => {
      if (!st.gameState) {
        st.gameState = {
          items: [...p.gameItems].sort(() => Math.random() - 0.5),
          sortedPicks: [],
          done: false,
          feedback: null
        };
      }
      const gs = st.gameState;
      const sortedCorrect = [...p.gameItems].sort((a, b) => a.speedVal - b.speedVal);

      if (gs.done) {
        this.container.innerHTML = `
          <div class="challenge-box text-center">
            ${makeGameHeaderHTML(p)}
            <div class="challenge-header">
              <span class="badge-tag">CHALLENGE 3 • NEPTUNE GAME</span>
              <h3 class="text-xl font-bold mt-1 text-blue-400">${isAr ? p.gameTitleAr : p.gameTitleEn}</h3>
            </div>
            <div class="my-4 p-5 bg-gradient-to-b from-blue-950/40 to-slate-900 border-2 border-blue-500 rounded-2xl">
              <div class="text-4xl mb-2">💨</div>
              <div class="text-base font-bold text-white mb-1">
                ${isAr ? 'أحسنت! رتبت سرعات الرياح فوق الصوتية من الأبطأ إلى الأسرع!' : 'Supersonic Wind Sorter Complete!'}
              </div>
              <div class="text-xs text-blue-300 font-mono">2,100 km/h Supersonic Threshold Unlocked</div>
            </div>
            ${makeGameDoneHTML(p, isAr)}
          </div>
        `;
        attachGameDoneBtn(p);
        return;
      }

      this.container.innerHTML = `
        <div class="challenge-box">
          ${makeGameHeaderHTML(p)}

          <div class="challenge-header">
            <span class="badge-tag">CHALLENGE 3 • NEPTUNE GAME</span>
            <h3 class="text-xl font-bold mt-1 text-blue-400">${isAr ? p.gameTitleAr : p.gameTitleEn}</h3>
            <p class="text-xs text-slate-300 mt-1">${isAr ? p.gameDescAr : p.gameDescEn}</p>
          </div>

          <div class="text-xs text-slate-400 my-2 font-mono flex items-center justify-between">
            <span>${isAr ? 'الترتيب المنجز:' : 'Ordered:'}</span>
            <span class="text-blue-400 font-bold">${gs.sortedPicks.length} / ${p.gameItems.length}</span>
          </div>

          <!-- Speed cards to click in order -->
          <div class="space-y-2 mt-2">
            ${gs.items.map((item, i) => {
              const pickIndex = gs.sortedPicks.findIndex(x => x.speedVal === item.speedVal);
              const isPicked = pickIndex !== -1;
              return `
                <button class="wind-pick-btn w-full p-3 rounded-xl border text-left rtl:text-right text-xs sm:text-sm font-bold transition flex items-center justify-between ${
                  isPicked ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 cursor-default' :
                  'bg-slate-800 border-slate-700 text-white hover:border-blue-400 active:scale-[0.99]'
                }" data-speed="${item.speedVal}" ${isPicked ? 'disabled' : ''}>
                  <span>${isAr ? item.labelAr : item.labelEn}</span>
                  <span class="font-mono text-xs ${isPicked ? 'text-emerald-400 font-bold' : 'text-slate-400'}">
                    ${isPicked ? `✓ #${pickIndex + 1}` : '💨'}
                  </span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Feedback Box -->
          ${gs.feedback ? `
            <div class="mt-3 p-2.5 rounded-xl text-xs font-bold ${gs.feedback.type === 'success' ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-rose-950 border border-rose-500 text-rose-300'}">
              ${gs.feedback.text}
            </div>
          ` : ''}
        </div>
      `;

      this.container.querySelectorAll('.wind-pick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const speed = parseInt(btn.dataset.speed, 10);
          const item = gs.items.find(x => x.speedVal === speed);
          const nextTarget = sortedCorrect[gs.sortedPicks.length];

          if (item && nextTarget && item.speedVal === nextTarget.speedVal) {
            gs.sortedPicks.push(item);
            window.cosmicAudio.playCorrect();
            gs.feedback = {
              type: 'success',
              text: isAr ? `✅ صحيح! #${gs.sortedPicks.length} في الترتيب!` : `✅ Correct! #${gs.sortedPicks.length} in order!`
            };
            if (gs.sortedPicks.length === p.gameItems.length) {
              gs.done = true;
              window.cosmicConfetti.burst();
              if (!st.completedPlanets.includes(p.id)) st.completedPlanets.push(p.id);
            }
          } else {
            window.cosmicAudio.playWrong();
            gs.feedback = {
              type: 'wrong',
              text: isAr 
                ? `⚠️ ليس هذا الأبطأ تالياً! الترتيب التالي الصحيح هو ${isAr ? nextTarget.labelAr : nextTarget.labelEn}.`
                : `⚠️ Not the next slowest! The next in sequence is ${nextTarget.labelEn}.`
            };
          }
          render();
        });
      });
    };

    // ===== SCREEN 3: FINAL GAME — THE 7 PLANET FACT CHALLENGE (CRASH-PROOF & REVISITABLE) =====
    const renderFinalChallenge = () => {
      if (!st.finalFacts || !st.finalFacts.length) {
        st.finalFacts = [...finalFacts].sort(() => Math.random() - 0.5);
      }
      const facts = st.finalFacts;
      const matchedCount = Object.keys(st.finalMatches).length;
      const allMatched = matchedCount === facts.length && facts.every((f, i) => st.finalMatches[i] === f.planetId);

      if (allMatched) {
        if (!st.stageSuccessTriggered) {
          st.stageSuccessTriggered = true;
          window.cosmicConfetti.burst();
          this.triggerStageSuccess('s1_3', 160, 100);
        }

        this.container.innerHTML = `
          <div class="challenge-box text-center">
            ${renderPlanetNavBarHTML()}

            <div class="challenge-header">
              <span class="badge-tag">CHALLENGE 3 COMPLETE</span>
              <h3 class="text-2xl font-black mt-1 text-amber-400">
                🏆 ${isAr ? 'أتممت تحدي مطابقة الحقائق الكوكبية بنجاح!' : 'The 7 Planet Fact Challenge Conquered!'}
              </h3>
            </div>
            <div class="my-5 p-6 bg-gradient-to-b from-amber-950/40 via-purple-950/30 to-slate-900 border-2 border-amber-500 rounded-3xl shadow-2xl">
              <div class="text-5xl mb-3">🌌</div>
              <h4 class="text-lg font-black text-white mb-2">
                ${isAr ? 'وسام مستكشف الكواكب السبعة الذهبي!' : 'Golden 7-World Planetary Expedition Patch!'}
              </h4>
              <p class="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-md mx-auto mb-4">
                ${isAr 
                  ? 'أحسنت أيها الرائد! لقد تعرفت على عوالم نظامنا الشمسي السبعة كاملة، واجتزت مهماتها التفاعلية، وطابقت جميع الحقائق الفلكية بدقة متناهية!' 
                  : 'Stellar navigation, Cadet! You explored all 7 planetary worlds, passed every dedicated science lab, and matched all 7 mystery facts without error!'}
              </p>

              <!-- Conquered 7 Worlds Showcase -->
              <div class="flex items-center justify-center gap-2 overflow-x-auto py-3 my-3 border-t border-b border-amber-500/30">
                ${planets.map(pl => `
                  <div class="flex flex-col items-center flex-shrink-0">
                    <img
                      src="${pl.image}"
                      alt="${isAr ? pl.nameAr : pl.nameEn}"
                      class="w-10 h-10 object-cover rounded-full border-2 shadow-lg"
                      style="border-color: ${pl.color}; box-shadow: 0 0 10px ${pl.color}88"
                      onerror="this.outerHTML='<span class=\\'text-lg\\'>${pl.icon}</span>'"
                    />
                    <span class="text-[9px] font-mono text-emerald-300 mt-1">${isAr ? pl.nameAr : pl.nameEn}</span>
                    <span class="text-[8px] text-emerald-400 font-mono">✓</span>
                  </div>
                `).join('')}
              </div>

              <div class="inline-block px-4 py-2 bg-emerald-950 border border-emerald-500 rounded-xl text-emerald-300 font-bold font-mono text-sm">
                ⭐ +160 XP AWARDED • STAGE 3 COMPLETE
              </div>
            </div>

            <!-- Action buttons: Next Sector or Explore Any Planet -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button id="final-advance-btn" class="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-sm shadow transition">
                ➔ ${isAr ? 'الدخول إلى قطاع استكشاف الأقمار (المرحلة 4)' : 'Advance to Sector 2: Lunar Cartography'}
              </button>
              <button id="final-revisit-planets-btn" class="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition">
                🪐 ${isAr ? 'التجول ومراجعة أي كوكب' : 'Explore / Revisit Any Planet'}
              </button>
            </div>
          </div>
        `;

        const advanceBtn = this.container.querySelector('#final-advance-btn');
        if (advanceBtn) {
          advanceBtn.addEventListener('click', () => {
            window.cosmicAudio.playLaunchWarp();
            window.academyApp.autoAdvanceToNextStage('s1_3');
          });
        }
        const revisitBtn = this.container.querySelector('#final-revisit-planets-btn');
        if (revisitBtn) {
          revisitBtn.addEventListener('click', () => {
            window.cosmicAudio.playClick();
            st.phase = 'planet';
            st.planetIdx = 0;
            st.planetPhase = 'info';
            render();
          });
        }
        return;
      }

      const selectedFact = st.finalSelectedFact;

      this.container.innerHTML = `
        <div class="challenge-box">
          ${renderPlanetNavBarHTML()}

          <div class="challenge-header">
            <span class="badge-tag">FINAL CHALLENGE • 7 PLANET EXPEDITIONS</span>
            <h3 class="text-xl sm:text-2xl font-black mt-1 text-amber-400">
              🌌 ${isAr ? 'تحدي مطابقة الحقائق الكوكبية السبع' : 'The 7 Planet Fact Challenge'}
            </h3>
            <p class="text-xs text-slate-300 mt-1">
              ${isAr 
                ? 'انقر على إحدى الحقائق العشوائية أدناه (دون ذكر اسم الكوكب)، ثم انقر على الكوكب الذي تعود له تلك الحقيقة!' 
                : 'Click a mystery fact below, then click the planetary world it belongs to. Planet names are not shown next to the facts!'}
            </p>
          </div>

          <!-- Progress Telemetry -->
          <div class="flex items-center justify-between my-3 px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono">
            <span class="text-slate-400">${isAr ? 'الحقائق المطابقة بنجاح:' : 'Facts Correctly Matched:'}</span>
            <span class="text-emerald-400 font-bold text-sm">${matchedCount} / ${facts.length}</span>
          </div>

          <!-- Feedback Box -->
          ${st.finalFeedback ? `
            <div class="mb-3 p-3 rounded-xl text-xs font-bold ${st.finalFeedback.type === 'success' ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-rose-950 border border-rose-500 text-rose-300'}">
              ${st.finalFeedback.text}
            </div>
          ` : ''}

          <!-- 7 Mystery Facts List -->
          <div class="mb-4">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              ${isAr ? '1. اختر إحدى الحقائق الكوكبية الغامضة:' : '1. Select a Mystery Planetary Fact:'}
            </div>
            <div class="space-y-2">
              ${facts.map((f, i) => {
                const isMatched = st.finalMatches[i] !== undefined;
                const isSelected = selectedFact === i;
                const matchedPlanet = isMatched ? planets.find(p => p.id === st.finalMatches[i]) : null;
                return `
                  <div class="fact-card p-3 rounded-xl border text-xs sm:text-sm transition cursor-pointer ${
                    isMatched ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 cursor-default shadow-sm' :
                    isSelected ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400 shadow-lg' :
                    'bg-slate-800 border-slate-700 text-slate-200 hover:border-amber-400'
                  }" data-factidx="${i}">
                    <div class="flex items-start gap-2">
                      <span class="text-base">${isMatched ? '✅' : (isSelected ? '👉' : '🔭')}</span>
                      <div class="flex-1 leading-relaxed">
                        ${isAr ? f.factAr : f.factEn}
                        ${isMatched && matchedPlanet ? `
                          <span class="inline-block mt-1 px-2 py-0.5 bg-emerald-900/60 border border-emerald-500/60 rounded text-[10px] font-bold text-emerald-300">
                            ${matchedPlanet.icon} ${isAr ? matchedPlanet.nameAr : matchedPlanet.nameEn}
                          </span>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- All 7 Planets Displayed Together -->
          <div class="mb-2">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              ${isAr ? '2. انقر على الكوكب المطابق للحقيقة المختارة:' : '2. Click the Corresponding Planet World:'}
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              ${planets.map(p => {
                const isPlanetMatched = Object.values(st.finalMatches).includes(p.id);
                return `
                  <button class="final-planet-btn p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 group ${
                    isPlanetMatched ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 opacity-60 cursor-default' :
                    'bg-slate-800/90 border-slate-700 text-white hover:border-amber-400 hover:scale-[1.02] active:scale-95 shadow-md'
                  }" data-planetid="${p.id}" ${isPlanetMatched ? 'disabled' : ''}>
                    <img
                      src="${p.image}"
                      alt="${isAr ? p.nameAr : p.nameEn}"
                      class="w-12 h-12 object-cover rounded-full border-2 shadow-md transition-transform group-hover:scale-105"
                      style="border-color: ${p.color}; box-shadow: 0 0 12px ${p.color}88"
                      onerror="this.outerHTML='<span class=\\'text-2xl\\'>${p.icon}</span>'"
                    />
                    <span class="font-bold text-center">${isAr ? p.nameAr : p.nameEn}</span>
                    ${isPlanetMatched ? '<span class="text-[10px] text-emerald-400 font-mono">✓ Solved</span>' : ''}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;

      // Fact card click
      this.container.querySelectorAll('.fact-card').forEach(card => {
        card.addEventListener('click', () => {
          const idx = parseInt(card.dataset.factidx, 10);
          if (st.finalMatches[idx] !== undefined) return;
          st.finalSelectedFact = (st.finalSelectedFact === idx) ? null : idx;
          st.finalFeedback = null;
          window.cosmicAudio.playClick();
          render();
        });
      });

      // Planet button click
      this.container.querySelectorAll('.final-planet-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (st.finalSelectedFact === null || st.finalSelectedFact === undefined) {
            st.finalFeedback = {
              type: 'wrong',
              text: isAr ? '⚠️ الرجاء اختيار إحدى الحقائق أولاً ثم اختيار الكوكب المطابق!' : '⚠️ Please select a fact first, then choose the planet!'
            };
            render();
            return;
          }

          const factIdx = st.finalSelectedFact;
          const factObj = facts[factIdx];
          const planetId = btn.dataset.planetid;
          const chosenPlanet = planets.find(p => p.id === planetId);

          if (planetId === factObj.planetId) {
            st.finalMatches[factIdx] = planetId;
            st.finalSelectedFact = null;
            window.cosmicAudio.playCorrect();
            st.finalFeedback = {
              type: 'success',
              text: isAr 
                ? `✅ رائع جداً! هذه الحقيقة تنتمي إلى كوكب ${chosenPlanet ? chosenPlanet.nameAr : planetId}!` 
                : `✅ Perfect match! That fact belongs to ${chosenPlanet ? chosenPlanet.nameEn : planetId}!`
            };
          } else {
            window.cosmicAudio.playWrong();
            st.finalFeedback = {
              type: 'wrong',
              text: isAr 
                ? `⚠️ غير صحيح! فكر في الخصائص الفيزيائية والمناخية لكل كوكب.` 
                : `⚠️ Incorrect! Review each planet\'s distinct thermal, atmospheric, and physical hallmarks.`
            };
          }
          render();
        });
      });
    };

    render();
  }


// --- 4. S2_1: Moon-to-Parent-Planet Matching with Enhanced Mistake Handling ---
  initStage2_1(lang) {
    const isAr = lang === 'ar';

    const moons = [
      { id: 'luna', nameEn: "Earth's Moon", nameAr: 'قمر الأرض', parent: 'earth', icon: '🌑' },
      { id: 'europa', nameEn: 'Europa (Salt Ocean)', nameAr: 'أوروبا (محيط مالح)', parent: 'jupiter', icon: '🧊' },
      { id: 'titan', nameEn: 'Titan (Methane Lakes)', nameAr: 'تيتان (بحيرات ميثان)', parent: 'saturn', icon: '🪐' },
      { id: 'io', nameEn: 'Io (Volcanic Giant)', nameAr: 'إيو (براكين كبريتية)', parent: 'jupiter', icon: '🌋' },
      { id: 'ganymede', nameEn: 'Ganymede (Largest Moon)', nameAr: 'غانيميد (أكبر الأقمار)', parent: 'jupiter', icon: '🌐' },
      { id: 'enceladus', nameEn: 'Enceladus (Ice Geysers)', nameAr: 'إنسيلادوس (ينابيع جليد)', parent: 'saturn', icon: '✨' }
    ];

    if (!this.sessionState.s2_1) {
      this.sessionState.s2_1 = {
        matches: { earth: [], jupiter: [], saturn: [] },
        selectedMoon: null,
        lastSelectedMoon: null,
        mistakes: 0,
        feedback: null,
        placedHistory: []
      };
    }
    const stateObj = this.sessionState.s2_1;

    const safeRender = () => {
      const scrollY = window.scrollY;
      render();
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };

    const handlePlacement = (planetId, currentMoonId = stateObj.selectedMoon) => {
      if (!currentMoonId) return;
      const moonObj = moons.find(m => m.id === currentMoonId);
      if (!moonObj) return;

      if (moonObj.parent === planetId) {
        stateObj.matches[planetId].push(currentMoonId);
        stateObj.placedHistory.push(currentMoonId);
        stateObj.selectedMoon = null;
        stateObj.lastSelectedMoon = null;
        window.cosmicAudio.playCorrect();
        stateObj.feedback = {
          type: 'success',
          text: isAr ? `✨ رائع! وضع ${moonObj.nameAr} في مداره الصحيح!` : `✨ Correct! Placed ${moonObj.nameEn} in its correct orbit!`
        };

        const totalAssigned = stateObj.matches.earth.length + stateObj.matches.jupiter.length + stateObj.matches.saturn.length;
        if (totalAssigned === moons.length) {
          window.cosmicConfetti.burst();
          stateObj.feedback = {
            type: 'success',
            text: isAr ? '🎉 رائع! تم تعيين جميع الأقمار في مداراتها الصحيحة بنجاح!' : '🎉 Spectacular! All 6 major moons mapped successfully!'
          };
          this.triggerStageSuccess('s2_1', 130, 100);
        }
      } else {
        stateObj.mistakes++;
        window.cosmicAudio.playWrong();

        if (stateObj.mistakes === 2) {
          let returnedName = isAr ? moonObj.nameAr : moonObj.nameEn;
          if (stateObj.placedHistory.length > 0) {
            const lastPlacedId = stateObj.placedHistory.pop();
            ['earth', 'jupiter', 'saturn'].forEach(pKey => {
              stateObj.matches[pKey] = stateObj.matches[pKey].filter(id => id !== lastPlacedId);
            });
            const returnedMoon = moons.find(m => m.id === lastPlacedId);
            returnedName = isAr ? returnedMoon.nameAr : returnedMoon.nameEn;
          }
          stateObj.selectedMoon = null;
          stateObj.feedback = {
            type: 'warning',
            text: isAr
              ? `⚠️ خطآن مداريان! أُعيد ${returnedName} إلى قائمة الأقمار للمراجعة! لديك فرصتان قبل إعادة الضبط الشامل.`
              : `⚠️ 2 Orbital mistakes! Returned ${returnedName} to the pool! You have 2 chances left before full reset.`
          };
        } else if (stateObj.mistakes >= 4) {
          stateObj.matches = { earth: [], jupiter: [], saturn: [] };
          stateObj.placedHistory = [];
          stateObj.selectedMoon = null;
          stateObj.mistakes = 0;
          stateObj.feedback = {
            type: 'reset',
            text: isAr
              ? '🚨 حدث اضطراب جاذبي حرج (4 أخطاء)! تمت إعادة ضبط كافة الأقمار إلى مداراتها الابتدائية للبدء من جديد.'
              : '🚨 Critical gravitational disruption (4 mistakes)! All moons reset to starting pool for a fresh attempt.'
          };
        } else {
          stateObj.selectedMoon = null;
          stateObj.feedback = {
            type: 'wrong',
            text: isAr
              ? `⚠️ مدار غير صحيح للقمر ${moonObj.nameAr}! تذكر: للأرض قمر واحد، للمشتري محيطات أوروبا وبراكين إيو، ولزحل غيوم تيتان وينابيع إنسيلادوس! (خطأ ${stateObj.mistakes} من 4)`
              : `⚠️ Incorrect orbit for ${moonObj.nameEn}! Remember: Earth has 1 moon, Jupiter holds Europa and Io, Saturn holds Titan and Enceladus! (Mistake ${stateObj.mistakes}/4)`
          };
        }
      }
      safeRender();
    };

    const render = () => {
      const assignedMoons = [...stateObj.matches.earth, ...stateObj.matches.jupiter, ...stateObj.matches.saturn];
      const remainingMoons = moons.filter(m => !assignedMoons.includes(m.id));

      this.container.innerHTML = `
        <div class="challenge-box">
          <div class="challenge-header">
            <span class="badge-tag">CHALLENGE 4 • LUNAR CARTOGRAPHY</span>
            <h3 class="text-xl font-bold text-purple-400 mt-1">
              ${isAr ? 'مطابقة الأقمار الرئيسية مع كواكبها الأم' : 'Match Major Moons to Parent Planets'}
            </h3>
            <p class="text-sm text-slate-300 mt-1">
              ${isAr 
                ? 'اسحب القمر بالفأرة وأفلته فوق كوكبه الأم (أو انقر عليه ثم انقر على الكوكب). تنبيه: عند ارتكاب خطأين يُعاد آخر قمر، وعند 4 أخطاء يُعاد الضبط!' 
                : 'Drag and drop moons onto their parent planet (or click moon then planet). Caution: 2 mistakes returns last moon, 4 mistakes resets all!'}
            </p>
          </div>

          <!-- Mistakes Telemetry -->
          <div class="flex items-center justify-between my-2 text-xs font-mono px-3 py-2 bg-slate-900 rounded-xl border border-slate-800">
            <span class="text-slate-400">${isAr ? 'سجل الأخطاء المدارية:' : 'Orbital Mistakes:'}</span>
            <span class="${stateObj.mistakes >= 2 ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}">
              ${stateObj.mistakes} / 4 ${isAr ? 'أخطاء مسموحة قبل إعادة الضبط' : 'mistakes tolerated before full reset'}
            </span>
          </div>

          <!-- Feedback Box -->
          ${stateObj.feedback ? `
            <div class="my-2 p-3 rounded-xl text-xs font-bold ${
              stateObj.feedback.type === 'success' ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' :
              stateObj.feedback.type === 'warning' ? 'bg-amber-950 border border-amber-500 text-amber-300' :
              stateObj.feedback.type === 'reset' ? 'bg-rose-950 border-2 border-rose-500 text-rose-200' :
              'bg-rose-950 border border-rose-500 text-rose-300'
            }">
              ${stateObj.feedback.text}
            </div>
          ` : ''}

          <!-- Unassigned Moons Pool (Draggable) -->
          <div class="my-3">
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>${isAr ? 'الأقمار المتاحة للمطابقة في المدار:' : 'Available Moons in Pool:'}</span>
              <span class="text-amber-400 text-[11px] font-mono">✋ Drag & Drop Available</span>
            </div>
            <div class="flex flex-wrap gap-2">
              ${remainingMoons.length === 0 ? `<span class="text-emerald-400 text-sm font-bold">✨ ${isAr ? 'تم تعيين جميع الأقمار بنجاح!' : 'All moons in stable orbits!'}</span>` : ''}
              ${remainingMoons.map(m => `
                <button class="moon-btn drag-item px-3 py-2 bg-slate-800 hover:bg-purple-900/60 border ${stateObj.selectedMoon === m.id ? 'border-purple-400 ring-2 ring-purple-400 bg-purple-950/80 shadow-lg' : 'border-slate-700'} rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 cursor-grab active:cursor-grabbing select-none" draggable="true" data-id="${m.id}">
                  <span class="text-slate-500 text-[10px] pointer-events-none">⠿</span>
                  <span>${m.icon}</span> ${isAr ? m.nameAr : m.nameEn}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Planet Buckets (Drop Zones) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Earth -->
            <div class="planet-target p-3 bg-slate-900 border-2 border-sky-500/50 rounded-xl cursor-pointer hover:bg-sky-950/30 transition shadow" data-planet="earth">
              <div class="flex items-center justify-between pb-1 border-b border-sky-500/30 pointer-events-none">
                <span class="font-bold text-sky-400 text-sm">🌍 ${isAr ? 'كوكب الأرض' : 'Earth'}</span>
                <span class="text-xs text-slate-400 font-mono">(1 ${isAr ? 'قمر' : 'Moon'})</span>
              </div>
              <div class="mt-2 space-y-1 min-h-[52px] pointer-events-none">
                ${stateObj.matches.earth.length === 0 ? `<span class="text-[10px] text-slate-500 italic block pt-2">${isAr ? 'أسقط القمر هنا ⬇' : 'Drop Moon Here ⬇'}</span>` : ''}
                ${stateObj.matches.earth.map(mid => `<div class="text-xs p-1.5 bg-sky-950 border border-sky-600 rounded-lg text-sky-200 font-bold flex items-center gap-1"><span>✓</span> ${isAr ? moons.find(m => m.id === mid).nameAr : moons.find(m => m.id === mid).nameEn}</div>`).join('')}
              </div>
            </div>

            <!-- Jupiter -->
            <div class="planet-target p-3 bg-slate-900 border-2 border-amber-500/50 rounded-xl cursor-pointer hover:bg-amber-950/30 transition shadow" data-planet="jupiter">
              <div class="flex items-center justify-between pb-1 border-b border-amber-500/30 pointer-events-none">
                <span class="font-bold text-amber-400 text-sm">🪐 ${isAr ? 'المشتري' : 'Jupiter'}</span>
                <span class="text-xs text-slate-400 font-mono">(3 ${isAr ? 'أقمار' : 'Moons'})</span>
              </div>
              <div class="mt-2 space-y-1 min-h-[52px] pointer-events-none">
                ${stateObj.matches.jupiter.length === 0 ? `<span class="text-[10px] text-slate-500 italic block pt-2">${isAr ? 'أسقط القمر هنا ⬇' : 'Drop Moon Here ⬇'}</span>` : ''}
                ${stateObj.matches.jupiter.map(mid => `<div class="text-xs p-1.5 bg-amber-950 border border-amber-600 rounded-lg text-amber-200 font-bold flex items-center gap-1"><span>✓</span> ${isAr ? moons.find(m => m.id === mid).nameAr : moons.find(m => m.id === mid).nameEn}</div>`).join('')}
              </div>
            </div>

            <!-- Saturn -->
            <div class="planet-target p-3 bg-slate-900 border-2 border-yellow-500/50 rounded-xl cursor-pointer hover:bg-yellow-950/30 transition shadow" data-planet="saturn">
              <div class="flex items-center justify-between pb-1 border-b border-yellow-500/30 pointer-events-none">
                <span class="font-bold text-yellow-400 text-sm">✨ ${isAr ? 'زحل' : 'Saturn'}</span>
                <span class="text-xs text-slate-400 font-mono">(2 ${isAr ? 'قمران' : 'Moons'})</span>
              </div>
              <div class="mt-2 space-y-1 min-h-[52px] pointer-events-none">
                ${stateObj.matches.saturn.length === 0 ? `<span class="text-[10px] text-slate-500 italic block pt-2">${isAr ? 'أسقط القمر هنا ⬇' : 'Drop Moon Here ⬇'}</span>` : ''}
                ${stateObj.matches.saturn.map(mid => `<div class="text-xs p-1.5 bg-yellow-950 border border-yellow-600 rounded-lg text-yellow-200 font-bold flex items-center gap-1"><span>✓</span> ${isAr ? moons.find(m => m.id === mid).nameAr : moons.find(m => m.id === mid).nameEn}</div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      `;

      // Drag & Drop event bindings
      const moonBtns = this.container.querySelectorAll('.moon-btn');
      moonBtns.forEach(btn => {
        btn.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', btn.dataset.id);
          e.dataTransfer.effectAllowed = 'move';
          btn.classList.add('is-dragging');
        });
        btn.addEventListener('dragend', () => {
          btn.classList.remove('is-dragging');
          this.container.querySelectorAll('.planet-target').forEach(el => el.classList.remove('drop-zone-active'));
        });
        btn.addEventListener('click', () => {
          stateObj.selectedMoon = btn.dataset.id;
          stateObj.lastSelectedMoon = btn.dataset.id;
          stateObj.feedback = null;
          window.cosmicAudio.playClick();
          safeRender();
        });
      });

      this.container.querySelectorAll('.planet-target').forEach(box => {
        box.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          box.classList.add('drop-zone-active');
        });
        box.addEventListener('dragleave', () => {
          box.classList.remove('drop-zone-active');
        });
        box.addEventListener('drop', (e) => {
          e.preventDefault();
          box.classList.remove('drop-zone-active');
          const moonId = e.dataTransfer.getData('text/plain');
          const planetId = box.dataset.planet;
          handlePlacement(planetId, moonId);
        });
        box.addEventListener('click', () => {
          if (!stateObj.selectedMoon) return;
          const planetId = box.dataset.planet;
          handlePlacement(planetId, stateObj.selectedMoon);
        });
      });
    };

    render();
  }

  // --- 5. S2_2: Black Hole Gravity Slingshot (2 ROUNDS & FAIL RANDOMIZATION) ---
  initStage2_2(lang) {
    const isAr = lang === 'ar';

    const randomizeCoords = () => {
      const bhX = Math.floor(220 + Math.random() * 120);
      const bhY = Math.floor(100 + Math.random() * 80);
      const targetX = Math.floor(430 + Math.random() * 80);
      const targetY = Math.floor(40 + Math.random() * 80);
      const shipStartX = Math.floor(30 + Math.random() * 30);
      const shipStartY = Math.floor(230 + Math.random() * 30);
      return { bhX, bhY, targetX, targetY, shipStartX, shipStartY };
    };

    if (!this.sessionState.s2_2) {
      this.sessionState.s2_2 = {
        round: 1, // 2 rounds needed to win!
        totalRounds: 2,
        angle: 25,
        thrust: 40,
        coords: randomizeCoords()
      };
    }
    const stateObj = this.sessionState.s2_2;
    if (!stateObj.coords) stateObj.coords = randomizeCoords();
    if (!stateObj.round) stateObj.round = 1;

    this.container.innerHTML = `
      <div class="challenge-box">
        <div class="challenge-header">
          <div class="flex items-center justify-between">
            <span class="badge-tag">CHALLENGE 5 • ORBITAL MECHANICS</span>
            <span class="px-3 py-1 bg-pink-950 border border-pink-500 rounded-full text-xs font-mono font-bold text-pink-300">
              ${isAr ? `الجولة ${stateObj.round} من ${stateObj.totalRounds}` : `ROUND ${stateObj.round} OF ${stateObj.totalRounds}`}
            </span>
          </div>
          <h3 class="text-xl font-bold text-pink-400 mt-1">
            ${isAr ? 'مناورة المقلاع المداري حول بئر الجاذبية' : 'Gravitational Slingshot Maneuver'}
          </h3>
          <p class="text-sm text-slate-300 mt-1">
            ${isAr ? 'أكمل جولتين ناجحتين! عند أي فشل أو اصطدام، تتغير مواقع الثقب الأسود والبوابة والسفينة فوراً لإعادة حساب السرعة والزاوية!' : 'Complete 2 successful rounds! Every time you fail, black hole, gate, and ship coordinates re-randomize automatically!'}
          </p>
        </div>

        <div class="relative mt-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
          <canvas id="slingshot-canvas" width="560" height="280" class="w-full block"></canvas>
        </div>

        <!-- Coordinates readout -->
        <div class="flex items-center justify-between mt-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
          <span class="text-slate-400">
            ${isAr ? 'إحداثيات المسار:' : 'Trajectory:'}
            <span class="text-pink-400">BH(${stateObj.coords.bhX},${stateObj.coords.bhY})</span> ➔
            <span class="text-emerald-400">GATE(${stateObj.coords.targetX},${stateObj.coords.targetY})</span>
          </span>
          <span class="text-amber-400 font-bold">
            ${isAr ? `الهدف: الجولة ${stateObj.round}/2` : `Target: Round ${stateObj.round}/2`}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div>
            <label class="text-xs text-slate-400 font-bold block mb-1">
              ${isAr ? 'زاوية الإطلاق المداري' : 'Launch Angle'}: <span id="angle-val" class="text-cyan-400">${stateObj.angle}°</span>
            </label>
            <input type="range" id="angle-slider" min="0" max="85" value="${stateObj.angle}" class="w-full accent-cyan-500">
          </div>
          <div>
            <label class="text-xs text-slate-400 font-bold block mb-1">
              ${isAr ? 'قوة الدفع النفاث' : 'Thruster Boost'}: <span id="thrust-val" class="text-amber-400">${stateObj.thrust} km/s</span>
            </label>
            <input type="range" id="thrust-slider" min="15" max="80" value="${stateObj.thrust}" class="w-full accent-amber-500">
          </div>
        </div>

        <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button id="launch-slingshot-btn" class="w-full sm:w-auto px-6 py-3 bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold rounded-xl shadow-lg transition">
            🚀 ${isAr ? `تنفيذ الإطلاق (الجولة ${stateObj.round}/2)` : `Execute Burn (Round ${stateObj.round}/2)`}
          </button>
          <div id="slingshot-msg" class="text-sm font-medium"></div>
        </div>
      </div>
    `;

    const canvas = this.container.querySelector('#slingshot-canvas');
    const ctx = canvas.getContext('2d');
    const angleSlider = this.container.querySelector('#angle-slider');
    const thrustSlider = this.container.querySelector('#thrust-slider');
    const angleVal = this.container.querySelector('#angle-val');
    const thrustVal = this.container.querySelector('#thrust-val');
    const launchBtn = this.container.querySelector('#launch-slingshot-btn');
    const msg = this.container.querySelector('#slingshot-msg');

    let bhX = stateObj.coords.bhX;
    let bhY = stateObj.coords.bhY;
    const bhRadius = 22;
    let targetX = stateObj.coords.targetX;
    let targetY = stateObj.coords.targetY;
    let shipStartX = stateObj.coords.shipStartX;
    let shipStartY = stateObj.coords.shipStartY;

    let ship = { x: shipStartX, y: shipStartY, vx: 0, vy: 0, trail: [] };
    let isFlying = false;

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Black Hole Accretion Disk Glow
      const grad = ctx.createRadialGradient(bhX, bhY, 15, bhX, bhY, 90);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(0.3, 'rgba(236, 72, 153, 0.45)');
      grad.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bhX, bhY, 90, 0, Math.PI * 2);
      ctx.fill();

      // Event Horizon
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#EC4899';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(bhX, bhY, bhRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Escape Gate
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#10B981';
      ctx.font = '10px monospace';
      ctx.fillText('ESCAPE GATE', targetX - 34, targetY + 38);

      // Ship launch pad marker
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(shipStartX, shipStartY, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Flight Trail
      if (ship.trail.length > 1) {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ship.trail[0].x, ship.trail[0].y);
        for (let i = 1; i < ship.trail.length; i++) {
          ctx.lineTo(ship.trail[i].x, ship.trail[i].y);
        }
        ctx.stroke();
      }

      // Ship
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(ship.x, ship.y, 6, 0, Math.PI * 2);
      ctx.fill();
    };

    drawScene();

    angleSlider.addEventListener('input', () => {
      stateObj.angle = parseInt(angleSlider.value, 10);
      angleVal.textContent = `${stateObj.angle}°`;
    });
    thrustSlider.addEventListener('input', () => {
      stateObj.thrust = parseInt(thrustSlider.value, 10);
      thrustVal.textContent = `${stateObj.thrust} km/s`;
    });

    const triggerFailureAndRandomize = (reasonText) => {
      isFlying = false;
      window.cosmicAudio.playWrong();
      // On failure, re-randomize positions so player has to calculate anew!
      stateObj.coords = randomizeCoords();
      bhX = stateObj.coords.bhX;
      bhY = stateObj.coords.bhY;
      targetX = stateObj.coords.targetX;
      targetY = stateObj.coords.targetY;
      shipStartX = stateObj.coords.shipStartX;
      shipStartY = stateObj.coords.shipStartY;
      ship = { x: shipStartX, y: shipStartY, vx: 0, vy: 0, trail: [] };

      msg.innerHTML = `<span class="text-rose-400 font-bold">${reasonText} ${isAr ? 'تم تغيير مواقع الثقب الأسود والبوابة والسفينة تلقائياً!' : 'Coordinates re-randomized for next attempt!'}</span>`;
      drawScene();
    };

    launchBtn.addEventListener('click', () => {
      if (isFlying) return;
      isFlying = true;
      msg.innerHTML = '';
      window.cosmicAudio.playThruster();

      const angle = (stateObj.angle * Math.PI) / 180;
      const thrust = stateObj.thrust * 0.16;

      ship.x = shipStartX;
      ship.y = shipStartY;
      ship.vx = Math.cos(angle) * thrust;
      ship.vy = -Math.sin(angle) * thrust;
      ship.trail = [{ x: ship.x, y: ship.y }];

      const step = () => {
        const dx = bhX - ship.x;
        const dy = bhY - ship.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        const G = 1900;
        const force = G / Math.max(distSq, 100);
        const ax = (dx / dist) * force;
        const ay = (dy / dist) * force;

        ship.vx += ax;
        ship.vy += ay;
        ship.x += ship.vx;
        ship.y += ship.vy;

        ship.trail.push({ x: ship.x, y: ship.y });
        drawScene();

        // 1. Swallowed by Event Horizon -> Failure + Re-randomize
        if (dist < bhRadius) {
          triggerFailureAndRandomize(isAr ? '⚠️ ابتلع الثقب الأسود السفينة!' : '⚠️ Captured by event horizon!');
          return;
        }

        // 2. Escape Gate Hit!
        const targetDist = Math.hypot(ship.x - targetX, ship.y - targetY);
        if (targetDist < 26) {
          isFlying = false;
          window.cosmicAudio.playCorrect();
          window.cosmicConfetti.burst();

          if (stateObj.round === 1) {
            // Advance to Round 2!
            stateObj.round = 2;
            stateObj.coords = randomizeCoords();
            msg.innerHTML = `<span class="text-emerald-400 font-bold">✨ ${isAr ? 'رائع! اجتزت الجولة 1/2 بنجاح! انتقلت للجولة 2 مع إحداثيات جديدة!' : 'Spectacular! Round 1/2 complete! New trajectory generated for Round 2!'}</span>`;
            setTimeout(() => {
              this.initStage2_2(lang);
            }, 1200);
          } else {
            // Round 2 complete -> Complete Mission!
            msg.innerHTML = `<span class="text-emerald-400 font-bold">🏆 ${isAr ? 'مبروك! أتممت الجولتين بنجاح تام وتجاوزت بئر الجاذبية!' : 'Flawless! Both Slingshot Rounds Mastered!'}</span>`;
            this.triggerStageSuccess('s2_2', 160, 100);
          }
          return;
        }

        // 3. Out of bounds -> Failure + Re-randomize
        if (ship.x < -20 || ship.x > canvas.width + 20 || ship.y < -20 || ship.y > canvas.height + 20) {
          triggerFailureAndRandomize(isAr ? '⚠️ تشتت المسار خارج النطاق!' : '⚠️ Trajectory drifted into the void!');
          return;
        }

        requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    });
  }
// --- 6. S2_3: JWST Exoplanet Optical Spectroscopy Scanner (INTERACTIVE SCIENCE GAME) ---
  initStage2_3(lang) {
    const isAr = lang === 'ar';

    // 3 Atmospheric Biomarkers to discover via live spectral scanning
    const biomarkers = [
      {
        id: 'h2o',
        nameEn: 'Water Vapor (H₂O) Clouds',
        nameAr: 'سحب جزيئات بخار الماء (H₂O)',
        targetWavelength: 1.4, // 1.4 µm
        tolerance: 0.35,
        color: '#38BDF8',
        icon: '💧',
        descEn: 'Distinct absorption dip at 1.4 µm reveals liquid water vapor clouds in the exoplanet\'s atmosphere!',
        descAr: 'هبوط حاد في امتصاص الضوء عند 1.4 ميكرون يكشف عن بخار الماء في الغلاف الجوي للكوكب الخارجي!'
      },
      {
        id: 'ch4',
        nameEn: 'Methane (CH₄) & Carbon Dioxide',
        nameAr: 'مركبات الميثان وثاني أكسيد الكربون (CH₄ + CO₂)',
        targetWavelength: 3.3, // 3.3 µm
        tolerance: 0.4,
        color: '#10B981',
        icon: '🌿',
        descEn: 'Absorption bands at 3.3 µm indicate carbon-based atmospheric chemistry and organic greenhouse molecules!',
        descAr: 'حزم امتصاص قوية عند 3.3 ميكرون تبرهن على وجود كيمياء كربونية وغازات دفيئة عضوية!'
      },
      {
        id: 'silicates',
        nameEn: 'Mineral Stardust & Silicate Haze',
        nameAr: 'هباء المعادن وسحب السيليكات (غبار النجوم)',
        targetWavelength: 7.7, // 7.7 µm
        tolerance: 0.5,
        color: '#F59E0B',
        icon: '✨',
        descEn: 'Mid-infrared MIRI detectors pierce high clouds at 7.7 µm, detecting glowing hot silicate dust particles!',
        descAr: 'كواشف الأشعة تحت الحمراء المتوسطة تخترق السحب عند 7.7 ميكرون لتكشف جزيئات غبار السيليكات الساخنة!'
      }
    ];

    if (!this.sessionState.s2_3) {
      this.sessionState.s2_3 = {
        wavelength: 0.8, // 0.6 µm to 10.0 µm
        detectedMarks: {}, // id -> true
        feedback: null
      };
    }
    const stateObj = this.sessionState.s2_3;
    const detectedCount = Object.keys(stateObj.detectedMarks).length;
    const isComplete = detectedCount === biomarkers.length;

    // Check if current wavelength is in lock with any biomarker
    const checkActiveLock = () => {
      const curW = stateObj.wavelength;
      for (let bm of biomarkers) {
        if (!stateObj.detectedMarks[bm.id] && Math.abs(curW - bm.targetWavelength) <= bm.tolerance) {
          return bm;
        }
      }
      return null;
    };

    const render = () => {
      const activeLock = checkActiveLock();

      this.container.innerHTML = `
        <div class="challenge-box">
          <div class="challenge-header">
            <span class="badge-tag">CHALLENGE 6 • EXOPLANET SPECTROSCOPY SCANNER</span>
            <h3 class="text-xl font-bold text-amber-400 mt-1">
              🔭 ${isAr ? 'ماسح أطياف الغلاف الجوي لكوكب WASP-96b الخارجي' : 'JWST Exoplanet Atmosphere Spectroscopy Scanner'}
            </h3>
            <p class="text-xs sm:text-sm text-slate-300 mt-1">
              ${isAr
                ? 'يمر الكوكب الخارجي أمام نجمه الأم. حرك شريط الطول الموجي لمطياف ويب لاصطياد بصمات الجزيئات الكيميائية الثلاث وفك أسرار الغلاف الجوي!'
                : 'Exoplanet WASP-96b transits its host star! Sweep the spectrometer wavelength slider to lock onto and analyze all 3 atmospheric biomarkers!'}
            </p>
          </div>

          <!-- Progress Telemetry -->
          <div class="flex items-center justify-between my-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
            <span class="text-slate-400">${isAr ? 'الجزيئات المكتشفة بنجاح:' : 'Biomarkers Detected:'}</span>
            <span class="text-amber-400 font-bold">${detectedCount} / ${biomarkers.length}</span>
          </div>

          <!-- Interactive Telescope Transit & Spectrum Canvas -->
          <div class="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
            <canvas id="spectro-canvas" width="560" height="240" class="w-full block"></canvas>
            <div class="absolute top-2 left-3 text-xs font-mono text-cyan-400 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
              📡 NIRCam/MIRI Spectrograph: <span class="text-white font-bold">${stateObj.wavelength.toFixed(1)} µm</span>
            </div>
          </div>

          <!-- Wavelength Tuner Controls -->
          <div class="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div class="flex items-center justify-between text-xs font-mono mb-1">
              <span class="text-slate-300 font-bold">${isAr ? 'شريط مسح الطول الموجي للأشعة تحت الحمراء:' : 'Infrared Wavelength Tuner (µm):'}</span>
              <span class="text-amber-400 font-bold text-sm">${stateObj.wavelength.toFixed(1)} µm</span>
            </div>
            <input type="range" id="wavelength-slider" min="6" max="95" value="${Math.round(stateObj.wavelength * 10)}" class="w-full accent-amber-500 cursor-pointer">
            <div class="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>0.6 µm (Visible/Near-IR)</span>
              <span>1.4 µm (H₂O)</span>
              <span>3.3 µm (CH₄)</span>
              <span>7.7 µm (MIRI Silicate)</span>
              <span>9.5 µm (Deep Mid-IR)</span>
            </div>
          </div>

          <!-- Lock Banner and Action Button -->
          <div class="mt-3">
            ${activeLock ? `
              <div class="p-3 bg-emerald-950/80 border-2 border-emerald-500 rounded-xl flex items-center justify-between gap-3 animate-fade-in shadow-lg">
                <div class="flex items-center gap-2.5">
                  <span class="text-2xl">${activeLock.icon}</span>
                  <div>
                    <div class="text-xs font-bold text-emerald-400 font-mono">${isAr ? 'تم رصد حزمة امتصاص طيفي نشطة!' : 'SPECTRAL ABSORPTION DIP DETECTED!'}</div>
                    <div class="text-sm font-bold text-white">${isAr ? activeLock.nameAr : activeLock.nameEn}</div>
                  </div>
                </div>
                <button id="lock-biomark-btn" class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow transition active:scale-95">
                  🔬 ${isAr ? 'تحليل وتسجيل البصمة' : 'Analyze & Lock Spectrum'}
                </button>
              </div>
            ` : `
              <div class="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs font-mono text-slate-400">
                ${isAr ? 'حرك شريط الطول الموجي لمطابقة حزم امتصاص جزيئات الغلاف الجوي' : 'Sweep wavelength slider across absorption peaks to detect molecules'}
              </div>
            `}
          </div>

          <!-- Discovered Biomarkers Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
            ${biomarkers.map(bm => {
              const isFound = stateObj.detectedMarks[bm.id];
              return `
                <div class="p-2.5 rounded-xl border text-xs transition ${
                  isFound ? 'bg-slate-900/90 border-emerald-500 text-emerald-200' :
                  'bg-slate-900/50 border-slate-800 text-slate-500'
                }">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-lg">${isFound ? bm.icon : '🔒'}</span>
                    <strong class="truncate ${isFound ? 'text-white' : 'text-slate-400'}">${isAr ? bm.nameAr : bm.nameEn}</strong>
                  </div>
                  <div class="text-[10px] font-mono text-cyan-400 mb-0.5">Target: ${bm.targetWavelength} µm</div>
                  <p class="text-[11px] leading-relaxed ${isFound ? 'text-slate-300' : 'text-slate-600'}">
                    ${isFound ? (isAr ? bm.descAr : bm.descEn) : (isAr ? 'بانتظار المسح الطيفي...' : 'Awaiting spectral scan...')}
                  </p>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Victory Banner -->
          ${isComplete ? `
            <div class="mt-4 p-4 bg-emerald-950 border-2 border-emerald-500 rounded-2xl text-center">
              <div class="text-base font-bold text-emerald-300 mb-1">
                🎉 ${isAr ? 'أحسنت! أتممت بنجاح التحليل الطيفي الكامل لغلاف الكوكب الخارجي!' : 'Spectacular! Complete Atmospheric Spectrum Decoded!'}
              </div>
              <p class="text-xs text-slate-300 max-w-md mx-auto">
                ${isAr
                  ? 'رصدت بنجاح سحب بخار الماء، وغازات الكربون، وغبار السيليكات عبر أجهزة NIRCam و MIRI لتلسكوب جيمس ويب الفضائي!'
                  : 'You proved how transit spectroscopy decodes water vapor clouds, carbon molecules, and silicate stardust using NASA Webb NIRCam and MIRI instruments!'}
              </p>
              <div class="mt-3 text-xs font-mono text-amber-400 font-bold">+160 XP Awarded • Stage Complete</div>
            </div>
          ` : ''}
        </div>
      `;

      // Canvas Spectrum Graphic Renderer
      const canvas = this.container.querySelector('#spectro-canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Host Star & Planet Transit at top
        const starX = 140;
        const starY = 65;
        const starGrad = ctx.createRadialGradient(starX, starY, 10, starX, starY, 45);
        starGrad.addColorStop(0, '#FFFFFF');
        starGrad.addColorStop(0.4, '#FDE047');
        starGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
        ctx.fillStyle = starGrad;
        ctx.beginPath();
        ctx.arc(starX, starY, 45, 0, Math.PI * 2);
        ctx.fill();

        // Planet transit silhouette
        const planetX = starX + 18;
        const planetY = starY + 2;
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(planetX, planetY, 14, 0, Math.PI * 2);
        ctx.fill();
        // Atmosphere ring around planet
        ctx.strokeStyle = activeLock ? activeLock.color : 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(planetX, planetY, 16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px monospace';
        ctx.fillText('EXOPLANET TRANSIT', starX - 45, starY - 45);

        // Draw Absorption Spectrum Curve in bottom half
        const graphLeft = 50;
        const graphRight = canvas.width - 30;
        const graphBottom = canvas.height - 25;
        const graphTop = 130;

        // Baseline axis
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(graphLeft, graphBottom);
        ctx.lineTo(graphRight, graphBottom);
        ctx.stroke();

        // Spectrum Wave Line with Dips at 1.4, 3.3, 7.7
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = graphLeft; x <= graphRight; x++) {
          const w = 0.6 + ((x - graphLeft) / (graphRight - graphLeft)) * (10.0 - 0.6);
          // Calculate absorption dip
          let dip = 0;
          dip += 35 * Math.exp(-Math.pow((w - 1.4) / 0.3, 2));   // H2O dip
          dip += 28 * Math.exp(-Math.pow((w - 3.3) / 0.4, 2));   // CH4 dip
          dip += 32 * Math.exp(-Math.pow((w - 7.7) / 0.5, 2));   // Silicate dip

          const y = graphTop + 25 + Math.sin(x * 0.1) * 3 + dip;
          if (x === graphLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Wavelength Scanner Cursor line
        const scanX = graphLeft + ((stateObj.wavelength - 0.6) / (10.0 - 0.6)) * (graphRight - graphLeft);
        ctx.strokeStyle = activeLock ? '#10B981' : '#F59E0B';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(scanX, graphTop - 10);
        ctx.lineTo(scanX, graphBottom + 5);
        ctx.stroke();
        ctx.setLineDash([]);

        // Scanner cursor badge
        ctx.fillStyle = activeLock ? '#10B981' : '#F59E0B';
        ctx.beginPath();
        ctx.arc(scanX, graphTop - 10, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Slider listener
      const slider = this.container.querySelector('#wavelength-slider');
      if (slider) {
        slider.addEventListener('input', () => {
          stateObj.wavelength = parseInt(slider.value, 10) / 10;
          render();
        });
      }

      // Lock biomarker button
      const lockBtn = this.container.querySelector('#lock-biomark-btn');
      if (lockBtn && activeLock) {
        lockBtn.addEventListener('click', () => {
          stateObj.detectedMarks[activeLock.id] = true;
          window.cosmicAudio.playCorrect();
          window.cosmicConfetti.burst();
          if (Object.keys(stateObj.detectedMarks).length === biomarkers.length) {
            this.triggerStageSuccess('s2_3', 160, 100);
          }
          render();
        });
      }
    };

    render();
  }

// --- 7. S3_1: Milky Way Galactic Radio Radar Triangulation (GREEN PROGRESS & BUTTON) ---
  initStage3_1(lang) {
    const isAr = lang === 'ar';

    if (!this.sessionState.s3_1) {
      this.sessionState.s3_1 = {
        missionStep: 1, // 1: Orion Spur, 2: Sagittarius A*
        radarAngle: 120,
        frequency: 2.0, // GHz
        signalLock: 0
      };
    }
    const stateObj = this.sessionState.s3_1;

    const render = () => {
      const isStep1 = stateObj.missionStep === 1;
      const targetAngle = isStep1 ? 165 : 0; // 165° for Orion Arm, 0° for core
      const targetFreq = isStep1 ? 1.4 : 2.3; // 1.42 GHz Hydrogen line vs 2.3 GHz Sgr A*

      const calcLock = () => {
        const angleDiff = Math.abs(stateObj.radarAngle - targetAngle);
        const freqDiff = Math.abs(stateObj.frequency - targetFreq);
        return Math.max(10, Math.min(100, Math.round(100 - (angleDiff * 0.7 + freqDiff * 35))));
      };
      const initialLock = calcLock();
      stateObj.signalLock = initialLock;
      const isLocked = initialLock >= 75; // Green zone threshold!

      this.container.innerHTML = `
        <div class="challenge-box">
          <div class="challenge-header">
            <span class="badge-tag">CHALLENGE 7 • GALACTIC RADAR</span>
            <h3 class="text-xl font-bold text-sky-400 mt-1">
              ${isStep1
                ? (isAr ? 'الخطوة 1: تثليث منارة ذراع الجبار (موقع شمسنا)' : 'Step 1: Triangulate Orion Spur Beacon (Our Solar System)')
                : (isAr ? 'الخطوة 2: رصد إشارة الثقب الأسود الرامي A* في قلب المجرة' : 'Step 2: Lock onto Supermassive Sagittarius A* Core')}
            </h3>
            <p class="text-sm text-slate-300 mt-1">
              ${isStep1
                ? (isAr ? 'اسحب شريطي التمرير نحو زاوية 165° وتردد 1.4 GHz حتى يتحول شريط التقدم وزر التثبيت للون الأخضر!' : 'Sweep radar toward azimuth 165° and frequency 1.4 GHz until the progress bar and button turn green!')
                : (isAr ? 'الآن اسحب شريطي التمرير لتوجيه الرادار نحو النواة المركزية لمجرتنا وارصد إشارات الرامي A*!' : 'Now click and drag the sliders toward the galactic core to lock onto the supermassive Sagittarius A* radio beacon!')}
            </p>
          </div>

          <!-- Radar Screen Visualizer -->
          <div class="my-4 p-3 bg-slate-950 border border-slate-700 rounded-2xl flex flex-col items-center">
            <svg viewBox="-100 -100 200 200" class="w-52 h-52 bg-slate-900 rounded-full border border-slate-700 shadow-2xl relative">
              <circle cx="0" cy="0" r="80" fill="none" stroke="rgba(56, 189, 248, 0.15)" stroke-width="1"/>
              <circle cx="0" cy="0" r="50" fill="none" stroke="rgba(56, 189, 248, 0.2)" stroke-width="1"/>
              <circle cx="0" cy="0" r="20" fill="none" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1"/>

              <!-- Central Galactic Core -->
              <circle cx="0" cy="0" r="6" fill="#EC4899"/>

              <!-- Target Beacon Zone Wedge -->
              <circle cx="${Math.cos(targetAngle * Math.PI / 180) * (isStep1 ? 52 : 4)}" cy="${Math.sin(targetAngle * Math.PI / 180) * (isStep1 ? 52 : 4)}" r="14" fill="${isLocked ? 'rgba(16, 185, 129, 0.25)' : 'none'}" stroke="${isLocked ? '#10B981' : 'rgba(255, 255, 255, 0.15)'}" stroke-width="1.5"/>

              <!-- Radar sweep beam line -->
              <line id="radar-sweep-line" x1="0" y1="0" x2="${Math.cos(stateObj.radarAngle * Math.PI / 180) * 85}" y2="${Math.sin(stateObj.radarAngle * Math.PI / 180) * 85}" stroke="${isLocked ? '#10B981' : '#38BDF8'}" stroke-width="2.5"/>

              <!-- Target Pulsar Dot -->
              <circle id="radar-target-dot" cx="${Math.cos(targetAngle * Math.PI / 180) * (isStep1 ? 52 : 4)}" cy="${Math.sin(targetAngle * Math.PI / 180) * (isStep1 ? 52 : 4)}" r="6" fill="${isLocked ? '#10B981' : '#F59E0B'}" class="animate-ping"/>
            </svg>

            <!-- Signal Lock Gauge: Turns GREEN in correct zone -->
            <div class="w-full max-w-xs mt-3">
              <div class="flex justify-between text-xs font-mono mb-1">
                <span class="text-slate-400">${isAr ? 'قوة قفل الإشارة:' : 'Signal Lock:'}</span>
                <span id="radar-lock-val" class="${isLocked ? 'text-emerald-400 font-bold text-sm' : 'text-amber-400 font-bold'}">${initialLock}%</span>
              </div>
              <div class="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                <div id="radar-lock-bar" class="h-full ${isLocked ? 'bg-emerald-500 shadow-md shadow-emerald-500/50' : 'bg-cyan-400'} transition-all duration-150" style="width: ${initialLock}%"></div>
              </div>
            </div>
          </div>

          <!-- Radar Controls -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div>
              <label class="text-xs text-slate-300 font-bold block mb-1">
                ${isAr ? 'زاوية مسح الرادار (الهدف: 165°)' : 'Radar Azimuth (Target: 165°)'}: <span id="radar-angle-val" class="${Math.abs(stateObj.radarAngle - targetAngle) <= 12 ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-bold'} font-mono">${stateObj.radarAngle}°</span>
              </label>
              <input type="range" id="radar-angle-slider" min="0" max="360" value="${stateObj.radarAngle}" class="w-full accent-cyan-400 cursor-pointer">
            </div>
            <div>
              <label class="text-xs text-slate-300 font-bold block mb-1">
                ${isAr ? 'تردد الموجة (الهدف: 1.4 GHz)' : 'Frequency (Target: 1.4 GHz)'}: <span id="radar-freq-val" class="${Math.abs(stateObj.frequency - targetFreq) <= 0.25 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'} font-mono">${stateObj.frequency.toFixed(1)} GHz</span>
              </label>
              <input type="range" id="radar-freq-slider" min="10" max="40" value="${Math.round(stateObj.frequency * 10)}" class="w-full accent-amber-400 cursor-pointer">
            </div>
          </div>

          <!-- Button: Turns GREEN in correct zone -->
          <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button id="lock-beacon-btn" class="w-full sm:w-auto px-7 py-3.5 ${isLocked ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/30 cursor-pointer active:scale-95 animate-pulse' : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'} rounded-xl shadow transition" ${!isLocked ? 'disabled' : ''}>
              📡 ${isAr ? 'تثبيت الإشارة والبيانات' : 'Lock Telemetry Signal'}
            </button>
            <div id="radar-msg" class="text-xs font-medium"></div>
          </div>

          <!-- NASA RadLab Cosmic Radiation Telemetry for Sector 3 (Galactic Frontiers) -->
          <div id="galactic-radlab-container" class="mt-4"></div>
        </div>
      `;

      if (window.NasaData) {
        window.NasaData.getRadiationCardHTML(lang).then(cardHtml => {
          const el = this.container.querySelector('#galactic-radlab-container');
          if (el && cardHtml) el.innerHTML = cardHtml;
        });
      }

      const angleSlider = this.container.querySelector('#radar-angle-slider');
      const freqSlider = this.container.querySelector('#radar-freq-slider');
      const lockBtn = this.container.querySelector('#lock-beacon-btn');
      const angleVal = this.container.querySelector('#radar-angle-val');
      const freqVal = this.container.querySelector('#radar-freq-val');
      const lockVal = this.container.querySelector('#radar-lock-val');
      const lockBar = this.container.querySelector('#radar-lock-bar');
      const sweepLine = this.container.querySelector('#radar-sweep-line');
      const targetDot = this.container.querySelector('#radar-target-dot');

      const updateTelemetry = () => {
        const curLock = calcLock();
        stateObj.signalLock = curLock;
        const curLocked = curLock >= 75;

        if (angleVal) {
          angleVal.textContent = `${stateObj.radarAngle}°`;
          angleVal.className = Math.abs(stateObj.radarAngle - targetAngle) <= 12 ? 'text-emerald-400 font-bold font-mono' : 'text-cyan-400 font-bold font-mono';
        }
        if (freqVal) {
          freqVal.textContent = `${stateObj.frequency.toFixed(1)} GHz`;
          freqVal.className = Math.abs(stateObj.frequency - targetFreq) <= 0.25 ? 'text-emerald-400 font-bold font-mono' : 'text-amber-400 font-bold font-mono';
        }
        if (lockVal) {
          lockVal.textContent = `${curLock}%`;
          lockVal.className = curLocked ? 'text-emerald-400 font-bold text-sm' : 'text-amber-400 font-bold';
        }
        if (lockBar) {
          lockBar.style.width = `${curLock}%`;
          lockBar.className = `h-full ${curLocked ? 'bg-emerald-500 shadow-md shadow-emerald-500/50' : 'bg-cyan-400'} transition-all duration-75`;
        }
        if (sweepLine) {
          const rad = stateObj.radarAngle * Math.PI / 180;
          sweepLine.setAttribute('x2', (Math.cos(rad) * 85).toFixed(2));
          sweepLine.setAttribute('y2', (Math.sin(rad) * 85).toFixed(2));
          sweepLine.setAttribute('stroke', curLocked ? '#10B981' : '#38BDF8');
        }
        if (targetDot) {
          targetDot.setAttribute('fill', curLocked ? '#10B981' : '#F59E0B');
        }
        if (lockBtn) {
          if (curLocked) {
            lockBtn.disabled = false;
            lockBtn.className = 'w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/30 cursor-pointer active:scale-95 animate-pulse transition';
          } else {
            lockBtn.disabled = true;
            lockBtn.className = 'w-full sm:w-auto px-7 py-3.5 bg-slate-700 text-slate-400 cursor-not-allowed rounded-xl shadow transition opacity-60';
          }
        }
      };

      if (angleSlider) {
        angleSlider.addEventListener('input', (e) => {
          stateObj.radarAngle = parseInt(e.target.value, 10);
          updateTelemetry();
        });
      }

      if (freqSlider) {
        freqSlider.addEventListener('input', (e) => {
          stateObj.frequency = parseInt(e.target.value, 10) / 10;
          updateTelemetry();
        });
      }

      if (lockBtn) {
        lockBtn.addEventListener('click', () => {
          if (stateObj.signalLock < 75) return;
          window.cosmicAudio.playCorrect();
          window.cosmicConfetti.burst();

          if (stateObj.missionStep === 1) {
            stateObj.missionStep = 2;
            stateObj.radarAngle = 30;
            stateObj.frequency = 3.0;
            render();
          } else {
            this.triggerStageSuccess('s3_1', 140, 100);
          }
        });
      }
    };

    render();
  }

  // --- 8. S3_2: Stellar Alchemy: Core Particle Collider & Fusion Launcher (TARGET DISAPPEARS ON HIT) ---
  initStage3_2(lang) {
    const isAr = lang === 'ar';

    const milestones = [
      {
        step: 1,
        starNameEn: 'Main Sequence Yellow Dwarf (Our Sun)',
        starNameAr: 'نجم النسق الأساسي (القزم الأصفر / شمسنا)',
        fuelNameEn: 'Hydrogen Proton (¹H)',
        fuelNameAr: 'بروتون الهيدروجين (¹H)',
        productNameEn: 'Helium-4 (⁴He)',
        productNameAr: 'الهيليوم-4 (⁴He)',
        coreColor: '#FBBF24',
        fuelNeeded: 3,
        descEn: 'Fuses 4 Hydrogen protons into Helium, releasing massive solar photon energy that sustains Earth!',
        descAr: 'يصهر 4 بروتونات هيدروجين لإنتاج الهيليوم، مطلقاً طاقة شمسية هائلة تدعم الحياة على الأرض!'
      },
      {
        step: 2,
        starNameEn: 'Red Giant Star Phase',
        starNameAr: 'طور العملاق الأحمر',
        fuelNameEn: 'Helium Alpha Nucleus (⁴He)',
        fuelNameAr: 'نواة ألفا الهيليوم (⁴He)',
        productNameEn: 'Carbon-12 (¹²C)',
        productNameAr: 'الكربون-12 (¹²C)',
        coreColor: '#EF4444',
        fuelNeeded: 3,
        descEn: 'Triple-alpha process: 3 Helium nuclei fuse to create Carbon — the elemental basis for all organic chemistry!',
        descAr: 'تفاعل ألفا الثلاثي: تندمج 3 أنوية هيليوم لتخليق الكربون — اللبنة الأساسية لكل حياة عضوية في الكون!'
      },
      {
        step: 3,
        starNameEn: 'Supergiant Alpha-Process Crucible',
        starNameAr: 'بوتقة النجم العملاق الفائق',
        fuelNameEn: 'Carbon & Alpha Particles (¹²C + ⁴He)',
        fuelNameAr: 'جسيمات كربون وألفا (¹²C + ⁴He)',
        productNameEn: 'Oxygen-16 (¹⁶O) & Neon',
        productNameAr: 'الأكسجين-16 (¹⁶O) والنيون',
        coreColor: '#38BDF8',
        fuelNeeded: 3,
        descEn: 'Carbon captures alpha nuclei to forge Oxygen and heavier elements in layered burning shells!',
        descAr: 'يلتقط الكربون جسيمات ألفا ليصهر الأكسجين والعناصر الأثقل في طبقات قشرية متوهجة!'
      },
      {
        step: 4,
        starNameEn: 'Supernova Collapse & Stardust Shockwave',
        starNameAr: 'انهيار السوبرنوفا وتناثر غبار النجوم',
        fuelNameEn: 'Ultra-Dense Silicon Compression',
        fuelNameAr: 'انضغاط السيليكون فائق الكثافة',
        productNameEn: 'Iron-56 Core (⁵⁶Fe) ➔ Supernova Blast!',
        productNameAr: 'قلب الحديد-56 ➔ انفجار السوبرنوفا العظيم!',
        coreColor: '#A855F7',
        fuelNeeded: 3,
        descEn: 'Iron cannot sustain fusion! Gravitational collapse triggers a catastrophic Supernova that seeds gold and stardust across the galaxy!',
        descAr: 'لا ينتج الحديد طاقة بالاندماج! ينهار القلب وتنفجر السوبرنوفا لتنثر الذهب وغبار النجوم في أرجاء المجرة!'
      }
    ];

    if (!this.sessionState.s3_2) {
      this.sessionState.s3_2 = {
        currentStepIdx: 0,
        hitsInStep: 0,
        completed: false,
        score: 0,
        feedback: null
      };
    }
    const stateObj = this.sessionState.s3_2;

    const render = () => {
      const ms = milestones[stateObj.currentStepIdx];
      const isComplete = stateObj.completed;

      this.container.innerHTML = `
        <div class="challenge-box">
          <div class="challenge-header">
            <span class="badge-tag">CHALLENGE 8 • STELLAR ALCHEMY ARCADE</span>
            <h3 class="text-xl font-bold text-amber-400 mt-1">
              ⚛️ ${isAr ? 'مسرّع جسيمات قلب النجم: لعبة الاندماج النووي التفاعلية' : 'Stellar Core Particle Collider & Fusion Launcher'}
            </h3>
            <p class="text-xs sm:text-sm text-slate-300 mt-1">
              ${isAr
                ? 'وجه مدفع المسرّع بالفأرة واطلق الجسيمات نحو الأنوية المدارية. عند إصابة أي نواة تختفي وتندمج في قلب النجم فوراً!'
                : 'Aim launcher with mouse and fire into orbiting target nuclei. Hitting a target makes it disappear and fuse into the stellar core!'}
            </p>
          </div>

          <!-- Milestones Progress Strip -->
          <div class="grid grid-cols-4 gap-1.5 my-3">
            ${milestones.map((m, idx) => {
              const isPast = idx < stateObj.currentStepIdx || isComplete;
              const isCurrent = idx === stateObj.currentStepIdx && !isComplete;
              return `
                <div class="p-2 rounded-xl border text-center transition ${
                  isPast ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' :
                  isCurrent ? 'bg-amber-950/80 border-amber-400 text-amber-300 ring-2 ring-amber-400 shadow-md scale-[1.02]' :
                  'bg-slate-900/60 border-slate-800 text-slate-500'
                }">
                  <div class="text-[10px] font-mono font-bold">STAGE ${m.step}</div>
                  <div class="text-xs truncate font-bold mt-0.5">${isAr ? m.productNameAr : m.productNameEn}</div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Interactive Arcade Canvas -->
          <div class="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
            <canvas id="fusion-collider-canvas" width="560" height="320" class="w-full block cursor-crosshair"></canvas>
            <div class="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs font-mono pointer-events-none text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800/80">
              <span>🎯 ${isAr ? 'حرك الفأرة للتصويب، وانقر للإطلاق' : 'Move mouse to aim, Click to Fire'}</span>
              <span class="text-amber-400 font-bold">${isAr ? 'الأنوية المدمجة:' : 'Fused:'} ${stateObj.hitsInStep} / ${ms.fuelNeeded}</span>
            </div>
          </div>

          <!-- Telemetry Dossier -->
          <div class="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div class="flex items-center justify-between text-xs font-mono mb-1">
              <span class="text-slate-400">${isAr ? 'الوقود النووي النشط:' : 'Active Fusion Fuel:'} <strong class="text-cyan-400">${isAr ? ms.fuelNameAr : ms.fuelNameEn}</strong></span>
              <span class="text-slate-400">${isAr ? 'العنصر المتخلّق:' : 'Target Product:'} <strong class="text-amber-400">${isAr ? ms.productNameAr : ms.productNameEn}</strong></span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">${isAr ? ms.descAr : ms.descEn}</p>
          </div>

          <!-- Final Victory Banner -->
          ${isComplete ? `
            <div class="mt-4 p-5 bg-gradient-to-r from-emerald-950 to-slate-900 border-2 border-emerald-500 rounded-2xl text-center shadow-xl">
              <div class="text-lg font-black text-emerald-300 mb-1">
                ⚛️ ${isAr ? 'أحسنت صنعاً! أتقنت خيمياء النجوم وتخليق كافة عناصر الكون!' : 'Flawless Master Stellar Alchemist! All Cosmic Elements Synthesized!'}
              </div>
              <p class="text-xs text-slate-300 max-w-md mx-auto">
                ${isAr
                  ? 'صهرت شمسك الهيليوم، والعملاق الأحمر صنع الكربون، والعملاق الفائق صهر الأكسجين، وفجرت السوبرنوفا لتنثر الذهب وغبار النجوم في الفضاء!'
                  : 'You fused Hydrogen into Helium, forged life-giving Carbon and Oxygen, and triggered the Supernova blast that seeded gold and cosmic stardust!'}
              </p>
              <div class="mt-3 text-xs font-mono text-amber-400 font-bold">+150 XP Awarded • Master Stellar Alchemist Badge Earned!</div>
            </div>
          ` : ''}
        </div>
      `;

      if (isComplete) return;

      const canvas = this.container.querySelector('#fusion-collider-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const coreX = canvas.width / 2;
      const coreY = 120;
      const coreRadius = 38;

      let mousePos = { x: canvas.width / 2, y: canvas.height / 2 };
      let launcherX = canvas.width / 2;
      let launcherY = canvas.height - 30;

      let projectiles = [];
      let sparks = [];

      // Orbiting target nuclei list: each target that is hit DISAPPEARS!
      let orbitAngle = 0;
      const orbitRadius = 78;
      
      const remainingTargetsCount = ms.fuelNeeded - stateObj.hitsInStep;
      let activeTargets = [];
      for (let i = 0; i < remainingTargetsCount; i++) {
        activeTargets.push({
          id: i,
          angleOffset: i * ((Math.PI * 2) / Math.max(1, remainingTargetsCount))
        });
      }

      const onMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        mousePos.x = (e.clientX - rect.left) * scaleX;
        mousePos.y = (e.clientY - rect.top) * scaleY;
      };

      const fireParticle = () => {
        if (stateObj.completed) return;
        const dx = mousePos.x - launcherX;
        const dy = mousePos.y - launcherY;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = 12;

        projectiles.push({
          x: launcherX,
          y: launcherY,
          vx: (dx / dist) * speed,
          vy: (dy / dist) * speed,
          radius: 5,
          color: ms.coreColor
        });
        window.cosmicAudio.playClick();
      };

      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('click', fireParticle);

      // Animation Loop
      let loopActive = true;
      const gameLoop = () => {
        if (!loopActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Core Plasma Glow
        const grad = ctx.createRadialGradient(coreX, coreY, 15, coreX, coreY, coreRadius * 2);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, ms.coreColor);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(coreX, coreY, coreRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Solid Core
        ctx.fillStyle = ms.coreColor;
        ctx.beginPath();
        ctx.arc(coreX, coreY, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core Text
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ms.productNameEn.split(' ')[0], coreX, coreY + 4);

        // Orbit track line
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(coreX, coreY, orbitRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Orbiting target nuclei (only those still active!)
        orbitAngle += 0.025;
        let drawnTargets = [];
        for (let t of activeTargets) {
          const a = orbitAngle + t.angleOffset;
          const tx = coreX + Math.cos(a) * orbitRadius;
          const ty = coreY + Math.sin(a) * orbitRadius;
          drawnTargets.push({ id: t.id, x: tx, y: ty, radius: 12 });

          // Draw target nucleus
          ctx.fillStyle = '#38BDF8';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(tx, ty, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('+', tx, ty + 3);
        }

        // Aiming laser guide
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(launcherX, launcherY);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Launcher Base
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(launcherX, launcherY + 12, 18, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Projectiles update & collision
        for (let pIdx = projectiles.length - 1; pIdx >= 0; pIdx--) {
          const pr = projectiles[pIdx];
          pr.x += pr.vx;
          pr.y += pr.vy;

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);
          ctx.fill();

          // Check collision with any active target nucleus
          let hitIndex = -1;
          let hitTarget = null;
          for (let i = 0; i < drawnTargets.length; i++) {
            const dt = drawnTargets[i];
            if (Math.hypot(pr.x - dt.x, pr.y - dt.y) < pr.radius + dt.radius) {
              hitIndex = i;
              hitTarget = dt;
              break;
            }
          }

          if (hitTarget) {
            // MAKE THE HIT TARGET DISAPPEAR IMMEDIATELY!
            const removedId = hitTarget.id;
            activeTargets = activeTargets.filter(t => t.id !== removedId);

            // Spawn explosion sparks at target location
            for (let s = 0; s < 22; s++) {
              sparks.push({
                x: hitTarget.x,
                y: hitTarget.y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                color: ms.coreColor
              });
            }

            window.cosmicAudio.playCorrect();
            projectiles.splice(pIdx, 1);
            stateObj.hitsInStep++;

            // If all targets in this milestone are destroyed/fused
            if (stateObj.hitsInStep >= ms.fuelNeeded || activeTargets.length === 0) {
              window.cosmicConfetti.burst();
              if (stateObj.currentStepIdx < milestones.length - 1) {
                stateObj.currentStepIdx++;
                stateObj.hitsInStep = 0;
                loopActive = false;
                render();
                return;
              } else {
                stateObj.completed = true;
                loopActive = false;
                this.triggerStageSuccess('s3_2', 150, 100);
                render();
                return;
              }
            }
            continue;
          }

          // Out of canvas bounds
          if (pr.x < 0 || pr.x > canvas.width || pr.y < 0 || pr.y > canvas.height) {
            projectiles.splice(pIdx, 1);
          }
        }

        // Sparks update
        for (let sIdx = sparks.length - 1; sIdx >= 0; sIdx--) {
          const sp = sparks[sIdx];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.life -= 0.05;
          if (sp.life <= 0) {
            sparks.splice(sIdx, 1);
            continue;
          }
          ctx.fillStyle = sp.color;
          ctx.globalAlpha = sp.life;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        requestAnimationFrame(gameLoop);
      };

      requestAnimationFrame(gameLoop);
    };

    render();
  }
  // --- 9. S3_3: Exoplanet Goldilocks Zone & Final Exam (DYNAMIC RANDOMIZED CHOICES) ---
  initStage3_3(lang) {
    const isAr = lang === 'ar';

    if (!this.sessionState.s3_3) {
      this.sessionState.s3_3 = {
        orbitVal: (Math.random() < 0.5 ? Math.floor(10 + Math.random() * 13) : Math.floor(44 + Math.random() * 17)),
        testedClimate: false,
        testResult: null,
        examIdx: 0,
        examScore: 0,
        answeredCurrent: false
      };
    }
    const stateObj = this.sessionState.s3_3;

    const renderOrbitTuner = () => {
      this.container.innerHTML = `
        <div class="challenge-box">
          <div class="challenge-header">
            <span class="badge-tag">CHALLENGE 9 • GOLDILOCKS CLIMATE DISCOVERY</span>
            <h3 class="text-xl font-bold text-emerald-400 mt-1">
              ${isAr ? 'تحديد مدار الكوكب واختبار مناخه' : 'Select Planetary Orbit & Test Atmosphere'}
            </h3>
            <p class="text-sm text-slate-300 mt-1">
              ${isAr ? 'حرك شريط المدار لتحديد المسافة، ثم اطلق مسبار الفحص لمعرفة ما إذا كانت الحرارة معتدلة ومناسبة للماء السائل!' : 'Adjust the orbital distance slider, then launch the atmospheric probe to reveal if the climate allows liquid water oceans!'}
            </p>
          </div>

          <div class="my-4 p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <div class="text-xs font-mono text-slate-400 mb-1">${isAr ? 'المسافة المدارية المختارة:' : 'Selected Orbital Distance:'}</div>
            <div id="au-readout" class="text-3xl font-mono font-bold text-cyan-400">${(stateObj.orbitVal / 1000).toFixed(3)} AU</div>
            <div id="probe-report" class="mt-2 text-xs font-mono">
              ${stateObj.testResult ? stateObj.testResult : `<span class="text-slate-500">${isAr ? 'بانتظار إطلاق مسبار الفحص...' : 'Awaiting atmospheric probe launch...'}</span>`}
            </div>
          </div>

          <div class="p-3 bg-slate-800/80 rounded-xl">
            <input type="range" id="orbit-slider" min="10" max="60" value="${stateObj.orbitVal}" class="w-full accent-emerald-500">
            <div class="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0.010 AU</span>
              <span>0.035 AU</span>
              <span>0.060 AU</span>
            </div>
          </div>

          <div class="mt-4 flex flex-col sm:flex-row gap-3">
            <button id="test-climate-btn" class="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow transition">
              🚀 ${isAr ? 'إطلاق مسبار فحص المناخ والحرارة' : 'Launch Atmospheric Climate Probe'}
            </button>
            <button id="proceed-exam-btn" class="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow transition ${stateObj.testedClimate ? '' : 'opacity-40 cursor-not-allowed'}" ${stateObj.testedClimate ? '' : 'disabled'}>
              🎓 ${isAr ? 'الدخول للاختبار النهائي للأكاديمية ←' : 'Enter Final Commander Exam →'}
            </button>
          </div>
        </div>
      `;

      const slider = this.container.querySelector('#orbit-slider');
      const auReadout = this.container.querySelector('#au-readout');
      const probeReport = this.container.querySelector('#probe-report');
      const testBtn = this.container.querySelector('#test-climate-btn');
      const proceedBtn = this.container.querySelector('#proceed-exam-btn');

      slider.addEventListener('input', () => {
        stateObj.orbitVal = parseInt(slider.value, 10);
        auReadout.textContent = `${(stateObj.orbitVal / 1000).toFixed(3)} AU`;
        probeReport.innerHTML = `<span class="text-slate-500">${isAr ? 'تغير المدار • انقر على إطلاق مسبار الفحص لقياس الحرارة' : 'Orbit changed • Launch probe to analyze climate'}</span>`;
      });

      testBtn.addEventListener('click', () => {
        window.cosmicAudio.playThruster();
        const v = stateObj.orbitVal;

        if (v < 25) {
          stateObj.testedClimate = false;
          stateObj.testResult = `<span class="text-rose-400 font-bold">🔥 ${isAr ? 'لاهب جداً (+410°م)! تبخرت المياه والمحيطات تماماً!' : 'Scorching (+410°C)! Oceans boiled away into steam!'}</span>`;
          window.cosmicAudio.playWrong();
        } else if (v > 40) {
          stateObj.testedClimate = false;
          stateObj.testResult = `<span class="text-sky-400 font-bold">❄️ ${isAr ? 'متجمد قارس (−95°م)! تجمدت المحيطات إلى كتل صلبة!' : 'Frigid (−95°C)! Global oceans frozen solid!'}</span>`;
          window.cosmicAudio.playWrong();
        } else {
          stateObj.testedClimate = true;
          stateObj.testResult = `<span class="text-emerald-400 font-bold">✨ ${isAr ? 'حرارة معتدلة ومثالية (+18°م)! نطاق غولديلوكس صالح للماء السائل!' : 'Perfect Habitable (+18°C)! Liquid water oceans confirmed in Goldilocks Zone!'}</span>`;
          window.cosmicAudio.playCorrect();
          window.cosmicConfetti.burst();
        }
        renderOrbitTuner();
      });

      proceedBtn.addEventListener('click', () => {
        window.cosmicAudio.playClick();
        renderFinalExam();
      });
    };

    const renderFinalExam = () => {
      const examQuestions = [
        {
          q: isAr ? 'أي الكواكب التالية يمتلك أعلى درجة حرارة سطحية في مجموعتنا الشمسية؟' : 'Which of the following planets has the highest surface temperature in our solar system?',
          opts: isAr ? ['عطارد', 'الزهرة', 'المريخ', 'المشتري'] : ['Mercury', 'Venus', 'Mars', 'Jupiter'],
          correct: 1,
          explainRight: isAr ? 'أحسنت! كوكب الزهرة هو الأسخن (نحو 465°C) بسبب الاحتباس الحراري العنيف في غلافه الجوي الكثيف.' : 'Spot on! Venus is the hottest planet (~465°C) due to a runaway greenhouse effect in its dense carbon dioxide atmosphere.',
          explainWrong: isAr ? 'غير صحيح. فرغم أن عطارد هو الأقرب للشمس، إلا أن كوكب الزهرة هو الأسخن على الإطلاق بسبب احتباس الحرارة الشديد في غلافه الغازي الكثيف.' : 'Incorrect. While Mercury is closest to the Sun, Venus is actually the hottest planet due to runaway greenhouse heat trapped by its carbon dioxide clouds.'
        },
        {
          q: isAr ? 'ما هو الحد الفاصل الذي لا يمكن حتى للضوء الهروب منه بعد عبوره حول الثقب الأسود؟' : 'What is the physical boundary called beyond which not even light can escape a black hole?',
          opts: isAr ? ['أفق الحدث', 'النطاق الكوني', 'سديم الانعكاس', 'فجوة كاسيني'] : ['The Event Horizon', 'The Cosmic Void', 'The Reflection Nebulae', 'The Cassini Gap'],
          correct: 0,
          explainRight: isAr ? 'إجابة دقيقة! أفق الحدث هو النقطة التي تصبح عندها سرعة الهروب مساوية لسرعة الضوء.' : 'Accurate! The Event Horizon is the boundary where escape velocity equals the cosmic speed of light.',
          explainWrong: isAr ? 'غير صحيح. الحد الذي لا يستطيع أي شيء تجاوزه بعد عبوره يُعرف علمياً باسم "أفق الحدث" (Event Horizon).' : 'Incorrect. The boundary where gravity traps everything, including light, is called the Event Horizon.'
        },
        {
          q: isAr ? 'لماذا طُليت مرايا تلسكوب جيمس ويب السداسية بالذهب الخالص؟' : 'Why are the primary mirrors of the James Webb Space Telescope coated in pure gold?',
          opts: isAr ? [
            'لزيادة كتلة التلسكوب',
            'لأن الذهب يعكس الأشعة تحت الحمراء بكفاءة 98%',
            'لحمايتها من الصدأ فقط',
            'لتعكس الضوء الأخضر'
          ] : [
            'To increase telescope structural weight',
            'Because gold reflects 98% of infrared radiation',
            'Purely to prevent metallic rust scratches',
            'To reflect optical green wavelengths'
          ],
          correct: 1,
          explainRight: isAr ? 'ممتاز! يعكس الذهب 98% من الأشعة تحت الحمراء، مما يتيح لتلسكوب ويب رصد أقدم المجرات عبر الغبار الكوني.' : 'Excellent! Gold reflects 98% of infrared light, allowing Webb to peer through dust clouds to see the first galaxies.',
          explainWrong: isAr ? 'غير صحيح. السبب العلمي هو أن طبقة الذهب تعكس 98% من الأشعة تحت الحمراء القادمة من فجر الكون.' : 'Incorrect. Gold is chosen because it reflects 98% of infrared heat rays, allowing Webb to see early cosmic light.'
        },
        {
          q: isAr ? 'أين يقع نظامنا الشمسي داخل مجرة درب التبانة؟' : 'Where is our solar system situated within the Milky Way galaxy?',
          opts: isAr ? [
            'في النواة المركزية الملتصقة بالثقب الأسود',
            'في ذراع الجبار على بعد 26 ألف سنة ضوئية',
            'خارج هالة المجرة في الفراغ الكوني',
            'عند الحافة القصوى المتجمدة'
          ] : [
            'Directly in the central nucleus touching Sagittarius A*',
            'In the Orion Spur roughly 26,000 light-years from core',
            'Floating far outside the galactic halo void',
            'At the very outermost edge of the Perseus arm'
          ],
          correct: 1,
          explainRight: isAr ? 'صحيح تماماً! نحن نعيش في ذراع الجبار (Orion Spur) في منتصف المسافة تقريباً من مركز المجرة.' : 'Completely correct! We live in the Orion Spur bridge, roughly halfway out at 26,000 light-years from the center.',
          explainWrong: isAr ? 'غير صحيح. موقعنا ليس في المركز ولا في الأطراف، بل في ذراع الجبار (Orion Spur) على بعد نحو 26,000 سنة ضوئية.' : 'Incorrect. Our solar system resides in the Orion Spur, roughly 26,000 light-years from the galactic nucleus.'
        }
      ];

      const item = examQuestions[stateObj.examIdx];

      // Dynamically shuffle option choices on each question attempt
      const shuffledOptions = item.opts.map((opt, i) => ({ opt, origIdx: i })).sort(() => Math.random() - 0.5);

      this.container.innerHTML = `
        <div class="challenge-box">
          <div class="challenge-header">
            <span class="badge-tag">FINAL COMMANDER EXAM • QUESTION ${stateObj.examIdx + 1} OF 4</span>
            <h3 class="text-xl font-bold text-amber-400 mt-2">${item.q}</h3>
          </div>

          <div class="space-y-2 mt-4" id="exam-opts-container">
            ${shuffledOptions.map((choice, i) => `
              <button class="exam-opt w-full p-3.5 text-left rtl:text-right bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-400 rounded-xl text-sm text-slate-200 transition font-medium" data-origidx="${choice.origIdx}">
                <span class="inline-block w-6 h-6 rounded-full bg-slate-700 text-center text-xs leading-6 text-amber-400 font-bold mr-2 rtl:mr-0 rtl:ml-2">${String.fromCharCode(65 + i)}</span>
                ${choice.opt}
              </button>
            `).join('')}
          </div>

          <div id="exam-feedback-box" class="mt-4"></div>
          <div id="exam-next-btn-container" class="mt-4 flex justify-end"></div>
        </div>
      `;

      const optBtns = this.container.querySelectorAll('.exam-opt');
      const feedbackBox = this.container.querySelector('#exam-feedback-box');
      const nextContainer = this.container.querySelector('#exam-next-btn-container');

      optBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const chosenOrig = parseInt(btn.dataset.origidx, 10);
          optBtns.forEach(b => b.disabled = true);

          if (chosenOrig === item.correct) {
            stateObj.examScore++;
            btn.classList.add('bg-emerald-950', 'border-emerald-400', 'text-emerald-400', 'font-bold');
            window.cosmicAudio.playCorrect();
            feedbackBox.innerHTML = `
              <div class="p-3 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-300 text-xs">
                <strong>✨ ${isAr ? 'إجابة صحيحة!' : 'Correct!'}</strong> ${item.explainRight}
              </div>
            `;
          } else {
            btn.classList.add('bg-rose-950', 'border-rose-400', 'text-rose-300');
            optBtns.forEach(b => {
              if (parseInt(b.dataset.origidx, 10) === item.correct) {
                b.classList.add('bg-emerald-950', 'border-emerald-400', 'text-emerald-400', 'font-bold');
              }
            });
            window.cosmicAudio.playWrong();
            feedbackBox.innerHTML = `
              <div class="p-3 bg-rose-950/90 border border-rose-500 rounded-xl text-rose-300 text-xs">
                <strong>⚠️ ${isAr ? 'غير صحيح!' : 'Incorrect!'}</strong> ${item.explainWrong}
              </div>
            `;
          }

          nextContainer.innerHTML = `
            <button id="exam-next-btn" class="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow transition">
              ${stateObj.examIdx < examQuestions.length - 1 ? (isAr ? 'السؤال التالي ←' : 'Next Question →') : (isAr ? 'عرض شهادة التخرج 🏆' : 'View Graduation Ceremony 🏆')}
            </button>
          `;

          this.container.querySelector('#exam-next-btn').addEventListener('click', () => {
            window.cosmicAudio.playClick();
            stateObj.examIdx++;
            if (stateObj.examIdx < examQuestions.length) {
              renderFinalExam();
            } else {
              this.showGraduationCeremony(stateObj.examScore, examQuestions.length, lang);
            }
          });
        });
      });
    };

    renderOrbitTuner();
  }

  showGraduationCeremony(score, total, lang) {
    const isAr = lang === 'ar';
    window.cosmicAudio.playBadgeChime();
    window.cosmicConfetti.burst(window.innerWidth / 2, window.innerHeight / 3, 160);

    this.container.innerHTML = `
      <div class="challenge-box text-center p-8 bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-900 border-2 border-amber-500 rounded-2xl shadow-2xl">
        <div class="text-5xl animate-bounce">👑</div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2">
          ${isAr ? 'مبارك التخرج! أصبحت قائداً معتمداً في كيلونوت!' : 'Congratulations! You Achieved Kilonaut Commander!'}
        </h2>
        <p class="text-sm text-slate-200 mt-2 max-w-lg mx-auto">
          ${isAr
            ? `أنهيت كافة المهمات الفلكية بدرجة ${score}/${total} في الاختبار النهائي، ونلت أعلى رتبة قيادية في الأكاديمية!`
            : `You mastered all cosmic sectors with a score of ${score}/${total} on the final Commander exam! Your official flight certificate is ready!`}
        </p>

        <div class="my-4 inline-block p-4 bg-amber-500/10 border border-amber-400/40 rounded-xl text-amber-300 font-bold text-base">
          ⭐ +200 Star Points Earned • RANK: COMMANDER (قائد الأكاديمية)
        </div>

        <div class="flex flex-col sm:flex-row justify-center gap-3 mt-4">
          <button id="return-home-btn" class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl shadow-lg transition active:scale-95">
            🏠 ${isAr ? 'العودة للشاشة الرئيسية' : 'Return to Home Screen'}
          </button>
          <button id="view-passport-btn" class="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition">
            📜 ${isAr ? 'فتح جواز الإنجازات والشهادة' : 'Open Flight Passport & Certificate'}
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('#return-home-btn').addEventListener('click', () => {
      window.cosmicAudio.playClick();
      window.academyApp.showDeck();
    });

    this.container.querySelector('#view-passport-btn').addEventListener('click', () => {
      window.cosmicAudio.playClick();
      window.passportManager.openModal();
    });

    this.triggerStageSuccess('s3_3', 200, 100);
  }

  // Auto-advance helper: automatically leaves finished stage and enters next one with NO DELAY!
  triggerStageSuccess(stageId, xp, score) {
    const isAr = window.cadetState.state.lang === 'ar';
    const result = window.cadetState.completeStage(stageId, score, 3);

    // Player takes points ONLY ONE TIME, not every time they replay or press verify!
    if (result && result.isFirstTime) {
      const xpResult = window.cadetState.addXP(xp);
      if (xpResult && xpResult.leveledUp) {
        window.cosmicAudio.playBadgeChime();
        window.cosmicConfetti.burst();
      }
    }

    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }

    // Go to next level with NO DELAY:
    if (stageId === 's3_3') {
      // Final level of final challenge returns directly to Home Screen (Deck)!
      window.cosmicConfetti.burst();
      window.academyApp.showDeck();
    } else {
      window.cosmicAudio.playLaunchWarp();
      window.academyApp.autoAdvanceToNextStage(stageId);
    }
  }
}

window.challengeManager = new ChallengeManager();
