import { useState, useEffect } from 'react';
import {
    mockPenalties,
    mockReflections,
    mockPenaltyStats,
    mockFamilyMembers,
    penaltyTypes,
    commonReasons,
    Penalty,
    Reflection,
    PenaltyStats
} from '../mock/penalties';

export const usePenalties = () => {
    const [penalties, setPenalties] = useState<Penalty[]>(mockPenalties);
    const [reflections] = useState<Reflection[]>(mockReflections);
    const [stats] = useState<PenaltyStats>(mockPenaltyStats);
    const [familyMembers] = useState(mockFamilyMembers);
    const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    // Timer effect for active penalties
    useEffect(() => {
        if (!isTimerRunning) return;

        const interval = setInterval(() => {
            setPenalties(prevPenalties =>
                prevPenalties.map(penalty => {
                    if (penalty.status === 'active' && penalty.remainingTime > 0) {
                        const newRemainingTime = penalty.remainingTime - 1;
                        const newProgress = ((penalty.duration - newRemainingTime) / penalty.duration) * 100;

                        if (newRemainingTime <= 0) {
                            // Penalty completed
                            return {
                                ...penalty,
                                remainingTime: 0,
                                progress: 100,
                                status: 'completed' as const,
                                completedAt: new Date().toLocaleString()
                            };
                        }

                        return {
                            ...penalty,
                            remainingTime: newRemainingTime,
                            progress: Math.min(100, newProgress)
                        };
                    }
                    return penalty;
                })
            );
        }, 1000); // Update every second

        return () => clearInterval(interval);
    }, [isTimerRunning]);

    // Get penalties by status
    const getPenaltiesByStatus = (status: string) => {
        return penalties.filter(penalty => penalty.status === status);
    };

    // Get active penalties
    const getActivePenalties = () => {
        return penalties.filter(penalty => penalty.status === 'active');
    };

    // Get completed penalties
    const getCompletedPenalties = () => {
        return penalties.filter(penalty => penalty.status === 'completed');
    };

    // Get recently completed penalties (last 7 days)
    const getRecentlyCompletedPenalties = () => {
        return penalties.filter(penalty =>
            penalty.status === 'completed' &&
            penalty.completedAt &&
            new Date(penalty.completedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        );
    };

    // Get penalty by ID
    const getPenaltyById = (id: string) => {
        return penalties.find(penalty => penalty.id === id);
    };

    // Create new penalty
    const createPenalty = (penaltyData: Omit<Penalty, 'id' | 'progress' | 'remainingTime' | 'status'>) => {
        const newPenalty: Penalty = {
            ...penaltyData,
            id: `penalty_${Date.now()}`,
            progress: 0,
            remainingTime: penaltyData.duration,
            status: 'active'
        };
        setPenalties(prev => [...prev, newPenalty]);
        return newPenalty;
    };

    // Update penalty
    const updatePenalty = (id: string, updates: Partial<Penalty>) => {
        setPenalties(prev =>
            prev.map(penalty =>
                penalty.id === id ? { ...penalty, ...updates } : penalty
            )
        );
    };

    // Add time to penalty
    const addTimeToPenalty = (id: string, minutes: number) => {
        const penalty = getPenaltyById(id);
        if (penalty && penalty.status === 'active') {
            updatePenalty(id, {
                duration: penalty.duration + minutes,
                remainingTime: penalty.remainingTime + minutes
            });
        }
    };

    // Subtract time from penalty
    const subtractTimeFromPenalty = (id: string, minutes: number) => {
        const penalty = getPenaltyById(id);
        if (penalty && penalty.status === 'active') {
            const newRemainingTime = Math.max(0, penalty.remainingTime - minutes);
            const newDuration = penalty.duration - (penalty.remainingTime - newRemainingTime);

            if (newRemainingTime <= 0) {
                // End penalty early
                updatePenalty(id, {
                    remainingTime: 0,
                    progress: 100,
                    status: 'completed',
                    completedAt: new Date().toLocaleString(),
                    endedEarly: true
                });
            } else {
                updatePenalty(id, {
                    duration: newDuration,
                    remainingTime: newRemainingTime,
                    progress: ((newDuration - newRemainingTime) / newDuration) * 100
                });
            }
        }
    };

    // End penalty early
    const endPenaltyEarly = (id: string) => {
        updatePenalty(id, {
            remainingTime: 0,
            progress: 100,
            status: 'completed',
            completedAt: new Date().toLocaleString(),
            endedEarly: true
        });
    };

    // Pause/Resume penalty
    const togglePenaltyPause = (id: string) => {
        const penalty = getPenaltyById(id);
        if (penalty) {
            const newStatus = penalty.status === 'paused' ? 'active' : 'paused';
            updatePenalty(id, { status: newStatus });
        }
    };

    // Delete penalty
    const deletePenalty = (id: string) => {
        setPenalties(prev => prev.filter(penalty => penalty.id !== id));
    };

    // Format time remaining
    const formatTimeRemaining = (minutes: number) => {
        if (minutes <= 0) return '00:00';

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:00`;
        } else {
            return `${mins.toString().padStart(2, '0')}:00`;
        }
    };

    // Format duration
    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes}m`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
    };

    // Get reflections for a penalty
    const getReflectionsForPenalty = (penaltyId: string) => {
        return reflections.filter(reflection => reflection.penaltyId === penaltyId);
    };

    // Get latest reflections
    const getLatestReflections = (limit: number = 3) => {
        return reflections
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
    };

    // Add reflection
    const addReflection = (reflectionData: Omit<Reflection, 'id' | 'createdAt' | 'reactions'>) => {
        const newReflection: Reflection = {
            ...reflectionData,
            id: `reflection_${Date.now()}`,
            createdAt: new Date().toLocaleString(),
            reactions: {
                heart: 0,
                clap: 0,
                muscle: 0,
                star: 0
            }
        };
        // In a real app, this would update the reflections state
        console.log('New reflection added:', newReflection);
        return newReflection;
    };

    // Add reaction to reflection
    const addReactionToReflection = (reflectionId: string, reactionType: 'heart' | 'clap' | 'muscle' | 'star') => {
        // In a real app, this would update the reflection's reactions
        console.log(`Added ${reactionType} reaction to reflection ${reflectionId}`);
    };

    // Get penalty statistics
    const getPenaltyStatistics = () => {
        const activePenalties = getActivePenalties().length;
        const completedPenalties = getCompletedPenalties().length;
        const thisWeekPenalties = penalties.filter(penalty => {
            const penaltyDate = new Date(penalty.startedAt);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return penaltyDate >= weekAgo;
        }).length;

        const averageTime = penalties.length > 0
            ? Math.round(penalties.reduce((sum, penalty) => sum + penalty.duration, 0) / penalties.length)
            : 0;

        return {
            active: activePenalties,
            thisWeek: thisWeekPenalties,
            completed: completedPenalties,
            averageTime
        };
    };

    // Get family member by ID
    const getFamilyMemberById = (id: string) => {
        return familyMembers.find(member => member.id === id);
    };

    // Get penalty type by ID
    const getPenaltyTypeById = (id: string) => {
        return penaltyTypes.find(type => type.id === id);
    };

    return {
        penalties,
        reflections,
        stats,
        familyMembers,
        penaltyTypes,
        commonReasons,
        selectedPenalty,
        setSelectedPenalty,
        isTimerRunning,
        setIsTimerRunning,
        getPenaltiesByStatus,
        getActivePenalties,
        getCompletedPenalties,
        getRecentlyCompletedPenalties,
        getPenaltyById,
        createPenalty,
        updatePenalty,
        addTimeToPenalty,
        subtractTimeFromPenalty,
        endPenaltyEarly,
        togglePenaltyPause,
        deletePenalty,
        formatTimeRemaining,
        formatDuration,
        getReflectionsForPenalty,
        getLatestReflections,
        addReflection,
        addReactionToReflection,
        getPenaltyStatistics,
        getFamilyMemberById,
        getPenaltyTypeById
    };
};
