/* ============================================================
   Astronaut Training Facility — 2D Top-Down ISS Game
   Kilonaut © 2025
   ============================================================ */
'use strict';

class AstronautTrainingManager {
  constructor() {
    /* ---- runtime references ---- */
    this.container   = null;
    this.canvas      = null;
    this.ctx         = null;
    this.rafId       = null;
    this.lastTime    = 0;

    /* ---- phase: 'hub' | 'playing' | 'fanPuzzle' | 'wires' | 'galley' | 'exercise' | 'comms' | 'arm' ---- */
    this.phase = 'hub';

    /* ---- input ---- */
    this.keys  = {};
    this.mouse = { x: 0, y: 0, down: false };

    /* ---- player ---- */
    this.player = {
      x: 380, y: 212,
      vx: 0, vy: 0,
      speed: 120,          /* px/s */
      r: 10,
      dir: 0,              /* radians */
      slowTimer: 0,
      emoji: '🧑‍🚀'
    };

    /* ---- task completion flags ---- */
    this.tasksDone = {
      sleep: false, galley: false, emergency: false,
      exercise: false, comms: false, armBay: false
    };

    /* ---- active prompt shown at bottom of station map ---- */
    this.activePrompt = '';

    /* ---- room definitions (canvas 760×480) ---- */
    this.rooms = [
      { id:'sleep',    x:5,   y:15,  w:230, h:170, label:'Sleep Bay',
        floorColor:'#0D1B3E', borderColor:'#1D4ED8' },
      { id:'galley',   x:253, y:15,  w:230, h:170, label:'Galley',
        floorColor:'#1A150A', borderColor:'#B45309' },
      { id:'emergency',x:501, y:15,  w:230, h:170, label:'Emergency',
        floorColor:'#1A0505', borderColor:'#DC2626' },
      { id:'exercise', x:5,   y:240, w:230, h:235, label:'Exercise',
        floorColor:'#061A0A', borderColor:'#16A34A' },
      { id:'comms',    x:253, y:240, w:230, h:235, label:'Comms',
        floorColor:'#0A0A1A', borderColor:'#7C3AED' },
      { id:'armBay',   x:501, y:240, w:230, h:235, label:'Arm Bay',
        floorColor:'#001A1A', borderColor:'#0891B2' }
    ];

    /* door openings (40 px wide) */
    this.doors = [
      { x:100, y:178, w:40, h:24 },
      { x:348, y:178, w:40, h:24 },
      { x:596, y:178, w:40, h:24 },
      { x:100, y:233, w:40, h:24 },
      { x:348, y:233, w:40, h:24 },
      { x:596, y:233, w:40, h:24 }
    ];

    this.corridor = { x:5, y:185, w:750, h:55 };

    /* Room Consoles to enter stages */
    this.consoles = {
      sleep:     { x: 115, y: 95,  r: 16, icon: '🌀', label: 'Fan Grid' },
      galley:    { x: 368, y: 95,  r: 16, icon: '🍱', label: 'Food Prep' },
      emergency: { x: 616, y: 95,  r: 16, icon: '⚡', label: 'Wire Panel' },
      exercise:  { x: 115, y: 355, r: 16, icon: '🏃', label: 'Treadmill T2' },
      comms:     { x: 368, y: 355, r: 16, icon: '📡', label: 'Radio Antenna' },
      armBay:    { x: 616, y: 355, r: 16, icon: '🦾', label: 'Canadarm2' }
    };

    /* Sub-game stage states */
    this.fanPuzzle     = this._freshFanPuzzleState();
    this.wires         = this._freshWiresState();
    this.galleyStage   = this._freshGalleyState();
    this.exerciseStage = this._freshExerciseState();
    this.commsStage    = this._freshCommsState();
    this.arm           = this._freshArmState(); /* UNCHANGED ROBOTIC ARM */

    /* Notification queue */
    this._notifications = [];

    /* Bound event handlers */
    this._boundKeyDown   = this._onKeyDown.bind(this);
    this._boundKeyUp     = this._onKeyUp.bind(this);
    this._boundMouseMove = this._onMouseMove.bind(this);
    this._boundClick     = this._onClick.bind(this);
    this._boundMouseDown = this._onMouseDown.bind(this);
    this._boundMouseUp   = this._onMouseUp.bind(this);
  }

  /* ============================================================
     STAGE 1: FAN CIRCUIT PUZZLE STATE (Sleep Bay)
  ============================================================ */
  _freshFanPuzzleState() {
    /* 3x3 rotating circuit tiles connecting Left (0,1) to Right (2,1) */
    /* ports: [top, right, bottom, left] */
    const grid = [
      /* Row 0 */
      [
        { ports: [false, true, true, false], rot: 1, type: 'corner' }, // corner: bottom-right
        { ports: [false, true, false, true], rot: 1, type: 'straight' }, // straight: horiz
        { ports: [false, false, true, true], rot: 2, type: 'corner' }  // corner: bottom-left
      ],
      /* Row 1: Solved path enters from left (0,1) and exits right (2,1) */
      [
        { ports: [true, false, false, true], rot: 3, type: 'corner' },  // top-left (solves path through row 0)
        { ports: [true, true, true, true],   rot: 0, type: 'cross' },   // cross junction
        { ports: [true, true, false, false], rot: 2, type: 'corner' }   // top-right (connects down from row 0 to fan)
      ],
      /* Row 2 */
      [
        { ports: [true, true, false, false], rot: 0, type: 'corner' },
        { ports: [false, true, false, true], rot: 1, type: 'straight' },
        { ports: [true, false, false, true], rot: 2, type: 'corner' }
      ]
    ];

    /* Apply initial scramble rotations (at least 1 rotation each) */
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const shifts = 1 + Math.floor(Math.random() * 3);
        for (let s = 0; s < shifts; s++) {
          const p = grid[r][c].ports;
          grid[r][c].ports = [p[3], p[0], p[1], p[2]];
          grid[r][c].rot = (grid[r][c].rot + 1) % 4;
        }
      }
    }

    return {
      grid,
      solved: false,
      fanAngle: 0,
      timer: 0,
      sparkT: 0
    };
  }

  /* ============================================================
     STAGE 2: WIRE FIXING STATE (Emergency Bay - Among Us Style)
  ============================================================ */
  _freshWiresState() {
    const colors = [
      { id: 'red',    hex: '#EF4444', label: 'RED' },
      { id: 'blue',   hex: '#3B82F6', label: 'BLUE' },
      { id: 'yellow', hex: '#EAB308', label: 'YELLOW' },
      { id: 'pink',   hex: '#EC4899', label: 'PINK' }
    ];

    const lefts = colors.map((c, i) => ({
      id: c.id,
      color: c.hex,
      x: 130,
      y: 135 + i * 72,
      connectedTo: null
    }));

    /* Shuffled right terminals */
    const order = ['yellow', 'blue', 'pink', 'red'];
    const rights = order.map((id, i) => {
      const c = colors.find(col => col.id === id);
      return {
        id: c.id,
        color: c.hex,
        x: 630,
        y: 135 + i * 72,
        connected: false
      };
    });

    /* Background decorative wire loom and severed conduits */
    const bgWires = [
      // Deep bundle conduit cables (dark charcoal, slate, navy)
      { x1: 60,  y1: 65,  cx1: 220, cy1: 160, cx2: 440, cy2: 240, x2: 700, y2: 420, color: '#1E293B', w: 12 },
      { x1: 80,  y1: 430, cx1: 280, cy1: 340, cx2: 500, cy2: 140, x2: 680, y2: 60,  color: '#0F172A', w: 14 },
      { x1: 170, y1: 50,  cx1: 230, cy1: 240, cx2: 360, cy2: 300, x2: 560, y2: 430, color: '#334155', w: 8 },
      { x1: 100, y1: 440, cx1: 260, cy1: 210, cx2: 460, cy2: 360, x2: 640, y2: 435, color: '#172554', w: 7 },
      // Colored background system cables
      { x1: 75,  y1: 110, cx1: 300, cy1: 140, cx2: 420, cy2: 280, x2: 685, y2: 340, color: '#78350F', w: 6 },
      { x1: 150, y1: 435, cx1: 320, cy1: 290, cx2: 430, cy2: 180, x2: 615, y2: 55,  color: '#064E3B', w: 6 },
      { x1: 190, y1: 55,  cx1: 310, cy1: 210, cx2: 420, cy2: 250, x2: 530, y2: 435, color: '#4C1D95', w: 5 },
      { x1: 280, y1: 45,  cx1: 340, cy1: 180, cx2: 410, cy2: 220, x2: 480, y2: 440, color: '#164E63', w: 5 },
      // Severed dangling background cables with exposed copper tips
      { x1: 220, y1: 65,  cx1: 240, cy1: 160, cx2: 280, cy2: 220, x2: 295, y2: 260, color: '#B45309', w: 4, severed: true },
      { x1: 510, y1: 430, cx1: 470, cy1: 320, cx2: 430, cy2: 270, x2: 415, y2: 230, color: '#1D4ED8', w: 4, severed: true },
      { x1: 380, y1: 50,  cx1: 370, cy1: 110, cx2: 350, cy2: 160, x2: 355, y2: 190, color: '#B91C1C', w: 3.5, severed: true }
    ];

    return {
      lefts,
      rights,
      bgWires,
      dragging: null,
      solved: false,
      timer: 0,
      sparks: [],
      ambientSparkTimer: 0
    };
  }

  /* ============================================================
     STAGE 3: FOOD REHYDRATION STATE (Galley)
  ============================================================ */
  _freshGalleyState() {
    return {
      pouches: [
        { name: 'CSA Space Salad (Veggie Lettuce 🌱)', targetMin: 70, targetMax: 85, water: 0, sealed: false, color: '#10B981' },
        { name: 'CSA Space Radish (APH Hydroponics 🥗)', targetMin: 65, targetMax: 80, water: 0, sealed: false, color: '#F59E0B' },
        { name: 'CSA Dwarf Wheat (Bioregenerative 🌾)', targetMin: 75, targetMax: 90, water: 0, sealed: false, color: '#E11D48' }
      ],
      currentIdx: 0,
      isHoldingFill: false,
      state: 'fill', /* 'fill' | 'seal' | 'done' */
      solved: false,
      timer: 0
    };
  }

  /* ============================================================
     STAGE 4: TREADMILL T2 CARDIO STATE (Exercise Bay)
  ============================================================ */
  _freshExerciseState() {
    /* Initialize speed line particles for wind rush effect */
    const speedLines = [];
    for (let i = 0; i < 28; i++) {
      speedLines.push({
        x: 160 + Math.random() * 440,
        y: 110 + Math.random() * 240,
        len: 18 + Math.random() * 55,
        speed: 180 + Math.random() * 220,
        alpha: 0.15 + Math.random() * 0.4
      });
    }

    return {
      distance: 0,
      targetDistance: 100, /* 100 meters */
      speed: 0,            /* km/h */
      lastFoot: null,      /* 'left' | 'right' */
      heartRate: 105,
      stepAnim: 0,
      cadenceStreak: 0,
      comboText: '',
      comboTimer: 0,
      pedalLeftPressed: 0,
      pedalRightPressed: 0,
      speedLines,
      ghosts: [],
      sweatParticles: [],
      solved: false,
      timer: 0
    };
  }

  /* ============================================================
     STAGE 5: RADIO WAVEFORM CALIBRATION STATE (Comms Room)
  ============================================================ */
  _freshCommsState() {
    return {
      targetFreq: 3.2,
      targetAmp:  38,
      playerFreq: 1.4,
      playerAmp:  18,
      lockPercent: 0,
      draggingSlider: null, /* 'freq' | 'amp' */
      solved: false,
      timer: 0
    };
  }

  /* ============================================================
     STAGE 6: ROBOTIC ARM STATE (KEPT UNCHANGED AS REQUESTED)
  ============================================================ */
  _freshArmState() {
    return {
      baseX: 720, baseY: 240,
      seg1Len: 160, seg2Len: 130,
      a1: Math.PI, a2: 0,
      leeX: 560, leeY: 240,
      targetX: 560, targetY: 240,
      boxes: [
        { x:380, y:100, vx:-0.6, vy: 0.4, w:36, h:28, docked:false,
          dockPort:0, snareProgress:0, latched:false,
          berthX: null, berthY: null, berthTimer:0, color:'#F59E0B' },
        { x:360, y:260, vx: 0.5, vy:-0.5, w:36, h:28, docked:false,
          dockPort:1, snareProgress:0, latched:false,
          berthX: null, berthY: null, berthTimer:0, color:'#A855F7' },
        { x:390, y:400, vx:-0.4, vy:-0.6, w:36, h:28, docked:false,
          dockPort:2, snareProgress:0, latched:false,
          berthX: null, berthY: null, berthTimer:0, color:'#10B981' }
      ],
      dockPorts: [
        { x:80, y:160 },
        { x:80, y:260 },
        { x:80, y:360 }
      ],
      allDocked: false,
      celebTimer: 0,
      confettiBursted: false
    };
  }

  /* ============================================================
     PUBLIC API
  ============================================================ */
  init(containerEl) {
    this.container = containerEl;
    this._loadProgress();
    this.phase = 'hub';
    this._renderHub();
  }

  cleanup() {
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    this._removeEvents();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx    = null;
  }

  _loadProgress() {
    try {
      const t = (window.cadetState && window.cadetState.state.training) || {};
      this.tasksDone.sleep     = Boolean(t.weightlessness?.completed);
      this.tasksDone.galley    = Boolean(t.stationDay?.completed);
      this.tasksDone.emergency = Boolean(t.emergency?.completed);
      this.tasksDone.exercise  = Boolean(t.spacesuit?.completed);
      this.tasksDone.comms     = Boolean(t.teamwork?.completed);
      this.tasksDone.armBay    = Boolean(t.docking?.completed);
    } catch(e) {}
  }

  /* ============================================================
     RESET FACILITY STATE
  ============================================================ */
  resetAllFacilityState() {
    this.tasksDone = {
      sleep: false, galley: false, emergency: false,
      exercise: false, comms: false, armBay: false
    };

    this.fanPuzzle     = this._freshFanPuzzleState();
    this.wires         = this._freshWiresState();
    this.galleyStage   = this._freshGalleyState();
    this.exerciseStage = this._freshExerciseState();
    this.commsStage    = this._freshCommsState();
    this.arm           = this._freshArmState();

    this.player.x = 380;
    this.player.y = 212;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.slowTimer = 0;
  }

  /* ============================================================
     RESET CONFIRMATION MODAL ("are you sure about resetting everything")
  ============================================================ */
  _showResetConfirmationModal() {
    const existing = document.getElementById('training-reset-modal');
    if (existing) existing.remove();

    const isAr = (window.cadetState && window.cadetState.state.lang === 'ar');

    const modal = document.createElement('div');
    modal.id = 'training-reset-modal';
    modal.style.cssText = `
      position:fixed;top:0;left:0;right:0;bottom:0;
      background:rgba(2,6,23,0.85);backdrop-filter:blur(6px);
      z-index:9999;display:flex;align-items:center;justify-content:center;
      padding:16px;font-family:'Outfit',sans-serif;
    `;

    modal.innerHTML = `
      <div style="
        background:linear-gradient(145deg, #1E1B4B, #0F172A);
        border:2px solid #EF4444;border-radius:20px;
        padding:28px 24px;max-width:480px;width:100%;
        box-shadow:0 25px 50px -12px rgba(239,68,68,0.4);
        color:#F8FAFC;text-align:center;position:relative;
      ">
        <div style="font-size:3rem;margin-bottom:12px;filter:drop-shadow(0 0 12px rgba(239,68,68,0.6));">
          ⚠️
        </div>
        <h3 style="font-size:1.4rem;font-weight:800;color:#FCA5A5;margin:0 0 10px;">
          ${isAr ? 'إعادة ضبط كل شيء؟' : 'Reset All Progress?'}
        </h3>
        <p style="font-size:0.9rem;line-height:1.55;color:#CBD5E1;margin:0 0 24px;">
          ${isAr 
            ? 'سيؤدي هذا إلى مسح مسيرة الرائد الفضائي بالكامل، وإلغاء جميع شهادات تدريب المحطة، ومسح الأوسمة والنقاط والنجوم والبدء من جديد. لا يمكن التراجع عن هذا الإجراء.' 
            : 'This will wipe all your astronaut training certifications, mission patches, stage stars, and XP points. You will start completely fresh as a new cadet. This action cannot be undone.'}
        </p>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <button id="modal-confirm-reset-btn" style="
            width:100%;padding:14px 20px;
            background:linear-gradient(135deg, #DC2626, #B91C1C);
            color:#FFFFFF;font-size:0.95rem;font-weight:800;
            border:1.5px solid #F87171;border-radius:12px;
            cursor:pointer;box-shadow:0 6px 20px rgba(220,38,38,0.45);
            transition:transform 0.1s;
          " onmouseover="this.style.background='#EF4444'" onmouseout="this.style.background='linear-gradient(135deg, #DC2626, #B91C1C)'">
            ${isAr ? '⚠️ هل أنت متأكد من إعادة ضبط كل شيء؟' : '⚠️ Are you sure about resetting everything?'}
          </button>
          
          <button id="modal-cancel-reset-btn" style="
            width:100%;padding:12px 20px;
            background:#1E293B;color:#94A3B8;
            font-size:0.85rem;font-weight:700;
            border:1px solid #334155;border-radius:12px;
            cursor:pointer;transition:background 0.15s, color 0.15s;
          " onmouseover="this.style.color='#FFFFFF';this.style.background='#334155'" onmouseout="this.style.color='#94A3B8';this.style.background='#1E293B'">
            ${isAr ? 'إلغاء، الاحتفاظ بتقدمي' : 'Cancel, Keep My Progress'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const confirmBtn = modal.querySelector('#modal-confirm-reset-btn');
    const cancelBtn  = modal.querySelector('#modal-cancel-reset-btn');

    cancelBtn.addEventListener('click', () => {
      this._playSound('click');
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    confirmBtn.addEventListener('click', () => {
      this._playSound('wrong');
      modal.remove();

      if (window.cadetState) {
        window.cadetState.resetProgress();
      }

      this.resetAllFacilityState();

      if (this.phase !== 'hub') {
        this.cleanup();
        this.phase = 'hub';
      }

      this._renderHub();
      this._addNotification(isAr ? 'تمت إعادة ضبط كل التقدم بنجاح!' : 'All progress has been reset!');
    });
  }

  /* ============================================================
     LOGOUT & HOMEPAGE ACTIONS
  ============================================================ */
  _handleLogout() {
    const isAr = (window.cadetState && window.cadetState.state.lang === 'ar');
    const confirmMsg = isAr ? 'هل أنت متأكد من رغبتك في تسجيل الخروج؟' : 'Are you sure you want to sign out?';
    if (!confirm(confirmMsg)) return;

    this._playSound('click');
    this.cleanup();
    if (window.academyApp) {
      window.academyApp.logout();
    } else if (window.cadetState) {
      window.cadetState.logout();
      location.reload();
    }
  }

  _handleReturnToHome() {
    this._playSound('click');
    this.cleanup();
    if (window.academyApp) {
      window.academyApp.showDeck();
    }
  }

  /* ============================================================
     HUB SCREEN
  ============================================================ */
  _renderHub() {
    if (!this.container) return;
    const isAr  = (window.cadetState && window.cadetState.state.lang === 'ar');
    const done  = Object.values(this.tasksDone).filter(Boolean).length;
    const total = 6;

    this.container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:18px;padding:16px 20px 28px;
                  font-family:'Outfit',sans-serif;color:#E2E8F0;min-height:400px;max-width:800px;margin:0 auto;">

        <!-- Top Navigation Bar / Tabs (Homepage Tab, Active Station Tab, Logout & Reset) -->
        <div style="width:100%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;
                    padding:10px 14px;background:#0F172A;border:1px solid #1E293B;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
          
          <div style="display:flex;align-items:center;gap:8px;">
            <button id="hub-nav-home-btn" style="
              display:flex;align-items:center;gap:6px;
              padding:7px 14px;background:#1E293B;color:#94A3B8;
              border:1px solid #334155;border-radius:10px;
              font-size:0.8rem;font-weight:700;cursor:pointer;transition:all 0.15s;"
              onmouseover="this.style.color='#38BDF8';this.style.borderColor='#38BDF8';"
              onmouseout="this.style.color='#94A3B8';this.style.borderColor='#334155';">
              <span>🏠</span>
              <span>${isAr ? 'الصفحة الرئيسية' : 'Homepage'}</span>
            </button>

            <div style="
              display:flex;align-items:center;gap:6px;
              padding:7px 14px;background:rgba(8,145,178,0.2);color:#38BDF8;
              border:1.5px solid #38BDF8;border-radius:10px;
              font-size:0.8rem;font-weight:800;box-shadow:0 0 14px rgba(56,189,248,0.2);">
              <span>🧑‍🚀</span>
              <span>${isAr ? 'تدريب رواد الفضاء' : 'Astronaut Training'}</span>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:8px;margin-left:auto;">
            <button id="hub-logout-btn" style="
              display:flex;align-items:center;gap:5px;
              padding:7px 12px;background:#1E293B;color:#94A3B8;
              border:1px solid #334155;border-radius:10px;
              font-size:0.75rem;font-weight:700;cursor:pointer;transition:all 0.15s;"
              onmouseover="this.style.color='#FCA5A5';this.style.borderColor='#EF4444';"
              onmouseout="this.style.color='#94A3B8';this.style.borderColor='#334155';">
              <span>🚪</span>
              <span>${isAr ? 'تسجيل الخروج' : 'Logout'}</span>
            </button>

            <button id="hub-reset-btn" style="
              display:flex;align-items:center;gap:5px;
              padding:7px 12px;background:rgba(239,68,68,0.12);color:#FCA5A5;
              border:1px solid rgba(239,68,68,0.35);border-radius:10px;
              font-size:0.75rem;font-weight:700;cursor:pointer;transition:all 0.15s;"
              onmouseover="this.style.background='rgba(239,68,68,0.25)';this.style.color='#FFFFFF';"
              onmouseout="this.style.background='rgba(239,68,68,0.12)';this.style.color='#FCA5A5';">
              <span>⚠️</span>
              <span>${isAr ? 'إعادة ضبط التقدم' : 'Reset Progress'}</span>
            </button>
          </div>
        </div>

        <h2 style="font-size:1.6rem;font-weight:700;color:#38BDF8;margin:6px 0 0;text-align:center;">
          🧑‍🚀 Astronaut Training Facility
        </h2>
        <p style="color:#94A3B8;text-align:center;max-width:500px;margin:0;font-size:0.9rem;">
          Welcome to the ISS Training Station. Explore the 6 modules using
          <strong style="color:#38BDF8;">WASD / Arrow Keys</strong>, walk to the terminals, and press
          <strong style="color:#38BDF8;">E</strong> to enter each interactive training stage!
        </p>

        <!-- Progress bar -->
        <div style="width:340px;background:#1E293B;border-radius:12px;padding:14px 18px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:.85rem;">
            <span>Mission Progress</span>
            <span style="color:#38BDF8;font-weight:600;">${done}/${total} Certified</span>
          </div>
          <div style="background:#0F172A;border-radius:8px;height:10px;overflow:hidden;">
            <div style="width:${Math.round(done/total*100)}%;height:100%;
                        background:linear-gradient(90deg,#38BDF8,#A855F7);
                        transition:width .4s;border-radius:8px;"></div>
          </div>
        </div>

        <!-- Room cards grid -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:620px;width:100%;">
          ${this._hubCard('sleep',    '🌀','Sleep Bay',     'Solve Fan Circuit Grid',  '#1D4ED8')}
          ${this._hubCard('galley',   '🍱','Galley',        'Food Prep & Hydration',   '#B45309')}
          ${this._hubCard('emergency','⚡','Emergency',     'Fix Severed Wires',       '#DC2626')}
          ${this._hubCard('exercise', '🏃','Exercise Bay',  'Treadmill T2 Cadence',    '#16A34A')}
          ${this._hubCard('comms',    '📡','Comms Room',    'Align Houston Frequency', '#7C3AED')}
          ${this._hubCard('armBay',   '🦾','Arm Bay',       'Dock 3 Cargo Boxes',      '#0891B2')}
        </div>

        <!-- NASA & CSA Research Telemetry Panel (OSDR, RadLab, CSA Food Production) -->
        <div id="hub-nasa-telemetry-container" style="width:100%;max-width:620px;margin-top:6px;">
          <div style="background:#0F172A;border:1px solid #1E293B;border-radius:12px;padding:12px 14px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:0.75rem;font-weight:700;color:#38BDF8;font-family:monospace;">
              <span>🛰️ NASA & CSA REAL-TIME MISSION SCIENCE</span>
              <span style="color:#10B981;">● TELEMETRY ACTIVE</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(170px, 1fr));gap:8px;font-size:0.72rem;">
              <div style="background:#1E293B;padding:8px 10px;border-radius:8px;border-left:3px solid #06B6D4;">
                <div style="color:#06B6D4;font-weight:700;">🧬 NASA OSDR</div>
                <div style="color:#94A3B8;margin-top:2px;">Open Science Data for Life in Space (Microgravity biology)</div>
              </div>
              <div style="background:#1E293B;padding:8px 10px;border-radius:8px;border-left:3px solid #A855F7;">
                <div style="color:#A855F7;font-weight:700;">☢️ RadLab / Curiosity RAD</div>
                <div style="color:#94A3B8;margin-top:2px;">Dosimetry on ISS & Mars surface</div>
              </div>
              <div style="background:#1E293B;padding:8px 10px;border-radius:8px;border-left:3px solid #10B981;">
                <div style="color:#10B981;font-weight:700;">🌱 CSA Youth Food Toolkit</div>
                <div style="color:#94A3B8;margin-top:2px;">Food production on the Moon & remote areas</div>
              </div>
            </div>
            <div id="hub-nasa-dynamic-content" style="margin-top:10px;"></div>
          </div>
        </div>

        <button id="training-enter-btn" style="
          margin-top:6px;
          padding:14px 48px;
          background:linear-gradient(135deg,#0369A1,#38BDF8);
          color:#fff;font-size:1.05rem;font-weight:700;
          border:none;border-radius:12px;cursor:pointer;
          box-shadow:0 4px 20px rgba(56,189,248,.35);
          transition:transform .15s;">
          🚀 Enter Station
        </button>
        <p style="color:#475569;font-size:.78rem;margin:0;">
          Walk to any terminal and press <kbd style="background:#1E293B;padding:1px 5px;border-radius:4px;">E</kbd>
          to enter the stage mini-game!
        </p>
      </div>`;

    const enterBtn = this.container.querySelector('#training-enter-btn');
    if (enterBtn) enterBtn.addEventListener('click', () => this._startGame());

    const homeBtn = this.container.querySelector('#hub-nav-home-btn');
    if (homeBtn) homeBtn.addEventListener('click', () => this._handleReturnToHome());

    const logoutBtn = this.container.querySelector('#hub-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => this._handleLogout());

    const resetBtn = this.container.querySelector('#hub-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', () => this._showResetConfirmationModal());

    if (window.NasaData) {
      const isAr = window.cadetState?.state?.lang === 'ar';
      Promise.all([
        window.NasaData.getOSDRFactsHTML('microgravity', isAr ? 'ar' : 'en'),
        window.NasaData.getRadiationCardHTML(isAr ? 'ar' : 'en')
      ]).then(([osdrHtml, radHtml]) => {
        const target = this.container.querySelector('#hub-nasa-dynamic-content');
        if (target) target.innerHTML = (osdrHtml || '') + (radHtml || '');
      });
    }
  }

  _hubCard(key, icon, label, desc, color) {
    const done = this.tasksDone[key];
    return `
      <div style="background:#0F172A;border:1.5px solid ${done ? '#10B981' : color};
                  border-radius:10px;padding:12px 10px;text-align:center;position:relative;">
        ${done ? `<span style="position:absolute;top:6px;right:8px;color:#10B981;font-size:.7rem;font-weight:700;">✓ DONE</span>` : ''}
        <div style="font-size:1.5rem;">${icon}</div>
        <div style="font-size:.85rem;font-weight:700;color:#E2E8F0;margin:4px 0 2px;">${label}</div>
        <div style="font-size:.72rem;color:#64748B;">${desc}</div>
      </div>`;
  }

  /* ============================================================
     START GAME — build canvas
  ============================================================ */
  _startGame() {
    if (!this.container) return;
    const isAr = (window.cadetState && window.cadetState.state.lang === 'ar');
    this.container.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;overflow:auto;user-select:none;max-width:760px;margin:0 auto;';
    this.container.appendChild(wrap);

    /* In-Game Top Toolbar */
    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
      display:flex;align-items:center;justify-content:space-between;
      margin-bottom:8px;flex-wrap:wrap;gap:8px;font-family:'Outfit',sans-serif;
    `;
    toolbar.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <button id="game-nav-home-btn" style="
          display:flex;align-items:center;gap:5px;
          padding:6px 12px;background:#1E293B;color:#94A3B8;
          border:1px solid #334155;border-radius:8px;
          font-size:.78rem;font-weight:700;cursor:pointer;transition:all 0.15s;"
          onmouseover="this.style.color='#38BDF8';this.style.borderColor='#38BDF8';"
          onmouseout="this.style.color='#94A3B8';this.style.borderColor='#334155';">
          <span>🏠</span> <span>${isAr ? 'الصفحة الرئيسية' : 'Homepage'}</span>
        </button>

        <button id="game-back-hub-btn" style="
          display:flex;align-items:center;gap:5px;
          padding:6px 12px;background:#0F172A;color:#38BDF8;
          border:1px solid #0284C7;border-radius:8px;
          font-size:.78rem;font-weight:700;cursor:pointer;transition:all 0.15s;">
          <span>←</span> <span>${isAr ? 'مركز التدريب' : 'Hub Overview'}</span>
        </button>
      </div>

      <div style="display:flex;align-items:center;gap:8px;">
        <button id="game-logout-btn" style="
          display:flex;align-items:center;gap:4px;
          padding:6px 10px;background:#0F172A;color:#94A3B8;
          border:1px solid #334155;border-radius:8px;
          font-size:.74rem;font-weight:700;cursor:pointer;transition:all 0.15s;"
          onmouseover="this.style.color='#FCA5A5';this.style.borderColor='#EF4444';"
          onmouseout="this.style.color='#94A3B8';this.style.borderColor='#334155';">
          <span>🚪</span> <span>${isAr ? 'تسجيل الخروج' : 'Logout'}</span>
        </button>

        <button id="game-reset-btn" style="
          display:flex;align-items:center;gap:4px;
          padding:6px 10px;background:rgba(239,68,68,0.12);color:#FCA5A5;
          border:1px solid rgba(239,68,68,0.35);border-radius:8px;
          font-size:.74rem;font-weight:700;cursor:pointer;transition:all 0.15s;"
          onmouseover="this.style.background='rgba(239,68,68,0.25)';this.style.color='#FFFFFF';"
          onmouseout="this.style.background='rgba(239,68,68,0.12)';this.style.color='#FCA5A5';">
          <span>⚠️</span> <span>${isAr ? 'إعادة ضبط' : 'Reset Progress'}</span>
        </button>
      </div>
    `;
    wrap.appendChild(toolbar);

    toolbar.querySelector('#game-nav-home-btn').addEventListener('click', () => this._handleReturnToHome());
    toolbar.querySelector('#game-back-hub-btn').addEventListener('click', () => {
      this.cleanup();
      this.phase = 'hub';
      this._renderHub();
    });
    toolbar.querySelector('#game-logout-btn').addEventListener('click', () => this._handleLogout());
    toolbar.querySelector('#game-reset-btn').addEventListener('click', () => this._showResetConfirmationModal());

    this.canvas = document.createElement('canvas');
    this.canvas.width  = 760;
    this.canvas.height = 480;
    this.canvas.style.cssText = `
      display:block;
      background:#0B0F19;
      border-radius:10px;
      cursor:crosshair;
      max-width:100%;`;
    wrap.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this._attachEvents();
    this.phase    = 'playing';
    this.lastTime = performance.now();
    this._loop(this.lastTime);
  }

  /* ============================================================
     EVENT HANDLING
  ============================================================ */
  _attachEvents() {
    window.addEventListener('keydown',  this._boundKeyDown);
    window.addEventListener('keyup',    this._boundKeyUp);
    this.canvas.addEventListener('mousemove', this._boundMouseMove);
    this.canvas.addEventListener('mousedown', this._boundMouseDown);
    this.canvas.addEventListener('mouseup',   this._boundMouseUp);
    this.canvas.addEventListener('click',     this._boundClick);
  }

  _removeEvents() {
    window.removeEventListener('keydown',  this._boundKeyDown);
    window.removeEventListener('keyup',    this._boundKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this._boundMouseMove);
      this.canvas.removeEventListener('mousedown', this._boundMouseDown);
      this.canvas.removeEventListener('mouseup',   this._boundMouseUp);
      this.canvas.removeEventListener('click',     this._boundClick);
    }
  }

  _onKeyDown(e) {
    this.keys[e.code] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
      e.preventDefault();
    }

    /* Global ESC handling to exit any mini-game stage */
    if (e.code === 'Escape' && this.phase !== 'playing' && this.phase !== 'hub') {
      this.phase = 'playing';
      this._playSound('click');
      return;
    }

    /* Exercise stage key press */
    if (this.phase === 'exercise' && !this.exerciseStage.solved) {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        this._exerciseStep('left');
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        this._exerciseStep('right');
      }
    }

    /* Galley hold space for water injection */
    if (this.phase === 'galley' && e.code === 'Space') {
      if (this.galleyStage.state === 'fill') {
        this.galleyStage.isHoldingFill = true;
      }
    }
  }

  _onKeyUp(e) {
    this.keys[e.code] = false;
    if (this.phase === 'galley' && e.code === 'Space') {
      this.galleyStage.isHoldingFill = false;
      this._checkGalleyFill();
    }
  }

  _onMouseMove(e) {
    const r = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width  / r.width;
    const scaleY = this.canvas.height / r.height;
    this.mouse.x = (e.clientX - r.left) * scaleX;
    this.mouse.y = (e.clientY - r.top)  * scaleY;

    /* Comms slider drag */
    if (this.phase === 'comms' && this.commsStage.draggingSlider) {
      const sx = Math.max(180, Math.min(580, this.mouse.x));
      const ratio = (sx - 180) / 400;
      if (this.commsStage.draggingSlider === 'freq') {
        this.commsStage.playerFreq = 1.0 + ratio * 5.0; /* 1.0 to 6.0 */
      } else if (this.commsStage.draggingSlider === 'amp') {
        this.commsStage.playerAmp = 10 + ratio * 50;   /* 10 to 60 */
      }
      this._checkCommsLock();
    }
  }

  _onMouseDown(e) {
    this.mouse.down = true;

    /* Wires drag start */
    if (this.phase === 'wires' && !this.wires.solved) {
      for (let i = 0; i < this.wires.lefts.length; i++) {
        const l = this.wires.lefts[i];
        if (l.connectedTo === null && this._dist(this.mouse.x, this.mouse.y, l.x, l.y) < 30) {
          this.wires.dragging = i;
          this._playSound('click');
          break;
        }
      }
    }

    /* Galley hold fill button */
    if (this.phase === 'galley' && this.galleyStage.state === 'fill') {
      if (this._inRect(this.mouse.x, this.mouse.y, 280, 390, 200, 48)) {
        this.galleyStage.isHoldingFill = true;
      }
    }

    /* Comms slider drag start */
    if (this.phase === 'comms' && !this.commsStage.solved) {
      if (this._inRect(this.mouse.x, this.mouse.y, 160, 340, 440, 30)) {
        this.commsStage.draggingSlider = 'freq';
      } else if (this._inRect(this.mouse.x, this.mouse.y, 160, 390, 440, 30)) {
        this.commsStage.draggingSlider = 'amp';
      }
    }
  }

  _onMouseUp(e) {
    this.mouse.down = false;

    /* Wires drag release */
    if (this.phase === 'wires' && this.wires.dragging !== null) {
      const lIdx = this.wires.dragging;
      const left = this.wires.lefts[lIdx];
      let snapped = false;

      for (let j = 0; j < this.wires.rights.length; j++) {
        const right = this.wires.rights[j];
        if (!right.connected && this._dist(this.mouse.x, this.mouse.y, right.x, right.y) < 35) {
          if (left.id === right.id) {
            left.connectedTo = j;
            right.connected  = true;
            snapped = true;
            this._playSound('correct');
            this.wires.sparks.push({ x: right.x, y: right.y, t: 0.5 });

            /* Check if all wires connected */
            if (this.wires.lefts.every(l => l.connectedTo !== null)) {
              this.wires.solved = true;
              this.wires.timer  = 1.8;
              this._completeTask('emergency', 'emergency');
            }
          }
          break;
        }
      }

      if (!snapped) {
        this._playSound('click');
      }
      this.wires.dragging = null;
    }

    /* Galley release fill */
    if (this.phase === 'galley' && this.galleyStage.isHoldingFill) {
      this.galleyStage.isHoldingFill = false;
      this._checkGalleyFill();
    }

    /* Comms slider release */
    if (this.phase === 'comms') {
      this.commsStage.draggingSlider = null;
    }
  }

  _onClick(e) {
    /* Exit button in any stage (top-right x=700, y=20) */
    if (this.phase !== 'playing' && this.phase !== 'hub') {
      if (this._inRect(this.mouse.x, this.mouse.y, 670, 10, 80, 28)) {
        this.phase = 'playing';
        this._playSound('click');
        return;
      }
    }

    /* Stage-specific clicks */
    if (this.phase === 'fanPuzzle' && !this.fanPuzzle.solved) {
      this._onFanPuzzleClick();
    } else if (this.phase === 'galley') {
      this._onGalleyClick();
    } else if (this.phase === 'exercise' && !this.exerciseStage.solved) {
      this._onExerciseClick();
    } else if (this.phase === 'arm') {
      this._tryLatch();
    }
  }

  /* ============================================================
     WALKABILITY (STATION OVERHEAD)
  ============================================================ */
  _isWalkable(x, y) {
    for (const r of this.rooms) {
      if (x >= r.x+2 && x <= r.x+r.w-2 && y >= r.y+2 && y <= r.y+r.h-2) return true;
    }
    const c = this.corridor;
    if (x >= c.x && x <= c.x+c.w && y >= c.y && y <= c.y+c.h) return true;
    for (const d of this.doors) {
      if (x >= d.x && x <= d.x+d.w && y >= d.y && y <= d.y+d.h) return true;
    }
    return false;
  }

  /* ============================================================
     MAIN RAF LOOP
  ============================================================ */
  _loop(ts) {
    this.rafId = requestAnimationFrame(t => this._loop(t));
    const dt = Math.min((ts - this.lastTime) / 1000, 0.05);
    this.lastTime = ts;

    switch(this.phase) {
      case 'playing':
        this._updatePlaying(dt);
        this._drawPlaying();
        break;
      case 'fanPuzzle':
        this._updateFanPuzzle(dt);
        this._drawFanPuzzle();
        break;
      case 'wires':
        this._updateWires(dt);
        this._drawWires();
        break;
      case 'galley':
        this._updateGalleyStage(dt);
        this._drawGalleyStage();
        break;
      case 'exercise':
        this._updateExerciseStage(dt);
        this._drawExerciseStage();
        break;
      case 'comms':
        this._updateCommsStage(dt);
        this._drawCommsStage();
        break;
      case 'arm':
        this._updateArm(dt);
        this._drawArm();
        break;
    }
  }

  /* ============================================================
     UPDATE & DRAW — OVERHEAD STATION (PLAYING)
  ============================================================ */
  _updatePlaying(dt) {
    const p   = this.player;
    const spd = p.speed;

    let dx = 0, dy = 0;
    if (this.keys['ArrowLeft']  || this.keys['KeyA']) dx -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) dx += 1;
    if (this.keys['ArrowUp']    || this.keys['KeyW']) dy -= 1;
    if (this.keys['ArrowDown']  || this.keys['KeyS']) dy += 1;

    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
    if (dx !== 0 || dy !== 0) p.dir = Math.atan2(dy, dx);

    const nx = p.x + dx * spd * dt;
    const ny = p.y + dy * spd * dt;
    if (this._isWalkable(nx, p.y)) p.x = nx;
    if (this._isWalkable(p.x, ny)) p.y = ny;

    this.activePrompt = '';

    /* Check proximity to room consoles to enter stages */
    const cons = this.consoles;
    const interactDist = 38;

    /* 1. Sleep Bay - Fan Grid */
    if (this._dist(p.x, p.y, cons.sleep.x, cons.sleep.y) < interactDist) {
      if (!this.tasksDone.sleep) {
        this.activePrompt = '[ E ] Enter Fan Grid Puzzle';
        if (this.keys['KeyE']) {
          this.keys['KeyE'] = false;
          this.fanPuzzle = this._freshFanPuzzleState();
          this.phase = 'fanPuzzle';
          this._playSound('click');
        }
      } else {
        this.activePrompt = '✓ Fan Grid Online & Repaired';
      }
    }

    /* 2. Galley - Food Prep */
    else if (this._dist(p.x, p.y, cons.galley.x, cons.galley.y) < interactDist) {
      if (!this.tasksDone.galley) {
        this.activePrompt = '[ E ] Enter Food Prep Stage';
        if (this.keys['KeyE']) {
          this.keys['KeyE'] = false;
          this.galleyStage = this._freshGalleyState();
          this.phase = 'galley';
          this._playSound('click');
        }
      } else {
        this.activePrompt = '✓ Food Nutrition Sealed';
      }
    }

    /* 3. Emergency - Wires */
    else if (this._dist(p.x, p.y, cons.emergency.x, cons.emergency.y) < interactDist) {
      if (!this.tasksDone.emergency) {
        this.activePrompt = '[ E ] Fix Severed Electrical Wires';
        if (this.keys['KeyE']) {
          this.keys['KeyE'] = false;
          this.wires = this._freshWiresState();
          this.phase = 'wires';
          this._playSound('click');
        }
      } else {
        this.activePrompt = '✓ Electrical Harness Operational';
      }
    }

    /* 4. Exercise - Treadmill T2 */
    else if (this._dist(p.x, p.y, cons.exercise.x, cons.exercise.y) < interactDist) {
      if (!this.tasksDone.exercise) {
        this.activePrompt = '[ E ] Start Treadmill Cardio Stage';
        if (this.keys['KeyE']) {
          this.keys['KeyE'] = false;
          this.exerciseStage = this._freshExerciseState();
          this.phase = 'exercise';
          this._playSound('click');
        }
      } else {
        this.activePrompt = '✓ 100m Cardio Completed';
      }
    }

    /* 5. Comms - Radio Antenna */
    else if (this._dist(p.x, p.y, cons.comms.x, cons.comms.y) < interactDist) {
      if (!this.tasksDone.comms) {
        this.activePrompt = '[ E ] Tune Radio Antenna Signal';
        if (this.keys['KeyE']) {
          this.keys['KeyE'] = false;
          this.commsStage = this._freshCommsState();
          this.phase = 'comms';
          this._playSound('click');
        }
      } else {
        this.activePrompt = '✓ Houston Signal Locked';
      }
    }

    /* 6. Arm Bay - Canadarm2 (UNCHANGED) */
    else if (this._dist(p.x, p.y, cons.armBay.x, cons.armBay.y) < interactDist) {
      if (!this.tasksDone.armBay) {
        this.activePrompt = '[ E ] Enter Robotic Arm Console';
        if (this.keys['KeyE']) {
          this.keys['KeyE'] = false;
          this.arm = this._freshArmState();
          this.phase = 'arm';
          this._playSound('thruster');
        }
      } else {
        this.activePrompt = '✓ Cargo Docking Complete';
      }
    }

    this._updateNotifications(dt);
  }

  _drawPlaying() {
    const cv = this.canvas, cx = this.ctx;
    cx.clearRect(0, 0, cv.width, cv.height);
    cx.fillStyle = '#080C14';
    cx.fillRect(0, 0, cv.width, cv.height);

    this._drawCorridor(cx);
    for (const room of this.rooms) this._drawRoom(cx, room);
    this._drawDoors(cx);

    /* Draw room consoles with guide icons & pulsing markers */
    this._drawConsoles(cx);

    this._drawPlayer(cx);
    this._drawHUD(cx);
    this._drawPrompt(cx);
    this._drawNotifications(cx);
  }

  _drawCorridor(cx) {
    const c = this.corridor;
    cx.fillStyle = '#0F172A';
    cx.fillRect(c.x, c.y, c.w, c.h);
    cx.strokeStyle = '#1E293B';
    cx.lineWidth = 1;
    cx.strokeRect(c.x, c.y, c.w, c.h);

    cx.setLineDash([10, 8]);
    cx.strokeStyle = '#1E3A5F';
    cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(c.x, c.y + c.h/2);
    cx.lineTo(c.x + c.w, c.y + c.h/2);
    cx.stroke();
    cx.setLineDash([]);
  }

  _drawRoom(cx, room) {
    const done  = this.tasksDone[room.id];
    const bColor = done ? '#10B981' : room.borderColor;
    const bWidth = done ? 3 : 2;

    cx.fillStyle = room.floorColor;
    cx.fillRect(room.x, room.y, room.w, room.h);

    cx.strokeStyle = bColor;
    cx.lineWidth   = bWidth;
    cx.strokeRect(room.x+1, room.y+1, room.w-2, room.h-2);

    cx.font      = 'bold 11px Outfit,sans-serif';
    cx.fillStyle = done ? '#10B981' : '#94A3B8';
    cx.textAlign = 'center';
    const labelY = room.y < 150 ? room.y + room.h - 8 : room.y + 14;
    cx.fillText((done ? '✓ ' : '') + room.label.toUpperCase(), room.x+room.w/2, labelY);

    if (!done) {
      cx.font      = '12px sans-serif';
      cx.fillStyle = '#F59E0B';
      cx.fillText('⚠', room.x + room.w - 14, room.y + 14);
    }
  }

  _drawDoors(cx) {
    for (const d of this.doors) {
      cx.fillStyle = '#0F172A';
      cx.fillRect(d.x, d.y, d.w, d.h);
    }
  }

  _drawConsoles(cx) {
    const time = performance.now() / 1000;
    for (const [id, c] of Object.entries(this.consoles)) {
      const done = this.tasksDone[id];
      const p = this.player;
      const near = this._dist(p.x, p.y, c.x, c.y) < 38;

      /* Terminal body */
      cx.beginPath();
      cx.arc(c.x, c.y, c.r, 0, Math.PI*2);
      cx.fillStyle   = done ? '#064E3B' : (near ? '#0369A1' : '#1E293B');
      cx.fill();
      cx.strokeStyle = done ? '#10B981' : (near ? '#38BDF8' : '#475569');
      cx.lineWidth   = near ? 2.5 : 1.5;
      cx.stroke();

      /* Console icon */
      cx.font = '14px sans-serif';
      cx.textAlign = 'center';
      cx.fillText(done ? '✓' : c.icon, c.x, c.y + 5);

      /* Console label */
      cx.font = '9px Outfit,sans-serif';
      cx.fillStyle = done ? '#10B981' : (near ? '#38BDF8' : '#94A3B8');
      cx.fillText(c.label, c.x, c.y + c.r + 12);

      /* Pulsing warning indicator if not done */
      if (!done) {
        const pulse = 1 + 0.15 * Math.sin(time * 5);
        cx.save();
        cx.translate(c.x, c.y - c.r - 8);
        cx.scale(pulse, pulse);
        cx.font = 'bold 10px Outfit,sans-serif';
        cx.fillStyle = '#F59E0B';
        cx.fillText('⚠ [E]', 0, 0);
        cx.restore();
      }
    }
  }

  _drawPlayer(cx) {
    const p = this.player;
    cx.save();
    cx.translate(p.x, p.y);
    cx.rotate(p.dir);
    cx.fillStyle = '#38BDF8';
    cx.beginPath();
    cx.moveTo(p.r+2, 0);
    cx.lineTo(p.r-3, -4);
    cx.lineTo(p.r-3,  4);
    cx.closePath();
    cx.fill();
    cx.restore();

    cx.font = '18px sans-serif';
    cx.textAlign = 'center';
    cx.fillText('🧑‍🚀', p.x, p.y+6);
  }

  _drawHUD(cx) {
    cx.fillStyle = 'rgba(8,12,20,0.88)';
    cx.fillRect(0, 0, 760, 24);

    const tasks = [
      { key:'sleep',    icon:'🌀' },
      { key:'galley',   icon:'🍱' },
      { key:'emergency',icon:'⚡' },
      { key:'exercise', icon:'🏃' },
      { key:'comms',    icon:'📡' },
      { key:'armBay',   icon:'🦾' }
    ];

    for (let i = 0; i < tasks.length; i++) {
      const t    = tasks[i];
      const done = this.tasksDone[t.key];
      const sx   = 30 + i * 120;

      cx.font      = '11px sans-serif';
      cx.fillStyle = done ? '#10B981' : '#475569';
      cx.textAlign = 'left';
      cx.fillText(`${done ? '✓' : '○'} ${t.icon}`, sx, 16);
    }

    const allDone = Object.values(this.tasksDone).every(Boolean);
    if (allDone) {
      cx.font      = 'bold 11px Outfit,sans-serif';
      cx.fillStyle = '#F59E0B';
      cx.textAlign = 'center';
      cx.fillText('🏆 ALL 6 TRAINING TASKS CERTIFIED!', 760/2, 16);
    }
  }

  _drawPrompt(cx) {
    if (!this.activePrompt) return;
    cx.fillStyle = 'rgba(14,22,42,0.92)';
    cx.beginPath();
    cx.roundRect(760/2 - 180, 452, 360, 24, 6);
    cx.fill();
    cx.strokeStyle = '#38BDF8';
    cx.lineWidth = 1;
    cx.stroke();
    cx.font      = 'bold 11px Outfit,sans-serif';
    cx.fillStyle = '#38BDF8';
    cx.textAlign = 'center';
    cx.fillText(this.activePrompt, 760/2, 468);
  }

  _drawNotifications(cx) {
    let ny = 36;
    for (const n of [...this._notifications].reverse()) {
      cx.fillStyle = `rgba(14,22,42,${n.alpha * 0.9})`;
      cx.beginPath();
      cx.roundRect(760/2 - 140, ny, 280, 22, 6);
      cx.fill();
      cx.strokeStyle = '#38BDF8';
      cx.lineWidth = 1;
      cx.stroke();
      cx.font      = '11px Outfit,sans-serif';
      cx.fillStyle = `rgba(226,232,240,${n.alpha})`;
      cx.textAlign = 'center';
      cx.fillText(n.msg, 760/2, ny+15);
      ny += 26;
    }
  }

  /* ============================================================
     STAGE 1: FAN CIRCUIT PUZZLE (Sleep Bay)
  ============================================================ */
  _updateFanPuzzle(dt) {
    const fp = this.fanPuzzle;
    fp.fanAngle += (fp.solved ? 14 : 1) * dt;

    if (fp.solved) {
      fp.timer -= dt;
      if (fp.timer <= 0) {
        this.phase = 'playing';
      }
    }
  }

  _onFanPuzzleClick() {
    const fp = this.fanPuzzle;
    const startX = 380 - 1.5 * 85;
    const startY = 240 - 1.5 * 85;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x = startX + c * 85;
        const y = startY + r * 85;
        if (this._inRect(this.mouse.x, this.mouse.y, x, y, 78, 78)) {
          /* Rotate 90° clockwise */
          const tile = fp.grid[r][c];
          const p = tile.ports;
          tile.ports = [p[3], p[0], p[1], p[2]];
          tile.rot   = (tile.rot + 1) % 4;
          this._playSound('click');
          this._checkFanPuzzleSolved();
          return;
        }
      }
    }
  }

  _checkFanPuzzleSolved() {
    const fp = this.fanPuzzle;
    /* BFS from left input (col 0, row 1, port 'left') */
    const visited = Array(3).fill(0).map(() => Array(3).fill(false));
    const queue = [];

    /* Check if tile (0,1) receives from Left */
    if (fp.grid[1][0].ports[3]) {
      queue.push({ r: 1, c: 0 });
      visited[1][0] = true;
    }

    let reachesRight = false;

    while (queue.length > 0) {
      const { r, c } = queue.shift();
      const curr = fp.grid[r][c];

      /* If reached tile (col 2, row 1) and its right port is open, power connects to Fan! */
      if (r === 1 && c === 2 && curr.ports[1]) {
        reachesRight = true;
        break;
      }

      /* Check 4 neighbors */
      // 0: TOP
      if (curr.ports[0] && r > 0 && !visited[r-1][c] && fp.grid[r-1][c].ports[2]) {
        visited[r-1][c] = true;
        queue.push({ r: r-1, c });
      }
      // 1: RIGHT
      if (curr.ports[1] && c < 2 && !visited[r][c+1] && fp.grid[r][c+1].ports[3]) {
        visited[r][c+1] = true;
        queue.push({ r, c: c+1 });
      }
      // 2: BOTTOM
      if (curr.ports[2] && r < 2 && !visited[r+1][c] && fp.grid[r+1][c].ports[0]) {
        visited[r+1][c] = true;
        queue.push({ r: r+1, c });
      }
      // 3: LEFT
      if (curr.ports[3] && c > 0 && !visited[r][c-1] && fp.grid[r][c-1].ports[1]) {
        visited[r][c-1] = true;
        queue.push({ r, c: c-1 });
      }
    }

    if (reachesRight && !fp.solved) {
      fp.solved = true;
      fp.timer  = 1.8;
      this._playSound('correct');
      this._completeTask('sleep', 'weightlessness');
    }
  }

  _drawFanPuzzle() {
    const cv = this.canvas, cx = this.ctx, fp = this.fanPuzzle;

    /* Background panel */
    cx.fillStyle = '#0F172A';
    cx.fillRect(0, 0, cv.width, cv.height);

    /* Stage header */
    this._drawStageHeader('🌀 SLEEP BAY — FAN CIRCUIT GRID', 'Click tiles to rotate wires and connect Power (Left) to Fan Motor (Right)!');

    /* Power Generator on Left */
    cx.fillStyle = '#1E293B';
    cx.fillRect(30, 200, 70, 80);
    cx.strokeStyle = '#38BDF8';
    cx.lineWidth = 2;
    cx.strokeRect(30, 200, 70, 80);
    cx.font = 'bold 11px Outfit,sans-serif';
    cx.fillStyle = '#38BDF8';
    cx.textAlign = 'center';
    cx.fillText('POWER', 65, 235);
    cx.fillText('28V DC', 65, 252);

    /* Connection line into grid */
    cx.beginPath();
    cx.moveTo(100, 240);
    cx.lineTo(380 - 1.5 * 85, 240);
    cx.strokeStyle = '#38BDF8';
    cx.lineWidth = 4;
    cx.stroke();

    /* 3x3 Tiles */
    const startX = 380 - 1.5 * 85;
    const startY = 240 - 1.5 * 85;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x = startX + c * 85;
        const y = startY + r * 85;
        const tile = fp.grid[r][c];

        /* Tile box */
        cx.fillStyle = '#1E293B';
        cx.fillRect(x, y, 78, 78);
        cx.strokeStyle = fp.solved ? '#10B981' : '#334155';
        cx.lineWidth = 2;
        cx.strokeRect(x, y, 78, 78);

        /* Draw wires on tile */
        const midX = x + 39, midY = y + 39;
        cx.strokeStyle = fp.solved ? '#34D399' : '#38BDF8';
        cx.lineWidth = 6;
        cx.lineCap = 'round';

        // top
        if (tile.ports[0]) {
          cx.beginPath(); cx.moveTo(midX, midY); cx.lineTo(midX, y); cx.stroke();
        }
        // right
        if (tile.ports[1]) {
          cx.beginPath(); cx.moveTo(midX, midY); cx.lineTo(x + 78, midY); cx.stroke();
        }
        // bottom
        if (tile.ports[2]) {
          cx.beginPath(); cx.moveTo(midX, midY); cx.lineTo(midX, y + 78); cx.stroke();
        }
        // left
        if (tile.ports[3]) {
          cx.beginPath(); cx.moveTo(midX, midY); cx.lineTo(x, midY); cx.stroke();
        }

        /* Center node */
        cx.beginPath();
        cx.arc(midX, midY, 6, 0, Math.PI*2);
        cx.fillStyle = fp.solved ? '#10B981' : '#67E8F9';
        cx.fill();
      }
    }

    /* Connection line from grid to fan */
    const gridRightX = startX + 3 * 85 - 7;
    cx.beginPath();
    cx.moveTo(gridRightX, 240);
    cx.lineTo(660, 240);
    cx.strokeStyle = fp.solved ? '#10B981' : '#334155';
    cx.lineWidth = 4;
    cx.stroke();

    /* Big Fan Motor on Right */
    const fanCenterX = 690, fanCenterY = 240;
    cx.save();
    cx.translate(fanCenterX, fanCenterY);
    cx.rotate(fp.fanAngle);
    cx.strokeStyle = fp.solved ? '#10B981' : '#64748B';
    cx.lineWidth = 5;
    cx.lineCap = 'round';
    for (let b = 0; b < 4; b++) {
      cx.beginPath();
      cx.moveTo(0, 0);
      cx.lineTo(32 * Math.cos(b * Math.PI/2), 32 * Math.sin(b * Math.PI/2));
      cx.stroke();
    }
    cx.restore();

    cx.beginPath();
    cx.arc(fanCenterX, fanCenterY, 8, 0, Math.PI*2);
    cx.fillStyle = fp.solved ? '#10B981' : '#475569';
    cx.fill();
    cx.font = 'bold 11px Outfit,sans-serif';
    cx.fillStyle = fp.solved ? '#10B981' : '#94A3B8';
    cx.textAlign = 'center';
    cx.fillText('FAN MOTOR', fanCenterX, fanCenterY + 45);

    if (fp.solved) {
      this._drawSolvedBanner('⚡ POWER RESTORED! FAN REPAIRED!');
    }
  }

  /* ============================================================
     STAGE 2: WIRE FIXING (Emergency Bay - Rear-Routed Configuration)
  ============================================================ */
  _updateWires(dt) {
    const w = this.wires;

    /* Update connection spark particles */
    for (let i = w.sparks.length - 1; i >= 0; i--) {
      w.sparks[i].t -= dt;
      if (w.sparks[i].t <= 0) w.sparks.splice(i, 1);
    }

    /* Ambient sparks at severed rear conduits */
    w.ambientSparkTimer = (w.ambientSparkTimer || 0) + dt;
    if (w.ambientSparkTimer > 0.8) {
      w.ambientSparkTimer = 0;
      const severed = w.bgWires.filter(b => b.severed);
      if (severed.length > 0) {
        const pick = severed[Math.floor(Math.random() * severed.length)];
        w.sparks.push({ x: pick.x2, y: pick.y2, t: 0.25 + Math.random() * 0.2, color: '#FACC15' });
      }
    }

    if (w.solved) {
      w.timer -= dt;
      if (w.timer <= 0) {
        this.phase = 'playing';
      }
    }
  }

  _drawWires() {
    const cv = this.canvas, cx = this.ctx, w = this.wires;
    const time = performance.now() / 1000;

    /* 1. Deep Space Electrical Cabinet Chassis */
    cx.fillStyle = '#070B12';
    cx.fillRect(0, 0, cv.width, cv.height);

    /* Stage header */
    this._drawStageHeader('⚡ EMERGENCY BAY — REAR-ROUTED WIRE HARNESS', 'Connect each wire from its rear bulkhead feed to the matching rear-side terminal socket!');

    /* 2. Rear Bulkhead Wall & Avionics Rack Frame */
    const bayX = 30, bayY = 65, bayW = 700, bayH = 385;

    // Dark brushed titanium rear bulkhead plate
    const bgGrad = cx.createLinearGradient(bayX, bayY, bayX, bayY + bayH);
    bgGrad.addColorStop(0, '#0F172A');
    bgGrad.addColorStop(0.5, '#090D17');
    bgGrad.addColorStop(1, '#0B132B');
    cx.fillStyle = bgGrad;
    cx.fillRect(bayX, bayY, bayW, bayH);

    cx.strokeStyle = '#334155';
    cx.lineWidth = 3;
    cx.strokeRect(bayX, bayY, bayW, bayH);

    // Stenciled avionics markings on rear bulkhead
    cx.font = 'bold 9px JetBrains Mono,monospace';
    cx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    cx.textAlign = 'left';
    cx.fillText('🛰️ REAR BULKHEAD AVIONICS BAY • LIFE SUPPORT MAIN BUS 28V DC • REAR-ROUTED HARNESS ARRAY', bayX + 16, bayY + 18);

    /* 3. Horizontal and Vertical Rear Cable Raceways (Wire Channels) across the entire bay */
    // Slotted horizontal rear wire raceways behind each wire track
    for (let i = 0; i < 4; i++) {
      const channelY = 135 + i * 72;
      cx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      cx.fillRect(bayX + 10, channelY - 20, bayW - 20, 40);
      cx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
      cx.lineWidth = 1.5;
      cx.strokeRect(bayX + 10, channelY - 20, bayW - 20, 40);

      // Slotted metallic grill holes inside the raceway
      cx.fillStyle = 'rgba(2, 6, 23, 0.8)';
      for (let hx = bayX + 190; hx <= bayX + bayW - 190; hx += 24) {
        cx.fillRect(hx, channelY - 14, 12, 28);
      }
    }

    // Vertical structural conduit pillars in the rear
    cx.fillStyle = '#111C2D';
    cx.fillRect(bayX + 180, bayY + 25, 18, bayH - 45);
    cx.fillRect(bayX + bayW - 198, bayY + 25, 18, bayH - 45);
    cx.strokeStyle = '#1E293B';
    cx.lineWidth = 1.5;
    cx.strokeRect(bayX + 180, bayY + 25, 18, bayH - 45);
    cx.strokeRect(bayX + bayW - 198, bayY + 25, 18, bayH - 45);

    /* 4. Deep Background Rear Cables & Conduit Bundles */
    for (const bw of w.bgWires) {
      // Rear conduit shadow
      cx.beginPath();
      cx.moveTo(bw.x1, bw.y1 + 4);
      cx.bezierCurveTo(bw.cx1, bw.cy1 + 6, bw.cx2, bw.cy2 + 6, bw.x2, bw.y2 + 4);
      cx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      cx.lineWidth   = bw.w + 2;
      cx.lineCap     = 'round';
      cx.stroke();

      // Rear cable insulation
      cx.beginPath();
      cx.moveTo(bw.x1, bw.y1);
      cx.bezierCurveTo(bw.cx1, bw.cy1, bw.cx2, bw.cy2, bw.x2, bw.y2);
      cx.strokeStyle = bw.color;
      cx.lineWidth   = bw.w;
      cx.lineCap     = 'round';
      cx.stroke();

      // Rear cable clips / conduit brackets
      const mx = (bw.x1 + bw.x2) / 2;
      const my = (bw.y1 + bw.y2) / 2;
      cx.fillStyle = '#475569';
      cx.fillRect(mx - 3, my - 4, 6, 8);

      // Severed dangling ends
      if (bw.severed) {
        cx.beginPath();
        cx.arc(bw.x2, bw.y2, bw.w * 0.9, 0, Math.PI * 2);
        cx.fillStyle = '#F59E0B';
        cx.fill();
        cx.strokeStyle = '#D97706';
        cx.lineWidth = 1;
        cx.stroke();
      }
    }

    /* 5. Left Rear-Feed Grommets & Heavy-Duty Conduit Sleeves */
    for (let i = 0; i < w.lefts.length; i++) {
      const l = w.lefts[i];
      const isConnected = l.connectedTo !== null;

      // 3D Circular Rear Grommet on Bulkhead Wall
      cx.beginPath();
      cx.arc(75, l.y, 20, 0, Math.PI * 2);
      cx.fillStyle = '#0B0F19';
      cx.fill();
      cx.strokeStyle = '#334155';
      cx.lineWidth = 2.5;
      cx.stroke();

      // Inner rubber sealing collar
      cx.beginPath();
      cx.arc(75, l.y, 14, 0, Math.PI * 2);
      cx.fillStyle = '#1E293B';
      cx.fill();
      cx.strokeStyle = l.color;
      cx.lineWidth = 2;
      cx.stroke();

      // Flexible Corrugated Conduit Sleeve extending forward from rear grommet to terminal
      cx.beginPath();
      cx.moveTo(75, l.y);
      cx.lineTo(l.x, l.y);
      cx.strokeStyle = l.color;
      cx.lineWidth = 14;
      cx.lineCap = 'round';
      cx.stroke();

      // Ribbed conduit texture
      cx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
      cx.lineWidth = 2;
      for (let rx = 85; rx < l.x; rx += 7) {
        cx.beginPath();
        cx.moveTo(rx, l.y - 6);
        cx.lineTo(rx, l.y + 6);
        cx.stroke();
      }

      // Metallic mounting collar at junction
      cx.fillStyle = '#334155';
      cx.fillRect(l.x - 6, l.y - 12, 12, 24);
      cx.strokeStyle = '#64748B';
      cx.lineWidth = 1.5;
      cx.strokeRect(l.x - 6, l.y - 12, 12, 24);

      // Terminal Terminal Plug Face
      cx.beginPath();
      cx.arc(l.x, l.y, 11, 0, Math.PI * 2);
      cx.fillStyle = l.color;
      cx.fill();
      cx.strokeStyle = '#FFFFFF';
      cx.lineWidth = 2;
      cx.stroke();

      // Rear Channel Tag
      cx.font = 'bold 9px JetBrains Mono,monospace';
      cx.fillStyle = '#E2E8F0';
      cx.textAlign = 'right';
      cx.fillText(`REAR ${l.id.toUpperCase()}`, l.x - 30, l.y - 14);

      // Circuit Live LED
      cx.beginPath();
      cx.arc(l.x + 18, l.y, 4, 0, Math.PI * 2);
      cx.fillStyle = isConnected ? '#10B981' : '#F59E0B';
      cx.fill();
    }

    /* 6. Right Rear-Receptor Grommets & Terminal Sockets */
    for (let j = 0; j < w.rights.length; j++) {
      const r = w.rights[j];

      // 3D Circular Rear Grommet on Bulkhead Wall
      cx.beginPath();
      cx.arc(685, r.y, 20, 0, Math.PI * 2);
      cx.fillStyle = '#0B0F19';
      cx.fill();
      cx.strokeStyle = '#334155';
      cx.lineWidth = 2.5;
      cx.stroke();

      // Inner rubber sealing collar
      cx.beginPath();
      cx.arc(685, r.y, 14, 0, Math.PI * 2);
      cx.fillStyle = '#1E293B';
      cx.fill();
      cx.strokeStyle = r.color;
      cx.lineWidth = 2;
      cx.stroke();

      // Rear conduit leading into bulkhead
      cx.beginPath();
      cx.moveTo(r.x, r.y);
      cx.lineTo(685, r.y);
      cx.strokeStyle = r.color;
      cx.lineWidth = 14;
      cx.lineCap = 'round';
      cx.stroke();

      // Ribbed conduit texture
      cx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
      cx.lineWidth = 2;
      for (let rx = r.x + 8; rx < 680; rx += 7) {
        cx.beginPath();
        cx.moveTo(rx, r.y - 6);
        cx.lineTo(rx, r.y + 6);
        cx.stroke();
      }

      // Metallic mounting socket collar
      cx.fillStyle = '#334155';
      cx.fillRect(r.x - 6, r.y - 12, 12, 24);
      cx.strokeStyle = '#64748B';
      cx.lineWidth = 1.5;
      cx.strokeRect(r.x - 6, r.y - 12, 12, 24);

      // Receptor Socket Bezel
      cx.beginPath();
      cx.arc(r.x, r.y, 11, 0, Math.PI * 2);
      cx.fillStyle = r.connected ? r.color : '#0B0F19';
      cx.fill();
      cx.strokeStyle = r.connected ? '#10B981' : r.color;
      cx.lineWidth = 2.5;
      cx.stroke();

      // Rear Port Tag
      cx.font = 'bold 9px JetBrains Mono,monospace';
      cx.fillStyle = r.connected ? '#10B981' : '#E2E8F0';
      cx.textAlign = 'left';
      cx.fillText(r.connected ? `✓ ${r.id.toUpperCase()} LOCKED` : `PORT ${r.id.toUpperCase()}`, r.x + 24, r.y - 14);

      // Status Indicator LED
      cx.beginPath();
      cx.arc(r.x - 18, r.y, 4, 0, Math.PI * 2);
      cx.fillStyle = r.connected ? '#10B981' : '#DC2626';
      cx.fill();
    }

    /* 7. Draw Active Connected Wires Routed Across the Rear Raceway */
    for (let i = 0; i < w.lefts.length; i++) {
      const l = w.lefts[i];
      if (l.connectedTo !== null) {
        const r = w.rights[l.connectedTo];

        // Cable drop shadow onto rear raceway
        cx.beginPath();
        cx.moveTo(l.x, l.y + 6);
        cx.bezierCurveTo(l.x + 140, l.y + 16, r.x - 140, r.y + 16, r.x, r.y + 6);
        cx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
        cx.lineWidth   = 13;
        cx.lineCap     = 'round';
        cx.stroke();

        // Heavy insulated cable jacket
        cx.beginPath();
        cx.moveTo(l.x, l.y);
        cx.bezierCurveTo(l.x + 140, l.y + 8, r.x - 140, r.y + 8, r.x, r.y);
        cx.strokeStyle = l.color;
        cx.lineWidth   = 11;
        cx.lineCap     = 'round';
        cx.stroke();

        // High-voltage glowing core
        cx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        cx.lineWidth   = 3;
        cx.stroke();

        // Animated current pulses traveling along wire from rear-feed to rear-receptor
        const pulseRatio = (time * 1.5 + i * 0.25) % 1;
        const px = l.x + (r.x - l.x) * pulseRatio;
        const py = l.y + (r.y - l.y) * pulseRatio + Math.sin(pulseRatio * Math.PI) * 8;
        cx.beginPath();
        cx.arc(px, py, 4, 0, Math.PI * 2);
        cx.fillStyle = '#FFFFFF';
        cx.fill();
      }
    }

    /* 8. Draw Currently Dragged Wire extending from the Rear Feed */
    if (w.dragging !== null) {
      const l = w.lefts[w.dragging];

      // Drag shadow
      cx.beginPath();
      cx.moveTo(l.x, l.y + 6);
      cx.bezierCurveTo(l.x + 100, l.y + 12, this.mouse.x - 100, this.mouse.y + 12, this.mouse.x, this.mouse.y + 6);
      cx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      cx.lineWidth   = 13;
      cx.lineCap     = 'round';
      cx.stroke();

      // Main flexible wire
      cx.beginPath();
      cx.moveTo(l.x, l.y);
      cx.bezierCurveTo(l.x + 100, l.y + 6, this.mouse.x - 100, this.mouse.y + 6, this.mouse.x, this.mouse.y);
      cx.strokeStyle = l.color;
      cx.lineWidth   = 11;
      cx.lineCap     = 'round';
      cx.stroke();

      // Core glow
      cx.strokeStyle = '#FFFFFF';
      cx.lineWidth   = 3;
      cx.stroke();

      // Heavy brass connector terminal at mouse cursor
      cx.beginPath();
      cx.arc(this.mouse.x, this.mouse.y, 8, 0, Math.PI * 2);
      cx.fillStyle = '#FCD34D';
      cx.fill();
      cx.strokeStyle = '#F59E0B';
      cx.lineWidth = 2;
      cx.stroke();
    }

    /* 9. Sparks (at connection snaps and severed rear conduits) */
    for (const sp of w.sparks) {
      cx.save();
      cx.translate(sp.x, sp.y);
      cx.strokeStyle = sp.color || '#FACC15';
      cx.lineWidth   = 2;
      for (let s = 0; s < 5; s++) {
        const ang = (s * Math.PI * 2) / 5 + Math.random() * 0.5;
        const len = 6 + Math.random() * 14;
        cx.beginPath();
        cx.moveTo(0, 0);
        cx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
        cx.stroke();
      }
      cx.restore();
    }

    if (w.solved) {
      this._drawSolvedBanner('⚡ REAR-ROUTED ELECTRICAL HARNESS RESTORED!');
    }
  }

  /* ============================================================
     STAGE 3: FOOD PREPARATION & REHYDRATION (Galley)
  ============================================================ */
  _updateGalleyStage(dt) {
    const gs = this.galleyStage;
    if (gs.state === 'fill' && gs.isHoldingFill) {
      const curr = gs.pouches[gs.currentIdx];
      curr.water = Math.min(100, curr.water + dt * 32);
    }

    if (gs.solved) {
      gs.timer -= dt;
      if (gs.timer <= 0) {
        this.phase = 'playing';
      }
    }
  }

  _checkGalleyFill() {
    const gs = this.galleyStage;
    const curr = gs.pouches[gs.currentIdx];
    if (curr.water >= curr.targetMin && curr.water <= curr.targetMax) {
      gs.state = 'seal';
      this._playSound('correct');
      this._addNotification('Target volume reached! Click HEAT-SEAL.');
    } else if (curr.water > curr.targetMax) {
      this._playSound('wrong');
      this._addNotification('Overfilled! Depressurizing pouch to retry.');
      curr.water = 0;
    }
  }

  _onGalleyClick() {
    const gs = this.galleyStage;
    if (gs.state === 'seal') {
      if (this._inRect(this.mouse.x, this.mouse.y, 280, 390, 200, 48)) {
        const curr = gs.pouches[gs.currentIdx];
        curr.sealed = true;
        this._playSound('correct');

        if (gs.currentIdx + 1 < gs.pouches.length) {
          gs.currentIdx++;
          gs.state = 'fill';
        } else {
          gs.solved = true;
          gs.timer  = 1.8;
          this._completeTask('galley', 'stationDay');
        }
      }
    }
  }

  _drawGalleyStage() {
    const cv = this.canvas, cx = this.ctx, gs = this.galleyStage;

    cx.fillStyle = '#0F172A';
    cx.fillRect(0, 0, cv.width, cv.height);

    this._drawStageHeader('🍱 GALLEY — SPACE FOOD HYDRATION & SEALING', 'Hold the [INJECT WATER] button until volume reaches the green zone, then seal!');

    const curr = gs.pouches[gs.currentIdx];

    /* Progress steps (3 pouches) */
    for (let i = 0; i < gs.pouches.length; i++) {
      const p = gs.pouches[i];
      const px = 240 + i * 140;
      cx.fillStyle = p.sealed ? '#064E3B' : (i === gs.currentIdx ? '#1E293B' : '#0B0F19');
      cx.fillRect(px, 70, 120, 36);
      cx.strokeStyle = p.sealed ? '#10B981' : (i === gs.currentIdx ? '#38BDF8' : '#334155');
      cx.lineWidth = 1.5;
      cx.strokeRect(px, 70, 120, 36);
      cx.font = 'bold 10px Outfit,sans-serif';
      cx.fillStyle = p.sealed ? '#10B981' : '#E2E8F0';
      cx.textAlign = 'center';
      cx.fillText(p.sealed ? `✓ Meal ${i+1}` : `Meal ${i+1}`, px + 60, 92);
    }

    /* Pouch Container in Center */
    cx.fillStyle = '#1E293B';
    cx.fillRect(260, 120, 240, 240);
    cx.strokeStyle = '#38BDF8';
    cx.lineWidth = 2;
    cx.strokeRect(260, 120, 240, 240);

    /* Pouch title */
    cx.font = 'bold 14px Outfit,sans-serif';
    cx.fillStyle = '#F59E0B';
    cx.textAlign = 'center';
    cx.fillText(curr.name, 380, 145);

    /* Water Level Tube */
    const tubeX = 350, tubeY = 160, tubeW = 60, tubeH = 180;
    cx.fillStyle = '#0F172A';
    cx.fillRect(tubeX, tubeY, tubeW, tubeH);
    cx.strokeStyle = '#475569';
    cx.lineWidth = 2;
    cx.strokeRect(tubeX, tubeY, tubeW, tubeH);

    /* Target Zone (green highlight) */
    const targetTopY = tubeY + tubeH * (1 - curr.targetMax / 100);
    const targetHeight = tubeH * ((curr.targetMax - curr.targetMin) / 100);
    cx.fillStyle = 'rgba(16,185,129,0.3)';
    cx.fillRect(tubeX, targetTopY, tubeW, targetHeight);
    cx.strokeStyle = '#10B981';
    cx.lineWidth = 1;
    cx.strokeRect(tubeX, targetTopY, tubeW, targetHeight);

    /* Water Fill Level */
    const fillHeight = tubeH * (curr.water / 100);
    const fillY = tubeY + tubeH - fillHeight;
    cx.fillStyle = '#0284C7';
    cx.fillRect(tubeX + 2, fillY, tubeW - 4, fillHeight);

    /* Percentage readout */
    cx.font = 'bold 12px JetBrains Mono,monospace';
    cx.fillStyle = '#38BDF8';
    cx.textAlign = 'left';
    cx.fillText(`${Math.round(curr.water)}%`, tubeX + tubeW + 14, 250);
    cx.font = '10px Outfit,sans-serif';
    cx.fillStyle = '#10B981';
    cx.fillText(`Target: ${curr.targetMin}%-${curr.targetMax}%`, tubeX + tubeW + 14, 270);

    /* Action Button at bottom */
    if (gs.state === 'fill') {
      const isHold = gs.isHoldingFill;
      cx.fillStyle = isHold ? '#0284C7' : '#0369A1';
      cx.beginPath();
      cx.roundRect(280, 390, 200, 48, 12);
      cx.fill();
      cx.strokeStyle = '#38BDF8';
      cx.lineWidth = 2;
      cx.stroke();
      cx.font = 'bold 12px Outfit,sans-serif';
      cx.fillStyle = '#FFFFFF';
      cx.textAlign = 'center';
      cx.fillText('HOLD TO INJECT WATER 💧', 380, 419);
    } else if (gs.state === 'seal') {
      cx.fillStyle = '#D97706';
      cx.beginPath();
      cx.roundRect(280, 390, 200, 48, 12);
      cx.fill();
      cx.strokeStyle = '#FCD34D';
      cx.lineWidth = 2;
      cx.stroke();
      cx.font = 'bold 12px Outfit,sans-serif';
      cx.fillStyle = '#FFFFFF';
      cx.textAlign = 'center';
      cx.fillText('CLICK TO HEAT-SEAL ⚡', 380, 419);
    }

    if (gs.solved) {
      this._drawSolvedBanner('🍱 ALL MEALS HYDRATED & SEALED!');
    }
  }

  /* ============================================================
     STAGE 4: TREADMILL T2 CARDIO WORKOUT (Exercise Bay)
  ============================================================ */
  _updateExerciseStage(dt) {
    const es = this.exerciseStage;

    /* Speed and distance accumulation */
    if (es.speed > 0) {
      es.speed = Math.max(0, es.speed - dt * 2.8);
      es.distance = Math.min(es.targetDistance, es.distance + (es.speed * dt * 1.8));
      es.stepAnim += dt * es.speed * 1.8;
      es.heartRate = Math.min(178, Math.round(105 + es.speed * 4.2));

      /* Update horizontal wind speed lines */
      for (const line of es.speedLines) {
        line.x -= (line.speed + es.speed * 32) * dt;
        if (line.x < 150) {
          line.x = 610 + Math.random() * 40;
          line.y = 110 + Math.random() * 240;
          line.len = 20 + Math.random() * 60;
        }
      }

      /* Spawn motion blur ghost trails at high speed */
      if (es.speed > 7 && Math.random() < 0.45) {
        es.ghosts.push({
          x: 380 - (Math.random() * 18 + 12),
          y: 265,
          lean: Math.min(0.35, es.speed * 0.02),
          stepAnim: es.stepAnim,
          alpha: 0.35
        });
      }

      /* Spawn sweat / spark particles */
      if (es.speed > 10 && Math.random() < 0.35) {
        es.sweatParticles.push({
          x: 390 + (Math.random() * 10 - 5),
          y: 215,
          vx: -(50 + Math.random() * 70),
          vy: -(15 + Math.random() * 35),
          alpha: 1
        });
      }
    } else {
      es.cadenceStreak = 0;
      es.heartRate = Math.max(105, es.heartRate - dt * 6);
    }

    /* Update ghost fade */
    for (let i = es.ghosts.length - 1; i >= 0; i--) {
      es.ghosts[i].alpha -= dt * 2.5;
      if (es.ghosts[i].alpha <= 0) es.ghosts.splice(i, 1);
    }

    /* Update sweat particles */
    for (let i = es.sweatParticles.length - 1; i >= 0; i--) {
      const sp = es.sweatParticles[i];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.vy += dt * 85;
      sp.alpha -= dt * 1.8;
      if (sp.alpha <= 0) es.sweatParticles.splice(i, 1);
    }

    /* Update combo timer */
    if (es.comboTimer > 0) {
      es.comboTimer -= dt;
      if (es.comboTimer <= 0) es.comboText = '';
    }

    /* Update pedal depression animations */
    if (es.pedalLeftPressed > 0) es.pedalLeftPressed = Math.max(0, es.pedalLeftPressed - dt * 6);
    if (es.pedalRightPressed > 0) es.pedalRightPressed = Math.max(0, es.pedalRightPressed - dt * 6);

    if (es.distance >= es.targetDistance && !es.solved) {
      es.solved = true;
      es.timer  = 1.8;
      this._playSound('correct');
      this._completeTask('exercise', 'spacesuit');
    }

    if (es.solved) {
      es.timer -= dt;
      if (es.timer <= 0) {
        this.phase = 'playing';
      }
    }
  }

  _exerciseStep(foot) {
    const es = this.exerciseStage;
    if (es.lastFoot !== foot) {
      es.speed = Math.min(20, es.speed + 3.4);
      es.lastFoot = foot;
      es.cadenceStreak++;

      if (foot === 'left') es.pedalLeftPressed = 1;
      else es.pedalRightPressed = 1;

      /* Cadence combo feedback */
      if (es.cadenceStreak === 4) {
        es.comboText = 'EXCELLENT STRIDE! ⚡';
        es.comboTimer = 1.2;
      } else if (es.cadenceStreak === 8) {
        es.comboText = 'CADENCE LOCKED: 165 SPM 🚀';
        es.comboTimer = 1.4;
      } else if (es.cadenceStreak >= 12 && es.cadenceStreak % 4 === 0) {
        es.comboText = 'TURBO SPRINT! 🔥';
        es.comboTimer = 1.4;
      }

      this._playSound('click');
    } else {
      /* Stumbled on same foot */
      es.speed = Math.max(2, es.speed - 2.5);
      es.cadenceStreak = 0;
      es.comboText = 'STUMBLE! ALTERNATE FEET ⚠';
      es.comboTimer = 1.0;
    }
  }

  _onExerciseClick() {
    /* Left pedal button (x: 230, y: 390, w: 120, h: 48) */
    if (this._inRect(this.mouse.x, this.mouse.y, 230, 390, 120, 48)) {
      this._exerciseStep('left');
    }
    /* Right pedal button (x: 410, y: 390, w: 120, h: 48) */
    else if (this._inRect(this.mouse.x, this.mouse.y, 410, 390, 120, 48)) {
      this._exerciseStep('right');
    }
  }

  _drawExerciseStage() {
    const cv = this.canvas, cx = this.ctx, es = this.exerciseStage;

    /* 1. Deep Space Gym Background */
    cx.fillStyle = '#090E17';
    cx.fillRect(0, 0, cv.width, cv.height);

    this._drawStageHeader('🏃 EXERCISE BAY — TREADMILL T2 CADENCE', 'Alternate Left (A / ←) & Right (D / →) pedals to build speed and complete 100 meters!');

    /* 2. Treadmill Platform Chassis (3D Perspective Deck) */
    const deckX = 140, deckY = 110, deckW = 480, deckH = 260;

    // Outer metal housing
    cx.fillStyle = '#111827';
    cx.fillRect(deckX, deckY, deckW, deckH);
    cx.strokeStyle = '#1E293B';
    cx.lineWidth = 3;
    cx.strokeRect(deckX, deckY, deckW, deckH);

    // Hazard safety side edges (yellow/black diagonal stripes)
    const stripeH = deckH;
    for (let sy = deckY; sy < deckY + stripeH; sy += 18) {
      cx.fillStyle = (Math.floor(sy / 18) % 2 === 0) ? '#EAB308' : '#1E293B';
      cx.fillRect(deckX, sy, 14, 18);
      cx.fillRect(deckX + deckW - 14, sy, 14, 18);
    }

    // Front & rear rotating steel rollers
    const rollerW = 12;
    // Front roller (left)
    cx.fillStyle = '#334155';
    cx.fillRect(deckX + 16, deckY + 16, rollerW, deckH - 32);
    // Rear roller (right)
    cx.fillRect(deckX + deckW - 28, deckY + 16, rollerW, deckH - 32);

    // Treadmill Belt (central running surface)
    const beltX = deckX + 30, beltY = deckY + 20, beltW = deckW - 60, beltH = deckH - 40;
    cx.fillStyle = '#0B0F19';
    cx.fillRect(beltX, beltY, beltW, beltH);

    // Moving ribbed textured slats on belt
    const slatSpacing = 22;
    const slatOffset = (es.stepAnim * 24) % slatSpacing;
    cx.strokeStyle = '#1E293B';
    cx.lineWidth = 2;
    for (let sx = beltX + slatSpacing - slatOffset; sx < beltX + beltW; sx += slatSpacing) {
      cx.beginPath();
      cx.moveTo(sx, beltY);
      cx.lineTo(sx - 12, beltY + beltH);
      cx.stroke();
    }

    // Glowing track lane guides
    cx.strokeStyle = 'rgba(74, 222, 128, 0.25)';
    cx.lineWidth = 1.5;
    cx.setLineDash([8, 8]);
    cx.beginPath();
    cx.moveTo(beltX, beltY + beltH * 0.35);
    cx.lineTo(beltX + beltW, beltY + beltH * 0.35);
    cx.moveTo(beltX, beltY + beltH * 0.75);
    cx.lineTo(beltX + beltW, beltY + beltH * 0.75);
    cx.stroke();
    cx.setLineDash([]);

    /* 3. Horizontal Wind Speed Lines (Velocity Streaks) */
    if (es.speed > 2) {
      const intensity = Math.min(1, es.speed / 16);
      for (const line of es.speedLines) {
        cx.beginPath();
        cx.moveTo(line.x, line.y);
        cx.lineTo(line.x - line.len * (0.8 + intensity), line.y);
        cx.strokeStyle = `rgba(56, 189, 248, ${line.alpha * intensity})`;
        cx.lineWidth = 1.5;
        cx.stroke();
      }
    }

    /* 4. Motion Blur Ghost Trails (After-Images) */
    for (const g of es.ghosts) {
      cx.save();
      cx.translate(g.x, g.y);
      cx.rotate(g.lean);
      this._drawRunnerSilhouette(cx, g.stepAnim, `rgba(56, 189, 248, ${g.alpha * 0.5})`);
      cx.restore();
    }

    /* 5. Draw Dynamic Articulated Running Astronaut */
    const centerX = 380;
    const baseY   = 285;
    const lean    = Math.min(0.35, es.speed * 0.02);
    const bob     = es.speed > 0 ? Math.abs(Math.sin(es.stepAnim * 2)) * 8 : 0;

    cx.save();
    cx.translate(centerX, baseY - bob);
    cx.rotate(lean);

    // Draw full runner astronaut with moving limbs
    this._drawRunningAstronaut(cx, es.stepAnim, es.speed);

    cx.restore();

    /* 6. Sweat / Energy Sparks flying off runner */
    for (const sp of es.sweatParticles) {
      cx.beginPath();
      cx.arc(sp.x, sp.y, 2.5, 0, Math.PI * 2);
      cx.fillStyle = `rgba(56, 189, 248, ${sp.alpha})`;
      cx.fill();
    }

    /* 7. Treadmill Side Handrails & Console Posts */
    cx.strokeStyle = '#475569';
    cx.lineWidth = 4;
    cx.lineCap = 'round';
    // Left handrail
    cx.beginPath();
    cx.moveTo(deckX + 40, deckY + 5);
    cx.lineTo(deckX + deckW - 60, deckY + 5);
    cx.stroke();
    // Front safety crossbar
    cx.beginPath();
    cx.moveTo(deckX + deckW - 60, deckY + 5);
    cx.lineTo(deckX + deckW - 60, deckY + 45);
    cx.stroke();

    /* 8. Top Telemetry Display HUD (Gauges, Heart Rate ECG, Distance) */
    // Background bar
    cx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    cx.fillRect(deckX + 15, deckY - 45, deckW - 30, 42);
    cx.strokeStyle = '#334155';
    cx.lineWidth = 1.5;
    cx.strokeRect(deckX + 15, deckY - 45, deckW - 30, 42);

    // Speed indicator with tachometer color
    cx.font = 'bold 13px JetBrains Mono,monospace';
    const speedColor = es.speed > 14 ? '#EF4444' : (es.speed > 8 ? '#10B981' : '#38BDF8');
    cx.fillStyle = speedColor;
    cx.textAlign = 'left';
    cx.fillText(`⚡ SPEED: ${es.speed.toFixed(1)} km/h`, deckX + 26, deckY - 20);

    // Real-time animated ECG pulse heartbeat monitor
    const ecgX = deckX + 195, ecgY = deckY - 24, ecgW = 85;
    cx.strokeStyle = '#10B981';
    cx.lineWidth = 1.5;
    cx.beginPath();
    const timeSec = performance.now() / 1000;
    const pulseOffset = (timeSec * (es.heartRate / 30)) % 1;
    cx.moveTo(ecgX, ecgY);
    cx.lineTo(ecgX + 18, ecgY);
    cx.lineTo(ecgX + 24, ecgY - 9);
    cx.lineTo(ecgX + 30, ecgY + 11);
    cx.lineTo(ecgX + 36, ecgY - 14);
    cx.lineTo(ecgX + 42, ecgY);
    cx.lineTo(ecgX + ecgW, ecgY);
    cx.stroke();

    cx.font = 'bold 11px JetBrains Mono,monospace';
    cx.fillStyle = '#10B981';
    cx.fillText(`♥ ${es.heartRate} BPM`, ecgX + ecgW + 8, deckY - 20);

    // Distance progress bar & readout
    const barX = deckX + 20, barY = deckY + 8, barW = deckW - 40, barH = 14;
    cx.fillStyle = '#0B0F19';
    cx.fillRect(barX, barY, barW, barH);
    cx.fillStyle = '#10B981';
    cx.fillRect(barX, barY, barW * (es.distance / es.targetDistance), barH);
    cx.strokeStyle = '#34D399';
    cx.lineWidth = 1;
    cx.strokeRect(barX, barY, barW, barH);

    cx.font = 'bold 10px JetBrains Mono,monospace';
    cx.fillStyle = '#FFFFFF';
    cx.textAlign = 'center';
    cx.fillText(`DISTANCE: ${Math.round(es.distance)}m / ${es.targetDistance}m (${Math.round((es.distance / es.targetDistance) * 100)}%)`, cv.width / 2, barY + 11);

    /* 9. Cadence Combo Text */
    if (es.comboText) {
      cx.font = 'bold 14px Outfit,sans-serif';
      cx.fillStyle = '#FACC15';
      cx.textAlign = 'center';
      cx.fillText(es.comboText, cv.width / 2, deckY + 50);
    }

    /* 10. Interactive Foot Pedals with 3D Depression Physics */
    // Left Pedal [A]
    const leftDepress = es.pedalLeftPressed * 4;
    cx.fillStyle = es.lastFoot === 'left' ? '#10B981' : '#1E293B';
    cx.beginPath();
    cx.roundRect(230, 390 + leftDepress, 125, 48 - leftDepress, 12);
    cx.fill();
    cx.strokeStyle = es.lastFoot === 'left' ? '#34D399' : '#475569';
    cx.lineWidth = es.lastFoot === 'left' ? 3 : 2;
    cx.stroke();

    cx.font = 'bold 12px Outfit,sans-serif';
    cx.fillStyle = '#FFFFFF';
    cx.textAlign = 'center';
    cx.fillText('LEFT [A / ←]', 292, 420 + leftDepress);

    // Right Pedal [D]
    const rightDepress = es.pedalRightPressed * 4;
    cx.fillStyle = es.lastFoot === 'right' ? '#10B981' : '#1E293B';
    cx.beginPath();
    cx.roundRect(405, 390 + rightDepress, 125, 48 - rightDepress, 12);
    cx.fill();
    cx.strokeStyle = es.lastFoot === 'right' ? '#34D399' : '#475569';
    cx.lineWidth = es.lastFoot === 'right' ? 3 : 2;
    cx.stroke();

    cx.font = 'bold 12px Outfit,sans-serif';
    cx.fillStyle = '#FFFFFF';
    cx.textAlign = 'center';
    cx.fillText('RIGHT [D / →]', 467, 420 + rightDepress);

    if (es.solved) {
      this._drawSolvedBanner('🏃 100m CADENCE WORKOUT COMPLETED!');
    }
  }

  /* Helper to draw the articulated vector running astronaut */
  _drawRunningAstronaut(cx, stepAnim, speed) {
    const phase = stepAnim;

    // Running limb angles
    const leftHipAng  = Math.sin(phase) * 0.75;
    const rightHipAng = Math.sin(phase + Math.PI) * 0.75;

    const leftKneeAng  = Math.max(0, Math.sin(phase - 0.4)) * 1.2;
    const rightKneeAng = Math.max(0, Math.sin(phase + Math.PI - 0.4)) * 1.2;

    const leftArmAng  = Math.sin(phase + Math.PI) * 0.65;
    const rightArmAng = Math.sin(phase) * 0.65;

    /* 1. Life support PLSS backpack (behind torso) */
    cx.fillStyle = '#94A3B8';
    cx.fillRect(-22, -60, 12, 34);
    cx.strokeStyle = '#334155';
    cx.lineWidth = 1.5;
    cx.strokeRect(-22, -60, 12, 34);

    /* 2. Left (Far) Arm */
    cx.save();
    cx.translate(-2, -50);
    cx.rotate(leftArmAng);
    cx.strokeStyle = '#CBD5E1';
    cx.lineWidth = 7;
    cx.lineCap = 'round';
    cx.beginPath();
    cx.moveTo(0, 0);
    cx.lineTo(12, 16);
    cx.lineTo(24, 12);
    cx.stroke();
    // Left glove
    cx.beginPath();
    cx.arc(24, 12, 5, 0, Math.PI * 2);
    cx.fillStyle = '#0284C7';
    cx.fill();
    cx.restore();

    /* 3. Left (Far) Leg */
    cx.save();
    cx.translate(-4, -20);
    cx.rotate(leftHipAng);
    cx.strokeStyle = '#CBD5E1';
    cx.lineWidth = 8;
    cx.lineCap = 'round';
    cx.beginPath();
    cx.moveTo(0, 0);
    cx.lineTo(0, 20);
    cx.stroke();

    cx.translate(0, 20);
    cx.rotate(leftKneeAng);
    cx.beginPath();
    cx.moveTo(0, 0);
    cx.lineTo(4, 22);
    cx.stroke();
    // Far boot
    cx.fillStyle = '#0F172A';
    cx.fillRect(0, 19, 14, 7);
    cx.restore();

    /* 4. Torso with astronaut suit and chest telemetry */
    cx.fillStyle = '#F8FAFC';
    cx.beginPath();
    cx.roundRect(-12, -62, 24, 42, 6);
    cx.fill();
    cx.strokeStyle = '#CBD5E1';
    cx.lineWidth = 1.5;
    cx.stroke();

    // Chest telemetry unit & NASA blue stripe
    cx.fillStyle = '#0284C7';
    cx.fillRect(-8, -48, 16, 6);
    cx.fillStyle = '#10B981';
    cx.beginPath();
    cx.arc(0, -32, 3, 0, Math.PI * 2);
    cx.fill();

    /* 5. Right (Near) Leg */
    cx.save();
    cx.translate(4, -20);
    cx.rotate(rightHipAng);
    cx.strokeStyle = '#F1F5F9';
    cx.lineWidth = 9;
    cx.lineCap = 'round';
    cx.beginPath();
    cx.moveTo(0, 0);
    cx.lineTo(0, 20);
    cx.stroke();

    cx.translate(0, 20);
    cx.rotate(rightKneeAng);
    cx.beginPath();
    cx.moveTo(0, 0);
    cx.lineTo(4, 22);
    cx.stroke();
    // Near boot with magnetic runner sole
    cx.fillStyle = '#0F172A';
    cx.fillRect(0, 19, 16, 8);
    cx.fillStyle = '#38BDF8';
    cx.fillRect(0, 25, 16, 2.5);
    cx.restore();

    /* 6. Right (Near) Arm */
    cx.save();
    cx.translate(4, -50);
    cx.rotate(rightArmAng);
    cx.strokeStyle = '#F8FAFC';
    cx.lineWidth = 8;
    cx.lineCap = 'round';
    cx.beginPath();
    cx.moveTo(0, 0);
    cx.lineTo(14, 16);
    cx.lineTo(26, 12);
    cx.stroke();
    // Near glove
    cx.beginPath();
    cx.arc(26, 12, 5.5, 0, Math.PI * 2);
    cx.fillStyle = '#0284C7';
    cx.fill();
    cx.restore();

    /* 7. Astronaut Helmet with reflective Gold Visor */
    cx.fillStyle = '#F8FAFC';
    cx.beginPath();
    cx.arc(0, -74, 16, 0, Math.PI * 2);
    cx.fill();
    cx.strokeStyle = '#CBD5E1';
    cx.lineWidth = 1.5;
    cx.stroke();

    // Gold reflective EVA visor
    const grad = cx.createLinearGradient(0, -82, 14, -66);
    grad.addColorStop(0, '#F59E0B');
    grad.addColorStop(0.5, '#FCD34D');
    grad.addColorStop(1, '#B45309');
    cx.fillStyle = grad;
    cx.beginPath();
    cx.ellipse(6, -74, 8, 10, 0, 0, Math.PI * 2);
    cx.fill();
    cx.strokeStyle = '#78350F';
    cx.lineWidth = 1;
    cx.stroke();

    // Visor light reflection flare
    cx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    cx.beginPath();
    cx.ellipse(4, -77, 3, 4, -0.4, 0, Math.PI * 2);
    cx.fill();
  }

  /* Helper to draw motion blur ghost silhouette */
  _drawRunnerSilhouette(cx, stepAnim, color) {
    cx.fillStyle = color;
    cx.beginPath();
    cx.arc(0, -74, 16, 0, Math.PI * 2);
    cx.fill();
    cx.beginPath();
    cx.roundRect(-12, -62, 24, 42, 6);
    cx.fill();
  }

  /* ============================================================
     STAGE 5: RADIO FREQUENCY WAVEFORM ALIGNMENT (Comms Room)
  ============================================================ */
  _updateCommsStage(dt) {
    const cs = this.commsStage;
    if (cs.solved) {
      cs.timer -= dt;
      if (cs.timer <= 0) {
        this.phase = 'playing';
      }
    }
  }

  _checkCommsLock() {
    const cs = this.commsStage;
    const freqErr = Math.abs(cs.playerFreq - cs.targetFreq);
    const ampErr  = Math.abs(cs.playerAmp  - cs.targetAmp);

    const lock = Math.max(0, 100 - (freqErr * 25 + ampErr * 1.5));
    cs.lockPercent = Math.min(100, Math.round(lock));

    if (cs.lockPercent >= 94 && !cs.solved) {
      cs.solved = true;
      cs.timer  = 1.8;
      this._playSound('correct');
      this._completeTask('comms', 'teamwork');
    }
  }

  _drawCommsStage() {
    const cv = this.canvas, cx = this.ctx, cs = this.commsStage;

    cx.fillStyle = '#0F172A';
    cx.fillRect(0, 0, cv.width, cv.height);

    this._drawStageHeader('📡 COMMS ROOM — RADIO WAVEFORM ALIGNMENT', 'Drag the Frequency & Amplitude sliders until your cyan wave locks onto Houston (Yellow)!');

    /* CRT Oscilloscope Screen */
    const crtX = 110, crtY = 80, crtW = 540, crtH = 220;
    cx.fillStyle = '#05131A';
    cx.fillRect(crtX, crtY, crtW, crtH);
    cx.strokeStyle = cs.solved ? '#10B981' : '#0891B2';
    cx.lineWidth = 2;
    cx.strokeRect(crtX, crtY, crtW, crtH);

    /* Grid lines */
    cx.strokeStyle = 'rgba(8,145,178,0.2)';
    cx.lineWidth = 1;
    for (let x = crtX; x <= crtX + crtW; x += 30) {
      cx.beginPath(); cx.moveTo(x, crtY); cx.lineTo(x, crtY + crtH); cx.stroke();
    }
    for (let y = crtY; y <= crtY + crtH; y += 30) {
      cx.beginPath(); cx.moveTo(crtX, y); cx.lineTo(crtX + crtW, y); cx.stroke();
    }

    const midY = crtY + crtH / 2;
    const time = performance.now() / 1000;

    /* Target Wave (Houston - Yellow dashed) */
    cx.setLineDash([8, 6]);
    cx.strokeStyle = '#FACC15';
    cx.lineWidth = 2;
    cx.beginPath();
    for (let x = 0; x < crtW; x += 2) {
      const y = midY + Math.sin((x / crtW) * Math.PI * 2 * cs.targetFreq + time * 3) * cs.targetAmp;
      if (x === 0) cx.moveTo(crtX + x, y); else cx.lineTo(crtX + x, y);
    }
    cx.stroke();
    cx.setLineDash([]);

    /* Cadet Receiver Wave (Cyan solid) */
    cx.strokeStyle = cs.solved ? '#10B981' : '#38BDF8';
    cx.lineWidth = 2.5;
    cx.beginPath();
    for (let x = 0; x < crtW; x += 2) {
      const y = midY + Math.sin((x / crtW) * Math.PI * 2 * cs.playerFreq + time * 3) * cs.playerAmp;
      if (x === 0) cx.moveTo(crtX + x, y); else cx.lineTo(crtX + x, y);
    }
    cx.stroke();

    /* Signal Lock Indicator inside CRT */
    cx.font = 'bold 12px JetBrains Mono,monospace';
    cx.fillStyle = cs.lockPercent >= 90 ? '#10B981' : '#F59E0B';
    cx.textAlign = 'right';
    cx.fillText(`SIGNAL LOCK: ${cs.lockPercent}%`, crtX + crtW - 16, crtY + 24);

    /* Frequency Slider */
    this._drawSlider('FREQUENCY', cs.playerFreq, 1.0, 6.0, 180, 335, 'freq');

    /* Amplitude Slider */
    this._drawSlider('AMPLITUDE', cs.playerAmp, 10, 60, 180, 395, 'amp');

    if (cs.solved) {
      this._drawSolvedBanner('📡 SIGNAL LOCKED: HOUSTON ONLINE!');
    }
  }

  _drawSlider(label, val, min, max, x, y, id) {
    const cx = this.ctx;
    const w = 400;
    const ratio = (val - min) / (max - min);
    const knobX = x + ratio * w;

    cx.font = 'bold 10px Outfit,sans-serif';
    cx.fillStyle = '#94A3B8';
    cx.textAlign = 'left';
    cx.fillText(label, x, y - 6);

    /* Track */
    cx.fillStyle = '#1E293B';
    cx.fillRect(x, y, w, 8);
    cx.fillStyle = '#38BDF8';
    cx.fillRect(x, y, ratio * w, 8);
    cx.strokeStyle = '#475569';
    cx.lineWidth = 1;
    cx.strokeRect(x, y, w, 8);

    /* Knob */
    cx.beginPath();
    cx.arc(knobX, y + 4, 10, 0, Math.PI*2);
    cx.fillStyle = '#38BDF8';
    cx.fill();
    cx.strokeStyle = '#FFFFFF';
    cx.lineWidth = 2;
    cx.stroke();
  }

  /* ============================================================
     STAGE 6: CANADARM2 ROBOTIC ARM (UNCHANGED AS REQUESTED)
  ============================================================ */
  _updateArm(dt) {
    const arm = this.arm;

    arm.targetX = this.mouse.x;
    arm.targetY = this.mouse.y;
    arm.leeX += (arm.targetX - arm.leeX) * Math.min(1, dt * 8);
    arm.leeY += (arm.targetY - arm.leeY) * Math.min(1, dt * 8);

    this._solveIK(arm);

    for (let i = 0; i < arm.boxes.length; i++) {
      const box = arm.boxes[i];
      if (box.docked) continue;

      if (!box.latched) {
        box.x += box.vx * 40 * dt;
        box.y += box.vy * 40 * dt;
        if (box.x < 100) { box.x = 100; box.vx *= -1; }
        if (box.x > 680) { box.x = 680; box.vx *= -1; }
        if (box.y < 40)  { box.y = 40;  box.vy *= -1; }
        if (box.y > 440) { box.y = 440; box.vy *= -1; }

        const pinX = box.x - box.w/2;
        const pinY = box.y;
        const dist = this._dist(arm.leeX, arm.leeY, pinX, pinY);

        if (dist < 22) {
          box.snareProgress += dt / 1.2;
          if (box.snareProgress >= 1) {
            box.latched = true;
            box.snareProgress = 1;
            this._playSound('thruster');
            this._addNotification('📦 Box latched!');
          }
        } else {
          box.snareProgress = Math.max(0, box.snareProgress - dt * 0.6);
        }

        if (this.mouse.down && dist < 22) {
          box.snareProgress = Math.min(1, box.snareProgress + dt * 1.5);
        }
      } else {
        const port = arm.dockPorts[i];
        const tx = port.x + 20;
        const ty = port.y;
        box.x += (tx - box.x) * Math.min(1, dt * 2);
        box.y += (ty - box.y) * Math.min(1, dt * 2);

        if (Math.abs(box.x - tx) < 3 && Math.abs(box.y - ty) < 3) {
          box.docked = true;
          this._playSound('correct');
          this._addNotification(`📦 Box ${i+1} docked!`);
        }
      }
    }

    if (arm.boxes.every(b => b.docked) && !arm.allDocked) {
      arm.allDocked  = true;
      arm.celebTimer = 2.5;
      this._completeTask('armBay', 'docking');
      try { window.cosmicConfetti && window.cosmicConfetti.burst(380, 240, 60); } catch(e) {}
    }

    if (arm.allDocked) {
      arm.celebTimer -= dt;
      if (arm.celebTimer <= 0) {
        this.phase = 'playing';
      }
    }

    if (this.keys['Escape']) {
      this.keys['Escape'] = false;
      this.phase = 'playing';
    }
  }

  _solveIK(arm) {
    const { baseX, baseY, seg1Len, seg2Len, leeX, leeY } = arm;
    const dx    = leeX - baseX;
    const dy    = leeY - baseY;
    const dist  = Math.hypot(dx, dy);
    const reach = seg1Len + seg2Len;
    const clamped = Math.min(dist, reach * 0.98);
    const angle   = Math.atan2(dy, dx);

    if (dist < 1) { arm.a1 = Math.PI; arm.a2 = 0; return; }

    const cosA2 = (clamped*clamped - seg1Len*seg1Len - seg2Len*seg2Len) / (2 * seg1Len * seg2Len);
    const a2    = -Math.acos(Math.max(-1, Math.min(1, cosA2)));
    const k1    = seg1Len + seg2Len * Math.cos(a2);
    const k2    = seg2Len * Math.sin(a2);
    const a1    = angle - Math.atan2(k2, k1);

    arm.a1 = a1;
    arm.a2 = a2;
  }

  _tryLatch() {
    const arm = this.arm;
    for (const box of arm.boxes) {
      if (box.latched || box.docked) continue;
      const pinX = box.x - box.w/2;
      const pinY = box.y;
      if (this._dist(arm.leeX, arm.leeY, pinX, pinY) < 28) {
        box.snareProgress = Math.min(1, box.snareProgress + 0.25);
      }
    }
  }

  _drawArm() {
    const cv = this.canvas, cx = this.ctx, arm = this.arm;

    cx.fillStyle = '#020817';
    cx.fillRect(0, 0, cv.width, cv.height);
    this._drawStars(cx);

    /* Stage Exit button */
    this._drawStageHeader('🦾 ARM BAY — CANADARM2 BERTHING', 'Position the robotic arm over each box pin to snare and dock into the ISS ports!');

    /* ISS panel on left */
    cx.fillStyle = '#1E293B';
    cx.fillRect(0, 40, 100, cv.height - 40);
    cx.strokeStyle = '#38BDF8';
    cx.lineWidth = 2;
    cx.strokeRect(0, 40, 100, cv.height - 40);

    for (let i = 0; i < arm.dockPorts.length; i++) {
      const port = arm.dockPorts[i];
      const docked = arm.boxes[i].docked;
      cx.fillStyle   = docked ? '#10B981' : '#0F172A';
      cx.strokeStyle = docked ? '#34D399' : '#38BDF8';
      cx.lineWidth   = 2;
      cx.fillRect(port.x, port.y-20, 60, 40);
      cx.strokeRect(port.x, port.y-20, 60, 40);
      cx.font      = '9px Outfit,sans-serif';
      cx.fillStyle = docked ? '#34D399' : '#475569';
      cx.textAlign = 'center';
      cx.fillText(docked ? '✓ DOCKED' : `PORT ${i+1}`, port.x+30, port.y+4);
    }

    /* Arm base */
    cx.beginPath();
    cx.arc(arm.baseX, arm.baseY, 12, 0, Math.PI*2);
    cx.fillStyle   = '#475569';
    cx.fill();
    cx.strokeStyle = '#94A3B8';
    cx.lineWidth   = 2;
    cx.stroke();

    const ex = arm.baseX + arm.seg1Len * Math.cos(arm.a1);
    const ey = arm.baseY + arm.seg1Len * Math.sin(arm.a1);

    /* Segment 1 */
    cx.beginPath();
    cx.moveTo(arm.baseX, arm.baseY);
    cx.lineTo(ex, ey);
    cx.strokeStyle = '#94A3B8';
    cx.lineWidth   = 6;
    cx.lineCap     = 'round';
    cx.stroke();

    /* Elbow */
    cx.beginPath();
    cx.arc(ex, ey, 8, 0, Math.PI*2);
    cx.fillStyle = '#64748B';
    cx.fill();

    /* Segment 2 */
    cx.beginPath();
    cx.moveTo(ex, ey);
    cx.lineTo(arm.leeX, arm.leeY);
    cx.strokeStyle = '#94A3B8';
    cx.lineWidth   = 5;
    cx.stroke();

    /* LEE (End effector) */
    cx.beginPath();
    cx.arc(arm.leeX, arm.leeY, 10, 0, Math.PI*2);
    cx.fillStyle   = '#38BDF8';
    cx.fill();
    cx.strokeStyle = '#7DD3FC';
    cx.lineWidth   = 2;
    cx.stroke();

    cx.strokeStyle = '#fff';
    cx.lineWidth   = 1;
    cx.beginPath();
    cx.moveTo(arm.leeX-7, arm.leeY); cx.lineTo(arm.leeX+7, arm.leeY);
    cx.moveTo(arm.leeX, arm.leeY-7); cx.lineTo(arm.leeX, arm.leeY+7);
    cx.stroke();

    /* Cargo boxes */
    for (let i = 0; i < arm.boxes.length; i++) {
      const box = arm.boxes[i];
      if (box.docked) continue;

      if (box.snareProgress > 0) {
        cx.beginPath();
        cx.arc(box.x, box.y, box.w/2+8, 0, Math.PI*2);
        cx.fillStyle = `rgba(56,189,248,${box.snareProgress * 0.3})`;
        cx.fill();
      }

      cx.fillStyle   = box.color;
      cx.strokeStyle = box.latched ? '#38BDF8' : '#E2E8F0';
      cx.lineWidth   = box.latched ? 2.5 : 1.5;
      cx.fillRect(box.x-box.w/2, box.y-box.h/2, box.w, box.h);
      cx.strokeRect(box.x-box.w/2, box.y-box.h/2, box.w, box.h);

      const pinX = box.x - box.w/2;
      const pinY = box.y;
      cx.beginPath();
      cx.arc(pinX, pinY, 5, 0, Math.PI*2);
      cx.fillStyle   = '#FCD34D';
      cx.fill();
      cx.strokeStyle = '#F59E0B';
      cx.lineWidth   = 1.5;
      cx.stroke();

      if (box.snareProgress > 0 && !box.latched) {
        cx.beginPath();
        cx.arc(pinX, pinY, 12, -Math.PI/2, -Math.PI/2 + box.snareProgress * Math.PI*2);
        cx.strokeStyle = '#38BDF8';
        cx.lineWidth   = 2.5;
        cx.stroke();
      }

      cx.font      = 'bold 9px Outfit,sans-serif';
      cx.fillStyle = '#000';
      cx.textAlign = 'center';
      cx.fillText(`BOX ${i+1}`, box.x, box.y+4);
    }

    if (arm.allDocked) {
      this._drawSolvedBanner('🏆 ALL 3 CARGO BOXES DOCKED!');
    }
  }

  _drawStars(cx) {
    const seed = 42;
    for (let i = 0; i < 80; i++) {
      const sx = ((seed * (i+1) * 2654435761) >>> 0) % 760;
      const sy = ((seed * (i+1) * 2246822519) >>> 0) % 480;
      const sr = (i % 3 === 0) ? 1.5 : 0.8;
      cx.beginPath();
      cx.arc(sx, sy, sr, 0, Math.PI*2);
      cx.fillStyle = `rgba(255,255,255,${0.3 + (i%5)*0.1})`;
      cx.fill();
    }
  }

  /* ============================================================
     COMMON UI HELPERS FOR MINI-GAME STAGES
  ============================================================ */
  _drawStageHeader(title, instructions) {
    const cv = this.canvas, cx = this.ctx;

    /* Top bar backdrop */
    cx.fillStyle = 'rgba(8,12,20,0.95)';
    cx.fillRect(0, 0, cv.width, 42);

    /* Title */
    cx.font = 'bold 12px Outfit,sans-serif';
    cx.fillStyle = '#38BDF8';
    cx.textAlign = 'left';
    cx.fillText(title, 20, 18);

    /* Instructions */
    cx.font = '10px Outfit,sans-serif';
    cx.fillStyle = '#94A3B8';
    cx.fillText(instructions, 20, 33);

    /* Exit Stage Button */
    cx.fillStyle = '#1E293B';
    cx.beginPath();
    cx.roundRect(670, 8, 80, 26, 6);
    cx.fill();
    cx.strokeStyle = '#475569';
    cx.lineWidth = 1;
    cx.stroke();

    cx.font = 'bold 10px Outfit,sans-serif';
    cx.fillStyle = '#FCA5A5';
    cx.textAlign = 'center';
    cx.fillText('✕ Exit (ESC)', 710, 24);
  }

  _drawSolvedBanner(text) {
    const cv = this.canvas, cx = this.ctx;
    cx.fillStyle = 'rgba(2,6,23,0.85)';
    cx.fillRect(0, cv.height/2 - 40, cv.width, 80);

    cx.font = 'bold 22px Outfit,sans-serif';
    cx.fillStyle = '#10B981';
    cx.textAlign = 'center';
    cx.fillText(text, cv.width/2, cv.height/2 + 8);
  }

  _completeTask(roomKey, stateKey) {
    if (this.tasksDone[roomKey]) return;
    this.tasksDone[roomKey] = true;

    try {
      window.cadetState.completeTrainingActivity(stateKey, 150, 100);
    } catch(e) {}
    this._playSound('correct');

    const allDone = Object.values(this.tasksDone).every(Boolean);
    if (allDone) {
      try { window.cosmicConfetti && window.cosmicConfetti.burst(380, 240, 80); } catch(e) {}
      this._addNotification('🎉 All 6 tasks complete! You earned Astronaut Wings!');
    } else {
      this._addNotification(`✓ ${roomKey.charAt(0).toUpperCase()+roomKey.slice(1)} complete!`);
    }
  }

  _addNotification(msg) {
    this._notifications.push({ msg, timer: 2.5, alpha: 1 });
    if (this._notifications.length > 4) this._notifications.shift();
  }

  _updateNotifications(dt) {
    for (const n of this._notifications) {
      n.timer -= dt;
      n.alpha = Math.max(0, n.timer / 1.5);
    }
    this._notifications = this._notifications.filter(n => n.timer > 0);
  }

  _dist(x1, y1, x2, y2) { return Math.hypot(x2-x1, y2-y1); }

  _inRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  }

  _playSound(type) {
    try {
      if (!window.cosmicAudio) return;
      switch(type) {
        case 'click':    window.cosmicAudio.playClick();    break;
        case 'correct':  window.cosmicAudio.playCorrect();  break;
        case 'wrong':    window.cosmicAudio.playWrong();    break;
        case 'thruster': window.cosmicAudio.playThruster(); break;
      }
    } catch(e) {}
  }
}

/* ============================================================
   Export global instance
============================================================ */
window.astronautTraining = new AstronautTrainingManager();
