/**
 * REAL Goals Firebase Service
 * Production-ready Firebase integration for Goals module
 */

import { RealDatabaseService, RealAuthService } from '../../../services';

export interface FirebaseGoal {
    id?: string;
    title: string;
    description: string;
    category: 'family' | 'personal' | 'health' | 'education' | 'financial';
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    progress: number; // 0-100
    targetDate?: Date;
    assignedTo?: string; // member ID
    createdBy: string;
    milestones: FirebaseMilestone[];
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

export interface FirebaseMilestone {
    id?: string;
    title: string;
    description?: string;
    status: 'pending' | 'completed';
    completedAt?: Date;
}

class RealGoalsService {
    private unsubscribeCallback?: () => void;

    async createGoal(goalData: Omit<FirebaseGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const goal: FirebaseGoal = {
                ...goalData,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await RealDatabaseService.createDocument(
                `families/${user.uid}/goals`,
                goal
            );

            if (!result.success || !result.data) {
                throw new Error('Failed to create goal');
            }

            console.log('✅ Goal created in Firebase:', result.data.id);
            return result.data.id;
        } catch (error) {
            console.error('❌ Error creating goal:', error);
            throw error;
        }
    }

    async updateGoal(goalId: string, updates: Partial<FirebaseGoal>): Promise<void> {
        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            await RealDatabaseService.updateDocument(
                `families/${user.uid}/goals`,
                goalId,
                { ...updates, updatedAt: new Date() }
            );

            console.log('✅ Goal updated in Firebase:', goalId);
        } catch (error) {
            console.error('❌ Error updating goal:', error);
            throw error;
        }
    }

    async deleteGoal(goalId: string): Promise<void> {
        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            await RealDatabaseService.deleteDocument(
                `families/${user.uid}/goals`,
                goalId
            );

            console.log('✅ Goal deleted from Firebase:', goalId);
        } catch (error) {
            console.error('❌ Error deleting goal:', error);
            throw error;
        }
    }

    async getGoals(): Promise<FirebaseGoal[]> {
        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const result = await RealDatabaseService.getDocuments(
                `families/${user.uid}/goals`
            );

            if (!result.success || !result.data) {
                console.error('Failed to get goals:', result.error);
                return [];
            }

            return result.data.map(doc => ({
                id: doc.id,
                ...doc,
                createdAt: doc.createdAt || new Date(),
                updatedAt: doc.updatedAt || new Date(),
            })) as FirebaseGoal[];
        } catch (error) {
            console.error('❌ Error getting goals:', error);
            return []; // Return empty array on error
        }
    }

    // Real-time subscription to goals
    async subscribeToGoals(callback: (goals: FirebaseGoal[]) => void): Promise<() => void> {
        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) {
                console.warn('⚠️ No user authenticated for goals');
                // Return empty callback instead of throwing error
                callback([]);
                return () => { };
            }

            console.log('🎯 Setting up goals real-time subscription for user:', user.uid);

            const unsubscribe = RealDatabaseService.listenToCollection<FirebaseGoal>(
                `families/${user.uid}/goals`,
                (goals, error) => {
                    if (error) {
                        console.error('❌ Error in real-time goals subscription:', error);
                    } else {
                        const formattedGoals = goals.map(doc => ({
                            id: doc.id,
                            ...doc,
                            createdAt: doc.createdAt || new Date(),
                            updatedAt: doc.updatedAt || new Date(),
                        })) as FirebaseGoal[];

                        callback(formattedGoals);
                        console.log('🎯 Real-time goals update:', formattedGoals.length, 'goals');
                    }
                }
            );

            this.unsubscribeCallback = unsubscribe;
            return unsubscribe;
        } catch (error) {
            console.error('❌ Error setting up real-time subscription:', error);
            // Return empty callback instead of throwing error
            callback([]);
            return () => { };
        }
    }

    async cleanup(): Promise<void> {
        if (this.unsubscribeCallback) {
            this.unsubscribeCallback();
            this.unsubscribeCallback = undefined;
            console.log('🧹 Goals service cleanup completed');
        }
    }
}

// Export singleton instance
export const realGoalsService = new RealGoalsService();
export default realGoalsService;
