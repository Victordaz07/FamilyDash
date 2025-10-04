import { create } from 'zustand';
import { Goal, GoalStats, FamilyMember, GoalTemplate } from '../types/goalTypes';
import { mockGoals, mockFamilyMembers, goalTemplates, getGoalStats } from '../mock/goalsData';
import { scheduleGoalNotification } from '../../../services/notificationService';

interface GoalsStore {
    goals: Goal[];
    familyMembers: FamilyMember[];
    templates: GoalTemplate[];
    isInitialized: boolean;

    // Actions
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    completeGoal: (id: string) => void;
    completeMilestone: (goalId: string, milestoneIndex: number) => void;
    addNote: (goalId: string, note: string) => void;
    extendDueDate: (goalId: string, newDueDate: string) => void;
    deleteGoal: (id: string) => void;

    // Getters
    getActiveGoals: () => Goal[];
    getCompletedGoals: () => Goal[];
    getOverdueGoals: () => Goal[];
    getGoalsByCategory: (category: string) => Goal[];
    getGoalsByMember: (memberId: string) => Goal[];
    getGoalById: (id: string) => Goal | undefined;
    getStats: () => GoalStats;
    getSpiritualAndFamilyGoals: () => Goal[];
    initializeWithMockData: () => void;
}

export const useGoalsStore = create<GoalsStore>((set, get) => ({
    goals: [],
    familyMembers: mockFamilyMembers,
    templates: goalTemplates,
    isInitialized: false,

    addGoal: (goalData) => {
        const newGoal: Goal = {
            ...goalData,
            id: `g${Date.now()}`,
            createdAt: new Date().toISOString().split('T')[0],
            notes: [],
            history: []
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));

        // Schedule notification for the new goal
        scheduleGoalNotification({
            id: newGoal.id,
            title: newGoal.title,
            assignedTo: newGoal.assignedTo,
            category: newGoal.category,
        });
    },

    updateGoal: (id, updates) => {
        set((state) => ({
            goals: state.goals.map((goal) =>
                goal.id === id ? { ...goal, ...updates } : goal
            ),
        }));
    },

    completeGoal: (id) => {
        set((state) => ({
            goals: state.goals.map((goal) =>
                goal.id === id
                    ? {
                        ...goal,
                        status: 'completed' as const,
                        completedAt: new Date().toISOString().split('T')[0],
                        progress: 100,
                        completedMilestones: goal.milestones,
                    }
                    : goal
            ),
        }));
    },

    completeMilestone: (goalId, milestoneIndex) => {
        set((state) => ({
            goals: state.goals.map((goal) => {
                if (goal.id === goalId) {
                    const newCompletedMilestones = Math.max(goal.completedMilestones, milestoneIndex + 1);
                    const newProgress = Math.round((newCompletedMilestones / goal.milestones) * 100);

                    const newHistoryEntry = {
                        id: `h${Date.now()}`,
                        date: new Date().toISOString().split('T')[0],
                        action: 'milestone_completed' as const,
                        description: `Completed milestone ${milestoneIndex + 1}`,
                        userId: 'current_user'
                    };

                    return {
                        ...goal,
                        completedMilestones: newCompletedMilestones,
                        progress: newProgress,
                        history: [...(goal.history || []), newHistoryEntry],
                        status: newProgress === 100 ? 'completed' as const : goal.status
                    };
                }
                return goal;
            }),
        }));
    },

    addNote: (goalId, note) => {
        set((state) => ({
            goals: state.goals.map((goal) =>
                goal.id === goalId
                    ? {
                        ...goal,
                        notes: [...(goal.notes || []), note],
                        history: [
                            ...(goal.history || []),
                            {
                                id: `h${Date.now()}`,
                                date: new Date().toISOString().split('T')[0],
                                action: 'note_added' as const,
                                description: 'Added a note',
                                userId: 'current_user'
                            }
                        ]
                    }
                    : goal
            ),
        }));
    },

    extendDueDate: (goalId, newDueDate) => {
        set((state) => ({
            goals: state.goals.map((goal) =>
                goal.id === goalId
                    ? {
                        ...goal,
                        dueDate: newDueDate,
                        history: [
                            ...(goal.history || []),
                            {
                                id: `h${Date.now()}`,
                                date: new Date().toISOString().split('T')[0],
                                action: 'due_date_extended' as const,
                                description: `Due date extended to ${newDueDate}`,
                                userId: 'current_user'
                            }
                        ]
                    }
                    : goal
            ),
        }));
    },

    deleteGoal: (id) => {
        set((state) => ({
            goals: state.goals.filter((goal) => goal.id !== id),
        }));
    },

    getActiveGoals: () => get().goals.filter((g) => g.status === 'active'),
    getCompletedGoals: () => get().goals.filter((g) => g.status === 'completed'),
    getOverdueGoals: () => get().goals.filter((g) => g.status === 'overdue'),
    getGoalsByCategory: (category) => get().goals.filter((g) => g.category === category),
    getGoalsByMember: (memberId) => get().goals.filter((g) => g.assignedTo.includes(memberId)),
    getGoalById: (id) => get().goals.find((g) => g.id === id),
    getStats: () => getGoalStats(get().goals),
    getSpiritualAndFamilyGoals: () => get().goals.filter((g) => g.category === 'spiritual' || g.category === 'family'),

    initializeWithMockData: () => {
        const { isInitialized } = get();
        if (!isInitialized) {
            set((state) => ({
                goals: mockGoals,
                isInitialized: true,
            }));
        }
    },
}));
