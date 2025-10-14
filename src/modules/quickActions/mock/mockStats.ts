import { FamilyStats } from '@/types/quickActionsTypes';

export const mockFamilyStats: FamilyStats = {
    totalTasks: 45,
    completedTasks: 38,
    activeGoals: 8,
    penalties: 3,
    safeRoomInteractions: 12,
    lastUpdated: '2024-01-15T20:00:00Z',
    memberStats: {
        '1': {
            tasksCompleted: 12,
            goalsReached: 3,
            penaltiesReceived: 0,
            safeRoomEntries: 2,
        },
        '2': {
            tasksCompleted: 10,
            goalsReached: 2,
            penaltiesReceived: 0,
            safeRoomEntries: 3,
        },
        '3': {
            tasksCompleted: 8,
            goalsReached: 1,
            penaltiesReceived: 1,
            safeRoomEntries: 4,
        },
        '4': {
            tasksCompleted: 6,
            goalsReached: 1,
            penaltiesReceived: 2,
            safeRoomEntries: 2,
        },
        '5': {
            tasksCompleted: 2,
            goalsReached: 0,
            penaltiesReceived: 0,
            safeRoomEntries: 1,
        },
    },
};
