import { useState, useEffect } from 'react';
import { mockActivities, mockFamilyMembers, mockRecentDecisions, Activity, FamilyMember } from '../mock/activities';
import { calendarFirebaseService, FirebaseActivity } from '../services/calendarFirebase';

export const useCalendar = () => {
    const [activities, setActivities] = useState<Activity[]>(mockActivities);
    const [firebaseActivities, setFirebaseActivities] = useState<FirebaseActivity[]>([]);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(mockFamilyMembers);
    const [recentDecisions] = useState(mockRecentDecisions);
    const [selectedDay, setSelectedDay] = useState('15'); // Monday selected by default
    const [currentWeek, setCurrentWeek] = useState('This Week');
    const [isLoading, setIsLoading] = useState(false);
    const [useFirebase, setUseFirebase] = useState(false); // Toggle between mock and Firebase

    // Initialize Firebase listener
    useEffect(() => {
        if (useFirebase) {
            const unsubscribe = calendarFirebaseService.subscribeToActivities((firebaseActivities) => {
                setFirebaseActivities(firebaseActivities);
            });

            return () => unsubscribe();
        }
    }, [useFirebase]);

    // Get current activities (Firebase or mock)
    const getCurrentActivities = () => {
        return useFirebase ? firebaseActivities : activities;
    };

    // Get today's activities
    const getTodaysActivities = () => {
        const currentActivities = getCurrentActivities();
        return currentActivities.filter(activity => activity.date === 'Monday');
    };

    // Get upcoming activities for the week
    const getUpcomingActivities = () => {
        const currentActivities = getCurrentActivities();
        return currentActivities.filter(activity => 
            activity.date !== 'Monday' && 
            ['Wednesday', 'Friday', 'Saturday'].includes(activity.date)
        );
    };

    // Get activities with voting status
    const getVotingActivities = () => {
        const currentActivities = getCurrentActivities();
        return currentActivities.filter(activity => activity.status === 'voting');
    };

    // Get activity by ID
    const getActivityById = (id: string) => {
        const currentActivities = getCurrentActivities();
        return currentActivities.find(activity => activity.id === id);
    };

    // Create new activity
    const createActivity = async (activityData: Omit<Activity, 'id'>) => {
        setIsLoading(true);
        try {
            if (useFirebase) {
                const firebaseActivity: FirebaseActivity = {
                    ...activityData,
                    id: '', // Will be set by Firebase
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                await calendarFirebaseService.createActivity(firebaseActivity);
            } else {
                const newActivity: Activity = {
                    ...activityData,
                    id: `activity_${Date.now()}`
                };
                setActivities(prev => [...prev, newActivity]);
            }
        } catch (error) {
            console.error('Error creating activity:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Update activity
    const updateActivity = (id: string, updates: Partial<Activity>) => {
        setActivities(prev =>
            prev.map(activity =>
                activity.id === id ? { ...activity, ...updates } : activity
            )
        );
    };

    // Add vote to activity
    const addVote = (activityId: string, optionId: string, voterId: string) => {
        const activity = getActivityById(activityId);
        if (!activity || !activity.votingOptions) return;

        const updatedOptions = activity.votingOptions.map(option => {
            if (option.id === optionId) {
                return {
                    ...option,
                    votes: option.votes + 1,
                    voters: [...option.voters, voterId]
                };
            }
            return option;
        });

        updateActivity(activityId, { votingOptions: updatedOptions });
    };

    // Update family member vote status
    const updateMemberVoteStatus = (memberId: string, hasVoted: boolean) => {
        setFamilyMembers(prev =>
            prev.map(member =>
                member.id === memberId ? { ...member, hasVoted } : member
            )
        );
    };

    // Complete responsibility
    const completeResponsibility = (activityId: string, responsibilityId: string) => {
        const activity = getActivityById(activityId);
        if (!activity || !activity.responsibilities) return;

        const updatedResponsibilities = activity.responsibilities.map(resp =>
            resp.id === responsibilityId ? { ...resp, completed: true } : resp
        );

        updateActivity(activityId, { responsibilities: updatedResponsibilities });
    };

    // Add chat message
    const addChatMessage = (activityId: string, message: Omit<import('../mock/activities').ChatMessage, 'id'>) => {
        const activity = getActivityById(activityId);
        if (!activity) return;

        const newMessage = {
            ...message,
            id: `msg_${Date.now()}`
        };

        const updatedMessages = [...(activity.chatMessages || []), newMessage];
        updateActivity(activityId, { chatMessages: updatedMessages });
    };

    // Week navigation
    const navigateWeek = (direction: 'prev' | 'next') => {
        if (direction === 'next') {
            setCurrentWeek('Next Week');
        } else {
            setCurrentWeek('Last Week');
        }

        setTimeout(() => {
            setCurrentWeek('This Week');
        }, 1000);
    };

    // Day selection
    const selectDay = (day: string) => {
        setSelectedDay(day);
    };

    // Get voting progress
    const getVotingProgress = () => {
        const votedCount = familyMembers.filter(member => member.hasVoted).length;
        const totalCount = familyMembers.length;
        return { votedCount, totalCount };
    };

    return {
        activities,
        firebaseActivities,
        familyMembers,
        recentDecisions,
        selectedDay,
        currentWeek,
        isLoading,
        useFirebase,
        setUseFirebase,
        getTodaysActivities,
        getUpcomingActivities,
        getVotingActivities,
        getActivityById,
        createActivity,
        updateActivity,
        addVote,
        updateMemberVoteStatus,
        completeResponsibility,
        addChatMessage,
        navigateWeek,
        selectDay,
        getVotingProgress
    };
};
