/**
 * 🏆 ACHIEVEMENTS SLICE
 * Manages achievements, points, streaks, and progress tracking
 */

import { ACHIEVEMENTS, AchievementDefinition } from "@/features/achievements/definitions";
import { pushUnlock, pushStats } from "@/services/achievementsSync";
import { triggerAchievementUnlocked } from "@/services/notifications/triggers";

export interface AchievementState {
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
}

export interface DayEntry {
  dayKey: string;
  completed: number;
}

export interface StatsState {
  totalCompleted: number;
  dayKey: string;
  dayCompleted: number;
  streak: number;
  lastActiveDay?: string;
  weekWindow: DayEntry[];
}

export interface AchievementsState {
  achievements: Record<string, AchievementState>;
  points: number;
  stats: StatsState;
  
  // Actions
  checkAndAward: (event: { type: 'task_created' | 'task_completed' | 'login_day'; payload?: any }) => void;
  unlock: (achId: string) => void;
  addPoints: (n: number) => void;
  bumpDayCounters: (opts: { completedDelta: number }) => void;
}

/**
 * Get current day key (YYYY-MM-DD)
 */
const getDayKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Calculate if a day is consecutive from another
 */
const isConsecutiveDay = (prevDayKey: string, currentDayKey: string): boolean => {
  const prev = new Date(prevDayKey);
  const curr = new Date(currentDayKey);
  const diffTime = curr.getTime() - prev.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays === 1;
};

/**
 * Initial state
 */
export const initialAchievementsState: Pick<AchievementsState, 'achievements' | 'points' | 'stats'> = {
  achievements: {},
  points: 0,
  stats: {
    totalCompleted: 0,
    dayKey: getDayKey(),
    dayCompleted: 0,
    streak: 0,
    lastActiveDay: undefined,
    weekWindow: [],
  },
};

/**
 * Create achievements slice for Zustand store
 */
export const createAchievementsSlice = (set: any, get: any) => ({
  ...initialAchievementsState,
  
  /**
   * Main event handler - checks achievements based on current stats
   */
  checkAndAward: (event: { type: 'task_created' | 'task_completed' | 'login_day'; payload?: any }) => {
    const state = get();
    
    // Handle different event types
    switch (event.type) {
      case 'task_completed':
        state.bumpDayCounters({ completedDelta: 1 });
        break;
      case 'login_day':
        state.bumpDayCounters({ completedDelta: 0 }); // Just update streak, no task
        break;
      case 'task_created':
        // Future: achievements for creating tasks
        break;
    }
    
    // Check all achievements after stats update
    const updatedState = get();
    const stats = updatedState.stats;
    
    Object.values(ACHIEVEMENTS).forEach((def: AchievementDefinition) => {
      const achState = updatedState.achievements[def.id];
      
      // Skip if already unlocked
      if (achState?.unlocked) return;
      
      let shouldUnlock = false;
      
      switch (def.trigger) {
        case 'tasks_total':
          shouldUnlock = stats.totalCompleted >= def.threshold;
          break;
        case 'tasks_daily':
          shouldUnlock = stats.dayCompleted >= def.threshold;
          break;
        case 'streak_days':
          shouldUnlock = stats.streak >= def.threshold;
          break;
        case 'tasks_weekly':
          const weekTotal = stats.weekWindow.reduce((sum, day) => sum + day.completed, 0);
          shouldUnlock = weekTotal >= def.threshold;
          break;
      }
      
      if (shouldUnlock) {
        updatedState.unlock(def.id);
      }
    });
  },
  
  /**
   * Unlock an achievement (idempotent)
   */
  unlock: (achId: string) => {
    const state = get();
    if (state.achievements[achId]?.unlocked) return; // Already unlocked
    
    const def = ACHIEVEMENTS[achId];
    if (!def) return;
    
    set({
      achievements: {
        ...state.achievements,
        [achId]: {
          unlocked: true,
          unlockedAt: Date.now(),
          progress: def.threshold,
        },
      },
    });
    
    state.addPoints(def.points);
    
    // Push to Firestore
    void pushUnlock(achId);
    
    // Trigger notification
    triggerAchievementUnlocked(achId);
    
    // Show notification (future: use toast/confetti)
    console.log(`🏆 Achievement unlocked: ${def.title} (+${def.points} points)`);
  },
  
  /**
   * Add points
   */
  addPoints: (n: number) => {
    const state = get();
    set({ points: state.points + n });
    void pushStats();
  },
  
  /**
   * Bump day counters and manage streaks
   */
  bumpDayCounters: (opts: { completedDelta: number }) => {
    const state = get();
    const currentDayKey = getDayKey();
    const stats = state.stats;
    
    // Increment total
    const newTotalCompleted = stats.totalCompleted + opts.completedDelta;
    
    // Check if day changed
    const dayChanged = stats.dayKey !== currentDayKey;
    
    let newDayCompleted = stats.dayCompleted;
    let newStreak = stats.streak;
    let newLastActiveDay = stats.lastActiveDay;
    
    if (dayChanged) {
      // New day - reset day counter
      newDayCompleted = opts.completedDelta;
      
      // Update streak logic
      if (stats.lastActiveDay) {
        if (isConsecutiveDay(stats.lastActiveDay, currentDayKey)) {
          newStreak = stats.streak + 1;
        } else {
          newStreak = opts.completedDelta > 0 ? 1 : 0; // Reset or 0 if no activity
        }
      } else {
        newStreak = opts.completedDelta > 0 ? 1 : 0;
      }
      
      newLastActiveDay = opts.completedDelta > 0 ? currentDayKey : stats.lastActiveDay;
    } else {
      // Same day - just increment
      newDayCompleted = stats.dayCompleted + opts.completedDelta;
      if (opts.completedDelta > 0 && !stats.lastActiveDay) {
        newLastActiveDay = currentDayKey;
        newStreak = 1;
      }
    }
    
    // Update week window (rolling 7 days)
    let newWeekWindow = [...stats.weekWindow];
    
    if (dayChanged) {
      // Add new day entry
      newWeekWindow.push({ dayKey: currentDayKey, completed: opts.completedDelta });
      // Keep only last 7 days
      if (newWeekWindow.length > 7) {
        newWeekWindow = newWeekWindow.slice(-7);
      }
    } else {
      // Update current day entry
      const currentDayIndex = newWeekWindow.findIndex(d => d.dayKey === currentDayKey);
      if (currentDayIndex >= 0) {
        newWeekWindow[currentDayIndex].completed += opts.completedDelta;
      } else {
        newWeekWindow.push({ dayKey: currentDayKey, completed: opts.completedDelta });
        if (newWeekWindow.length > 7) {
          newWeekWindow = newWeekWindow.slice(-7);
        }
      }
    }
    
    set({
      stats: {
        ...stats,
        totalCompleted: newTotalCompleted,
        dayKey: currentDayKey,
        dayCompleted: newDayCompleted,
        streak: newStreak,
        lastActiveDay: newLastActiveDay,
        weekWindow: newWeekWindow,
      },
    });
    
    // Push to Firestore (throttled)
    void pushStats();
  },
});
