import { create } from 'zustand';
import { Achievement } from '../types/quickActionsTypes';
import { mockAchievements } from '../mock/mockAchievements';

interface AchievementsStore {
    achievements: Achievement[];
    loading: boolean;
    error: string | null;

    // Actions
    addAchievement: (achievement: Omit<Achievement, 'id'>) => void;
    updateAchievement: (id: string, updates: Partial<Achievement>) => void;
    removeAchievement: (id: string) => void;
    markAchievementComplete: (id: string) => void;
    updateProgress: (id: string, progress: number) => void;
    getAchievementsByCategory: (category: Achievement['category']) => Achievement[];
    getAchievementsByMember: (memberId: string) => Achievement[];
    getLeaderboard: () => { memberId: string; memberName: string; points: number }[];
}

export const useAchievementsStore = create<AchievementsStore>((set, get) => ({
    achievements: mockAchievements,
    loading: false,
    error: null,

    addAchievement: (achievement) => {
        const newAchievement: Achievement = {
            ...achievement,
            id: Date.now().toString(),
        };
        set((state) => ({
            achievements: [...state.achievements, newAchievement],
        }));
    },

    updateAchievement: (id, updates) => {
        set((state) => ({
            achievements: state.achievements.map((achievement) =>
                achievement.id === id ? { ...achievement, ...updates } : achievement
            ),
        }));
    },

    removeAchievement: (id) => {
        set((state) => ({
            achievements: state.achievements.filter((achievement) => achievement.id !== id),
        }));
    },

    markAchievementComplete: (id) => {
        set((state) => ({
            achievements: state.achievements.map((achievement) =>
                achievement.id === id ? { ...achievement, achieved: true, progress: achievement.maxProgress } : achievement
            ),
        }));
    },

    updateProgress: (id, progress) => {
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
        const memberPoints: { [key: string]: { name: string; points: number } } = {};

        achievements.forEach((achievement) => {
            if (achievement.achieved) {
                achievement.assignedTo.forEach((memberId) => {
                    if (!memberPoints[memberId]) {
                        memberPoints[memberId] = { name: `Member ${memberId}`, points: 0 };
                    }
                    memberPoints[memberId].points += achievement.points;
                });
            }
        });

        return Object.entries(memberPoints)
            .map(([memberId, data]) => ({ memberId, ...data }))
            .sort((a, b) => b.points - a.points);
    },
}));
