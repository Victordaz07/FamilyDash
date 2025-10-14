import { create } from 'zustand';
import { FamilyStats } from '@/types/quickActionsTypes';
import { mockFamilyStats } from '../mock/mockStats';

interface StatsStore {
    familyStats: FamilyStats;
    loading: boolean;
    error: string | null;

    // Actions
    updateStats: (stats: Partial<FamilyStats>) => void;
    incrementTaskCompleted: (memberId: string) => void;
    incrementGoalReached: (memberId: string) => void;
    incrementPenaltyReceived: (memberId: string) => void;
    incrementSafeRoomEntry: (memberId: string) => void;
    getMemberStats: (memberId: string) => FamilyStats['memberStats'][string] | undefined;
    getCompletionRate: () => number;
    getTopPerformer: () => { memberId: string; memberName: string; score: number } | null;
}

export const useStatsStore = create<StatsStore>((set, get) => ({
    familyStats: mockFamilyStats,
    loading: false,
    error: null,

    updateStats: (stats) => {
        set((state) => ({
            familyStats: { ...state.familyStats, ...stats, lastUpdated: new Date().toISOString() },
        }));
    },

    incrementTaskCompleted: (memberId) => {
        set((state) => {
            const memberStats = state.familyStats.memberStats[memberId];
            if (memberStats) {
                return {
                    familyStats: {
                        ...state.familyStats,
                        completedTasks: state.familyStats.completedTasks + 1,
                        memberStats: {
                            ...state.familyStats.memberStats,
                            [memberId]: {
                                ...memberStats,
                                tasksCompleted: memberStats.tasksCompleted + 1,
                            },
                        },
                        lastUpdated: new Date().toISOString(),
                    },
                };
            }
            return state;
        });
    },

    incrementGoalReached: (memberId) => {
        set((state) => {
            const memberStats = state.familyStats.memberStats[memberId];
            if (memberStats) {
                return {
                    familyStats: {
                        ...state.familyStats,
                        activeGoals: Math.max(0, state.familyStats.activeGoals - 1),
                        memberStats: {
                            ...state.familyStats.memberStats,
                            [memberId]: {
                                ...memberStats,
                                goalsReached: memberStats.goalsReached + 1,
                            },
                        },
                        lastUpdated: new Date().toISOString(),
                    },
                };
            }
            return state;
        });
    },

    incrementPenaltyReceived: (memberId) => {
        set((state) => {
            const memberStats = state.familyStats.memberStats[memberId];
            if (memberStats) {
                return {
                    familyStats: {
                        ...state.familyStats,
                        penalties: state.familyStats.penalties + 1,
                        memberStats: {
                            ...state.familyStats.memberStats,
                            [memberId]: {
                                ...memberStats,
                                penaltiesReceived: memberStats.penaltiesReceived + 1,
                            },
                        },
                        lastUpdated: new Date().toISOString(),
                    },
                };
            }
            return state;
        });
    },

    incrementSafeRoomEntry: (memberId) => {
        set((state) => {
            const memberStats = state.familyStats.memberStats[memberId];
            if (memberStats) {
                return {
                    familyStats: {
                        ...state.familyStats,
                        safeRoomInteractions: state.familyStats.safeRoomInteractions + 1,
                        memberStats: {
                            ...state.familyStats.memberStats,
                            [memberId]: {
                                ...memberStats,
                                safeRoomEntries: memberStats.safeRoomEntries + 1,
                            },
                        },
                        lastUpdated: new Date().toISOString(),
                    },
                };
            }
            return state;
        });
    },

    getMemberStats: (memberId) => {
        return get().familyStats.memberStats[memberId];
    },

    getCompletionRate: () => {
        const stats = get().familyStats;
        return stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
    },

    getTopPerformer: () => {
        const stats = get().familyStats;
        const members = Object.entries(stats.memberStats);

        if (members.length === 0) return null;

        const topMember = members.reduce((top, [memberId, memberStats]) => {
            const score = memberStats.tasksCompleted + memberStats.goalsReached - memberStats.penaltiesReceived;
            const topScore = top.memberStats.tasksCompleted + top.memberStats.goalsReached - top.memberStats.penaltiesReceived;

            return score > topScore ? { memberId, memberStats } : top;
        }, { memberId: members[0][0], memberStats: members[0][1] });

        return {
            memberId: topMember.memberId,
            memberName: `Member ${topMember.memberId}`,
            score: topMember.memberStats.tasksCompleted + topMember.memberStats.goalsReached - topMember.memberStats.penaltiesReceived,
        };
    },
}));




