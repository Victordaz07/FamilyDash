import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCalendar } from '@/hooks/useCalendar';
import ActivityCard from '@/components/ActivityCard';
import NewEventModal from '@/components/NewEventModal';
import { WeatherWidget } from '@/components/WeatherWidget';
import { listSchedules } from '@/services/schedules';
import { listReminders } from '@/services/reminders';

const { width: screenWidth } = Dimensions.get('window');

interface CalendarHubScreenProps {
    navigation: any;
}

const CalendarHubScreen: React.FC<CalendarHubScreenProps> = ({ navigation }) => {
    const {
        selectedDay,
        currentWeek,
        currentWeekStart,
        currentMonth,
        getTodaysActivities,
        getUpcomingActivities,
        navigateWeek,
        navigateMonth,
        getMonthYear,
        getCalendarDays,
        getActivitiesForDate,
        selectDay,
        updateActivity
    } = useCalendar();

    const [showNewEventModal, setShowNewEventModal] = useState(false);
    const [viewMode, setViewMode] = useState('week'); // week, month, agenda
    const [showWeather, setShowWeather] = useState(true);
    const [showWeatherWidget, setShowWeatherWidget] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all'); // all, family, personal, work

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const calendarAnim = useRef(new Animated.Value(0)).current;
    const weatherAnim = useRef(new Animated.Value(0)).current;

    // Load real family schedules from Firebase
    const loadFamilySchedules = async () => {
        try {
            const schedules = await listSchedules('default_family');
            const formattedSchedules = schedules.map(schedule => ({
                id: schedule.id,
                title: schedule.title,
                time: formatScheduleTime(schedule),
                details: formatScheduleDetails(schedule)
            }));
            setFamilySchedules(formattedSchedules);
        } catch (error) {
            console.error('Error loading family schedules:', error);
            // Keep mock data on error
        }
    };

    const formatScheduleTime = (schedule: any) => {
        const date = new Date(schedule.timeISO);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const repeatStr = schedule.repeat?.kind?.toUpperCase() || 'DAILY';
        return `${repeatStr} ${timeStr}`;
    };

    const formatScheduleDetails = (schedule: any) => {
        let details = '';
        if (schedule.notes) {
            details = schedule.notes;
        }
        if (schedule.members && schedule.members.length > 0) {
            details += (details ? ' • ' : '') + `${schedule.members.length} members`;
        }
        return details || 'Family routine';
    };

    // Load real family reminders from Firebase
    const loadFamilyReminders = async () => {
        try {
            const reminderData = await listReminders('default_family');
            const formattedReminders = reminderData.map(reminder => ({
                id: reminder.id,
                title: reminder.title,
                time: reminder.timeUntilEvent,
                details: formatReminderDetails(reminder)
            }));
            setReminders(formattedReminders);
        } catch (error) {
            console.error('Error loading family reminders:', error);
            // Keep mock data on error
        }
    };

    const formatReminderDetails = (reminder: any) => {
        let details = '';
        if (reminder.description) {
            details = reminder.description;
        }
        if (reminder.participants && reminder.participants.length > 0) {
            const names = reminder.participants.slice(0, 2).join(' & ');
            details += (details ? ' • ' : '') + `${names}${reminder.participants.length > 2 ? ' & others' : ''}`;
        }
        if (reminder.location) {
            details += (details ? ' • ' : '') + reminder.location;
        }
        const date = new Date(reminder.scheduledFor);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        details += (details ? ' • ' : '') + `${timeStr} today`;
        return details || 'Reminder';
    };

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Calendar animation with delay
        Animated.timing(calendarAnim, {
            toValue: 1,
            duration: 1000,
            delay: 200,
            useNativeDriver: true,
        }).start();

        // Weather animation with delay
        Animated.timing(weatherAnim, {
            toValue: 1,
            duration: 1200,
            delay: 400,
            useNativeDriver: true,
        }).start();

        // Load family schedules and reminders on mount
        loadFamilySchedules();
        loadFamilyReminders();
    }, []);

    // Reload schedules and reminders when screen comes into focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadFamilySchedules();
            loadFamilyReminders();
        });

        return unsubscribe;
    }, [navigation]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleActivityPress = (activityId: string) => {
        navigation.navigate('ActivityDetail', { activityId });
    };

    const handleVotePress = () => {
        navigation.navigate('Voting');
    };

    const handleSchedulePress = () => {
        Alert.alert('Schedule', 'Schedule new activity functionality would go here');
    };

    const handleNewEventPress = () => {
        setShowNewEventModal(true);
    };

    const handleNewEventSubmit = (eventData: any) => {
        // Create new activity with unique ID
        const newActivity = {
            id: `activity_${Date.now()}`,
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
            location: eventData.location,
            organizer: 'Mom', // Default organizer
            organizerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
            type: eventData.type,
            participants: eventData.participants,
            status: 'planning',
            description: eventData.description
        };

        // Add to activities list
        Alert.alert('Success', `Event "${eventData.title}" created successfully!`);
        console.log('New event created:', newActivity);
    };

    const handleHistoryPress = () => {
        navigation.navigate('History');
    };

    const handleReminderPress = (activityTitle: string) => {
        Alert.alert('Reminder Set', `Reminder set for ${activityTitle}`);
    };

    // Generate current week days dynamically
    const getCurrentWeekDays = () => {
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekStart);
            date.setDate(currentWeekStart.getDate() + i);

            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = dayNames[i];
            const dayNumber = date.getDate().toString();
            const isToday = date.toDateString() === new Date().toDateString();

            weekDays.push({
                day: dayName,
                date: dayNumber,
                hasEvent: false, // Will be populated from real events
                isSelected: isToday,
                fullDate: date
            });
        }
        return weekDays;
    };

    const weekDays = getCurrentWeekDays();

    const todaysActivities = getTodaysActivities().map(activity => ({
        id: activity.id,
        title: activity.title,
        time: activity.time,
        location: activity.location,
        icon: getActivityIcon(activity.type),
        iconColor: getActivityColor(activity.type),
        bgColor: getActivityBgColor(activity.type),
        borderColor: getActivityColor(activity.type),
        participants: getParticipantAvatars(activity.participants),
        action: getActivityAction(activity.status)
    }));

    const upcomingActivities = getUpcomingActivities().map(activity => ({
        id: activity.id,
        title: activity.title,
        time: activity.time,
        location: activity.location,
        icon: getActivityIcon(activity.type),
        iconColor: getActivityColor(activity.type),
        bgColor: getActivityBgColor(activity.type),
        borderColor: getActivityColor(activity.type),
        participants: getParticipantAvatars(activity.participants),
        action: getActivityAction(activity.status)
    }));

    const [reminders, setReminders] = useState([
        {
            id: '1',
            title: 'Piano lesson reminder',
            time: 'in 2 hours',
            details: 'Emma & Mom • 4:00 PM today'
        },
        {
            id: '2',
            title: 'Grocery list preparation',
            time: 'in 4 hours',
            details: 'Family shopping • 6:30 PM today'
        }
    ]);

    const [familySchedules, setFamilySchedules] = useState([
        {
            id: '1',
            title: 'Morning Routine',
            time: 'Daily 7:00 AM',
            details: 'Breakfast & School Prep • All Family Members'
        },
        {
            id: '2',
            title: 'Family Dinner',
            time: 'Daily 6:30 PM',
            details: 'Quality Time Together • Family Bonding'
        },
        {
            id: '3',
            title: 'Homework Time',
            time: 'Weekdays 4:00 PM',
            details: 'Study Session • Emma & Noah'
        }
    ]);

    function getActivityIcon(type: string) {
        const icons: { [key: string]: string } = {
            'movie': 'film',
            'birthday': 'gift',
            'doctor': 'medical',
            'shopping': 'cart',
            'reading': 'book',
            'picnic': 'leaf',
            'bowling': 'bowling-ball',
            'library': 'library'
        };
        return icons[type] || 'calendar';
    }

    function getActivityColor(type: string) {
        const colors: { [key: string]: string } = {
            'movie': '#EC4899',
            'birthday': '#8B5CF6',
            'doctor': '#F59E0B',
            'shopping': '#3B82F6',
            'reading': '#F59E0B',
            'picnic': '#10B981',
            'bowling': '#3B82F6',
            'library': '#8B5CF6'
        };
        return colors[type] || '#6B7280';
    }

    function getActivityBgColor(type: string) {
        const colors: { [key: string]: string } = {
            'movie': '#FDF2F8',
            'birthday': '#F3E8FF',
            'doctor': '#FFFBEB',
            'shopping': '#EBF8FF',
            'reading': '#FFFBEB',
            'picnic': '#F0FDF4',
            'bowling': '#EBF8FF',
            'library': '#F3E8FF'
        };
        return colors[type] || '#F9FAFB';
    }

    function getParticipantAvatars(participants: string[]) {
        const avatarMap: { [key: string]: string } = {
            'Mom': 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
            'Dad': 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
            'Emma': 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
            'Jake': 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg'
        };
        return participants.map(p => avatarMap[p] || '');
    }

    function getActivityAction(status: string) {
        const actions: { [key: string]: string } = {
            'confirmed': 'remind',
            'voting': 'vote',
            'planning': 'pending',
            'completed': 'pending'
        };
        return actions[status] as 'remind' | 'list' | 'pending' | 'vote';
    }

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                            <Ionicons name="arrow-back" size={20} color="white" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>
                                {viewMode === 'week' ? 'Weekly Calendar' : 'Monthly Calendar'}
                            </Text>
                            <Text style={styles.headerSubtitle}>
                                {viewMode === 'week' ? 'Jan 15 - 21, 2024' : getMonthYear()}
                            </Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('ExpandedCalendar')}>
                                <Ionicons name="calendar" size={16} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerButton} onPress={() => setShowWeatherWidget(!showWeatherWidget)}>
                                <Ionicons name={showWeatherWidget ? "sunny" : "cloudy"} size={16} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerButton} onPress={handleNewEventPress}>
                                <Ionicons name="add" size={16} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerButton}>
                                <Ionicons name="notifications" size={16} color="white" />
                                <View style={styles.notificationBadge} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>

                {/* Week Navigation */}
                <Animated.View style={[styles.weekNavigationSection, { opacity: calendarAnim }]}>
                    <View style={styles.card}>
                        {viewMode === 'week' ? (
                            // Week View
                            <>
                                <View style={styles.weekNavigationHeader}>
                                    <TouchableOpacity style={styles.weekNavButton} onPress={() => navigateWeek('prev')}>
                                        <Ionicons name="chevron-back" size={16} color="#6B7280" />
                                    </TouchableOpacity>
                                    <Text style={styles.weekTitle}>{currentWeek}</Text>
                                    <TouchableOpacity style={styles.weekNavButton} onPress={() => navigateWeek('next')}>
                                        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.weekDaysGrid}>
                                    {weekDays.map((day, index) => (
                                        <Animated.View
                                            key={index}
                                            style={[
                                                styles.dayItem,
                                                {
                                                    transform: [{
                                                        translateY: calendarAnim.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [index * 8, 0],
                                                        })
                                                    }]
                                                }
                                            ]}
                                        >
                                            <TouchableOpacity style={styles.dayButton} onPress={() => selectDay(day.date)}>
                                                <Text style={styles.dayLabel}>{day.day}</Text>
                                                <View style={[
                                                    styles.dayNumber,
                                                    selectedDay === day.date && styles.selectedDay,
                                                    !selectedDay && day.isSelected && styles.selectedDay
                                                ]}>
                                                    <Text style={[
                                                        styles.dayNumberText,
                                                        selectedDay === day.date && styles.selectedDayText,
                                                        !selectedDay && day.isSelected && styles.selectedDayText
                                                    ]}>
                                                        {day.date}
                                                    </Text>
                                                    {day.hasEvent && (
                                                        <View style={[styles.eventDot, { backgroundColor: day.eventColor }]} />
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    ))}
                                </View>
                            </>
                        ) : (
                            // Month View
                            <>
                                <View style={styles.monthNavigationHeader}>
                                    <TouchableOpacity style={styles.weekNavButton} onPress={() => navigateMonth('prev')}>
                                        <Ionicons name="chevron-back" size={16} color="#6B7280" />
                                    </TouchableOpacity>
                                    <Text style={styles.weekTitle}>{getMonthYear()}</Text>
                                    <TouchableOpacity style={styles.weekNavButton} onPress={() => navigateMonth('next')}>
                                        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                {/* Day headers */}
                                <View style={styles.monthDayHeaders}>
                                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                                        <Text key={day} style={styles.monthDayHeader}>{day}</Text>
                                    ))}
                                </View>

                                {/* Calendar grid */}
                                <View style={styles.monthGrid}>
                                    {getCalendarDays().map((day, index) => {
                                        const dayActivities = getActivitiesForDate(day.date);
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.monthDay,
                                                    !day.isCurrentMonth && styles.monthDayInactive,
                                                    day.isToday && styles.monthDayToday
                                                ]}
                                                onPress={() => selectDay(day.dayNumber.toString())}
                                            >
                                                <Text style={[
                                                    styles.monthDayText,
                                                    !day.isCurrentMonth && styles.monthDayTextInactive,
                                                    day.isToday && styles.monthDayTextToday
                                                ]}>
                                                    {day.dayNumber}
                                                </Text>
                                                {dayActivities.length > 0 && (
                                                    <View style={styles.monthActivityDot} />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </>
                        )}
                    </View>
                </Animated.View>

                {/* Today's Activities */}
                <View style={styles.todaysActivitiesSection}>
                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Today - Monday</Text>
                            <Text style={styles.activitiesCount}>{todaysActivities.length} activities</Text>
                        </View>

                        <View style={styles.activitiesList}>
                            {todaysActivities.map((activity, index) => (
                                <ActivityCard
                                    key={activity.id || `activity-${index}`}
                                    activity={{
                                        ...activity,
                                        id: activity.id || `activity-${index}`
                                    }}
                                    onPress={() => handleActivityPress(activity.id || `activity-${index}`)}
                                    onActionPress={() => handleReminderPress(activity.title)}
                                />
                            ))}
                        </View>
                    </View>
                </View>

                {/* Upcoming This Week */}
                <View style={styles.upcomingWeekSection}>
                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Upcoming This Week</Text>
                            <TouchableOpacity onPress={() => Alert.alert('View All', 'View all activities')}>
                                <Text style={styles.viewAllButton}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.upcomingEventsList}>
                            {upcomingActivities.map((activity, index) => (
                                <ActivityCard
                                    key={activity.id || `activity-${index}`}
                                    activity={{
                                        ...activity,
                                        id: activity.id || `activity-${index}`
                                    }}
                                    onPress={() => handleActivityPress(activity.id || `activity-${index}`)}
                                    onActionPress={() => {
                                        if (activity.action === 'vote') {
                                            handleVotePress();
                                        } else {
                                            handleReminderPress(activity.title);
                                        }
                                    }}
                                />
                            ))}
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsSection}>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.quickActionsGrid}>
                            <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: '#3B82F6' }]} onPress={handleNewEventPress}>
                                <Ionicons name="add" size={20} color="white" />
                                <Text style={styles.quickActionText}>New Event</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: '#8B5CF6' }]} onPress={handleVotePress}>
                                <Ionicons name="people" size={20} color="white" />
                                <Text style={styles.quickActionText}>Start Vote</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: '#10B981' }]} onPress={handleSchedulePress}>
                                <Ionicons name="calendar" size={20} color="white" />
                                <Text style={styles.quickActionText}>Schedule</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Recent Decisions */}
                <View style={styles.recentDecisionsSection}>
                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Decisions</Text>
                            <TouchableOpacity onPress={handleHistoryPress}>
                                <Text style={styles.viewAllButton}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.recentDecisionsButton} onPress={handleHistoryPress}>
                            <Text style={styles.recentDecisionsText}>View all past decisions and voting history</Text>
                            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Family Schedules Section */}
                <View style={styles.schedulesSection}>
                    <LinearGradient
                        colors={['#3B82F6', '#1D4ED8']}
                        style={styles.schedulesCard}
                    >
                        <View style={styles.schedulesHeader}>
                            <Text style={styles.schedulesTitle}>Family Schedules</Text>
                            <Ionicons name="time" size={24} color="white" />
                        </View>

                        <View style={styles.schedulesList}>
                            {familySchedules.map(schedule => (
                                <View key={schedule.id} style={styles.scheduleItem}>
                                    <View style={styles.scheduleHeader}>
                                        <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                                        <Text style={styles.scheduleTime}>{schedule.time}</Text>
                                    </View>
                                    <Text style={styles.scheduleDetails}>{schedule.details}</Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity 
                            style={styles.manageSchedulesButton} 
                            onPress={() => navigation.navigate('FamilySchedules', { 
                                familyId: 'default_family', 
                                userId: 'default_user' 
                            })}
                        >
                            <Text style={styles.manageSchedulesText}>Manage Schedules</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* Reminders */}
                <View style={styles.remindersSection}>
                    <LinearGradient
                        colors={['#FB923C', '#EF4444']}
                        style={styles.remindersCard}
                    >
                        <View style={styles.remindersHeader}>
                            <Text style={styles.remindersTitle}>Upcoming Reminders</Text>
                            <Ionicons name="notifications" size={24} color="white" />
                        </View>

                        <View style={styles.remindersList}>
                            {reminders.map(reminder => (
                                <View key={reminder.id} style={styles.reminderItem}>
                                    <View style={styles.reminderHeader}>
                                        <Text style={styles.reminderTitle}>{reminder.title}</Text>
                                        <Text style={styles.reminderTime}>{reminder.time}</Text>
                                    </View>
                                    <Text style={styles.reminderDetails}>{reminder.details}</Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity 
                            style={styles.manageNotificationsButton} 
                            onPress={() => navigation.navigate('FamilyReminders', { 
                                familyId: 'default_family', 
                                userId: 'default_user' 
                            })}
                        >
                            <Text style={styles.manageNotificationsText}>Manage Notifications</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>


                {/* Bottom spacing for navigation */}
                <View style={styles.bottomSpacing} />

                {/* New Event Modal */}
                <NewEventModal
                    visible={showNewEventModal}
                    onClose={() => setShowNewEventModal(false)}
                    onSubmit={handleNewEventSubmit}
                />

                {/* Weather Widget */}
                <WeatherWidget
                    visible={showWeatherWidget}
                    onClose={() => setShowWeatherWidget(false)}
                />
            </ScrollView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 32,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 12,
        height: 12,
        backgroundColor: '#EF4444',
        borderRadius: 6,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    weekNavigationSection: {
        paddingHorizontal: 16,
        marginTop: -24,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    weekNavigationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    weekNavButton: {
        width: 32,
        height: 32,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    weekTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    weekDaysGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayItem: {
        alignItems: 'center',
    },
    dayLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    dayNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    selectedDay: {
        backgroundColor: '#3B82F6',
    },
    dayNumberText: {
        fontSize: 14,
        color: '#6B7280',
    },
    selectedDayText: {
        color: 'white',
        fontWeight: 'bold',
    },
    eventDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    todaysActivitiesSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    activitiesCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    activitiesList: {
        gap: 12,
    },
    upcomingWeekSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    viewAllButton: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    upcomingEventsList: {
        gap: 12,
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickActionButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
        marginTop: 4,
    },
    recentDecisionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    recentDecisionsButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    recentDecisionsText: {
        fontSize: 14,
        color: '#6B7280',
    },
    remindersSection: {
        paddingHorizontal: 16,
        marginTop: 0,
        marginBottom: 80,
    },
    remindersCard: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    remindersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    remindersTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    remindersList: {
        gap: 12,
        marginBottom: 16,
    },
    reminderItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 12,
    },
    reminderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    reminderTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    reminderTime: {
        fontSize: 14,
        color: 'white',
    },
    reminderDetails: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    manageNotificationsButton: {
        width: '100%',
        paddingVertical: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        alignItems: 'center',
    },
    manageNotificationsText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    bottomSpacing: {
        height: 80,
    },
    dayButton: {
        alignItems: 'center',
        padding: 8,
    },
    viewModeSelector: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 2,
    },
    viewModeButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    viewModeButtonActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    viewModeButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },
    viewModeButtonTextActive: {
        color: '#1F2937',
        fontWeight: '600',
    },
    // Month View Styles
    monthNavigationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthDayHeaders: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    monthDayHeader: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        paddingVertical: 8,
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    monthDay: {
        width: '14.28%', // 100% / 7 days
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#E5E7EB',
        position: 'relative',
    },
    monthDayInactive: {
        backgroundColor: '#F9FAFB',
    },
    monthDayToday: {
        backgroundColor: '#8B5CF6',
        borderRadius: 8,
    },
    monthDayText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    monthDayTextInactive: {
        color: '#9CA3AF',
    },
    monthDayTextToday: {
        color: 'white',
        fontWeight: '600',
    },
    monthActivityDot: {
        position: 'absolute',
        bottom: 4,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#8B5CF6',
    },
    // Family Schedules Styles
    schedulesSection: {
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
    },
    schedulesCard: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    schedulesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    schedulesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    schedulesList: {
        gap: 12,
        marginBottom: 16,
    },
    scheduleItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 12,
    },
    scheduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    scheduleTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    scheduleTime: {
        fontSize: 14,
        color: 'white',
    },
    scheduleDetails: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    manageSchedulesButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    manageSchedulesText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default CalendarHubScreen;




