import { useState, useEffect } from 'react';
import { mockActivities, mockFamilyMembers, mockRecentDecisions, Activity, FamilyMember } from '../mock/activities';
import { realCalendarService, FirebaseActivity } from '../services/RealCalendarService';

export const useCalendar = () => {
    const [activities, setActivities] = useState<Activity[]>(mockActivities);
    const [firebaseActivities, setFirebaseActivities] = useState<FirebaseActivity[]>([]);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(mockFamilyMembers);
    const [recentDecisions] = useState(mockRecentDecisions);
    const [selectedDay, setSelectedDay] = useState('15'); // Monday selected by default
    const [currentWeek, setCurrentWeek] = useState('This Week');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [useFirebase, setUseFirebase] = useState(true); // 🔥 Firebase ACTIVATED by default

    // Initialize Firebase listener
    useEffect(() => {
        if (useFirebase) {
            const setupSubscription = async () => {
                try {
                    console.log('🗓️ Initializing calendar with Firebase...');

                    const unsubscribe = await realCalendarService.subscribeToActivities((firebaseActivities) => {
                        setFirebaseActivities(firebaseActivities);
                    });

                    return unsubscribe;
                } catch (error) {
                    console.error('❌ Error setting up Firebase subscription:', error);
                    return () => { };
                }
            };

            let unsubscribe: (() => void) | undefined;

            setupSubscription().then(unsub => {
                unsubscribe = unsub;
            });

            return () => {
                if (unsubscribe && typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            };
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
                await realCalendarService.createActivity(firebaseActivity);
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

    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return startOfWeek;
    });

    // Week navigation
    const navigateWeek = (direction: 'prev' | 'next') => {
        const newWeekStart = new Date(currentWeekStart);
        if (direction === 'next') {
            newWeekStart.setDate(currentWeekStart.getDate() + 7);
        } else {
            newWeekStart.setDate(currentWeekStart.getDate() - 7);
        }
        setCurrentWeekStart(newWeekStart);

        // Update currentWeek display
        const today = new Date();
        const diffTime = newWeekStart.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            setCurrentWeek('This Week');
        } else if (diffDays > 0) {
            setCurrentWeek('Next Week');
        } else {
            setCurrentWeek('Last Week');
        }
    };

    // Navigate between months
    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(currentMonth);
        if (direction === 'prev') {
            newMonth.setMonth(newMonth.getMonth() - 1);
        } else {
            newMonth.setMonth(newMonth.getMonth() + 1);
        }
        setCurrentMonth(newMonth);
    };

    // Get month name and year
    const getMonthYear = () => {
        return currentMonth.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
        });
    };

    // Get calendar days for current month
    const getCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // First day of the month
        const firstDay = new Date(year, month, 1);
        // First day of the week (0 = Sunday)
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const currentDate = new Date(startDate);

        // Generate 42 days (6 weeks)
        for (let i = 0; i < 42; i++) {
            days.push({
                date: new Date(currentDate),
                isCurrentMonth: currentDate.getMonth() === month,
                isToday: currentDate.toDateString() === new Date().toDateString(),
                dayNumber: currentDate.getDate()
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    };

    // Get activities for a specific date
    const getActivitiesForDate = (date: Date) => {
        const currentActivities = getCurrentActivities();

        // For now, return mock activities based on day of week
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[date.getDay()];

        return currentActivities.filter(activity => activity.date === dayName);
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
        currentWeekStart,
        currentMonth,
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
        navigateMonth,
        getMonthYear,
        getCalendarDays,
        getActivitiesForDate,
        selectDay,
        getVotingProgress
    };
};
