/**
 * Votes Service - Specialized Voting System
 * FamilyDash v1.4.0-pre - Real-time Family Voting
 */

import DatabaseService, { DatabaseResult } from './DatabaseService';

export interface VoteOption {
    id: string;
    text: string;
    votes: string[]; // User IDs who voted for this option
    createdAt: Date;
}

export interface Vote {
    id: string;
    question: string;
    description?: string;
    options: VoteOption[];
    createdBy: string;
    createdByName: string;
    status: 'active' | 'completed' | 'cancelled';
    expiresAt: Date;
    allowMultipleVotes: boolean;
    allowChangeVote: boolean;
    visibility: 'family' | 'public' | 'private';
    results: {
        totalVotes: number;
        participation: number; // percentage of eligible voters
        winningOption?: string;
        isTied: boolean;
    };
    metadata: {
        category?: string;
        tags: string[];
        priority: 'low' | 'medium' | 'high';
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface VoteInput {
    question: string;
    description?: string;
    options: string[]; // Array of option texts
    expiresAt: Date;
    allowMultipleVotes?: boolean;
    allowChangeVote?: boolean;
    visibility?: Vote['visibility'];
    category?: string;
    tags?: string[];
    priority?: Vote['metadata']['priority'];
}

export interface VoteFilters {
    status?: Vote['status'];
    createdBy?: string;
    category?: string;
    priority?: Vote['metadata']['priority'];
    visibility?: Vote['visibility'];
}

const COLLECTION = 'familyVotes';

export const VotesService = {
    /**
     * Create a new vote
     */
    async createVote(voteData: VoteInput, createdBy: string, createdByName: string): Promise<DatabaseResult<Vote>> {
        try {
            console.log('🗳️ Creating new vote:', voteData);

            // Generate options with IDs
            const options: VoteOption[] = voteData.options.map((text, index) => ({
                id: `opt_${Date.now()}_${index}`,
                text,
                votes: [],
                createdAt: new Date()
            }));

            const vote: Omit<Vote, 'id'> = {
                question: voteData.question,
                description: voteData.description || '',
                options,
                createdBy,
                createdByName,
                status: 'active',
                expiresAt: voteData.expiresAt,
                allowMultipleVotes: voteData.allowMultipleVotes || false,
                allowChangeVote: voteData.allowChangeVote || true,
                visibility: voteData.visibility || 'family',
                results: {
                    totalVotes: 0,
                    participation: 0,
                    isTied: false
                },
                metadata: {
                    category: voteData.category || 'general',
                    tags: voteData.tags || [],
                    priority: voteData.priority || 'medium'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await DatabaseService.add<Vote>(COLLECTION, vote);

            if (result.success) {
                console.log('✅ Vote created successfully');
            }

            return result;
        } catch (error: any) {
            console.error('❌ Error creating vote:', error);
            return {
                success: false,
                error: error.message || 'Failed to create vote'
            };
        }
    },

    /**
     * Get all votes with optional filtering
     */
    async getVotes(filters?: VoteFilters): Promise<DatabaseResult<Vote[]>> {
        console.log('🗳️ Getting votes with filters:', filters);

        const options = {
            orderBy: [{ field: 'createdAt', direction: 'desc' as const }]
        };

        if (filters) {
            const whereConditions = Object.entries(filters)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([field, value]) => ({
                    field: field === 'priority' ? 'metadata.priority' : field,
                    operator: '==' as const,
                    value
                }));

            if (whereConditions.length > 0) {
                options.where = whereConditions;
            }
        }

        return await DatabaseService.getAll<Vote>(COLLECTION, options);
    },

    /**
     * Get active votes only
     */
    async getActiveVotes(): Promise<DatabaseResult<Vote[]>> {
        console.log('🗳️ Getting active votes');
        return await this.getVotes({ status: 'active' });
    },

    /**
     * Get votes by creator
     */
    async getVotesByCreator(createdBy: string): Promise<DatabaseResult<Vote[]>> {
        console.log(`🗳️ Getting votes created by ${createdBy}`);
        return await this.getVotes({ createdBy });
    },

    /**
     * Get a single vote by ID
     */
    async getVoteById(id: string): Promise<DatabaseResult<Vote>> {
        console.log(`🗳️ Getting vote ${id}`);
        return await DatabaseService.getById<Vote>(COLLECTION, id);
    },

    /**
     * Cast a vote
     */
    async castVote(voteId: string, optionId: string, userId: string): Promise<DatabaseResult<Vote>> {
        try {
            console.log(`🗳️ User ${userId} casting vote for option ${optionId} in vote ${voteId}`);

            // Get current vote
            const voteResult = await this.getVoteById(voteId);
            if (!voteResult.success || !voteResult.data) {
                return { success: false, error: 'Vote not found' };
            }

            const vote = voteResult.data;

            // Validate vote
            if (vote.status !== 'active') {
                return { success: false, error: 'Vote is no longer active' };
            }

            if (new Date() > vote.expiresAt) {
                return { success: false, error: 'Vote has expired' };
            }

            // Check if option exists
            const option = vote.options.find(opt => opt.id === optionId);
            if (!option) {
                return { success: false, error: 'Invalid option' };
            }

            // Handle vote logic
            const updatedOptions = vote.options.map(opt => {
                if (opt.id === optionId) {
                    // Add vote if not already voted
                    if (!opt.votes.includes(userId)) {
                        opt.votes.push(userId);
                    }
                } else if (!vote.allowMultipleVotes) {
                    // Remove user from other options if not allowing multiple votes
                    opt.votes = opt.votes.filter(voteUserId => voteUserId !== userId);
                }
                return opt;
            });

            // Calculate results
            const totalVotes = updatedOptions.reduce((sum, option) => sum + option.votes.length, 0);
            const maxVotes = Math.max(...updatedOptions.map(opt => opt.votes.length));
            const winningOptions = updatedOptions.filter(opt => opt.votes.length === maxVotes);
            const isTied = winningOptions.length > 1;

            const updates: Partial<Vote> = {
                options: updatedOptions,
                results: {
                    totalVotes,
                    participation: vote.results.participation, // Will be updated separately
                    winningOption: !isTied ? winningOptions[0]?.id : undefined,
                    isTied
                },
                updatedAt: new Date()
            };

            const result = await DatabaseService.update<Vote>(COLLECTION, voteId, updates);

            if (result.success) {
                console.log(`✅ Vote cast successfully for option ${optionId}`);
            }

            return result;
        } catch (error: any) {
            console.error('❌ Error casting vote:', error);
            return {
                success: false,
                error: error.message || 'Failed to cast vote'
            };
        }
    },

    /**
     * Remove a vote (unvote)
     */
    async removeVote(voteId: string, optionId: string, userId: string): Promise<DatabaseResult<Vote>> {
        try {
            console.log(`🗳️ User ${userId} removing vote from option ${optionId} in vote ${voteId}`);

            const voteResult = await this.getVoteById(voteId);
            if (!voteResult.success || !voteResult.data) {
                return { success: false, error: 'Vote not found' };
            }

            const vote = voteResult.data;

            if (!vote.allowChangeVote) {
                return { success: false, error: 'Vote changes are not allowed' };
            }

            // Remove vote from option
            const updatedOptions = vote.options.map(opt => {
                if (opt.id === optionId) {
                    opt.votes = opt.votes.filter(voteUserId => voteUserId !== userId);
                }
                return opt;
            });

            // Recalculate results
            const totalVotes = updatedOptions.reduce((sum, option) => sum + option.votes.length, 0);
            const maxVotes = Math.max(...updatedOptions.map(opt => opt.votes.length));
            const winningOptions = updatedOptions.filter(opt => opt.votes.length === maxVotes);
            const isTied = winningOptions.length > 1;

            const updates: Partial<Vote> = {
                options: updatedOptions,
                results: {
                    totalVotes,
                    participation: vote.results.participation,
                    winningOption: !isTied ? winningOptions[0]?.id : undefined,
                    isTied
                },
                updatedAt: new Date()
            };

            return await DatabaseService.update<Vote>(COLLECTION, voteId, updates);
        } catch (error: any) {
            console.error('❌ Error removing vote:', error);
            return {
                success: false,
                error: error.message || 'Failed to remove vote'
            };
        }
    },

    /**
     * Complete a vote (close it)
     */
    async completeVote(voteId: string): Promise<DatabaseResult<Vote>> {
        console.log(`🗳️ Completing vote ${voteId}`);

        const updates: Partial<Vote> = {
            status: 'completed',
            updatedAt: new Date()
        };

        return await DatabaseService.update<Vote>(COLLECTION, voteId, updates);
    },

    /**
     * Cancel a vote
     */
    async cancelVote(voteId: string): Promise<DatabaseResult<Vote>> {
        console.log(`🗳️ Cancelling vote ${voteId}`);

        const updates: Partial<Vote> = {
            status: 'cancelled',
            updatedAt: new Date()
        };

        return await DatabaseService.update<Vote>(COLLECTION, voteId, updates);
    },

    /**
     * Update vote participation (call this when family members change)
     */
    async updateParticipation(voteId: string, totalEligibleVoters: number): Promise<DatabaseResult<Vote>> {
        try {
            const voteResult = await this.getVoteById(voteId);
            if (!voteResult.success || !voteResult.data) {
                return { success: false, error: 'Vote not found' };
            }

            const vote = voteResult.data;
            const participation = totalEligibleVoters > 0
                ? (vote.results.totalVotes / totalEligibleVoters) * 100
                : 0;

            const updates: Partial<Vote> = {
                results: {
                    ...vote.results,
                    participation
                },
                updatedAt: new Date()
            };

            return await DatabaseService.update<Vote>(COLLECTION, voteId, updates);
        } catch (error: any) {
            console.error('❌ Error updating participation:', error);
            return {
                success: false,
                error: error.message || 'Failed to update participation'
            };
        }
    },

    /**
     * Listen to real-time vote updates
     */
    listenToVotes(callback: (votes: Vote[]) => void, filters?: VoteFilters): () => void {
        console.log('👂 Setting up real-time votes listener');

        const options = {
            orderBy: [{ field: 'createdAt', direction: 'desc' as const }]
        };

        if (filters) {
            const whereConditions = Object.entries(filters)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([field, value]) => ({
                    field: field === 'priority' ? 'metadata.priority' : field,
                    operator: '==' as const,
                    value
                }));

            if (whereConditions.length > 0) {
                options.where = whereConditions;
            }
        }

        return DatabaseService.listen<Vote>(COLLECTION, callback, options);
    },

    /**
     * Listen to active votes only
     */
    listenToActiveVotes(callback: (votes: Vote[]) => void): () => void {
        return this.listenToVotes(callback, { status: 'active' });
    },

    /**
     * Get vote statistics
     */
    async getVoteStats(): Promise<DatabaseResult<{
        totalVotes: number;
        activeVotes: number;
        completedVotes: number;
        cancelledVotes: number;
        totalParticipants: number;
        averageParticipation: number;
        mostPopularCategory: string;
    }>> {
        try {
            console.log('📊 Getting vote statistics');

            const result = await this.getVotes();
            if (!result.success || !result.data) {
                return { success: false, error: 'Failed to get votes for statistics' };
            }

            const votes = result.data;
            const stats = {
                totalVotes: votes.length,
                activeVotes: votes.filter(v => v.status === 'active').length,
                completedVotes: votes.filter(v => v.status === 'completed').length,
                cancelledVotes: votes.filter(v => v.status === 'cancelled').length,
                totalParticipants: votes.reduce((sum, v) => sum + v.results.totalVotes, 0),
                averageParticipation: votes.length > 0
                    ? votes.reduce((sum, v) => sum + v.results.participation, 0) / votes.length
                    : 0,
                mostPopularCategory: votes.length > 0
                    ? votes.reduce((acc, v) => {
                        const category = v.metadata.category || 'general';
                        acc[category] = (acc[category] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>)
                    : 'general'
            };

            console.log('📊 Vote statistics:', stats);
            return { success: true, data: stats };
        } catch (error: any) {
            console.error('❌ Error getting vote statistics:', error);
            return {
                success: false,
                error: error.message || 'Failed to get vote statistics'
            };
        }
    }
};

export default VotesService;
