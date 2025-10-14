/**
 * 🏆 ACHIEVEMENTS DEFINITIONS
 * Catalog of all available achievements with triggers, points, and thresholds
 */

export type AchievementCategory = 'getting_started' | 'consistency' | 'helper' | 'habit_builder';

export type TriggerType = 
  | 'tasks_total'      // Total tasks completed (all time)
  | 'tasks_daily'      // Tasks completed in current day
  | 'streak_days'      // Consecutive days with activity
  | 'tasks_weekly';    // Tasks completed in last 7 days

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: string;
  points: number;
  trigger: TriggerType;
  threshold: number;
  hidden?: boolean;
}

/**
 * Complete catalog of achievements
 */
export const ACHIEVEMENTS: Record<string, AchievementDefinition> = {
  // ==================
  // GETTING STARTED
  // ==================
  first_task: {
    id: 'first_task',
    category: 'getting_started',
    title: 'First Steps',
    description: 'Complete your first task',
    icon: 'trophy',
    points: 10,
    trigger: 'tasks_total',
    threshold: 1,
  },
  
  five_tasks: {
    id: 'five_tasks',
    category: 'getting_started',
    title: 'Task Master',
    description: 'Complete 5 tasks',
    icon: 'star',
    points: 25,
    trigger: 'tasks_total',
    threshold: 5,
  },
  
  ten_tasks: {
    id: 'ten_tasks',
    category: 'getting_started',
    title: 'Dedicated Worker',
    description: 'Complete 10 tasks',
    icon: 'ribbon',
    points: 50,
    trigger: 'tasks_total',
    threshold: 10,
  },
  
  // ==================
  // CONSISTENCY
  // ==================
  daily_1: {
    id: 'daily_1',
    category: 'consistency',
    title: 'Daily Achiever',
    description: 'Complete at least 1 task today',
    icon: 'checkmark-circle',
    points: 10,
    trigger: 'tasks_daily',
    threshold: 1,
  },
  
  streak_3: {
    id: 'streak_3',
    category: 'consistency',
    title: 'On Fire!',
    description: '3 day streak - complete tasks 3 days in a row',
    icon: 'flame',
    points: 30,
    trigger: 'streak_days',
    threshold: 3,
  },
  
  streak_7: {
    id: 'streak_7',
    category: 'consistency',
    title: 'Unstoppable',
    description: '7 day streak - a full week of productivity!',
    icon: 'flash',
    points: 100,
    trigger: 'streak_days',
    threshold: 7,
  },
  
  // ==================
  // HELPER
  // ==================
  day_5_tasks: {
    id: 'day_5_tasks',
    category: 'helper',
    title: 'Super Helper',
    description: 'Complete 5 tasks in a single day',
    icon: 'hand-left',
    points: 40,
    trigger: 'tasks_daily',
    threshold: 5,
  },
  
  // ==================
  // HABIT BUILDER
  // ==================
  week_20_tasks: {
    id: 'week_20_tasks',
    category: 'habit_builder',
    title: 'Productivity Beast',
    description: 'Complete 20 tasks in the last 7 days',
    icon: 'trending-up',
    points: 80,
    trigger: 'tasks_weekly',
    threshold: 20,
  },
};

/**
 * Get achievements by category
 */
export const getAchievementsByCategory = (category: AchievementCategory): AchievementDefinition[] => {
  return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
};

/**
 * Get all achievement IDs
 */
export const getAllAchievementIds = (): string[] => {
  return Object.keys(ACHIEVEMENTS);
};

/**
 * Category display names
 */
export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  getting_started: 'Getting Started',
  consistency: 'Consistency',
  helper: 'Helper',
  habit_builder: 'Habit Builder',
};
