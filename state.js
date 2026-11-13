/**
 * NASA Junior Astronaut Academy - State Management
 * Persists cadet profile, XP, ranks, stage completion, high scores, and settings to LocalStorage.
 */

const STORAGE_KEY = 'nasa_junior_astronaut_cadet_v1';

const RANKS = [
  { id: 'cadet', minXP: 0, titleEn: 'Cadet', titleAr: 'رائد مبتدئ', badgeIcon: '🚀' },
  { id: 'pilot', minXP: 300, titleEn: 'Pilot', titleAr: 'طيار فضائي', badgeIcon: '🛸' },
  { id: 'specialist', minXP: 700, titleEn: 'Specialist', titleAr: 'أخصائي استكشاف', badgeIcon: '🛰️' },
  { id: 'commander', minXP: 1200, titleEn: 'Commander', titleAr: 'قائد الأكاديمية', badgeIcon: '👑' }
];

const DEFAULT_STATE = {
  hasOnboarded: false,
  callSign: 'Nova Scout',
  avatar: 'bear', // 'rover' | 'bear' | 'cat' | 'explorer'
  xp: 0,
  lang: 'en', // 'en' | 'ar'
  muted: false,
  stages: {
    // Sector 1: Solar System Odyssey
    s1_1: { completed: false, unlocked: true, score: 0, stars: 0, completedAt: null },
    s1_2: { completed: false, unlocked: false, score: 0, stars: 0, completedAt: null },
    s1_3: { completed: false, unlocked: false, score: 0, stars: 0, completedAt: null },

    // Sector 2: Black Holes & Cosmic Mysteries
    s2_1: { completed: false, unlocked: false, score: 0, stars: 0, completedAt: null },
    s2_2: { completed: false, unlocked: false, score: 0, stars: 0, completedAt: null },
    s2_3: { completed: false, unlocked: false, score: 0, stars: 0, completedAt: null },

    // Sector 3: Galactic Frontiers
    s3_1: { completed: false, unlocked: false, score: 0, stars: 0, completedAt: null },
    s3_2: { completed: false, unlocked: false, score: 0, stars: 0, completedAt: null },
    s3_3: { completed: false, unlocked: false, score: 0, stars: 0, completedAt: null }
  },
  // Astronaut Training Section Modules
  training: {
    weightlessness: { completed: false, score: 0, completedAt: null },
    spacesuit: { completed: false, score: 0, completedAt: null },
    stationDay: { completed: false, score: 0, completedAt: null },
    emergency: { completed: false, score: 0, completedAt: null },
    teamwork: { completed: false, score: 0, completedAt: null },
    docking: { completed: false, score: 0, completedAt: null }
  },
  badgesEarned: [],
  createdAt: new Date().toISOString()
};

// Stage unlock sequence
const STAGE_ORDER = [
  's1_1', 's1_2', 's1_3',
  's2_1', 's2_2', 's2_3',
  's3_1', 's3_2', 's3_3'
];

class CadetStateManager {
  constructor() {
    this.state = this.load();
    this.listeners = [];
  }

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          stages: { ...DEFAULT_STATE.stages, ...(parsed.stages || {}) },
          training: { ...DEFAULT_STATE.training, ...(parsed.training || {}) }
        };
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notify();
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    for (const cb of this.listeners) {
      try { cb(this.state); } catch (e) { console.error(e); }
    }
  }

  getRank() {
    const xp = this.state.xp || 0;
    let current = RANKS[0];
    let next = RANKS[1];

    for (let i = 0; i < RANKS.length; i++) {
      if (xp >= RANKS[i].minXP) {
        current = RANKS[i];
        next = RANKS[i + 1] || null;
      }
    }

    return {
      current,
      next,
      progressPercent: next
        ? Math.min(100, Math.round(((xp - current.minXP) / (next.minXP - current.minXP)) * 100))
        : 100
    };
  }

  addXP(amount) {
    const oldRank = this.getRank().current.id;
    this.state.xp = (this.state.xp || 0) + amount;
    const newRank = this.getRank().current.id;
    const leveledUp = oldRank !== newRank;
    this.save();
    return { newXP: this.state.xp, leveledUp, rank: this.getRank().current };
  }

  completeStage(stageId, score = 100, stars = 3) {
    if (!this.state.stages[stageId]) {
      this.state.stages[stageId] = { completed: false, unlocked: true, score: 0, stars: 0 };
    }

    const currentStage = this.state.stages[stageId];
    const isFirstTime = !currentStage.completed;

    currentStage.completed = true;
    currentStage.score = Math.max(currentStage.score || 0, score);
    currentStage.stars = Math.max(currentStage.stars || 0, stars);
    currentStage.completedAt = new Date().toISOString();

    // Unlock next stage in sequence
    const currentIndex = STAGE_ORDER.indexOf(stageId);
    if (currentIndex !== -1 && currentIndex + 1 < STAGE_ORDER.length) {
      const nextStageId = STAGE_ORDER[currentIndex + 1];
      if (this.state.stages[nextStageId]) {
        this.state.stages[nextStageId].unlocked = true;
      }
    }

    // Also unlock first stage of sector 2 or sector 3 if all stages of prev sector done
    if (stageId === 's1_3' && this.state.stages.s2_1) {
      this.state.stages.s2_1.unlocked = true;
    }
    if (stageId === 's2_3' && this.state.stages.s3_1) {
      this.state.stages.s3_1.unlocked = true;
    }

    // Add badge if not yet earned
    if (!this.state.badgesEarned.includes(stageId)) {
      this.state.badgesEarned.push(stageId);
    }

    this.save();
    return { isFirstTime, unlockedNext: currentIndex + 1 < STAGE_ORDER.length ? STAGE_ORDER[currentIndex + 1] : null };
  }

  setCadetProfile(callSign, avatar) {
    this.state.hasOnboarded = true;
    if (callSign && callSign.trim()) {
      this.state.callSign = callSign.trim().slice(0, 24);
    }
    if (avatar) {
      this.state.avatar = avatar;
    }
    this.save();
  }

  setLang(lang) {
    this.state.lang = lang === 'ar' ? 'ar' : 'en';
    this.save();
  }

  setMuted(muted) {
    this.state.muted = Boolean(muted);
    this.save();
  }

  getCompletedCount() {
    return Object.values(this.state.stages).filter(s => s.completed).length;
  }

  isTrainingUnlocked() {
    const s = this.state.stages || {};
    const s1Done = Boolean(s.s1_1?.completed && s.s1_2?.completed && s.s1_3?.completed);
    const s2Done = Boolean(s.s2_1?.completed && s.s2_2?.completed && s.s2_3?.completed);
    const s3Done = Boolean(s.s3_1?.completed && s.s3_2?.completed && s.s3_3?.completed);
    return Boolean(s1Done && s2Done && s3Done);
  }

  isAllStagesCompleted() {
    return this.isTrainingUnlocked();
  }

  getSectorProgress(sectorNum) {
    const prefix = `s${sectorNum}_`;
    const sectorStages = Object.entries(this.state.stages).filter(([k]) => k.startsWith(prefix));
    const completed = sectorStages.filter(([_, s]) => s.completed).length;
    const total = sectorStages.length;
    const isUnlocked = sectorStages.some(([_, s]) => s.unlocked || s.completed);
    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      isUnlocked
    };
  }

  completeTrainingActivity(activityKey, xp = 150, score = 100) {
    if (!this.state.training) {
      this.state.training = JSON.parse(JSON.stringify(DEFAULT_STATE.training));
    }
    if (!this.state.training[activityKey]) {
      this.state.training[activityKey] = { completed: false, score: 0, completedAt: null };
    }
    const act = this.state.training[activityKey];
    const isFirstTime = !act.completed;
    act.completed = true;
    act.score = Math.max(act.score || 0, score);
    act.completedAt = new Date().toISOString();

    const badgeId = `badge_training_${activityKey}`;
    if (!this.state.badgesEarned.includes(badgeId)) {
      this.state.badgesEarned.push(badgeId);
    }

    if (isFirstTime) {
      this.addXP(xp);
    } else {
      this.save();
    }

    return { isFirstTime, newXP: this.state.xp };
  }

  getTrainingProgress() {
    if (!this.state.training) {
      this.state.training = JSON.parse(JSON.stringify(DEFAULT_STATE.training));
    }
    const entries = Object.entries(this.state.training);
    const completed = entries.filter(([_, s]) => s && s.completed).length;
    const total = entries.length;
    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  logout() {
    this.state.hasOnboarded = false;
    this.save();
  }

  resetProgress() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  }
}

window.cadetState = new CadetStateManager();
