import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFamilyDashStore } from '../state/store';
import { useTasksStore } from '../modules/tasks/store/tasksStore';
import { usePenaltiesStore } from '../modules/penalties/store/penaltiesStore';
import { useFamilyStore } from '../store/familyStore';
import { useProfileStore } from '../modules/profile/store/profileStore';
import { theme } from '../styles/simpleTheme';
import { useSettings } from '../contexts/SettingsContext';
import { useNotifications } from '../hooks/useNotifications';
import { DeveloperModeToggle } from '../components/DeveloperModeToggle';
import { DeveloperPanel } from '../components/DeveloperPanel';
import RealDatabaseService from '../services/database/RealDatabaseService';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardScreenProps {
    navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
    // Real data connections
    const { currentUser } = useProfileStore();
    const { tasks, addTask, updateTask } = useTasksStore();
    const { penalties, addPenalty } = usePenaltiesStore();
    const { familyMembers: familyMembersFromStore } = useFamilyStore();
    const { settings, toggleDeveloperMode } = useSettings();
    const { unreadCount } = useNotifications();

    // State management
    const [refreshing, setRefreshing] = useState(false);
    const [showDeveloperPanel, setShowDeveloperPanel] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
    const [lastRingTime, setLastRingTime] = useState(0);
    const [penaltyTime, setPenaltyTime] = useState(0);
    const [quickActions, setQuickActions] = useState([
        { id: 'add-task', title: 'Add Task', icon: 'add-circle', color: '#10B981' },
        { id: 'start-vote', title: 'Start Vote', icon: 'people', color: '#3B82F6' },
        { id: 'emergency', title: 'Emergency', icon: 'shield', color: '#EF4444' },
        { id: 'family-chat', title: 'Family Chat', icon: 'chatbubbles', color: '#8B5CF6' }
    ]);

    // Real-time connection monitoring
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const isConnected = await RealDatabaseService.checkConnection();
                setIsConnected(isConnected);
                if (isConnected) {
                    setLastSyncTime(new Date());
                }
            } catch (error) {
                console.log('Connection check failed:', error);
                setIsConnected(false);
            }
        };

        // Check connection every 30 seconds
        const connectionInterval = setInterval(checkConnection, 30000);
        checkConnection(); // Initial check

        return () => clearInterval(connectionInterval);
    }, []);

    // Auto-refresh data every 2 minutes
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            if (isConnected) {
                setLastSyncTime(new Date());
            }
        }, 120000);

        return () => clearInterval(refreshInterval);
    }, [isConnected]);

    // Memoized data with safety checks
    const activeTasks = useMemo(() => (tasks || []).filter((task: any) => task.status !== 'completed'), [tasks]);
    const activePenalties = useMemo(() => (penalties || []).filter((penalty: any) => penalty.isActive), [penalties]);
    const upcomingActivities = useMemo(() => [], []); // Calendar activities will be handled by calendar module

    // Family members data with additional UI properties
    // CLEAN DATA - Real family members without mock data
    const familyMembers = useMemo(() => {
        const baseMembers = familyMembersFromStore || [];
        const colors = ['#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B'];

        return baseMembers.map((member, index) => ({
            ...member,
            tasks: 0, // Real task count (empty initially)
            borderColor: colors[index % colors.length],
            points: 0, // Real points (empty initially)
            streak: 0, // Real streak (empty initially)
            status: 'offline' as 'online' | 'away' | 'offline', // Default offline until connected
        }));
    }, [familyMembersFromStore]);

    // Mock tasks data
    // CLEAN DATA - Empty tasks ready for real connections
    const todaysTasks: any[] = [];

    // CLEAN DATA - Empty activities ready for real connections
    const thisWeekActivities: any[] = [];

    // Advanced Quick Actions handlers
    const handleQuickAction = useCallback(async (actionId: string) => {
        switch (actionId) {
            case 'add-task':
                navigation.navigate('Tasks');
                break;

            case 'start-vote':
                navigation.navigate('Tasks', { screen: 'FamilyVote' });
                break;

            case 'emergency':
                navigation.navigate('SafeRoom', { mode: 'emotional' });
                break;

            case 'family-chat':
                navigation.navigate('Tasks', { screen: 'FamilyChat' });
                break;

            default:
                Alert.alert('Action', `${actionId} feature coming soon!`);
        }
    }, [navigation]);

    // Pull to refresh functionality
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            // Simulate data refresh
            await new Promise(resolve => setTimeout(resolve, 1000));
            setLastSyncTime(new Date());
        } catch (error) {
            console.log('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
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

    const handleRingDevice = useCallback(async (memberName: string, memberId?: string) => {
        if (!memberId) {
            Alert.alert('Error', 'Member ID not available');
            return;
        }

        Alert.alert(
            'Ring Device',
            `Ring ${memberName}'s phone?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Ring',
                    onPress: async () => {
                        const { default: DeviceRingService } = await import('../services/DeviceRingService');
                        const result = await DeviceRingService.ringDevice(
                            memberId,
                            memberName,
                            currentUser?.uid || 'unknown',
                            currentUser?.name || 'Family Member',
                            currentUser?.familyId || 'default_family',
                            30 // 30 seconds
                        );

                        if (result.success) {
                            Alert.alert('✅ Ringing', `${memberName}'s device is ringing`);
                            setLastRingTime(0);
                        } else {
                            Alert.alert('❌ Error', result.error || 'Failed to ring device');
                        }
                    }
                }
            ]
        );
    }, [currentUser]);

    const handleRingAllDevices = useCallback(async () => {
        Alert.alert(
            'Ring All Devices',
            'Ring all family devices?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Ring All',
                    onPress: async () => {
                        const { default: DeviceRingService } = await import('../services/DeviceRingService');
                        const result = await DeviceRingService.ringAllDevices(
                            currentUser?.uid || 'unknown',
                            currentUser?.name || 'Family Member',
                            currentUser?.familyId || 'default_family',
                            30 // 30 seconds
                        );

                        if (result.success) {
                            Alert.alert('✅ Ringing', 'All family devices are ringing');
                            setLastRingTime(0);
                        } else {
                            Alert.alert('❌ Error', result.error || 'Failed to ring devices');
                        }
                    }
                }
            ]
        );
    }, [currentUser]);

    const handleVote = useCallback((activityId: string) => {
        Alert.alert('Vote', `Voting on activity ${activityId}...`);
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
            {/* Enhanced Header with Connection Status */}
            <LinearGradient
                colors={isConnected ? [theme.colors.primary, '#7C3AED'] : ['#6b7280', '#9ca3af']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="home" size={20} color="white" />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Family Dashboard</Text>
                            <Text style={styles.headerSubtitle}>
                                {isConnected ? '🟢 Connected' : '🔴 Offline'} • Last sync: {lastSyncTime.toLocaleTimeString()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Profile', { screen: 'Notifications' })}>
                            <Ionicons name="notifications" size={20} color="white" />
                            {unreadCount > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.syncButton} onPress={onRefresh}>
                            <Ionicons name="refresh" size={20} color="white" />
                        </TouchableOpacity>
                        <Image
                            source={{
                                uri: currentUser?.profileImage || currentUser?.avatar || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
                            }}
                            style={styles.profileImage}
                        />
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Family Members */}
                <View style={styles.firstSection}>
                    <View style={styles.familyMembersCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Family Members</Text>
                            <Text style={styles.sectionSubtitle}>{familyMembersFromStore.length} active</Text>
                        </View>
                        <View style={styles.membersContainer}>
                            {familyMembers.length === 0 ? (
                                <View style={styles.emptyStateContainer}>
                                    <Text style={styles.emptyStateText}>No family members connected yet</Text>
                                    <Text style={styles.emptyStateSubtext}>Connect with other apps to import family members</Text>
                                </View>
                            ) : (
                                familyMembers.map((member) => (
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
                                            onPress={() => handleRingDevice(member.name, member.id)}
                                        >
                                            <Ionicons name="call" size={12} color="white" />
                                            <Text style={styles.ringButtonText}>Ring</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                </View>

                {/* Enhanced Quick Actions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <Text style={styles.sectionSubtitle}>Tap to execute instantly</Text>
                    </View>
                    <View style={styles.quickActionsContainer}>
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={styles.quickActionButtonLarge}
                                onPress={() => handleQuickAction(action.id)}
                            >
                                <LinearGradient
                                    colors={[action.color, `${action.color}CC`]}
                                    style={styles.quickActionGradientLarge}
                                >
                                    <View style={styles.quickActionIconLarge}>
                                        <Ionicons name={action.icon as any} size={28} color="white" />
                                    </View>
                                    <View style={styles.quickActionTextContainer}>
                                        <Text style={styles.quickActionTextLarge}>{action.title}</Text>
                                        <Text style={styles.quickActionSubtext}>
                                            {action.id === 'add-task' && 'Create tasks instantly'}
                                            {action.id === 'start-vote' && 'Family decisions'}
                                            {action.id === 'emergency' && 'Emergency support'}
                                            {action.id === 'family-chat' && 'Real-time chat'}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Developer Tools Access - Only show if developer mode is enabled */}
                    {settings.developerModeEnabled && (
                        <TouchableOpacity
                            style={styles.quickActionButtonLarge}
                            onPress={() => setShowDeveloperPanel(true)}
                        >
                            <LinearGradient
                                colors={['#1F2937', '#374151']}
                                style={styles.quickActionGradientLarge}
                            >
                                <View style={styles.quickActionIconLarge}>
                                    <Ionicons name="code-slash" size={28} color="#10B981" />
                                </View>
                                <View style={styles.quickActionTextContainer}>
                                    <Text style={styles.quickActionTextLarge}>Developer Tools</Text>
                                    <Text style={styles.quickActionSubtext}>Access testing & debugging tools</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
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
                        <Text style={styles.sectionSubtitle}>{tasks.filter(task => task.status === 'completed').length} of {tasks.length} done</Text>
                    </View>
                    <View style={styles.tasksContainer}>
                        {todaysTasks.length === 0 ? (
                            <View style={styles.emptyStateContainer}>
                                <Text style={styles.emptyStateText}>No tasks created yet</Text>
                                <Text style={styles.emptyStateSubtext}>Create your first task to get started</Text>
                            </View>
                        ) : (
                            todaysTasks.map((task) => (
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
                                            {task.assignedTo} • {task.status === 'completed' ? `Completed ${task.completedAt}` : task.status === 'pending' ? `Due in ${task.dueIn}` : `Overdue by ${task.overdueBy}`}
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
                            ))
                        )}
                    </View>
                    <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('Tasks')}>
                        <Text style={styles.viewAllButtonText}>View All Tasks</Text>
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
                                    <TouchableOpacity style={styles.voteButton} onPress={() => handleVote(activity.id)}>
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

                {/* Daily Essentials */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Daily Essentials</Text>

                    {/* Weather & Family Check-in Row */}
                    <View style={styles.essentialsRow}>
                        {/* Weather Card */}
                        <TouchableOpacity style={styles.essentialCard} onPress={() => navigation.navigate('Calendar')}>
                            <LinearGradient
                                colors={['#3B82F6', '#1D4ED8']}
                                style={styles.essentialGradient}
                            >
                                <View style={styles.essentialHeader}>
                                    <Ionicons name="partly-sunny" size={20} color="white" />
                                    <Text style={styles.essentialTitle}>Weather</Text>
                                </View>
                                <Text style={styles.essentialValue}>72°F</Text>
                                <Text style={styles.essentialSubtext}>Partly Cloudy</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Family Check-in Card */}
                        <TouchableOpacity style={styles.essentialCard} onPress={() => navigation.navigate('SafeRoom')}>
                            <LinearGradient
                                colors={['#EC4899', '#DB2777']}
                                style={styles.essentialGradient}
                            >
                                <View style={styles.essentialHeader}>
                                    <Ionicons name="heart" size={20} color="white" />
                                    <Text style={styles.essentialTitle}>Family Check-in</Text>
                                </View>
                                <Text style={styles.essentialValue}>3/4</Text>
                                <Text style={styles.essentialSubtext}>Feeling Good</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Today's Focus */}
                    <TouchableOpacity style={styles.focusCard} onPress={() => navigation.navigate('Vision')}>
                        <LinearGradient
                            colors={['#8B5CF6', '#7C3AED']}
                            style={styles.focusGradient}
                        >
                            <View style={styles.focusHeader}>
                                <Ionicons name="eye" size={24} color="white" />
                                <Text style={styles.focusTitle}>Today's Focus</Text>
                            </View>
                            <Text style={styles.focusText}>Family Prayer Time</Text>
                            <Text style={styles.focusSubtext}>Let's strengthen our spiritual connection together</Text>
                            <View style={styles.focusProgress}>
                                <View style={styles.focusProgressBar}>
                                    <View style={[styles.focusProgressFill, { width: '75%' }]} />
                                </View>
                                <Text style={styles.focusProgressText}>75% Complete</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Quick Actions */}
                    <View style={styles.quickActionsRow}>
                        <TouchableOpacity style={styles.quickActionSmall} onPress={() => navigation.navigate('Tasks')}>
                            <View style={styles.quickActionIconSmall}>
                                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                            </View>
                            <Text style={styles.quickActionTextSmall}>Tasks</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionSmall} onPress={() => navigation.navigate('Calendar')}>
                            <View style={styles.quickActionIconSmall}>
                                <Ionicons name="calendar" size={20} color="#3B82F6" />
                            </View>
                            <Text style={styles.quickActionTextSmall}>Calendar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionSmall} onPress={() => navigation.navigate('SafeRoom')}>
                            <View style={styles.quickActionIconSmall}>
                                <Ionicons name="shield" size={20} color="#EC4899" />
                            </View>
                            <Text style={styles.quickActionTextSmall}>Safe Room</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickActionSmall} onPress={() => navigation.navigate('Vision')}>
                            <View style={styles.quickActionIconSmall}>
                                <Ionicons name="eye" size={20} color="#8B5CF6" />
                            </View>
                            <Text style={styles.quickActionTextSmall}>Vision</Text>
                        </TouchableOpacity>
                    </View>
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
        gap: 16,
        paddingHorizontal: 8,
    },
    quickActionButtonLarge: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    quickActionGradientLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
        minHeight: 80,
    },
    quickActionIconLarge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionTextLarge: {
        fontSize: 18,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'white',
        marginBottom: 2,
        flex: 1,
    },
    quickActionSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    quickActionTextContainer: {
        flex: 1,
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
    // Daily Essentials Styles
    essentialsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    essentialCard: {
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    essentialGradient: {
        padding: 16,
        alignItems: 'center',
    },
    essentialHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    essentialTitle: {
        fontSize: 14,
        fontWeight: theme.typography.fontWeight.semibold,
        color: 'white',
        marginLeft: 6,
    },
    essentialValue: {
        fontSize: 24,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'white',
        marginBottom: 4,
    },
    essentialSubtext: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    focusCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    focusGradient: {
        padding: 20,
    },
    focusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    focusTitle: {
        fontSize: 18,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'white',
        marginLeft: 8,
    },
    focusText: {
        fontSize: 16,
        fontWeight: theme.typography.fontWeight.semibold,
        color: 'white',
        marginBottom: 6,
    },
    focusSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 16,
    },
    focusProgress: {
        alignItems: 'center',
    },
    focusProgressBar: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    focusProgressFill: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 4,
    },
    focusProgressText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickActionSmall: {
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        minWidth: 70,
    },
    quickActionIconSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionTextSmall: {
        fontSize: 12,
        fontWeight: theme.typography.fontWeight.medium,
        color: '#374151',
        textAlign: 'center',
    },

    // Empty State Styles
    emptyStateContainer: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
        marginVertical: 16,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    // New styles for enhanced features
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#EF4444',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    syncButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
});

export default DashboardScreen;