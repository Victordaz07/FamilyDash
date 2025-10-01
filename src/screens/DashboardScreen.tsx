import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFamilyDashStore } from '../state/store';
import NotificationsModal from '../components/NotificationsModal';
import { theme } from '../styles/simpleTheme';
import { Button, Card, Badge, Avatar } from '../components/ui/WorkingComponents';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardScreenProps {
    navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
    const { tasks, penalties, activities, goals } = useFamilyDashStore();
    const [penaltyTime, setPenaltyTime] = useState(15 * 60 + 42); // 15 minutes 42 seconds
    const [lastRingTime, setLastRingTime] = useState(5); // 5 minutes ago
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const penaltyTimer = setInterval(() => {
            setPenaltyTime(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);

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

        // Pulse animation for notification badge
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulseAnimation.start();

        // Rotation animation for loading elements
        const rotateAnimation = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            })
        );
        rotateAnimation.start();

        return () => {
            clearInterval(penaltyTimer);
            pulseAnimation.stop();
            rotateAnimation.stop();
        };
    }, []);

    const formatTime = useCallback((totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    const handleRingDevice = useCallback((memberName: string) => {
        Alert.alert('🔔 Ringing Device', `Ringing ${memberName}'s device...`);
    }, []);

    const handleRingAllDevices = useCallback(() => {
        Alert.alert('🔔 Ring All Devices', 'Ringing all family devices...');
        setLastRingTime(0); // Reset last ring time to "Just now"
        const timer = setTimeout(() => {
            setLastRingTime(5); // Reset to 5 min ago after a short while for demo
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Navigation handlers
    const handleAddTask = useCallback(() => {
        navigation.navigate('Tasks');
    }, [navigation]);

    const handleSafeRoom = useCallback(() => {
        navigation.navigate('SafeRoom');
    }, [navigation]);

    const handleNotifications = useCallback(() => {
        Alert.alert('Notifications', 'Notifications feature coming soon!');
    }, []);

    const handleViewAllTasks = useCallback(() => {
        navigation.navigate('Tasks');
    }, [navigation]);

    const handleViewCalendar = useCallback(() => {
        navigation.navigate('Calendar');
    }, [navigation]);

    const handleVote = useCallback(() => {
        navigation.navigate('Voting');
    }, [navigation]);

    const handleGoals = useCallback(() => {
        navigation.navigate('Goals');
    }, [navigation]);

    const handleActivePenalty = useCallback(() => {
        Alert.alert('Penalties', 'Penalties feature coming soon!');
    }, []);

    const familyMembers = useMemo(() => [
        {
            id: '1',
            name: 'Dad',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
            badge: { type: 'count', value: 3, color: '#10B981' },
            borderColor: '#3B82F6',
            status: 'online',
            lastSeen: '2 min ago',
            points: 1250,
            streak: 7
        },
        {
            id: '2',
            name: 'Mom',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
            badge: { type: 'count', value: 2, color: '#10B981' },
            borderColor: '#EC4899',
            status: 'online',
            lastSeen: '1 min ago',
            points: 1180,
            streak: 5
        },
        {
            id: '3',
            name: 'Emma',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
            badge: { type: 'count', value: 1, color: '#F59E0B' },
            borderColor: '#8B5CF6',
            status: 'away',
            lastSeen: '15 min ago',
            points: 890,
            streak: 3
        },
        {
            id: '4',
            name: 'Jake',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
            badge: { type: 'icon', value: 'warning', color: '#EF4444' },
            borderColor: '#F59E0B',
            status: 'offline',
            lastSeen: '1 hour ago',
            points: 650,
            streak: 1
        },
    ], []);

    const todaysTasks = useMemo(() => [
        {
            id: '1',
            title: 'Clean bedroom',
            assignedTo: 'Emma',
            status: 'completed',
            time: '2h ago',
            rewards: ['⭐', '🎉'],
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
            priorityColor: '#10B981',
            bgColor: '#F0FDF4',
            icon: 'checkmark',
            points: 50,
            category: 'Chores',
            difficulty: 'Easy',
            progress: 100,
            estimatedTime: '30 min',
            actualTime: '25 min'
        },
        {
            id: '2',
            title: 'Homework - Math',
            assignedTo: 'Jake',
            status: 'pending',
            time: '3h',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
            priorityColor: '#F59E0B',
            bgColor: '#FFFBEB',
            icon: 'play',
            points: 75,
            category: 'Education',
            difficulty: 'Medium',
            progress: 0,
            estimatedTime: '45 min',
            actualTime: null
        },
        {
            id: '3',
            title: 'Fix kitchen sink',
            assignedTo: 'Dad',
            status: 'overdue',
            time: '1d',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
            priorityColor: '#EF4444',
            bgColor: '#FEF2F2',
            icon: 'time',
            points: 100,
            category: 'Maintenance',
            difficulty: 'Hard',
            progress: 30,
            estimatedTime: '2 hours',
            actualTime: null
        },
    ], []);

    const thisWeekActivities = useMemo(() => [
        {
            id: '1',
            title: 'Movie Night',
            time: 'Friday 7:00 PM',
            details: 'Family vote needed',
            action: 'Vote',
            icon: 'film',
            color: '#3B82F6',
            bgColor: '#EBF8FF',
            participants: 4,
            votes: 3,
            totalVotes: 4,
            location: 'Living Room',
            organizer: 'Mom',
            status: 'voting',
            options: ['Action Movie', 'Comedy', 'Horror']
        },
        {
            id: '2',
            title: "Emma's Birthday Party",
            time: 'Saturday 2:00 PM',
            details: 'Mom organizing',
            action: 'Done',
            icon: 'gift',
            color: '#8B5CF6',
            bgColor: '#F3E8FF',
            participants: 6,
            votes: 6,
            totalVotes: 6,
            location: 'Backyard',
            organizer: 'Mom',
            status: 'confirmed',
            options: ['Pizza', 'Cake', 'Games']
        },
    ], []);

    const familyGoal = useMemo(() => ({
        name: 'Family Reading Challenge',
        completed: 12,
        target: 20,
        progress: 60,
        timeRemaining: '2 weeks to go',
        description: 'Read 20 books together as a family',
        reward: 'Family trip to the zoo',
        category: 'Education',
        difficulty: 'Medium',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        participants: ['Dad', 'Mom', 'Emma', 'Jake'],
        contributions: [
            { member: 'Dad', books: 4, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', points: 200 },
            { member: 'Mom', books: 3, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg', points: 150 },
            { member: 'Emma', books: 3, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', points: 150 },
            { member: 'Jake', books: 2, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', points: 100 }
        ],
        milestones: [
            { target: 5, reward: 'Ice cream party', completed: true },
            { target: 10, reward: 'Movie night', completed: true },
            { target: 15, reward: 'Pizza dinner', completed: false },
            { target: 20, reward: 'Zoo trip', completed: false }
        ]
    }), []);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <Animated.View style={[styles.headerIcon, { transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>
                                <Ionicons name="home" size={20} color="white" />
                            </Animated.View>
                            <View>
                                <Text style={styles.headerTitle}>Family Dashboard</Text>
                                <Text style={styles.headerSubtitle}>Johnson Family</Text>
                            </View>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.headerIcon} onPress={handleNotifications}>
                                <Ionicons name="notifications" size={16} color="white" />
                                {/* Notification Badge */}
                                <Animated.View style={[styles.notificationBadge, { transform: [{ scale: pulseAnim }] }]}>
                                    <Text style={styles.notificationBadgeText}>3</Text>
                                </Animated.View>
                            </TouchableOpacity>
                            <Image
                                source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' }}
                                style={styles.profileImage}
                            />
                        </View>
                    </View>
                </LinearGradient>

                {/* Family Members */}
                <View style={styles.familyMembersSection}>
                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Family Members</Text>
                            <View style={styles.sectionStats}>
                                <Text style={styles.sectionSubtitle}>4 active</Text>
                                <View style={styles.onlineIndicator}>
                                    <View style={styles.onlineDot} />
                                    <Text style={styles.onlineText}>2 online</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.membersGrid}>
                            {familyMembers.map((member, index) => (
                                <Animated.View
                                    key={member.id}
                                    style={[
                                        styles.memberItem,
                                        {
                                            transform: [{
                                                translateX: slideAnim.interpolate({
                                                    inputRange: [0, 50],
                                                    outputRange: [0, index * 10],
                                                })
                                            }]
                                        }
                                    ]}
                                >
                                    <View style={styles.avatarContainer}>
                                        <Image source={{ uri: member.avatar }} style={[styles.memberAvatar, { borderColor: member.borderColor }]} />
                                        <View style={[styles.statusIndicator, { backgroundColor: member.status === 'online' ? '#10B981' : member.status === 'away' ? '#F59E0B' : '#6B7280' }]} />
                                        {member.badge.type === 'count' ? (
                                            <View style={[styles.badge, { backgroundColor: member.badge.color }]}>
                                                <Text style={styles.badgeText}>{member.badge.value}</Text>
                                            </View>
                                        ) : (
                                            <View style={[styles.badge, { backgroundColor: member.badge.color }]}>
                                                <Ionicons name={member.badge.value as any} size={10} color="white" />
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.memberName}>{member.name}</Text>
                                    <View style={styles.memberStats}>
                                        <Text style={styles.memberPoints}>{member.points} pts</Text>
                                        <Text style={styles.memberStreak}>{member.streak} 🔥</Text>
                                    </View>
                                    <Text style={styles.memberStatus}>{member.lastSeen}</Text>
                                    <TouchableOpacity style={styles.ringButton} onPress={() => handleRingDevice(member.name)}>
                                        <Ionicons name="notifications" size={12} color="white" />
                                        <Text style={styles.ringButtonText}>Ring</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsSection}>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity style={styles.quickActionButton} onPress={handleAddTask}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.quickActionGradient}
                            >
                                <View style={styles.quickActionIconBg}>
                                    <Ionicons name="add" size={22} color="white" />
                                </View>
                                <Text style={styles.quickActionText}>Add Task</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton} onPress={handleSafeRoom}>
                            <LinearGradient
                                colors={['#EC4899', '#DB2777']}
                                style={styles.quickActionGradient}
                            >
                                <View style={styles.quickActionIconBg}>
                                    <Ionicons name="heart" size={22} color="white" />
                                </View>
                                <Text style={styles.quickActionText}>Safe Room</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Device Tools */}
                <View style={styles.deviceToolsSection}>
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
                            <View style={styles.ringAllIconBg}>
                                <Ionicons name="notifications" size={20} color="#7C3AED" />
                            </View>
                            <Text style={styles.ringAllButtonText}>Ring All Devices</Text>
                        </TouchableOpacity>

                        <Text style={styles.lastRingText}>Last ring: {lastRingTime === 0 ? 'Just now' : `${lastRingTime} min ago`}</Text>
                    </LinearGradient>
                </View>

                {/* Today's Tasks */}
                <View style={styles.todaysTasksSection}>
                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Today's Tasks</Text>
                            <Text style={styles.tasksDoneText}>6 of 8 done</Text>
                        </View>

                        <View style={styles.tasksList}>
                            {todaysTasks.map(task => (
                                <View key={task.id} style={[styles.taskItem, { backgroundColor: task.bgColor, borderLeftColor: task.priorityColor }]}>
                                    <View style={[styles.taskIconBg, { backgroundColor: task.priorityColor }]}>
                                        <Ionicons name={task.icon as any} size={14} color="white" />
                                    </View>
                                    <Image source={{ uri: task.avatar }} style={styles.taskAvatar} />
                                    <View style={styles.taskInfo}>
                                        <Text style={styles.taskTitle}>{task.title}</Text>
                                        <Text style={styles.taskSubtitle}>{task.assignedTo} • {task.status === 'completed' ? `Completed ${task.time}` : `Due in ${task.time}`}</Text>
                                    </View>
                                    {task.rewards ? (
                                        <View style={styles.taskRewards}>
                                            {task.rewards.map((reward, index) => (
                                                <Text key={index} style={styles.taskRewardText}>{reward}</Text>
                                            ))}
                                        </View>
                                    ) : (
                                        <TouchableOpacity style={[styles.taskActionButton, { backgroundColor: task.priorityColor }]}>
                                            <Ionicons name={task.icon as any} size={14} color="white" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.viewAllTasksButton} onPress={handleViewAllTasks}>
                            <Text style={styles.viewAllTasksButtonText}>View All Tasks</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Active Penalty */}
                <View style={styles.activePenaltySection}>
                    <TouchableOpacity onPress={handleActivePenalty}>
                        <LinearGradient
                            colors={['#EF4444', '#DC2626']}
                            style={styles.penaltyCard}
                        >
                            <View style={styles.penaltyHeader}>
                                <Text style={styles.penaltyTitle}>Active Penalty</Text>
                                <Ionicons name="hourglass" size={20} color="white" />
                            </View>

                            <View style={styles.penaltyMemberInfo}>
                                <Image source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg' }} style={styles.penaltyAvatar} />
                                <View>
                                    <Text style={styles.penaltyMemberName}>Jake</Text>
                                    <Text style={styles.penaltyDescription}>No tablet time</Text>
                                </View>
                            </View>

                            <View style={styles.penaltyTimerContainer}>
                                <View style={styles.penaltyTimerContent}>
                                    <Text style={styles.penaltyTimerLabel}>Time remaining</Text>
                                    <Text style={styles.penaltyTime}>{formatTime(penaltyTime)}</Text>
                                </View>
                                <View style={styles.penaltyProgressBar}>
                                    <View style={[styles.penaltyProgressFill, { width: `${(penaltyTime / (15 * 60 + 42)) * 100}%` }]} />
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* This Week Activities */}
                <View style={styles.thisWeekSection}>
                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>This Week</Text>
                            <TouchableOpacity onPress={handleViewCalendar}>
                                <Text style={styles.viewCalendarText}>View Calendar</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.activitiesList}>
                            {thisWeekActivities.map(activity => (
                                <View key={activity.id} style={[styles.activityItem, { backgroundColor: activity.bgColor }]}>
                                    <View style={[styles.activityIconBg, { backgroundColor: activity.color }]}>
                                        <Ionicons name={activity.icon as any} size={20} color="white" />
                                    </View>
                                    <View style={styles.activityInfo}>
                                        <Text style={styles.activityTitle}>{activity.title}</Text>
                                        <Text style={styles.activitySubtitle}>{activity.time} • {activity.details}</Text>
                                    </View>
                                    {activity.action === 'Vote' ? (
                                        <TouchableOpacity style={[styles.activityActionButton, { backgroundColor: activity.color }]} onPress={handleVote}>
                                            <Text style={styles.activityActionButtonText}>{activity.action}</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={[styles.activityActionButton, { backgroundColor: activity.color }]}>
                                            <Ionicons name="checkmark" size={14} color="white" />
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Family Goal */}
                <View style={styles.goalSection}>
                    <TouchableOpacity onPress={handleGoals}>
                        <LinearGradient
                            colors={['#F59E0B', '#EA580C']}
                            style={styles.goalCard}
                        >
                            <View style={styles.goalHeader}>
                                <Text style={styles.goalTitle}>Family Goal</Text>
                                <Ionicons name="trophy" size={20} color="white" />
                            </View>

                            <View style={styles.goalContent}>
                                <Text style={styles.goalName}>Family Reading Challenge</Text>
                                <Text style={styles.goalAmount}>{familyGoal.completed} of {familyGoal.target} books read</Text>

                                <View style={styles.goalProgressBar}>
                                    <View style={[styles.goalProgressFill, { width: `${familyGoal.progress}%` }]} />
                                </View>
                                <Text style={styles.goalProgressText}>{familyGoal.progress}% complete • {familyGoal.timeRemaining}</Text>
                            </View>

                            <View style={styles.contributionsGrid}>
                                {familyGoal.contributions.map((contribution, index) => (
                                    <View key={index} style={styles.contributionItem}>
                                        <Image
                                            source={{ uri: contribution.avatar }}
                                            style={styles.contributionAvatar}
                                        />
                                        <Text style={styles.contributionAmount}>{contribution.books} books</Text>
                                    </View>
                                ))}
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Bottom spacing for navigation */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Notifications Modal */}
            <NotificationsModal
                visible={showNotificationsModal}
                onClose={() => setShowNotificationsModal(false)}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 50, // Adjusted for hidden status bar
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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
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
    },
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginLeft: 8,
    },
    familyMembersSection: {
        paddingHorizontal: 16,
        marginTop: -16, // Overlap with header
        marginBottom: 8,
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    membersGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    memberItem: {
        alignItems: 'center',
        marginHorizontal: 8,
        marginBottom: 8,
    },
    avatarContainer: {
        position: 'relative',
    },
    memberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 3,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
    memberName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
        marginTop: 4,
    },
    ringButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7C3AED',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
        marginTop: 4,
    },
    ringButtonText: {
        color: 'white',
        fontSize: 10,
        marginLeft: 4,
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
    },
    quickActionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    quickActionIconBg: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    deviceToolsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    deviceToolsCard: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
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
    },
    deviceToolsEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    deviceToolsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    ringAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    ringAllIconBg: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    ringAllButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    lastRingText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    todaysTasksSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    tasksDoneText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981',
    },
    tasksList: {
        marginBottom: 16,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderLeftWidth: 4,
        marginBottom: 8,
    },
    taskIconBg: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    taskAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    taskSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    taskRewards: {
        flexDirection: 'row',
        gap: 4,
    },
    taskRewardText: {
        fontSize: 16,
    },
    taskActionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewAllTasksButton: {
        width: '100%',
        paddingVertical: 12,
        borderColor: '#4F46E5',
        borderWidth: 1,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewAllTasksButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4F46E5',
    },
    activePenaltySection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    penaltyCard: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    penaltyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    penaltyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    penaltyMemberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    penaltyAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginRight: 12,
    },
    penaltyMemberName: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    penaltyDescription: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    penaltyTimerContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 12,
    },
    penaltyTimerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    penaltyTimerLabel: {
        fontSize: 14,
        color: 'white',
    },
    penaltyTime: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    penaltyProgressBar: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    penaltyProgressFill: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 4,
    },
    thisWeekSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    viewCalendarText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3B82F6',
    },
    activitiesList: {
        marginBottom: 16,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    activityIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    activitySubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    activityActionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityActionButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'white',
    },
    goalSection: {
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 80,
    },
    goalCard: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    goalContent: {
        marginBottom: 16,
    },
    goalName: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 8,
    },
    goalAmount: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 12,
    },
    goalProgressBar: {
        width: '100%',
        height: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    goalProgressFill: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 6,
    },
    goalProgressText: {
        fontSize: 14,
        color: 'white',
    },
    contributionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    contributionItem: {
        alignItems: 'center',
    },
    contributionAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginBottom: 4,
    },
    contributionAmount: {
        fontSize: 12,
        color: 'white',
    },
    bottomSpacing: {
        height: 80,
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#EF4444',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    notificationBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    sectionStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    onlineIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
    },
    onlineText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '500',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'white',
    },
    memberStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    memberPoints: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: '500',
    },
    memberStreak: {
        fontSize: 10,
        color: '#F59E0B',
        fontWeight: '500',
    },
    memberStatus: {
        fontSize: 9,
        color: '#9CA3AF',
        marginTop: 2,
    },
});

export default DashboardScreen;