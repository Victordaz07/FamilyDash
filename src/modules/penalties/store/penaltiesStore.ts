import { create } from 'zustand';
import { Penalty, FamilyMember, PenaltyStats } from '../types/penaltyTypes';
import { mockPenalties, mockFamilyMembers } from '../mock/penaltiesData';

interface PenaltiesStore {
    penalties: Penalty[];
    familyMembers: FamilyMember[];

    // Actions
    addPenalty: (penalty: Omit<Penalty, 'id' | 'startTime'>) => void;
    endPenalty: (id: string, reflection?: string) => void;
    adjustTime: (id: string, minutes: number) => void;
    addReflection: (id: string, text: string) => void;
    updatePenaltyTimer: (id: string) => void;

    // Getters
    getActivePenalties: () => Penalty[];
    getCompletedPenalties: () => Penalty[];
    getPenaltyById: (id: string) => Penalty | undefined;
    getPenaltiesByMember: (memberId: string) => Penalty[];
    getStats: () => PenaltyStats;
    getMemberById: (id: string) => FamilyMember | undefined;
}

export const usePenaltiesStore = create<PenaltiesStore>((set, get) => ({
    penalties: mockPenalties,
    familyMembers: mockFamilyMembers,

    addPenalty: (penaltyData) => {
        const newPenalty: Penalty = {
            ...penaltyData,
            id: `p${Date.now()}`,
            startTime: Date.now(),
            isActive: true,
            remaining: penaltyData.duration
        };

        set((state) => ({
            penalties: [newPenalty, ...state.penalties]
        }));
    },

    endPenalty: (id, reflection) => {
        set((state) => ({
            penalties: state.penalties.map((penalty) =>
                penalty.id === id
                    ? {
                        ...penalty,
                        isActive: false,
                        remaining: 0,
                        endTime: Date.now(),
                        reflection: reflection || penalty.reflection
                    }
                    : penalty
            )
        }));
    },

    adjustTime: (id, minutes) => {
        set((state) => ({
            penalties: state.penalties.map((penalty) =>
                penalty.id === id && penalty.isActive
                    ? {
                        ...penalty,
                        remaining: Math.max(0, penalty.remaining + minutes),
                        duration: penalty.duration + minutes
                    }
                    : penalty
            )
        }));
    },

    addReflection: (id, text) => {
        set((state) => ({
            penalties: state.penalties.map((penalty) =>
                penalty.id === id
                    ? { ...penalty, reflection: text }
                    : penalty
            )
        }));
    },

    updatePenaltyTimer: (id) => {
        set((state) => ({
            penalties: state.penalties.map((penalty) => {
                if (penalty.id === id && penalty.isActive && penalty.remaining > 0) {
                    const newRemaining = penalty.remaining - 1;
                    return {
                        ...penalty,
                        remaining: newRemaining,
                        isActive: newRemaining > 0,
                        endTime: newRemaining <= 0 ? Date.now() : penalty.endTime
                    };
                }
                return penalty;
            })
        }));
    },

    // Getters
    getActivePenalties: () => {
        return get().penalties.filter(penalty => penalty.isActive);
    },

    getCompletedPenalties: () => {
        return get().penalties.filter(penalty => !penalty.isActive);
    },

    getPenaltyById: (id) => {
        return get().penalties.find(penalty => penalty.id === id);
    },

    getPenaltiesByMember: (memberId) => {
        return get().penalties.filter(penalty => penalty.memberId === memberId);
    },

    getStats: () => {
        const penalties = get().penalties;
        const activePenalties = penalties.filter(p => p.isActive);
        const completedPenalties = penalties.filter(p => !p.isActive);

        const totalTimeServed = completedPenalties.reduce((total, penalty) => {
            return total + (penalty.duration - (penalty.remaining || 0));
        }, 0);

        const averageDuration = penalties.length > 0
            ? penalties.reduce((total, penalty) => total + penalty.duration, 0) / penalties.length
            : 0;

        // Find most common reason
        const reasonCounts: { [key: string]: number } = {};
        penalties.forEach(penalty => {
            reasonCounts[penalty.reason] = (reasonCounts[penalty.reason] || 0) + 1;
        });

        const mostCommonReason = Object.keys(reasonCounts).reduce((a, b) =>
            reasonCounts[a] > reasonCounts[b] ? a : b, 'None'
        );

        return {
            totalPenalties: penalties.length,
            activePenalties: activePenalties.length,
            completedPenalties: completedPenalties.length,
            totalTimeServed,
            averageDuration: Math.round(averageDuration),
            mostCommonReason
        };
    },

    getMemberById: (id) => {
        return get().familyMembers.find(member => member.id === id);
    }
}));
