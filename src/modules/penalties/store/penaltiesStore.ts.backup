import { create } from 'zustand';
import { Penalty, FamilyMember, PenaltyStats } from '../types/penaltyTypes';
import { mockPenalties, mockFamilyMembers, penaltyTypeConfigs } from '../mock/penaltiesData';
import { schedulePenaltyNotification } from '../../../services/notificationService';

interface PenaltiesStore {
    penalties: Penalty[];
    familyMembers: FamilyMember[];
    penaltyTypeConfigs: typeof penaltyTypeConfigs;
    isInitialized: boolean;

    // Actions
    addPenalty: (penalty: Omit<Penalty, 'id' | 'startTime' | 'remaining' | 'isActive' | 'endTime'>) => void;
    endPenalty: (id: string, reflection?: string) => void;
    adjustTime: (id: string, days: number) => void;
    addReflection: (id: string, text: string) => void;
    updatePenaltyTimer: () => void;
    initializeWithMockData: () => void;

    // Getters
    getActivePenalties: () => Penalty[];
    getCompletedPenalties: () => Penalty[];
    getPenaltyById: (id: string) => Penalty | undefined;
    getPenaltiesByMember: (memberId: string) => Penalty[];
    getPenaltiesByType: (type: 'yellow' | 'red') => Penalty[];
    getPenaltiesByMethod: (method: 'fixed' | 'random') => Penalty[];
    getStats: () => PenaltyStats & {
        yellowCards: number;
        redCards: number;
    };
    getMemberStats: (memberId: string) => {
        completedCount: number;
        timeServed: number;
        averageDuration: number;
        yellowCards: number;
        redCards: number;
    };
    getMemberById: (id: string) => FamilyMember | undefined;
}

export const usePenaltiesStore = create<PenaltiesStore>((set, get) => ({
    penalties: [],
    familyMembers: mockFamilyMembers,
    penaltyTypeConfigs: penaltyTypeConfigs,
    isInitialized: false,

    addPenalty: (penaltyData) => {
        const newPenalty: Penalty = {
            ...penaltyData,
            id: `penalty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            startTime: Date.now(),
            remaining: penaltyData.duration,
            isActive: true,
        };
        set((state) => ({ penalties: [...state.penalties, newPenalty] }));

        // Schedule notification for the new penalty
        schedulePenaltyNotification({
            id: newPenalty.id,
            title: `${newPenalty.penaltyType === 'yellow' ? 'Tarjeta Amarilla' : 'Tarjeta Roja'}: ${newPenalty.reason}`,
            assignedTo: newPenalty.memberName,
            duration: `${newPenalty.duration} días`,
            reason: newPenalty.reason,
        });
    },

    endPenalty: (id, reflection) => {
        set((state) => ({
            penalties: state.penalties.map((p) =>
                p.id === id
                    ? { ...p, isActive: false, remaining: 0, reflection, endTime: Date.now() }
                    : p
            ),
        }));
    },

    adjustTime: (id, days) => {
        set((state) => ({
            penalties: state.penalties.map((p) =>
                p.id === id && p.isActive
                    ? { ...p, remaining: Math.max(0, p.remaining + days) }
                    : p
            ),
        }));
    },

    addReflection: (id, text) => {
        set((state) => ({
            penalties: state.penalties.map((p) =>
                p.id === id ? { ...p, reflection: text } : p
            ),
        }));
    },

    updatePenaltyTimer: () => {
        set((state) => ({
            penalties: state.penalties.map((p) => {
                if (p.isActive) {
                    const elapsed = Math.floor((Date.now() - p.startTime) / (1000 * 60 * 60 * 24)); // days
                    const newRemaining = Math.max(0, p.duration - elapsed);
                    if (newRemaining === 0) {
                        return { ...p, remaining: 0, isActive: false, endTime: Date.now() };
                    }
                    return { ...p, remaining: newRemaining };
                }
                return p;
            }),
        }));
    },

    initializeWithMockData: () => {
        const { isInitialized } = get();
        if (!isInitialized) {
            set((state) => ({
                penalties: mockPenalties,
                isInitialized: true,
            }));
        }
    },

    getActivePenalties: () => get().penalties.filter((p) => p.isActive),
    getCompletedPenalties: () => get().penalties.filter((p) => !p.isActive),
    getPenaltyById: (id) => get().penalties.find((p) => p.id === id),
    getPenaltiesByMember: (memberId) => get().penalties.filter((p) => p.memberId === memberId),

    getPenaltiesByType: (type) => get().penalties.filter((p) => p.penaltyType === type),
    getPenaltiesByMethod: (method) => get().penalties.filter((p) => p.selectionMethod === method),

    getStats: () => {
        const penalties = get().penalties;
        const completed = penalties.filter((p) => !p.isActive);
        const totalTimeServed = completed.reduce((sum, p) => sum + p.duration, 0);
        const averageDuration = completed.length > 0 ? totalTimeServed / completed.length : 0;
        const yellowCards = penalties.filter((p) => p.penaltyType === 'yellow').length;
        const redCards = penalties.filter((p) => p.penaltyType === 'red').length;

        return {
            totalPenalties: penalties.length,
            activePenalties: penalties.filter((p) => p.isActive).length,
            completedPenalties: completed.length,
            totalTimeServed: totalTimeServed,
            averageDuration: parseFloat(averageDuration.toFixed(1)),
            mostCommonReason: 'behavior', // TODO: Calculate actual most common reason
            yellowCards,
            redCards,
        };
    },

    getMemberStats: (memberId) => {
        const memberPenalties = get().penalties.filter((p) => p.memberId === memberId);
        const completed = memberPenalties.filter((p) => !p.isActive);
        const timeServed = completed.reduce((sum, p) => sum + p.duration, 0);
        const averageDuration = completed.length > 0 ? timeServed / completed.length : 0;
        const yellowCards = memberPenalties.filter((p) => p.penaltyType === 'yellow').length;
        const redCards = memberPenalties.filter((p) => p.penaltyType === 'red').length;

        return {
            completedCount: completed.length,
            timeServed: timeServed,
            averageDuration: parseFloat(averageDuration.toFixed(1)),
            yellowCards,
            redCards,
        };
    },

    getMemberById: (id) => get().familyMembers.find((m) => m.id === id),
}));