/**
 * Achievements Store with Firebase Integration
 * Real-time achievements management connected to Tasks, Goals, and Penalties
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { subscribe } from '@/lib/eventBus';
import * as Notifications from 'expo-notifications';
import Logger from '@/services/Logger';

export type Category = 'tasksCompleted' | 'goalsReached' | 'noPenalties' | 'specialEvents';

export interface AchievementTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: Category;
  maxProgress: number;
  isGlobal?: boolean;
}

export interface AchievementProgress {
  id: string;
  templateId: string;
  progress: number;
  maxProgress: number;
  achieved: boolean;
  achievedAt?: number;
  pointsAwarded?: number;
}

// Legacy Achievement type for backwards compatibility
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  achieved: boolean;
  assignedTo: string[];
  category: Category;
  progress?: number;
  maxProgress?: number;
}

interface State {
  templates: AchievementTemplate[];
  progressById: Record<string, AchievementProgress>;
  achievements: Achievement[]; // Legacy support
    loading: boolean;
    error: string | null;
  initialized: boolean;
  
  // Firebase integration
  init: (familyId: string, userId: string) => Promise<void>;
  cleanup: () => void;
  seedTemplates: (familyId: string) => Promise<void>;
  subscribeProgress: (familyId: string, userId: string) => () => void;
  subscribeEvents: (familyId: string, userId: string) => () => void;
  
  // Progress management
  applyEvent: (familyId: string, userId: string, category: Category, delta?: number) => Promise<void>;
  awardIfComplete: (familyId: string, userId: string, tpl: AchievementTemplate, prog: AchievementProgress) => Promise<void>;
  
  // Legacy methods (for backwards compatibility)
    addAchievement: (achievement: Omit<Achievement, 'id'>) => void;
    updateAchievement: (id: string, updates: Partial<Achievement>) => void;
    removeAchievement: (id: string) => void;
    markAchievementComplete: (id: string) => void;
    updateProgress: (id: string, progress: number) => void;
  getAchievementsByCategory: (category: Category) => Achievement[];
    getAchievementsByMember: (memberId: string) => Achievement[];
    getLeaderboard: () => { memberId: string; memberName: string; points: number }[];
}

// Unsubscribe functions storage
let progressUnsubscribe: (() => void) | null = null;
let eventsUnsubscribe: (() => void)[] = [];

export const useAchievementsStore = create<State>()(
  subscribeWithSelector((set, get) => ({
    templates: [],
    progressById: {},
    achievements: [], // Legacy
    loading: false,
    error: null,
    initialized: false,

    init: async (familyId: string, userId: string) => {
      if (get().initialized) {
        Logger.debug('🏆 Achievements already initialized');
        return;
      }

      set({ loading: true, error: null });
      Logger.debug('🏆 Initializing achievements system...');

      try {
        // 1. Load/seed templates
        await get().seedTemplates(familyId);
        
        // 2. Load templates from Firestore
        const templatesCol = collection(db, 'families', familyId, 'achievementTemplates');
        const templatesSnap = await getDocs(templatesCol);
        const templates: AchievementTemplate[] = [];
        templatesSnap.forEach(d => {
          templates.push(d.data() as AchievementTemplate);
        });
        
        Logger.debug(`🏆 Loaded ${templates.length} achievement templates`);
        set({ templates });

        // 3. Subscribe to user progress (real-time)
        const unsubProgress = get().subscribeProgress(familyId, userId);
        progressUnsubscribe = unsubProgress;

        // 4. Subscribe to events (tasks, goals, penalties)
        const unsubEvents = get().subscribeEvents(familyId, userId);
        eventsUnsubscribe.push(unsubEvents);

        set({ loading: false, initialized: true });
        Logger.debug('✅ Achievements system initialized successfully');
      } catch (error: any) {
        Logger.error('❌ Error initializing achievements:', error);
        set({ error: error.message, loading: false, initialized: false });
      }
    },

    cleanup: () => {
      Logger.debug('🧹 Cleaning up achievements subscriptions');
      
      if (progressUnsubscribe) {
        progressUnsubscribe();
        progressUnsubscribe = null;
      }
      
      eventsUnsubscribe.forEach(unsub => unsub());
      eventsUnsubscribe = [];
      
      set({ initialized: false });
    },

    seedTemplates: async (familyId: string) => {
      try {
        const templatesCol = collection(db, 'families', familyId, 'achievementTemplates');
        const existing = await getDocs(templatesCol);
        
        if (!existing.empty) {
          Logger.debug('🏆 Achievement templates already exist');
          return;
        }

        Logger.debug('🌱 Seeding achievement templates...');

        const baseTemplates: AchievementTemplate[] = [
          {
            id: 'task_master',
            title: 'Task Master',
            description: 'Complete 10 tasks successfully',
            icon: '⭐',
            points: 50,
            category: 'tasksCompleted',
            maxProgress: 10,
            isGlobal: true,
          },
          {
            id: 'goal_achiever',
            title: 'Goal Achiever',
            description: 'Complete your first family goal',
            icon: '🏆',
            points: 25,
            category: 'goalsReached',
            maxProgress: 1,
            isGlobal: true,
          },
          {
            id: 'exemplary_behavior',
            title: 'Exemplary Behavior',
            description: '7 days without penalties',
            icon: '🌟',
            points: 100,
            category: 'noPenalties',
            maxProgress: 7,
            isGlobal: true,
          },
          {
            id: 'family_night_star',
            title: 'Family Night Star',
            description: 'Participate in 5 family events',
            icon: '👨‍👩‍👧‍👦',
            points: 75,
            category: 'specialEvents',
            maxProgress: 5,
            isGlobal: true,
          },
          {
            id: 'dedicated_student',
            title: 'Dedicated Student',
            description: 'Complete 20 homework assignments',
            icon: '📚',
            points: 80,
            category: 'tasksCompleted',
            maxProgress: 20,
            isGlobal: true,
          },
        ];

        for (const template of baseTemplates) {
          await setDoc(
            doc(db, 'families', familyId, 'achievementTemplates', template.id),
            template,
            { merge: true }
          );
        }

        Logger.debug('✅ Achievement templates seeded successfully');
      } catch (error: any) {
        Logger.error('❌ Error seeding templates:', error);
      }
    },

    subscribeProgress: (familyId: string, userId: string) => {
      Logger.debug(`📡 Subscribing to achievement progress for user: ${userId}`);
      
      const progressCol = collection(db, 'families', familyId, 'members', userId, 'achievements');
      
      const unsubscribe = onSnapshot(progressCol, (snap) => {
        const map: Record<string, AchievementProgress> = {};
        
        snap.forEach(d => {
          map[d.id] = d.data() as AchievementProgress;
        });

        // Ensure all templates have progress entries
        const templates = get().templates;
        const merged = { ...map };
        
        for (const tpl of templates) {
          if (!merged[tpl.id]) {
            merged[tpl.id] = {
              id: tpl.id,
              templateId: tpl.id,
              progress: 0,
              maxProgress: tpl.maxProgress,
              achieved: false,
            };
          }
        }

        Logger.debug(`📊 Progress updated: ${Object.keys(merged).length} achievements`);
        set({ progressById: merged });

        // Update legacy achievements array
        get().syncLegacyAchievements();
      });

      return unsubscribe;
    },

    subscribeEvents: (familyId: string, userId: string) => {
      Logger.debug('📡 Subscribing to achievement events');

      const off1 = subscribe('task.completed', async ({ userId: u }) => {
        if (u === userId) {
          Logger.debug('✅ Task completed event received');
          await get().applyEvent(familyId, u, 'tasksCompleted', 1);
        }
      });

      const off2 = subscribe('goal.completed', async ({ userId: u }) => {
        if (u === userId) {
          Logger.debug('🎯 Goal completed event received');
          await get().applyEvent(familyId, u, 'goalsReached', 1);
        }
      });

      const off3 = subscribe('penalty.added', async ({ userId: u }) => {
        if (u === userId) {
          Logger.debug('⚠️ Penalty added event received - resetting noPenalties streak');
          // Reset all noPenalties achievements
          const tpls = get().templates.filter(t => t.category === 'noPenalties');
          for (const tpl of tpls) {
            const ref = doc(db, 'families', familyId, 'members', u, 'achievements', tpl.id);
            try {
              const snap = await getDoc(ref);
              if (snap.exists()) {
                await updateDoc(ref, { progress: 0 });
              } else {
                await setDoc(ref, {
                  id: tpl.id,
                  templateId: tpl.id,
                  progress: 0,
                  maxProgress: tpl.maxProgress,
                  achieved: false,
                });
              }
            } catch (error) {
              Logger.error('❌ Error resetting penalty streak:', error);
            }
          }
        }
      });

      const off4 = subscribe('event.participated', async ({ userId: u, eventType }) => {
        if (u === userId) {
          Logger.debug(`🎉 Event participation received: ${eventType}`);
          await get().applyEvent(familyId, u, 'specialEvents', 1);
        }
      });

      // Return combined unsubscribe function
      return () => {
        off1();
        off2();
        off3();
        off4();
      };
    },

    applyEvent: async (familyId: string, userId: string, category: Category, delta = 1) => {
      try {
        const templates = get().templates.filter(t => t.category === category);
        
        for (const tpl of templates) {
          const ref = doc(db, 'families', familyId, 'members', userId, 'achievements', tpl.id);
          const current = await getDoc(ref);
          
          const prog: AchievementProgress = current.exists()
            ? (current.data() as AchievementProgress)
            : {
                id: tpl.id,
                templateId: tpl.id,
                progress: 0,
                maxProgress: tpl.maxProgress,
                achieved: false,
              };

          // Don't increase progress if already achieved
          if (prog.achieved) continue;

          const newProgress = Math.min(tpl.maxProgress, (prog.progress ?? 0) + delta);
          
          await setDoc(
            ref,
            {
              ...prog,
              progress: newProgress,
              maxProgress: tpl.maxProgress,
            },
            { merge: true }
          );

          Logger.debug(`📈 Progress updated: ${tpl.title} - ${newProgress}/${tpl.maxProgress}`);

          // Check if completed
          await get().awardIfComplete(familyId, userId, tpl, { ...prog, progress: newProgress });
        }
      } catch (error: any) {
        Logger.error('❌ Error applying event:', error);
      }
    },

    awardIfComplete: async (familyId: string, userId: string, tpl: AchievementTemplate, prog: AchievementProgress) => {
      if (prog.progress >= tpl.maxProgress && !prog.achieved) {
        try {
          Logger.debug(`🏅 Achievement unlocked: ${tpl.title}`);

          // Mark as achieved
          const ref = doc(db, 'families', familyId, 'members', userId, 'achievements', tpl.id);
          await updateDoc(ref, {
            achieved: true,
            achievedAt: Date.now(),
            pointsAwarded: tpl.points,
          });

          // Update leaderboard
          const lbRef = doc(db, 'families', familyId, 'leaderboards', userId);
          await setDoc(
            lbRef,
            {
              userId,
              pointsTotal: increment(tpl.points),
              lastUpdated: serverTimestamp(),
            },
            { merge: true }
          );

          // Send local notification
          await notifyAchievementUnlocked(tpl.title, tpl.points);
        } catch (error: any) {
          Logger.error('❌ Error awarding achievement:', error);
        }
      }
    },

    // Helper to sync legacy achievements array
    syncLegacyAchievements: () => {
      const { templates, progressById } = get();
      const achievements: Achievement[] = templates.map(tpl => {
        const prog = progressById[tpl.id];
        return {
          id: tpl.id,
          title: tpl.title,
          description: tpl.description,
          icon: tpl.icon,
          points: tpl.points,
          achieved: prog?.achieved ?? false,
          assignedTo: ['current-user'], // Placeholder
          category: tpl.category,
          progress: prog?.progress ?? 0,
          maxProgress: tpl.maxProgress,
        };
      });
      set({ achievements });
    },

    // Legacy methods for backwards compatibility
    addAchievement: (achievement) => {
      Logger.warn('⚠️ addAchievement is deprecated. Use Firebase templates instead.');
        const newAchievement: Achievement = {
            ...achievement,
            id: Date.now().toString(),
        };
        set((state) => ({
            achievements: [...state.achievements, newAchievement],
        }));
    },

    updateAchievement: (id, updates) => {
      Logger.warn('⚠️ updateAchievement is deprecated. Use Firebase instead.');
        set((state) => ({
            achievements: state.achievements.map((achievement) =>
                achievement.id === id ? { ...achievement, ...updates } : achievement
            ),
        }));
    },

    removeAchievement: (id) => {
      Logger.warn('⚠️ removeAchievement is deprecated. Use Firebase instead.');
        set((state) => ({
            achievements: state.achievements.filter((achievement) => achievement.id !== id),
        }));
    },

    markAchievementComplete: (id) => {
      Logger.warn('⚠️ markAchievementComplete is deprecated. Use Firebase instead.');
        set((state) => ({
            achievements: state.achievements.map((achievement) =>
          achievement.id === id
            ? { ...achievement, achieved: true, progress: achievement.maxProgress }
            : achievement
            ),
        }));
    },

    updateProgress: (id, progress) => {
      Logger.warn('⚠️ updateProgress is deprecated. Use Firebase instead.');
        set((state) => ({
            achievements: state.achievements.map((achievement) =>
                achievement.id === id ? { ...achievement, progress } : achievement
            ),
        }));
    },

    getAchievementsByCategory: (category) => {
        return get().achievements.filter((achievement) => achievement.category === category);
    },

    getAchievementsByMember: (memberId) => {
        return get().achievements.filter((achievement) =>
            achievement.assignedTo.includes(memberId)
        );
    },

    getLeaderboard: () => {
        const achievements = get().achievements;
        const memberPoints: { [key: string]: { memberName: string; points: number } } = {};

        achievements.forEach((achievement) => {
            if (achievement.achieved) {
                achievement.assignedTo.forEach((memberId) => {
                    if (!memberPoints[memberId]) {
              memberPoints[memberId] = {
                memberName: `Member ${memberId}`,
                points: 0,
              };
                    }
                    memberPoints[memberId].points += achievement.points;
                });
            }
        });

        return Object.entries(memberPoints)
            .map(([memberId, data]) => ({ memberId, ...data }))
            .sort((a, b) => b.points - a.points);
    },
  }))
);

/**
 * Local notification helper
 */
export async function notifyAchievementUnlocked(title: string, points: number) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏅 ¡Logro desbloqueado!',
        body: `${title} (+${points} pts)`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Immediate
    });
    Logger.debug(`📬 Notification sent: ${title}`);
  } catch (error) {
    Logger.error('❌ Error sending notification:', error);
  }
}

/**
 * Daily tick helper for "no penalties" streak
 */
export async function dailyNoPenaltyTick(familyId: string, userId: string) {
  try {
    const store = useAchievementsStore.getState();
    const tpls = store.templates.filter(t => t.category === 'noPenalties');

    for (const tpl of tpls) {
      const ref = doc(db, 'families', familyId, 'members', userId, 'achievements', tpl.id);
      const snap = await getDoc(ref);
      const curr = snap.exists() ? (snap.data() as AchievementProgress) : null;

      // Check if we already ticked today
      const lastTickKey = `noPenaltyTick_${tpl.id}_${userId}`;
      const lastStr = await AsyncStorage.getItem(lastTickKey);
      const last = lastStr ? Number(lastStr) : 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = today.getTime();

      if (todayTimestamp > last && !curr?.achieved) {
        const newProgress = Math.min(tpl.maxProgress, (curr?.progress ?? 0) + 1);
        
        if (curr) {
          await updateDoc(ref, { progress: newProgress });
        } else {
          await setDoc(ref, {
            id: tpl.id,
            templateId: tpl.id,
            progress: newProgress,
            maxProgress: tpl.maxProgress,
            achieved: false,
          });
        }

        await AsyncStorage.setItem(lastTickKey, String(todayTimestamp));
        Logger.debug(`✅ Daily tick: ${tpl.title} - ${newProgress}/${tpl.maxProgress}`);
      }
    }
  } catch (error) {
    Logger.error('❌ Error in dailyNoPenaltyTick:', error);
  }
}
