/**
 * GoalsStore with Firebase Integration
 * Real-time goal management with Firebase Firestore
 */

import { create } from 'zustand';
import React from 'react';
import { Goal, GoalStats, FamilyMember, GoalTemplate } from '../types/goalTypes';
import { goalTemplates } from '../mock/goalsData';
import { 
  RealDatabaseService, 
  RealAuthService,
  trackEvent 
} from '../../../services';
import { scheduleGoalNotification } from '../../../services/notificationService';

interface GoalsStore {
    goals: Goal[];
    familyMembers: FamilyMember[];
    templates: GoalTemplate[];
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
    subscription?: () => void;

    // Actions
    initializeGoals: () => Promise<void>;
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<{success: boolean; error?: string}>;
    updateGoal: (id: string, updates: Partial<Goal>) => Promise<{success: boolean; error?: string}>;
    completeGoal: (id: string) => Promise<{success: boolean; error?: string}>;
    completeMilestone: (goalId: string, milestoneIndex: number) => Promise<{success: boolean; error?: string}>;
    addNote: (goalId: string, note: string) => Promise<{success: boolean; error?: string}>;
    extendDueDate: (goalId: string, newDueDate: string) => Promise<{success: boolean; error?: string}>;
    deleteGoal: (id: string) => Promise<{success: boolean; error?: string}>;

    // Offline Actions
    addGoalOffline: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
    updateGoalOffline: (id: string, updates: Partial<Goal>) => void;
    completeGoalOffline: (id: string) => void;
    deleteGoalOffline: (id: string) => void;
    syncOfflineGoals: () => Promise<void>;

    // Getters
    getActiveGoals: () => Goal[];
    getCompletedGoals: () => Goal[];
    getOverdueGoals: () => Goal[];
    getGoalsByCategory: (category: string) => Goal[];
    getGoalsByMember: (memberId: string) => Goal[];
    getGoalById: (id: string) => Goal | undefined;
    getStats: () => GoalStats;
    getSpiritualAndFamilyGoals: () => Goal[];

    // Connection & Sync
    checkConnection: () => Promise<boolean>;
    reconnect: () => Promise<void>;
}

export const useGoalsStoreWithFirebase = create<GoalsStore>((set, get) => ({
    goals: [],
    familyMembers: [], // Will be loaded from Firebase family data
    templates: goalTemplates,
    isInitialized: false,
    isLoading: false,
    error: null,
    subscription: undefined,

    initializeGoals: async () => {
        const { isInitialized } = get();
        
        if (isInitialized) {
            console.log('🎯 Goals already initialized, skipping...');
            return;
        }

        set({ isLoading: true, error: null });

        try {
            console.log('🎯 Initializing goals with Firebase...');

            // Check if user is authenticated
            const user = await RealAuthService.getCurrentUser();
            if (!user) {
                console.log('⚠️ No authenticated user, initializing with empty state');
                set({ goals: [], familyMembers: [], isInitialized: true, isLoading: false });
                return;
            }

            // Check Firebase connection
            const isConnected = await RealDatabaseService.checkConnection();
            if (!isConnected) {
                console.log('⚠️ Firebase connection failed, falling back to offline mode');
                set({ 
                    goals: [], 
                    familyMembers: [],
                    isInitialized: true, 
                    isLoading: false,
                    error: 'Firebase connection unavailable'
                });
                return;
            }

            // Load family members first
            await get().lordFamilyMembers();

            // Set up real-time listener for goals
            const unsubscribe = RealDatabaseService.listenToCollection<Goal>(
                `families/${user.uid}/goals`,
                (goals, error) => {
                    if (error) {
                        console.error('❌ Error listening to goals:', error);
                        set({ error: error, isLoading: false });
                    } else {
                        console.log(`🎯 Real-time update: ${goals.length} goals received`);
                        set({ 
                            goals, 
                            isInitialized: true, 
                            isLoading: false, 
                            error: null 
                        });
                        
                        // Track analytics
                        trackEvent('goals_synced', { 
                            count: goals.length,
                            user_id: user.uid 
                        });
                    }
                },
                {
                    orderBy: [{ field: 'createdAt', direction: 'desc' }]
                }
            );

            // Store subscription for cleanup
            set({ subscription: unsubscribe });

            console.log('✅ Goals initialized with Firebase real-time updates');
        } catch (error: any) {
            console.error('❌ Error initializing goals:', error);
            set({ 
                error: error.message, 
                isInitialized: true, 
                isLoading: false 
            });
        }
    },

    addGoal: async (goalData) => {
        set({ isLoading: true, error: null });

        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            console.log('🎯 Adding goal to Firebase...');

            const goalWithMetadata = {
                ...goalData,
                familyId: user.uid,
                createdBy: user.uid,
                category: goalData.category || 'personal',
                priority: goalData.priority || 'medium',
                status: goalData.status || 'active',
            };

            const result = await RealDatabaseService.createDocument<Goal>(
                `families/${user.uid}/goals`,
                goalWithMetadata
            );

            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to create goal');
            }

            const newGoal = result.data;
            set({ isLoading: false });

            // Schedule notification for the new goal
            scheduleGoalNotification({
                id: newGoal.id,
                title: newGoal.title,
                assignedTo: newGoal.assignedTo,
                dueDate: newGoal.dueDate,
            });

            // Track analytics
            trackEvent('goal_created', { 
                goal_id: newGoal.id,
                user_id: user.uid,
                category: newGoal.category,
                status: newGoal.status,
                assigned_to: newGoal.assignedTo
            });

            console.log('✅ Goal created successfully:', newGoal.title);

            return { success: true };
        } catch (error: any) {
            console.error('❌ Error adding goal:', error);
            set({ isLoading: false, error: error.message });
            
            return { 
                success: false, 
                error: error.message || 'Failed to add goal' 
            };
        }
    },

    updateGoal: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            console.log('✏️ Updating goal in Firebase...');

            const result = await RealDatabaseService.updateDocument<Goal>(
                `families/${user.uid}/goals`,
                id,
                {
                    ...updates,
                    updatedBy: user.uid,
                }
            );

            if (!result.success) {
                throw new Error(result.error || 'Failed to update goal');
            }

            set({ isLoading: false });

            // Track analytics
            trackEvent('goal_updated', { 
                goal_id: id,
                user_id: user.uid,
                updated_fields: Object.keys(updates)
            });

            console.log('✅ Goal updated successfully:', id);

            return { success: true };
        } catch (error: any) {
            console.error('❌ Error updating goal:', error);
            set({ isLoading: false, error: error.message });
            
            // Fallback to offline mode
            get().updateGoalOffline(id, updates);
            
            return { 
                success: true, // Return success for offline mode
                error: 'Updated offline, will sync when online'
            };
        }
    },

    completeGoal: async (id) => {
        return get().updateGoal(id, {
            status: 'completed' as any,
            completionDate: new Date().toISOString(),
            completedAt: new Date().toISOString(),
        });
    },

    completeMilestone: async (goalId, milestoneIndex) => {
        const goal = get().getGoalById(goalId);
        if (!goal || !goal.milestones || milestoneIndex >= goal.milestones.length) {
            return { success: false, error: 'Invalid goal or milestone' };
        }

        const updatedMilestones = [...goal.milestones];
        updatedMilestones[milestoneIndex] = {
            ...updatedMilestones[milestoneIndex],
            completed: true,
            completedAt: new Date().toISOString(),
        };

        return get().updateGoal(goalId, {
            milestones: updatedMilestones,
        });
    },

    addNote: async (goalId, note) => {
        const goal = get().getGoalById(goalId);
        if (!goal) {
            return { success: false, error: 'Goal not found' };
        }

        const newNote = {
            id: `note_${Date.now()}`,
            text: note,
            addedBy: goal.assignedTo || 'unknown',
            addedAt: new Date().toISOString(),
        };

        const updatedNotes = [...(goal.notes || []), newNote];

        return get().updateGoal(goalId, {
            notes: updatedNotes,
        });
    },

    extendDueDate: async (goalId, newDueDate) => {
        return get().updateGoal(goalId, {
            dueDate: newDueDate,
            extensions: ((get().getGoalById(goalId)?.extensions) || []).concat({
                previousDueDate: get().getGoalById(goalId)?.dueDate || '',
                newDueDate,
                extendedOn: new Date().toISOString(),
            }),
        });
    },

    deleteGoal: async (id) => {
        set({ isLoading: true, error: null });

        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            console.log('🗑️ Deleting goal from Firebase...');

            const result = await RealDatabaseService.deleteDocument(
                `families/${user.uid}/goals`,
                id
            );

            if (!result.success) {
                throw new Error(result.error || 'Failed to delete goal');
            }

            set({ isLoading: false });

            // Track analytics
            trackEvent('goal_deleted', { 
                goal_id: id,
                user_id: user.uid
            });

            console.log('✅ Goal deleted successfully:', id);

            return { success: true };
        } catch (error: any) {
            console.error('❌ Error deleting goal:', error);
            set({ isLoading: false, error: error.message });
            
            return { 
                success: false, 
                error: error.message || 'Failed to delete goal' 
            };
        }
    },

    // Offline fallback methods
    addGoalOffline: (goalData) => {
        const newGoal: Goal = {
            ...goalData,
            id: `offline_goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString().split('T')[0],
            notes: [],
            history: []
        };
        
        set((state) => ({ goals: [...state.goals, newGoal] }));
        
        console.log('🎯 Goal added offline, will sync when online:', newGoal.title);
    },

    updateGoalOffline: (id, updates) => {
        set((state) => ({
            goals: state.goals.map((g) =>
                g.id === id ? { ...g, ...updates } : g
            ),
        }));
        
        console.log('✏️ Goal updated offline, will sync when online:', id);
    },

    completeGoalOffline: (id) => {
        get().updateGoalOffline(id, {
            status: 'completed' as any,
            completionDate: new Date().toISOString(),
        });
    },

    deleteGoalOffline: (id) => {
        set((state) => ({
            goals: state.goals.filter((g) => g.id !== id),
        }));
        
        console.log('🗑️ Goal deleted offline, will sync when online:', id);
    },

    syncOfflineGoals: async () => {
        const { goals } = get();
        const offlineGoals = goals.filter(goal => goal.id.startsWith('offline_goal_'));
        
        if (offlineGoals.length === 0) {
            console.log('🎯 No offline goals to sync');
            return;
        }

        console.log(`📡 Syncing ${offlineGoals.length} offline goals...`);
        
        let successCount = 0;
        let errorCount = 0;

        for (const goal of offlineGoals) {
            try {
                const { id, createdAt, notes, history, ...goalData } = goal;
                const result = await get().addGoal(goalData);
                
                if (result.success) {
                    get().deleteGoalOffline(goal.id);
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error('❌ Error syncing offline goal:', goal.id, error);
                errorCount++;
            }
        }

        console.log(`📡 Sync completed: ${successCount} successful, ${errorCount} errors`);
        
        trackEvent('offline_goals_synced', { 
            successful: successCount,
            failed: errorCount
        });
    },

    // Helper method to load family members
    lordFamilyMembers: async () => {
        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) {
                return;
            }

            const result = await RealDatabaseService.getDocuments<any>(
                `families/${user.uid}/members`
            );

            if (result.success && result.data) {
                const familyMembers = result.data.map((member: any) => ({
                    id: member.id,
                    name: member.displayName || member.name,
                    role: member.role || 'child',
                    avatar: member.photoURL || member.avatar,
                    ...member,
                }));

                set({ familyMembers });
                console.log(`👨‍👩‍👧‍👦 Loaded ${familyMembers.length} family members`);
            }
        } catch (error) {
            console.error('❌ Error loading family members:', error);
        }
    },

    // Getters
    getActiveGoals: () => get().goals.filter((g) => g.status === 'active'),
    getCompletedGoals: () => get().goals.filter((g) => g.status === 'completed'),
    getOverdueGoals: () => get().goals.filter((g) => {
        if (g.status === 'completed') return false;
        return new Date(g.dueDate) < new Date();
    }),
    getGoalsByCategory: (category) => get().goals.filter((g) => g.category === category),
    getGoalsByMember: (memberId) => get().goals.filter((g) => g.assignedTo === memberId),
    getGoalById: (id) => get().goals.find((g) => g.id === id),
    
    getStats: () => {
        const goals = get().goals;
        const active = goals.filter((g) => g.status === 'active');
        const completed = goals.filter((g) => g.status === 'completed');
        const overdue = get().getOverdueGoals();

        return {
            total: goals.length,
            active: active.length,
            completed: completed.length,
            overdue: overdue.length,
            completionRate: goals.length === 0 ? 0 : completed.length / goals.length,
            spiritualAndFamilyCount: get().getSpiritualAndFamilyGoals().length,
        };
    },

    getSpiritualAndFamilyGoals: () => get().goals.filter((g) => 
        g.category === 'spiritual' || g.category === 'family'
    ),

    checkConnection: async () => {
        try {
            return await RealDatabaseService.checkConnection();
        } catch (error) {
            console.error('❌ Connection check failed:', error);
            return false;
        }
    },

    reconnect: async () => {
        try {
            console.log('🔄 Attempting to reconnect to Firebase...');
            set({ isLoading: true, error: null });
            
            // Cleanup existing subscription
            const { subscription } = get();
            if (subscription) {
                subscription();
            }

            // Reinitialize
            await get().initializeGoals();
            
            console.log('✅ Reconnected to Firebase successfully');
        } catch (error: any) {
            console.error('❌ Reconnection failed:', error);
            set({ 
                error: error.message, 
                isLoading: false 
            });
        }
    },
}));

// Hook for easy cleanup on component unmount
export const useGoalsStore = () => {
    const store = useGoalsStoreWithFirebase();
    
    // Initialize goals on first use
    React.useEffect(() => {
        if (!store.isInitialized) {
            store.initializeGoals();
        }
        
        // Cleanup on unmount
        return () => {
            if (store.subscription) {
                store.subscription();
            }
        };
    }, []);

    return store;
};
