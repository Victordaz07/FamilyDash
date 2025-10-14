/**
 * PenaltiesStore with Firebase Integration
 * Real-time penalties management with Firebase Firestore
 */

import { create } from 'zustand';
import React from 'react';
import { Penalty, FamilyMember, PenaltyStats } from '@/types/penaltyTypes';
import { penaltyTypeConfigs } from '../mock/penaltiesData';
import { 
  RealDatabaseService, 
  RealAuthService,
  trackEvent 
} from '../../../services';
import { schedulePenaltyNotification } from '@/services/notificationService';

interface PenaltiesStore {
    penalties: Penalty[];
    familyMembers: FamilyMember[];
    penaltyTypeConfigs: typeof penaltyTypeConfigs;
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
    subscription?: () => void;

    // Actions
    initializePenalties: () => Promise<void>;
    addPenalty: (penalty: Omit<Penalty, 'id' | 'startTime' | 'remaining' | 'isActive' | 'endTime'>) => Promise<{success: boolean; error?: string}>;
    endPenalty: (id: string, reflection?: string) => Promise<{success: boolean; error?: string}>;
    adjustTime: (id: string, days: number) => Promise<{success: boolean; error?: string}>;
    addReflection: (id: string, text: string) => Promise<{success: boolean; error?: string}>;
    updatePenaltyTimer: () => Promise<void>;

    // Offline Actions
    addPenaltyOffline: (penalty: Omit<Penalty, 'id' | 'startTime' | 'remaining' | 'isActive' | 'endTime'>) => void;
    endPenaltyOffline: (id: string, reflection?: string) => void;
    adjustTimeOffline: (id: string, days: number) => void;
    updatePenaltyTimerOffline: () => void;
    syncOfflinePenalties: () => Promise<void>;

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

    // Connection & Sync
    checkConnection: () => Promise<boolean>;
    reconnect: () => Promise<void>;
}

export const usePenaltiesStoreWithFirebase = create<PenaltiesStore>((set, get) => ({
    penalties: [],
    familyMembers: [],
    penaltyTypeConfigs: penaltyTypeConfigs,
    isInitialized: false,
    isLoading: false,
    error: null,
    subscription: undefined,

    initializePenalties: async () => {
        const { isInitialized } = get();
        
        if (isInitialized) {
            console.log('⚖️ Penalties already initialized, skipping...');
            return;
        }

        set({ isLoading: true, error: null });

        try {
            console.log('⚖️ Initializing penalties with Firebase...');

            // Check if user is authenticated
            const user = await RealAuthService.getCurrentUser();
            if (!user) {
                console.log('⚠️ No authenticated user, initializing with empty state');
                set({ penalties: [], familyMembers: [], isInitialized: true, isLoading: false });
                return;
            }

            // Check Firebase connection
            const isConnected = await RealDatabaseService.checkConnection();
            if (!isConnected) {
                console.log('⚠️ Firebase connection failed, falling back to offline mode');
                set({ 
                    penalties: [], 
                    familyMembers: [],
                    isInitialized: true, 
                    isLoading: false,
                    error: 'Firebase connection unavailable'
                });
                return;
            }

            // Load família members
            await get().lordFamilyMembers();

            // Set up real-time listener for penalties
            const unsubscribe = RealDatabaseService.listenToCollection<Penalty>(
                `families/${user.uid}/penalties`,
                (penalties, error) => {
                    if (error) {
                        console.error('❌ Error listening to penalties:', error);
                        set({ error: error, isLoading: false });
                    } else {
                        console.log(`⚖️ Real-time update: ${penalties.length} penalties received`);
                        
                        // Update penalty timers
                        const updatedPenalties = penalties.map(penalty => {
                            if (penalty.isActive && penalty.endTime) {
                                const now = new Date().getTime();
                                const endTime = new Date(penalty.endTime).getTime();
                                const remaining = Math.max(0, endTime - now);
                                
                                return {
                                    ...penalty,
                                    remaining: Math.ceil(remaining / (1000 * 60 * 60 * 24)), // Convert to days
                                    isActive: remaining > 0
                                };
                            }
                            return penalty;
                        });

                        set({ 
                            penalties: updatedPenalties, 
                            isInitialized: true, 
                            isLoading: false, 
                            error: null 
                        });
                        
                        // Track analytics
                        trackEvent('penalties_synced', { 
                            count: penalties.length,
                            user_id: user.uid 
                        });
                    }
                },
                {
                    orderBy: [{ field: 'startTime', direction: 'desc' }]
                }
            );

            // Store subscription for cleanup
            set({ subscription: unsubscribe });

            console.log('✅ Penalties initialized with Firebase real-time updates');
        } catch (error: any) {
            console.error('❌ Error initializing penalties:', error);
            set({ 
                error: error.message, 
                isInitialized: true, 
                isLoading: false 
            });
        }
    },

    addPenalty: async (penaltyData) => {
        set({ isLoading: true, error: null });

        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            console.log('⚖️ Adding penalty to Firebase...');

            const now = new Date();
            const endTime = new Date(now.getTime() + (penaltyData.durationDays * 24 * 60 * 60 * 1000));

            const penaltyWithMetadata = {
                ...penaltyData,
                familyId: user.uid,
                assignedBy: user.uid,
                startTime: now.toISOString(),
                endTime: endTime.toISOString(),
                remaining: penaltyData.durationDays,
                isActive: true,
                isCompleted: false,
                reflections: [],
                timeAdjustments: [],
            };

            const result = await RealDatabaseService.createDocument<Penalty>(
                `families/${user.uid}/penalties`,
                penaltyWithMetadata
            );

            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to create penalty');
            }

            const newPenalty = result.data;
            set({ isLoading: false });

            // Schedule notification for the new penalty
            schedulePenaltyNotification({
                id: newPenalty.id,
                type: newPenalty.type,
                assignedTo: newPenalty.assignedTo,
                durationDays: newPenalty.durationDays,
                reasons: newPenalty.reasons,
            });

            // Track analytics
            trackEvent('penalty_created', { 
                penalty_id: newPenalty.id,
                user_id: user.uid,
                type: newPenalty.type,
                duration: newPenalty.durationDays,
                assigned_to: newPenalty.assignedTo,
                method: newPenalty.method
            });

            console.log('✅ Penalty created successfully:', newPenalty.type);

            return { success: true };
        } catch (error: any) {
            console.error('❌ Error adding penalty:', error);
            set({ isLoading: false, error: error.message });
            
            return { 
                success: false, 
                error: error.message || 'Failed to add penalty' 
            };
        }
    },

    endPenalty: async (id, reflection) => {
        set({ isLoading: true, error: null });

        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            console.log('🏁 Ending penalty in Firebase...');

            const updates: Partial< Penalty> = {
                isActive: false,
                isCompleted: true,
                completedAt: new Date().toISOString(),
            };

            if (reflection) {
                const reflectionEntry = {
                    id: `reflection_${Date.now()}`,
                    text: reflection,
                    addedAt: new Date().toISOString(),
                    addedBy: user.uid,
                };

                const penalty = get().getPenaltyById(id);
                updates.reflections = [...(penalty?.reflections || []), reflectionEntry];
            }

            const result = await RealDatabaseService.updateDocument<Penalty>(
                `families/${user.uid}/penalties`,
                id,
                updates
            );

            if (!result.success) {
                throw new Error(result.error || 'Failed to update penalty');
            }

            set({ isLoading: false });

            // Track analytics
            trackEvent('penalty_completed', { 
                penalty_id: id,
                user_id: user.uid,
                has_reflection: !!reflection
            });

            console.log('✅ Penalty completed successfully:', id);

            return { success: true };
        } catch (error: any) {
            console.error('❌ Error ending penalty:', error);
            set({ isLoading: false, error: error.message });
            
            // Fallback to offline mode
            get().endPenaltyOffline(id, reflection);
            
            return { 
                success: true, 
                error: 'Completed offline, will sync when online'
            };
        }
    },

    adjustTime: async (id, days) => {
        set({ isLoading: true, error: null });

        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            console.log(`⏰ Adjusting penalty time in Firebase: ${days} days for ${id}`);

            const penalty = get().getPenaltyById(id);
            if (!penalty) {
                throw new Error('Penalty not found');
            }

            const timeAdjustment = {
                id: `adjustment_${Date.now()}`,
                days: days,
                adjustedAt: new Date().toISOString(),
                adjustedBy: user.uid,
                reason: 'Manual adjustment',
            };

            const newEndTime = new Date(new Date(penalty.endTime!).getTime() + (days * 24 * 60 * 60 * 1000));
            const currentRemaining = Math.max(0, newEndTime.getTime() - Date.now());
            const newRemaining = Math.ceil(currentRemaining / (1000 * 60 * 60 * 24));

            const updates: Partial<Penalty> = {
                endTime: newEndTime.toISOString(),
                remaining: newRemaining,
                timeAdjustments: [...(penalty.timeAdjustments || []), timeAdjustment],
                isActive: newRemaining > 0,
            };

            const result = await RealDatabaseService.updateDocument<Penalty>(
                `families/${user.uid}/penalties`,
                id,
                updates
            );

            if (!result.success) {
                throw new Error(result.error || 'Failed to update penalty');
            }

            set({ isLoading: false });

            // Track analytics
            trackEvent('penalty_adjusted', { 
                penalty_id: id,
                user_id: user.uid,
                adjustment_days: days
            });

            console.log('✅ Penalty time adjusted successfully:', id);

            return { success: true };
        } catch (error: any) {
            console.error('❌ Error adjusting penalty time:', error);
            set({ isLoading: false, error: error.message });
            
            return { 
                success: false, 
                error: error.message || 'Failed to adjust penalty time' 
            };
        }
    },

    addReflection: async (id, text) => {
        set({ isLoading: true, error: null });

        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            console.log('💭 Adding reflection to penalty in Firebase...');

            const penalty = get().getPenaltyById(id);
            if (!penalty) {
                throw new Error('Penalty not found');
            }

            const reflectionEntry = {
                id: `reflection_${Date.now()}`,
                text: text,
                addedAt: new Date().toISOString(),
                addedBy: user.uid,
            };

            const updates: Partial<Penalty> = {
                reflections: [...(penalty.reflections || []), reflectionEntry],
            };

            const result = await RealDatabaseService.updateDocument<Penalty>(
                `families/${user.uid}/penalties`,
                id,
                updates
            );

            if (!result.success) {
                throw new Error(result.error || 'Failed to update penalty');
            }

            set({ isLoading: false });

            // Track analytics
            trackEvent('penalty_reflection_added', { 
                penalty_id: id,
                user_id: user.uid,
                reflection_length: text.length
            });

            console.log('✅ Reflection added successfully:', id);

            return { success: true };
        } catch (error: any) {
            console.error('❌ Error adding reflection:', error);
            set({ isLoading: false, error: error.message });
            
            return { 
                success: false, 
                error: error.message || 'Failed to add reflection' 
            };
        }
    },

    updatePenaltyTimer: async () => {
        const { penalties } = get();
        const now = new Date().getTime();
        
        const updatedPenalties = penalties.map(penalty => {
            if (penalty.isActive && penalty.endTime) {
                const endTime = new Date(penalty.endTime).getTime();
                const remaining = Math.max(0, endTime - now);
                const remainingDays = Math.ceil(remaining / (1000 * 60 * 60 * 24));
                
                if (remaining <= 0 && penalty.isActive) {
                    // Penalty just expired
                    get().endPenaltyOffline(penalty.id);
                }
                
                return {
                    ...penalty,
                    remaining: remainingDays,
                    isActive: remaining > 0
                };
            }
            return penalty;
        });

        set({ penalties: updatedPenalties });
    },

    // Offline fallback methods
    addPenaltyOffline: (penaltyData) => {
        const now = new Date();
        const endTime = new Date(now.getTime() + (penaltyData.durationDays * 24 * 60 * 60 * 1000));
        
        const newPenalty: Penalty = {
            ...penaltyData,
            id: `offline_penalty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            startTime: now.toISOString(),
            endTime: endTime.toISOString(),
            remaining: penaltyData.durationDays,
            isActive: true,
            isCompleted: false,
            reflections: [],
            timeAdjustment: [],
        };
        
        set((state) => ({ penalties: [...state.penalties, newPenalty] }));
        
        console.log('⚖️ Penalty added offline, will sync when online:', newPenalty.type);
        
        // Schedule notification
        schedulePenaltyNotification({
            id: newPenalty.id,
            type: newPenalty.type,
            assignedTo: newPenalty.assignedTo,
            durationDays: newPenalty.durationDays,
            reasons: newPenalty.reasons,
        });
    },

    endPenaltyOffline: (id, reflection) => {
        set((state) => ({
            penalties: state.penalties.map((p) =>
                p.id === id
                    ? {
                        ...p,
                        isActive: false,
                        isCompleted: true,
                        completedAt: new Date().toISOString(),
                        ...(reflection && {
                            reflections: [...(p.reflections || []), {
                                id: `reflection_${Date.now()}`,
                                text: reflection,
                                addedAt: new Date().toISOString(),
                                addedBy: 'offline_user',
                            }],
                        }),
                    }
                    : p
            ),
        }));
        
        console.log('🏁 Penalty ended offline, will sync when online:', id);
    },

    adjustTimeOffline: (id, days) => {
        const penalty = get().getPenaltyById(id);
        if (!penalty) return;

        const newEndTime = new Date(new Date(penalty.endTime!).getTime() + (days * 24 * 60 * 60 * 1000));
        const currentRemaining = Math.max(0, newEndTime.getTime() - Date.now());
        const newRemaining = Math.ceil(currentRemaining / (1000 * 60 * 60 * 24));

        set((state) => ({
            penalties: state.penalties.map((p) =>
                p.id === id
                    ? {
                        ...p,
                        endTime: newEndTime.toISOString(),
                        remaining: newRemaining,
                        isActive: newRemaining > 0,
                        timeAdjustments: [...(p.timeAdjustments || []), {
                            id: `adjustment_${Date.now()}`,
                            days: days,
                            adjustedAt: new Date().toISOString(),
                            adjustedBy: 'offline_user',
                            reason: 'Manual adjustment',
                        }],
                    }
                    : p
            ),
        }));
        
        console.log('⏰ Penalty time adjusted offline, will sync when online:', id);
    },

    updatePenaltyTimerOffline: () => {
        get().updatePenaltyTimer();
    },

    syncOfflinePenalties: async () => {
        const { penalties } = get();
        const offlinePenalties = penalties.filter(penalty => penalty.id.startsWith('offline_penalty_'));
        
        if (offlinePenalties.length === 0) {
            console.log('⚖️ No offline penalties to sync');
            return;
        }

        console.log(`📡 Syncing ${offlinePenalties.length} offline penalties...`);
        
        let successCount = 0;
        let errorCount = 0;

        for (const penalty of offlinePenalties) {
            try {
                const { id, startTime, endTime, remaining, isActive, isCompleted, reflections, timeAdjustments, ...penaltyData } = penalty;
                const result = await get().addPenalty(penaltyData);
                
                if (result.success) {
                    // Remove offline penalty and sync any adjustments/reflections
                    set((state) => ({
                        penalties: state.penalties.filter(p => p.id !== penalty.id)
                    }));
                    
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error('❌ Error syncing offline penalty:', penalty.id, error);
                errorCount++;
            }
        }

        console.log(`📡 Sync completed: ${successCount} successful, ${errorCount} errors`);
        
        trackEvent('offline_penalties_synced', { 
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
                console.log(`👨‍👩‍👧‍👦 Loaded ${familyMembers.length} family members for penalties`);
            }
        } catch (error) {
            console.error('❌ Error loading family members:', error);
        }
    },

    // Getters (same as before)
    getActivePenalties: () => get().penalties.filter((p) => p.isActive),
    getCompletedPenalties: () => get().penalties.filter((p) => p.isCompleted),
    getPenaltyById: (id) => get().penalties.find((p) => p.id === id),
    getPenaltiesByMember: (memberId) => get().penalties.filter((p) => p.assignedTo === memberId),
    getPenaltiesByType: (type) => get().penalties.filter((p) => p.type === type),
    getPenaltiesByMethod: (method) => get().penalties.filter((p) => p.method === method),
    
    getStats: () => {
        const penalties = get().penalties;
        const active = penalties.filter((p) => p.isActive);
        const completed = penalties.filter((p) => p.isCompleted);
        const yellowCards = penalties.filter((p) => p.type === 'yellow');
        const redCards = penalties.filter((p) => p.type === 'red');

        return {
            totalPenalties: penalties.length,
            activePenalties: active.length,
            completedPenalties: completed.length,
            yellowCards: yellowCards.length,
            redCards: redCards.length,
            yellowCards,
            redCards,
        };
    },

    getMemberStats: (memberId) => {
        const memberPenalties = get().getPenaltiesByMember(memberId);
        const completed = memberPenalties.filter((p) => p.isCompleted);
        const yellowCards = memberPenalties.filter((p) => p.type === 'yellow');
        const redCards = memberPenalties.filter((p) => p.type === 'red');
        
        const timeServed = completed.reduce((total, p) => {
            const start = new Date(p.startTime).getTime();
            const end = new Date(p.completedAt || p.endTime!).getTime();
            return total + (end - start);
        }, 0);
        
        const averageDuration = completed.length > 0 
            ? completed.reduce((sum, p) => sum + p.durationDays, 0) / completed.length 
            : 0;

        return {
            completedCount: completed.length,
            timeServed: Math.round(timeServed / (1000 * 60 * 60 * 24)), // Convert to days
            averageDuration,
            yellowCards: yellowCards.length,
            redCards: redCards.length,
        };
    },

    getMemberById: (id) => get().familyMembers.find((m) => m.id === id),

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
            await get().initializePenalties();
            
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
export const usePenaltiesStore = () => {
    const store = usePenaltiesStoreWithFirebase();
    
    // Initialize penalties on first use
    React.useEffect(() => {
        if (!store.isInitialized) {
            store.initializePenalties();
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




