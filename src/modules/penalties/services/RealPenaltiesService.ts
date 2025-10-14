/**
 * REAL Penalties Firebase Service
 * Production-ready Firebase integration for Penalties module
 */

import { RealDatabaseService, RealAuthService } from '../../../services';

export interface FirebasePenalty {
    id?: string;
    memberId: string;
    memberName: string;
    memberAvatar: string;
    reason: string;
    duration: number; // in minutes
    category: 'behavior' | 'chores' | 'screen_time' | 'homework' | 'other';
    penaltyType: 'yellow' | 'red';
    status: 'active' | 'paused' | 'completed';
    createdAt: Date;
    updatedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}

class RealPenaltiesService {
    private unsubscribeCallback?: () => void;

    async createPenalty(penaltyData: Omit<FirebasePenalty, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const penalty: FirebasePenalty = {
                ...penaltyData,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await RealDatabaseService.createDocument(
                `families/${user.uid}/penalties`,
                penalty
            );

            if (!result.success || !result.data) {
                throw new Error('Failed to create penalty');
            }

            console.log('✅ Penalty created in Firebase:', result.data.id);
            return result.data.id;
        } catch (error) {
            console.error('❌ Error creating penalty:', error);
            throw error;
        }
    }

    async updatePenalty(penaltyId: string, updates: Partial<FirebasePenalty>): Promise<void> {
        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            await RealDatabaseService.updateDocument(
                `families/${user.uid}/penalties`,
                penaltyId,
                { ...updates, updatedAt: new Date() }
            );

            console.log('✅ Penalty updated in Firebase:', penaltyId);
        } catch (error) {
            console.error('❌ Error updating penalty:', error);
            throw error;
        }
    }

    async deletePenalty(penaltyId: string): Promise<void> {
        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            await RealDatabaseService.deleteDocument(
                `families/${user.uid}/penalties`,
                penaltyId
            );

            console.log('✅ Penalty deleted from Firebase:', penaltyId);
        } catch (error) {
            console.error('❌ Error deleting penalty:', error);
            throw error;
        }
    }

    async getPenalties(): Promise<FirebasePenalty[]> {
        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const result = await RealDatabaseService.getDocuments(
                `families/${user.uid}/penalties`
            );

            if (!result.success || !result.data) {
                console.error('Failed to get penalties:', result.error);
                return [];
            }

            return result.data.map(doc => ({
                id: doc.id,
                ...doc,
                createdAt: doc.createdAt || new Date(),
                updatedAt: doc.updatedAt || new Date(),
            })) as FirebasePenalty[];
        } catch (error) {
            console.error('❌ Error getting penalties:', error);
            return []; // Return empty array on error
        }
    }

    // Real-time subscription to penalties
    async subscribeToPenalties(callback: (penalties: FirebasePenalty[]) => void): Promise<() => void> {
        try {
            const user = await RealAuthService.getCurrentUser();
            if (!user) {
                console.warn('⚠️ No user authenticated for penalties');
                // Return empty callback instead of throwing error
                callback([]);
                return () => { };
            }

            console.log('⚖️ Setting up penalties real-time subscription for user:', user.uid);

            const unsubscribe = RealDatabaseService.listenToCollection<FirebasePenalty>(
                `families/${user.uid}/penalties`,
                (penalties, error) => {
                    if (error) {
                        console.error('❌ Error in real-time penalties subscription:', error);
                    } else {
                        const formattedPenalties = penalties.map(doc => ({
                            id: doc.id,
                            ...doc,
                            createdAt: doc.createdAt || new Date(),
                            updatedAt: doc.updatedAt || new Date(),
                        })) as FirebasePenalty[];

                        callback(formattedPenalties);
                        console.log('⚖️ Real-time penalties update:', formattedPenalties.length, 'penalties');
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
            console.log('🧹 Penalties service cleanup completed');
        }
    }
}

// Export singleton instance
export const realPenaltiesService = new RealPenaltiesService();
export default realPenaltiesService;




