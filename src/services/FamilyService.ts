/**
 * Family Service - Firebase Integration
 * FamilyDash v1.4.0-pre - Family Vision, Members, and Shared Data
 */

import DatabaseService, { DatabaseResult } from './DatabaseService';
import Logger from './Logger';

export interface FamilyMember {
    id: string;
    userId: string;
    email: string;
    displayName: string;
    role: 'parent' | 'child' | 'guardian';
    avatar?: string;
    isActive: boolean;
    joinedAt: Date;
    lastActiveAt: Date;
    preferences: {
        notifications: boolean;
        theme: 'light' | 'dark' | 'auto';
        language: string;
    };
}

export interface FamilyVision {
    id: string;
    title: string;
    description: string;
    category: 'spiritual' | 'health' | 'education' | 'financial' | 'relationship' | 'personal';
    progress: number; // 0-100
    targetDate?: Date;
    createdBy: string;
    assignedTo: string[]; // User IDs
    status: 'active' | 'completed' | 'paused' | 'cancelled';
    milestones: {
        id: string;
        title: string;
        description: string;
        completed: boolean;
        completedAt?: Date;
        completedBy?: string;
    }[];
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface FamilyVote {
    id: string;
    question: string;
    options: {
        id: string;
        text: string;
        votes: string[]; // User IDs who voted for this option
    }[];
    createdBy: string;
    status: 'active' | 'completed' | 'cancelled';
    expiresAt: Date;
    allowMultipleVotes: boolean;
    results: {
        totalVotes: number;
        participation: number; // percentage of family members who voted
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface FamilyReflection {
    id: string;
    content: string;
    type: 'gratitude' | 'achievement' | 'challenge' | 'memory';
    mood: 'happy' | 'grateful' | 'proud' | 'thoughtful' | 'hopeful';
    createdBy: string;
    isShared: boolean; // visible to all family members
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const COLLECTIONS = {
    MEMBERS: 'familyMembers',
    VISION: 'familyVision',
    VOTES: 'familyVotes',
    REFLECTIONS: 'familyReflections'
};

export const FamilyService = {
    // Family Members Management

    /**
     * Add a family member
     */
    async addMember(memberData: Omit<FamilyMember, 'id' | 'joinedAt' | 'lastActiveAt'>): Promise<DatabaseResult<FamilyMember>> {
        Logger.debug('👥 Adding family member:', memberData);

        const member: Omit<FamilyMember, 'id'> = {
            ...memberData,
            joinedAt: new Date(),
            lastActiveAt: new Date()
        };

        return await DatabaseService.add<FamilyMember>(COLLECTIONS.MEMBERS, member);
    },

    /**
     * Get all family members
     */
    async getMembers(): Promise<DatabaseResult<FamilyMember[]>> {
        Logger.debug('👥 Getting all family members');
        return await DatabaseService.getAll<FamilyMember>(COLLECTIONS.MEMBERS, {
            orderBy: [{ field: 'joinedAt', direction: 'asc' }]
        });
    },

    /**
     * Update family member
     */
    async updateMember(id: string, updates: Partial<FamilyMember>): Promise<DatabaseResult<FamilyMember>> {
        Logger.debug(`👥 Updating family member ${id}:`, updates);
        return await DatabaseService.update<FamilyMember>(COLLECTIONS.MEMBERS, id, updates);
    },

    /**
     * Remove family member
     */
    async removeMember(id: string): Promise<DatabaseResult> {
        Logger.debug(`👥 Removing family member ${id}`);
        return await DatabaseService.remove(COLLECTIONS.MEMBERS, id);
    },

    /**
     * Listen to family members changes
     */
    listenToMembers(callback: (members: FamilyMember[]) => void): () => void {
        Logger.debug('👂 Setting up real-time family members listener');
        return DatabaseService.listen<FamilyMember>(
            COLLECTIONS.MEMBERS,
            callback,
            { orderBy: [{ field: 'joinedAt', direction: 'asc' }] }
        );
    },

    // Family Vision Management

    /**
     * Create a new family vision/goal
     */
    async createVision(visionData: Omit<FamilyVision, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResult<FamilyVision>> {
        Logger.debug('🎯 Creating family vision:', visionData);

        const vision: Omit<FamilyVision, 'id'> = {
            ...visionData,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await DatabaseService.add<FamilyVision>(COLLECTIONS.VISION, vision);
    },

    /**
     * Get all family visions
     */
    async getVisions(status?: FamilyVision['status']): Promise<DatabaseResult<FamilyVision[]>> {
        Logger.debug('🎯 Getting family visions with status:', status);

        const options = {
            orderBy: [{ field: 'createdAt', direction: 'desc' as const }]
        };

        if (status) {
            options.where = [{ field: 'status', operator: '==', value: status }];
        }

        return await DatabaseService.getAll<FamilyVision>(COLLECTIONS.VISION, options);
    },

    /**
     * Update family vision
     */
    async updateVision(id: string, updates: Partial<FamilyVision>): Promise<DatabaseResult<FamilyVision>> {
        Logger.debug(`🎯 Updating family vision ${id}:`, updates);
        return await DatabaseService.update<FamilyVision>(COLLECTIONS.VISION, id, updates);
    },

    /**
     * Update vision progress
     */
    async updateVisionProgress(id: string, progress: number, milestoneId?: string): Promise<DatabaseResult<FamilyVision>> {
        Logger.debug(`🎯 Updating vision ${id} progress to ${progress}%`);

        const updates: Partial<FamilyVision> = { progress };

        if (milestoneId) {
            // Mark milestone as completed
            const visionResult = await DatabaseService.getById<FamilyVision>(COLLECTIONS.VISION, id);
            if (visionResult.success && visionResult.data) {
                const vision = visionResult.data;
                const updatedMilestones = vision.milestones.map(milestone =>
                    milestone.id === milestoneId
                        ? { ...milestone, completed: true, completedAt: new Date() }
                        : milestone
                );
                updates.milestones = updatedMilestones;
            }
        }

        return await DatabaseService.update<FamilyVision>(COLLECTIONS.VISION, id, updates);
    },

    /**
     * Listen to family visions changes
     */
    listenToVisions(callback: (visions: FamilyVision[]) => void): () => void {
        Logger.debug('👂 Setting up real-time family visions listener');
        return DatabaseService.listen<FamilyVision>(
            COLLECTIONS.VISION,
            callback,
            { orderBy: [{ field: 'createdAt', direction: 'desc' }] }
        );
    },

    // Family Voting System

    /**
     * Create a new family vote
     */
    async createVote(voteData: Omit<FamilyVote, 'id' | 'createdAt' | 'updatedAt' | 'results'>): Promise<DatabaseResult<FamilyVote>> {
        Logger.debug('🗳️ Creating family vote:', voteData);

        const vote: Omit<FamilyVote, 'id'> = {
            ...voteData,
            results: {
                totalVotes: 0,
                participation: 0
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await DatabaseService.add<FamilyVote>(COLLECTIONS.VOTES, vote);
    },

    /**
     * Get all family votes
     */
    async getVotes(status?: FamilyVote['status']): Promise<DatabaseResult<FamilyVote[]>> {
        Logger.debug('🗳️ Getting family votes with status:', status);

        const options = {
            orderBy: [{ field: 'createdAt', direction: 'desc' as const }]
        };

        if (status) {
            options.where = [{ field: 'status', operator: '==', value: status }];
        }

        return await DatabaseService.getAll<FamilyVote>(COLLECTIONS.VOTES, options);
    },

    /**
     * Cast a vote
     */
    async castVote(voteId: string, optionId: string, userId: string): Promise<DatabaseResult<FamilyVote>> {
        Logger.debug(`🗳️ User ${userId} voting for option ${optionId} in vote ${voteId}`);

        try {
            // Get current vote
            const voteResult = await DatabaseService.getById<FamilyVote>(COLLECTIONS.VOTES, voteId);
            if (!voteResult.success || !voteResult.data) {
                return { success: false, error: 'Vote not found' };
            }

            const vote = voteResult.data;

            // Check if vote is still active
            if (vote.status !== 'active' || new Date() > vote.expiresAt) {
                return { success: false, error: 'Vote is no longer active' };
            }

            // Update options with new vote
            const updatedOptions = vote.options.map(option => {
                if (option.id === optionId) {
                    // Remove user from other options if not allowing multiple votes
                    if (!vote.allowMultipleVotes) {
                        const otherOptions = vote.options.filter(opt => opt.id !== optionId);
                        otherOptions.forEach(opt => {
                            opt.votes = opt.votes.filter(voteUserId => voteUserId !== userId);
                        });
                    }

                    // Add user to this option if not already voted
                    if (!option.votes.includes(userId)) {
                        option.votes.push(userId);
                    }
                }
                return option;
            });

            // Calculate results
            const totalVotes = updatedOptions.reduce((sum, option) => sum + option.votes.length, 0);
            const familyMembers = await this.getMembers();
            const participation = familyMembers.success && familyMembers.data
                ? (totalVotes / familyMembers.data.length) * 100
                : 0;

            const updates: Partial<FamilyVote> = {
                options: updatedOptions,
                results: {
                    totalVotes,
                    participation
                }
            };

            return await DatabaseService.update<FamilyVote>(COLLECTIONS.VOTES, voteId, updates);
        } catch (error: any) {
            Logger.error('❌ Error casting vote:', error);
            return {
                success: false,
                error: error.message || 'Failed to cast vote'
            };
        }
    },

    /**
     * Listen to family votes changes
     */
    listenToVotes(callback: (votes: FamilyVote[]) => void): () => void {
        Logger.debug('👂 Setting up real-time family votes listener');
        return DatabaseService.listen<FamilyVote>(
            COLLECTIONS.VOTES,
            callback,
            { orderBy: [{ field: 'createdAt', direction: 'desc' }] }
        );
    },

    // Family Reflections

    /**
     * Add a family reflection
     */
    async addReflection(reflectionData: Omit<FamilyReflection, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResult<FamilyReflection>> {
        Logger.debug('💭 Adding family reflection:', reflectionData);

        const reflection: Omit<FamilyReflection, 'id'> = {
            ...reflectionData,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await DatabaseService.add<FamilyReflection>(COLLECTIONS.REFLECTIONS, reflection);
    },

    /**
     * Get family reflections
     */
    async getReflections(sharedOnly: boolean = false): Promise<DatabaseResult<FamilyReflection[]>> {
        Logger.debug('💭 Getting family reflections, shared only:', sharedOnly);

        const options = {
            orderBy: [{ field: 'createdAt', direction: 'desc' as const }]
        };

        if (sharedOnly) {
            options.where = [{ field: 'isShared', operator: '==', value: true }];
        }

        return await DatabaseService.getAll<FamilyReflection>(COLLECTIONS.REFLECTIONS, options);
    },

    /**
     * Listen to family reflections changes
     */
    listenToReflections(callback: (reflections: FamilyReflection[]) => void): () => void {
        Logger.debug('👂 Setting up real-time family reflections listener');
        return DatabaseService.listen<FamilyReflection>(
            COLLECTIONS.REFLECTIONS,
            callback,
            { orderBy: [{ field: 'createdAt', direction: 'desc' }] }
        );
    },

    // Family Statistics

    /**
     * Get family statistics
     */
    async getFamilyStats(): Promise<DatabaseResult<{
        totalMembers: number;
        activeMembers: number;
        totalVisions: number;
        activeVisions: number;
        completedVisions: number;
        totalVotes: number;
        activeVotes: number;
        totalReflections: number;
        sharedReflections: number;
    }>> {
        try {
            Logger.debug('📊 Getting family statistics');

            const [membersResult, visionsResult, votesResult, reflectionsResult] = await Promise.all([
                this.getMembers(),
                this.getVisions(),
                this.getVotes(),
                this.getReflections()
            ]);

            const members = membersResult.success ? membersResult.data || [] : [];
            const visions = visionsResult.success ? visionsResult.data || [] : [];
            const votes = votesResult.success ? votesResult.data || [] : [];
            const reflections = reflectionsResult.success ? reflectionsResult.data || [] : [];

            const stats = {
                totalMembers: members.length,
                activeMembers: members.filter(m => m.isActive).length,
                totalVisions: visions.length,
                activeVisions: visions.filter(v => v.status === 'active').length,
                completedVisions: visions.filter(v => v.status === 'completed').length,
                totalVotes: votes.length,
                activeVotes: votes.filter(v => v.status === 'active').length,
                totalReflections: reflections.length,
                sharedReflections: reflections.filter(r => r.isShared).length
            };

            Logger.debug('📊 Family statistics:', stats);
            return { success: true, data: stats };
        } catch (error: any) {
            Logger.error('❌ Error getting family statistics:', error);
            return {
                success: false,
                error: error.message || 'Failed to get family statistics'
            };
        }
    }
};

export default FamilyService;




