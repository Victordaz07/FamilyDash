/**
 * Family Context - Shared Family Data Management
 * FamilyDash v1.4.0-pre - Global Family State Management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import FamilyService, { FamilyMember, FamilyVision, FamilyReflection } from '@/services/FamilyService';
import VotesService, { Vote } from '@/services/VotesService';
import { useAuth } from './AuthContext';

export interface FamilyContextType {
    // Family Members
    members: FamilyMember[];
    membersLoading: boolean;
    membersError: string | null;

    // Family Vision
    visions: FamilyVision[];
    visionsLoading: boolean;
    visionsError: string | null;

    // Family Votes
    votes: Vote[];
    votesLoading: boolean;
    votesError: string | null;

    // Family Reflections
    reflections: FamilyReflection[];
    reflectionsLoading: boolean;
    reflectionsError: string | null;

    // Statistics
    familyStats: {
        totalMembers: number;
        activeMembers: number;
        totalVisions: number;
        activeVisions: number;
        completedVisions: number;
        totalVotes: number;
        activeVotes: number;
        totalReflections: number;
        sharedReflections: number;
    } | null;

    // Actions
    refreshFamilyData: () => Promise<void>;
    addMember: (memberData: Omit<FamilyMember, 'id' | 'joinedAt' | 'lastActiveAt'>) => Promise<boolean>;
    updateMember: (id: string, updates: Partial<FamilyMember>) => Promise<boolean>;
    removeMember: (id: string) => Promise<boolean>;

    createVision: (visionData: Omit<FamilyVision, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
    updateVision: (id: string, updates: Partial<FamilyVision>) => Promise<boolean>;
    updateVisionProgress: (id: string, progress: number, milestoneId?: string) => Promise<boolean>;

    createVote: (voteData: any, createdBy: string, createdByName: string) => Promise<boolean>;
    castVote: (voteId: string, optionId: string, userId: string) => Promise<boolean>;
    completeVote: (voteId: string) => Promise<boolean>;

    addReflection: (reflectionData: Omit<FamilyReflection, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;

    // Connection status
    isConnected: boolean;
    lastSyncAt: Date | null;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const useFamily = () => {
    const context = useContext(FamilyContext);
    if (!context) {
        throw new Error('useFamily must be used within a FamilyProvider');
    }
    return context;
};

interface FamilyProviderProps {
    children: ReactNode;
}

export const FamilyProvider: React.FC<FamilyProviderProps> = ({ children }) => {
    const { user } = useAuth();

    // State for family members
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(true);
    const [membersError, setMembersError] = useState<string | null>(null);

    // State for family visions
    const [visions, setVisions] = useState<FamilyVision[]>([]);
    const [visionsLoading, setVisionsLoading] = useState(true);
    const [visionsError, setVisionsError] = useState<string | null>(null);

    // State for family votes
    const [votes, setVotes] = useState<Vote[]>([]);
    const [votesLoading, setVotesLoading] = useState(true);
    const [votesError, setVotesError] = useState<string | null>(null);

    // State for family reflections
    const [reflections, setReflections] = useState<FamilyReflection[]>([]);
    const [reflectionsLoading, setReflectionsLoading] = useState(true);
    const [reflectionsError, setReflectionsError] = useState<string | null>(null);

    // Statistics
    const [familyStats, setFamilyStats] = useState<FamilyContextType['familyStats']>(null);

    // Connection status
    const [isConnected, setIsConnected] = useState(true);
    const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

    // Real-time listeners
    const [listeners, setListeners] = useState<(() => void)[]>([]);

    // Initialize family data
    useEffect(() => {
        if (user) {
            initializeFamilyData();
        } else {
            // Clear data when user logs out
            clearFamilyData();
        }

        return () => {
            // Cleanup listeners
            listeners.forEach(unsubscribe => unsubscribe());
        };
    }, [user]);

    const initializeFamilyData = async () => {
        console.log('👨‍👩‍👧‍👦 Initializing family data...');

        try {
            // Set up real-time listeners
            setupRealtimeListeners();

            // Load initial data
            await Promise.all([
                loadMembers(),
                loadVisions(),
                loadVotes(),
                loadReflections()
            ]);

            // Load statistics
            await loadFamilyStats();

            setLastSyncAt(new Date());
            console.log('✅ Family data initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing family data:', error);
        }
    };

    const setupRealtimeListeners = () => {
        console.log('👂 Setting up real-time family listeners');

        const newListeners: (() => void)[] = [];

        // Members listener
        const membersUnsubscribe = FamilyService.listenToMembers((members) => {
            console.log('📡 Real-time members update:', members.length);
            setMembers(members);
            setMembersLoading(false);
            setMembersError(null);
        });
        newListeners.push(membersUnsubscribe);

        // Visions listener
        const visionsUnsubscribe = FamilyService.listenToVisions((visions) => {
            console.log('📡 Real-time visions update:', visions.length);
            setVisions(visions);
            setVisionsLoading(false);
            setVisionsError(null);
        });
        newListeners.push(visionsUnsubscribe);

        // Votes listener
        const votesUnsubscribe = VotesService.listenToVotes((votes) => {
            console.log('📡 Real-time votes update:', votes.length);
            setVotes(votes);
            setVotesLoading(false);
            setVotesError(null);
        });
        newListeners.push(votesUnsubscribe);

        // Reflections listener
        const reflectionsUnsubscribe = FamilyService.listenToReflections((reflections) => {
            console.log('📡 Real-time reflections update:', reflections.length);
            setReflections(reflections);
            setReflectionsLoading(false);
            setReflectionsError(null);
        });
        newListeners.push(reflectionsUnsubscribe);

        setListeners(newListeners);
    };

    const clearFamilyData = () => {
        console.log('🧹 Clearing family data');
        setMembers([]);
        setVisions([]);
        setVotes([]);
        setReflections([]);
        setFamilyStats(null);
        setMembersLoading(false);
        setVisionsLoading(false);
        setVotesLoading(false);
        setReflectionsLoading(false);
        setMembersError(null);
        setVisionsError(null);
        setVotesError(null);
        setReflectionsError(null);
    };

    // Data loading functions
    const loadMembers = async () => {
        try {
            setMembersLoading(true);
            const result = await FamilyService.getMembers();
            if (result.success && result.data) {
                setMembers(result.data);
                setMembersError(null);
            } else {
                setMembersError(result.error || 'Failed to load members');
            }
        } catch (error: any) {
            setMembersError(error.message || 'Error loading members');
        } finally {
            setMembersLoading(false);
        }
    };

    const loadVisions = async () => {
        try {
            setVisionsLoading(true);
            const result = await FamilyService.getVisions();
            if (result.success && result.data) {
                setVisions(result.data);
                setVisionsError(null);
            } else {
                setVisionsError(result.error || 'Failed to load visions');
            }
        } catch (error: any) {
            setVisionsError(error.message || 'Error loading visions');
        } finally {
            setVisionsLoading(false);
        }
    };

    const loadVotes = async () => {
        try {
            setVotesLoading(true);
            const result = await VotesService.getVotes();
            if (result.success && result.data) {
                setVotes(result.data);
                setVotesError(null);
            } else {
                setVotesError(result.error || 'Failed to load votes');
            }
        } catch (error: any) {
            setVotesError(error.message || 'Error loading votes');
        } finally {
            setVotesLoading(false);
        }
    };

    const loadReflections = async () => {
        try {
            setReflectionsLoading(true);
            const result = await FamilyService.getReflections();
            if (result.success && result.data) {
                setReflections(result.data);
                setReflectionsError(null);
            } else {
                setReflectionsError(result.error || 'Failed to load reflections');
            }
        } catch (error: any) {
            setReflectionsError(error.message || 'Error loading reflections');
        } finally {
            setReflectionsLoading(false);
        }
    };

    const loadFamilyStats = async () => {
        try {
            const result = await FamilyService.getFamilyStats();
            if (result.success && result.data) {
                setFamilyStats(result.data);
            }
        } catch (error) {
            console.error('❌ Error loading family stats:', error);
        }
    };

    // Action functions
    const refreshFamilyData = async () => {
        console.log('🔄 Refreshing family data...');
        await initializeFamilyData();
    };

    const addMember = async (memberData: Omit<FamilyMember, 'id' | 'joinedAt' | 'lastActiveAt'>): Promise<boolean> => {
        try {
            const result = await FamilyService.addMember(memberData);
            return result.success;
        } catch (error) {
            console.error('❌ Error adding member:', error);
            return false;
        }
    };

    const updateMember = async (id: string, updates: Partial<FamilyMember>): Promise<boolean> => {
        try {
            const result = await FamilyService.updateMember(id, updates);
            return result.success;
        } catch (error) {
            console.error('❌ Error updating member:', error);
            return false;
        }
    };

    const removeMember = async (id: string): Promise<boolean> => {
        try {
            const result = await FamilyService.removeMember(id);
            return result.success;
        } catch (error) {
            console.error('❌ Error removing member:', error);
            return false;
        }
    };

    const createVision = async (visionData: Omit<FamilyVision, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
        try {
            const result = await FamilyService.createVision(visionData);
            return result.success;
        } catch (error) {
            console.error('❌ Error creating vision:', error);
            return false;
        }
    };

    const updateVision = async (id: string, updates: Partial<FamilyVision>): Promise<boolean> => {
        try {
            const result = await FamilyService.updateVision(id, updates);
            return result.success;
        } catch (error) {
            console.error('❌ Error updating vision:', error);
            return false;
        }
    };

    const updateVisionProgress = async (id: string, progress: number, milestoneId?: string): Promise<boolean> => {
        try {
            const result = await FamilyService.updateVisionProgress(id, progress, milestoneId);
            return result.success;
        } catch (error) {
            console.error('❌ Error updating vision progress:', error);
            return false;
        }
    };

    const createVote = async (voteData: any, createdBy: string, createdByName: string): Promise<boolean> => {
        try {
            const result = await VotesService.createVote(voteData, createdBy, createdByName);
            return result.success;
        } catch (error) {
            console.error('❌ Error creating vote:', error);
            return false;
        }
    };

    const castVote = async (voteId: string, optionId: string, userId: string): Promise<boolean> => {
        try {
            const result = await VotesService.castVote(voteId, optionId, userId);
            return result.success;
        } catch (error) {
            console.error('❌ Error casting vote:', error);
            return false;
        }
    };

    const completeVote = async (voteId: string): Promise<boolean> => {
        try {
            const result = await VotesService.completeVote(voteId);
            return result.success;
        } catch (error) {
            console.error('❌ Error completing vote:', error);
            return false;
        }
    };

    const addReflection = async (reflectionData: Omit<FamilyReflection, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
        try {
            const result = await FamilyService.addReflection(reflectionData);
            return result.success;
        } catch (error) {
            console.error('❌ Error adding reflection:', error);
            return false;
        }
    };

    const contextValue: FamilyContextType = {
        // State
        members,
        membersLoading,
        membersError,
        visions,
        visionsLoading,
        visionsError,
        votes,
        votesLoading,
        votesError,
        reflections,
        reflectionsLoading,
        reflectionsError,
        familyStats,
        isConnected,
        lastSyncAt,

        // Actions
        refreshFamilyData,
        addMember,
        updateMember,
        removeMember,
        createVision,
        updateVision,
        updateVisionProgress,
        createVote,
        castVote,
        completeVote,
        addReflection
    };

    return (
        <FamilyContext.Provider value={contextValue}>
            {children}
        </FamilyContext.Provider>
    );
};

export default FamilyProvider;
