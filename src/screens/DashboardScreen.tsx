import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../locales/i18n';
import { useFamilyDashStore } from '../state/store';
// TEMPORARILY DISABLED FOR DEBUGGING
// import { useTasksStore } from '../modules/tasks/store/tasksStore';
// import { usePenaltiesStore } from '../modules/penalties/store/penaltiesStore';
// import { useGoalsStore } from '../modules/goals/store/goalsStore';
import { useFamilyStore } from '../store/familyStore';
import { theme } from '../styles/simpleTheme';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardScreenProps {
    navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
    const { t } = useTranslation();

    // MOCK DATA TEMPORARILY - Firebase services disabled for debugging
    const tasks = [
        { id: '1', title: 'Mock Task 1', status: 'pending', assignedTo: 'demo' },
        { id: '2', title: 'Mock Task 2', status: 'completed', assignedTo: 'demo' },
    ];
    const penalties = [];
    const goals = [];
    const familyMembersFromStore = [
        { id: 'demo', name: 'Demo User', role: 'admin', online: true }
    ];

    const [penaltyTime, setPenaltyTime] = useState(15 * 60 + 42); // 15 minutes 42 seconds
    const [lastRingTime, setLastRingTime] = useState(5); // 5 minutes ago

    // Timer para la penalización
    useEffect(() => {
        const timer = setInterval(() => {
            setPenaltyTime(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Memoized data with safety checks
    const activeTasks = useMemo(() => (tasks || []).filter((task: any) => task.status !== 'completed'), [tasks]);
    const activePenalties = useMemo(() => (penalties || []).filter((penalty: any) => penalty.isActive), [penalties]);
    const upcomingActivities = useMemo(() => [], []); // Calendar activities will be handled by calendar module
    const activeGoals = useMemo(() => (goals || []).filter((goal: any) => goal.status === 'active'), [goals]);

    // Family members data with additional UI properties
    const familyMembers = useMemo(() => {
        const baseMembers = familyMembersFromStore || [];
        const colors = ['#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B'];
        const statuses = ['online', 'away', 'offline'];

        return baseMembers.map((member, index) => ({
            ...member,
            tasks: Math.floor(Math.random() * 5) + 1, // Mock task count
            borderColor: colors[index % colors.length],
            points: Math.floor(Math.random() * 1000) + 500, // Mock points
            streak: Math.floor(Math.random() * 10) + 1, // Mock streak
            status: statuses[index % statuses.length] as 'online' | 'away' | 'offline',
        }));
    }, [familyMembersFromStore]);

    // Mock tasks data
    const todaysTasks = [
        { id: '1', title: 'Clean bedroom', assignedTo: 'Emma', status: 'completed', completedAt: '2h ago', priority: 'high' },
        { id: '2', title: 'Homework - Math', assignedTo: 'Jake', status: 'pending', dueIn: '3h', priority: 'medium' },
        { id: '3', title: 'Fix kitchen sink', assignedTo: 'Dad', status: 'overdue', overdueBy: '1d', priority: 'high' },
    ];

    // Mock activities data
    const thisWeekActivities = [
        { id: '1', title: 'Movie Night', date: 'Friday 7:00 PM', description: 'Family vote needed', status: 'vote_needed' },
        { id: '2', title: "Emma's Birthday Party", date: 'Saturday 2:00 PM', description: 'Mom organizing', status: 'confirmed' },
    ];

    // Navigation handlers
    const handleVote = useCallback(() => {
        navigation.navigate('Calendar', { screen: 'Voting' });
    }, [navigation]);

    const handleActivePenalty = useCallback(() => {
        navigation.navigate('PenaltiesMain');
    }, [navigation]);

    const handleNotifications = useCallback(() => {
        Alert.alert('Notifications', 'Notifications feature coming soon!');
    }, []);

    const handleTaskPress = useCallback((taskId: string) => {
        navigation.navigate('Tasks', { screen: 'TaskDetails', params: { taskId } });
    }, [navigation]);

    const handleActivityPress = useCallback((activityId: string) => {
        navigation.navigate('Calendar', { screen: 'ActivityDetail', params: { activityId } });
    }, [navigation]);

    const handleGoalPress = useCallback((goalId: string) => {
        navigation.navigate('Goals', { screen: 'GoalDetails', params: { goalId } });
    }, [navigation]);

    const handleAddTask = useCallback(() => {
        navigation.navigate('Tasks');
    }, [navigation]);

    const handleSafeRoom = useCallback(() => {
        navigation.navigate('SafeRoom');
    }, [navigation]);

    const handleDeviceTools = useCallback(() => {
        navigation.navigate('DeviceTools');
    }, [navigation]);

    const handleRingDevice = useCallback((memberName: string) => {
        Alert.alert('Ring Device', `Ringing ${memberName}'s phone...`);
    }, []);

    const handleRingAllDevices = useCallback(() => {
        Alert.alert('Ring All Devices', 'Ringing all family devices...');
        setLastRingTime(0);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getTaskStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return theme.colors.success;
            case 'pending': return theme.colors.warning;
            case 'overdue': return theme.colors.error;
            default: return theme.colors.gray;
        }
    };

    const getTaskStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return 'checkmark-circle';
            case 'pending': return 'ellipse-outline';
            case 'overdue': return 'warning';
            default: return 'ellipse-outline';
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[theme.colors.primary, '#7C3AED']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="home" size={20} color="white" />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>{t('dashboard.title')}</Text>
                            <Text style={styles.headerSubtitle}>Johnson Family</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.notificationButton} onPress={handleNotifications}>
                            <Ionicons name="notifications-outline" size={20} color="white" />
                        </TouchableOpacity>
                        <Image
                            source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' }}
                            style={styles.profileImage}
                        />
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Family Members */}
                <View style={styles.firstSection}>
                    <View style={styles.familyMembersCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{t('dashboard.familyMembers')}</Text>
                            <Text style={styles.sectionSubtitle}>4 {t('dashboard.activeMembers')}</Text>
                        </View>
                        <View style={styles.membersContainer}>
                            {familyMembers.map((member) => (
                                <View key={member.id} style={styles.memberCard}>
                                    <View style={styles.memberAvatarContainer}>
                                        <Image source={{ uri: member.avatar }} style={[styles.memberAvatar, { borderColor: member.borderColor }]} />
                                        <View style={[styles.memberBadge, { backgroundColor: member.status === 'offline' ? theme.colors.error : theme.colors.success }]}>
                                            <Text style={styles.memberBadgeText}>
                                                {member.status === 'offline' ? '!' : member.tasks}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.memberName}>{member.name}</Text>
                                    <TouchableOpacity
                                        style={styles.ringButton}
                                        onPress={() => handleRingDevice(member.name)}
                                    >
                                        <Ionicons name="call" size={12} color="white" />
                                        <Text style={styles.ringButtonText}>Ring</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <View style={styles.quickActionsContainer}>
                        <TouchableOpacity style={styles.quickActionButton} onPress={handleAddTask}>
                            <LinearGradient
                                colors={[theme.colors.success, '#059669']}
                                style={styles.quickActionGradient}
                            >
                                <View style={styles.quickActionIcon}>
                                    <Ionicons name="add" size={20} color="white" />
                                </View>
                                <Text style={styles.quickActionText}>Add Task</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('LoginScreen' as never)}
                        >
                            <LinearGradient
                                colors={[theme.colors.firebase || '#FF6B6B', '#FF8A65']}
                                style={styles.quickActionGradient}
                            >
                                <View style={styles.quickActionIcon}>
                                    <Ionicons name="log-in" size={20} color="white" />
                                </View>
                                <Text style={styles.quickActionText}>Login</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate('RegisterScreen' as never)}
                        >
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.quickActionGradient}
                            >
                                <View style={styles.quickActionIcon}>
                                    <Ionicons name="person-add" size={20} color="white" />
                                </View>
                                <Text style={styles.quickActionText}>Register</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionButton} onPress={handleSafeRoom}>
                            <LinearGradient
                                colors={['#EC4899', '#DB2777']}
                                style={styles.quickActionGradient}
                            >
                                <View style={styles.quickActionIcon}>
                                    <Ionicons name="heart" size={20} color="white" />
                                </View>
                                <Text style={styles.quickActionText}>Safe Room</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Device Tools */}
                <View style={styles.section}>
                    <LinearGradient
                        colors={['#7C3AED', '#6D28D9']}
                        style={styles.deviceToolsCard}
                    >
                        <View style={styles.deviceToolsHeader}>
                            <View style={styles.deviceToolsTitleContainer}>
                                <Text style={styles.deviceToolsEmoji}>📱</Text>
                                <Text style={styles.deviceToolsTitle}>Device Tools</Text>
                            </View>
                            <Ionicons name="phone-portrait" size={24} color="white" />
                        </View>

                        <TouchableOpacity style={styles.ringAllButton} onPress={handleRingAllDevices}>
                            <View style={styles.ringAllIcon}>
                                <Ionicons name="call" size={20} color="white" />
                            </View>
                            <Text style={styles.ringAllText}>Ring All Devices</Text>
                        </TouchableOpacity>

                        <Text style={styles.lastRingText}>
                            Last ring: {lastRingTime === 0 ? 'Just now' : `${lastRingTime} min ago`}
                        </Text>
                    </LinearGradient>
                </View>

                {/* Today's Tasks */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today's Tasks</Text>
                        <Text style={styles.sectionSubtitle}>6 of 8 done</Text>
                    </View>
                    <View style={styles.tasksContainer}>
                        {todaysTasks.map((task) => (
                            <TouchableOpacity
                                key={task.id}
                                style={[styles.taskCard, { borderLeftColor: getTaskStatusColor(task.status) }]}
                                onPress={() => handleTaskPress(task.id)}
                            >
                                <View style={[styles.taskStatusIcon, { backgroundColor: getTaskStatusColor(task.status) }]}>
                                    <Ionicons name={getTaskStatusIcon(task.status) as any} size={12} color="white" />
                                </View>
                                <Image
                                    source={{ uri: familyMembers.find(m => m.name === task.assignedTo)?.avatar }}
                                    style={styles.taskAssigneeAvatar}
                                />
                                <View style={styles.taskContent}>
                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                    <Text style={styles.taskMeta}>
                                        {task.assignedTo} • {
                                            task.status === 'completed' ? `Completed ${task.completedAt}` :
                                                task.status === 'pending' ? `Due in ${task.dueIn}` :
                                                    `Overdue by ${task.overdueBy}`
                                        }
                                    </Text>
                                </View>
                                <View style={styles.taskActions}>
                                    {task.status === 'completed' && (
                                        <>
                                            <Text style={styles.taskEmoji}>⭐</Text>
                                            <Text style={styles.taskEmoji}>🎉</Text>
                                        </>
                                    )}
                                    {task.status === 'pending' && (
                                        <TouchableOpacity style={[styles.taskActionButton, { backgroundColor: theme.colors.warning }]}>
                                            <Ionicons name="play" size={12} color="white" />
                                        </TouchableOpacity>
                                    )}
                                    {task.status === 'overdue' && (
                                        <TouchableOpacity style={[styles.taskActionButton, { backgroundColor: theme.colors.error }]}>
                                            <Ionicons name="time" size={12} color="white" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('Tasks')}>
                        <Text style={styles.viewAllButtonText}>{t('dashboard.viewAll')} {t('navigation.tasks')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Active Penalty */}
                {activePenalties.length > 0 && (
                    <View style={styles.section}>
                        <LinearGradient
                            colors={[theme.colors.error, '#DC2626']}
                            style={styles.penaltyCard}
                        >
                            <View style={styles.penaltyHeader}>
                                <Text style={styles.penaltyTitle}>Active Penalty</Text>
                                <Ionicons name="hourglass" size={24} color="white" />
                            </View>

                            <View style={styles.penaltyContent}>
                                <Image
                                    source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg' }}
                                    style={styles.penaltyAvatar}
                                />
                                <View>
                                    <Text style={styles.penaltyMemberName}>Jake</Text>
                                    <Text style={styles.penaltyReason}>No tablet time</Text>
                                </View>
                            </View>

                            <View style={styles.penaltyTimer}>
                                <View style={styles.penaltyTimerHeader}>
                                    <Text style={styles.penaltyTimerLabel}>Time remaining</Text>
                                    <Text style={styles.penaltyTimerValue}>{formatTime(penaltyTime)}</Text>
                                </View>
                                <View style={styles.penaltyProgressBar}>
                                    <View style={[styles.penaltyProgress, { width: `${(penaltyTime / (15 * 60 + 42)) * 100}%` }]} />
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                )}

                {/* This Week */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>This Week</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
                            <Text style={styles.sectionLink}>View Calendar</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.activitiesContainer}>
                        {thisWeekActivities.map((activity) => (
                            <TouchableOpacity
                                key={activity.id}
                                style={styles.activityCard}
                                onPress={() => handleActivityPress(activity.id)}
                            >
                                <View style={[styles.activityIcon, { backgroundColor: activity.id === '1' ? theme.colors.primary : '#8B5CF6' }]}>
                                    <Ionicons
                                        name={activity.id === '1' ? 'film' : 'gift'}
                                        size={16}
                                        color="white"
                                    />
                                </View>
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityTitle}>{activity.title}</Text>
                                    <Text style={styles.activityMeta}>
                                        {activity.date} • {activity.description}
                                    </Text>
                                </View>
                                {activity.status === 'vote_needed' ? (
                                    <TouchableOpacity style={styles.voteButton} onPress={handleVote}>
                                        <Text style={styles.voteButtonText}>Vote</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.confirmedIcon}>
                                        <Ionicons name="checkmark" size={12} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Family Goal */}
                <View style={styles.section}>
                    <LinearGradient
                        colors={['#F59E0B', '#D97706']}
                        style={styles.goalCard}
                    >
                        <View style={styles.goalHeader}>
                            <Text style={styles.goalTitle}>Family Goal</Text>
                            <Ionicons name="trophy" size={24} color="white" />
                        </View>

                        <View style={styles.goalContent}>
                            <Text style={styles.goalName}>Save for Disney World Trip</Text>
                            <Text style={styles.goalProgress}>$2,400 of $5,000 saved</Text>

                            <View style={styles.goalProgressBar}>
                                <View style={styles.goalProgressFill} />
                            </View>
                            <Text style={styles.goalStats}>48% complete • 4 months to go</Text>
                        </View>

                        <View style={styles.goalContributors}>
                            {familyMembers.map((member, index) => (
                                <View key={member.id} style={styles.contributorCard}>
                                    <Image source={{ uri: member.avatar }} style={styles.contributorAvatar} />
                                    <Text style={styles.contributorAmount}>
                                        ${[600, 800, 500, 500][index]}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </LinearGradient>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    notificationButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        marginTop: -12,
    },
    section: {
        marginBottom: 16,
    },
    firstSection: {
        marginBottom: 16,
        marginTop: 8,
    },
    familyMembersCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: theme.typography.fontWeight.bold,
        color: '#1F2937',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: theme.colors.success,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    sectionLink: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    membersContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    memberCard: {
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRadius: 16,
        padding: 8,
    },
    memberAvatarContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    memberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 3,
    },
    memberBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberBadgeText: {
        fontSize: 10,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'white',
    },
    memberName: {
        fontSize: 12,
        fontWeight: theme.typography.fontWeight.medium,
        color: '#374151',
        marginBottom: 8,
    },
    ringButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7C3AED',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ringButtonText: {
        fontSize: 10,
        color: 'white',
        fontWeight: theme.typography.fontWeight.medium,
    },
    quickActionsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    quickActionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    quickActionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionText: {
        fontSize: 16,
        fontWeight: theme.typography.fontWeight.semibold,
        color: 'white',
    },
    deviceToolsCard: {
        borderRadius: 16,
        padding: 16,
    },
    deviceToolsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    deviceToolsTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deviceToolsEmoji: {
        fontSize: 18,
    },
    deviceToolsTitle: {
        fontSize: 18,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'white',
    },
    ringAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        gap: 12,
    },
    ringAllIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringAllText: {
        fontSize: 18,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'white',
    },
    lastRingText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    tasksContainer: {
        gap: 12,
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    taskStatusIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    taskAssigneeAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: theme.typography.fontWeight.medium,
        color: '#1F2937',
    },
    taskMeta: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    taskActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    taskEmoji: {
        fontSize: 18,
    },
    taskActionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewAllButton: {
        marginTop: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderRadius: 12,
        alignItems: 'center',
    },
    viewAllButtonText: {
        fontSize: 14,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.primary,
    },
    penaltyCard: {
        borderRadius: 16,
        padding: 16,
    },
    penaltyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    penaltyTitle: {
        fontSize: 18,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'white',
    },
    penaltyContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    penaltyAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    penaltyMemberName: {
        fontSize: 16,
        fontWeight: theme.typography.fontWeight.semibold,
        color: 'white',
    },
    penaltyReason: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    penaltyTimer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 12,
    },
    penaltyTimerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    penaltyTimerLabel: {
        fontSize: 14,
        color: 'white',
    },
    penaltyTimerValue: {
        fontSize: 18,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'white',
    },
    penaltyProgressBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    penaltyProgress: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 4,
    },
    activitiesContainer: {
        gap: 12,
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: theme.typography.fontWeight.medium,
        color: '#1F2937',
    },
    activityMeta: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    voteButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    voteButtonText: {
        fontSize: 12,
        color: 'white',
        fontWeight: theme.typography.fontWeight.medium,
    },
    confirmedIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    goalCard: {
        borderRadius: 16,
        padding: 16,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'white',
    },
    goalContent: {
        marginBottom: 16,
    },
    goalName: {
        fontSize: 16,
        fontWeight: theme.typography.fontWeight.semibold,
        color: 'white',
        marginBottom: 8,
    },
    goalProgress: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 12,
    },
    goalProgressBar: {
        height: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 6,
        marginBottom: 8,
        overflow: 'hidden',
    },
    goalProgressFill: {
        height: '100%',
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 6,
    },
    goalStats: {
        fontSize: 14,
        color: 'white',
    },
    goalContributors: {
        flexDirection: 'row',
        gap: 8,
    },
    contributorCard: {
        flex: 1,
        alignItems: 'center',
    },
    contributorAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginBottom: 4,
    },
    contributorAmount: {
        fontSize: 12,
        color: 'white',
    },
});

export default DashboardScreen;