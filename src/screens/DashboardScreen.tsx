import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFamilyDashStore } from '../state/store';

const DashboardScreen = () => {
    const { tasks, penalties, activities, goals } = useFamilyDashStore();
    const [penaltyTime, setPenaltyTime] = useState(15 * 60 + 42); // 15 minutes 42 seconds
    const [lastRingTime, setLastRingTime] = useState(5); // 5 minutes ago

    useEffect(() => {
        const penaltyTimer = setInterval(() => {
            setPenaltyTime(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);
        return () => clearInterval(penaltyTimer);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleRingDevice = (memberName: string) => {
        Alert.alert('🔔 Ringing Device', `Ringing ${memberName}'s device...`);
    };

    const handleRingAllDevices = () => {
        Alert.alert('🔔 Ring All Devices', 'Ringing all family devices...');
        setLastRingTime(0); // Reset last ring time to "Just now"
        const timer = setTimeout(() => {
            setLastRingTime(5); // Reset to 5 min ago after a short while for demo
        }, 3000);
        return () => clearTimeout(timer);
    };

    const familyMembers = [
        { id: '1', name: 'Dad', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', badge: { type: 'count', value: 3, color: '#10B981' }, borderColor: '#3B82F6' },
        { id: '2', name: 'Mom', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg', badge: { type: 'count', value: 2, color: '#10B981' }, borderColor: '#EC4899' },
        { id: '3', name: 'Emma', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', badge: { type: 'count', value: 1, color: '#F59E0B' }, borderColor: '#8B5CF6' },
        { id: '4', name: 'Jake', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', badge: { type: 'icon', value: 'exclamation', color: '#EF4444' }, borderColor: '#F59E0B' },
    ];

    const todaysTasks = [
        { id: '1', title: 'Clean bedroom', assignedTo: 'Emma', status: 'completed', time: '2h ago', rewards: ['⭐', '🎉'], avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', priorityColor: '#10B981', bgColor: '#F0FDF4', icon: 'checkmark' },
        { id: '2', title: 'Homework - Math', assignedTo: 'Jake', status: 'pending', time: '3h', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', priorityColor: '#F59E0B', bgColor: '#FFFBEB', icon: 'play' },
        { id: '3', title: 'Fix kitchen sink', assignedTo: 'Dad', status: 'overdue', time: '1d', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', priorityColor: '#EF4444', bgColor: '#FEF2F2', icon: 'time' },
    ];

    const thisWeekActivities = [
        { id: '1', title: 'Movie Night', time: 'Friday 7:00 PM', details: 'Family vote needed', action: 'Vote', icon: 'film', color: '#3B82F6', bgColor: '#EBF8FF' },
        { id: '2', title: "Emma's Birthday Party", time: 'Saturday 2:00 PM', details: 'Mom organizing', action: 'Done', icon: 'gift', color: '#8B5CF6', bgColor: '#F3E8FF' },
    ];

    const familyGoal = {
        name: 'Save for Disney World Trip',
        saved: 2400,
        target: 5000,
        progress: 48,
        timeRemaining: '4 months to go',
        contributions: [
            { member: 'Dad', amount: 600, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg' },
            { member: 'Mom', amount: 800, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' },
            { member: 'Emma', amount: 500, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' },
            { member: 'Jake', amount: 500, avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg' },
        ]
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="home" size={20} color="white" />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Family Dashboard</Text>
                            <Text style={styles.headerSubtitle}>Johnson Family</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="notifications" size={16} color="white" />
                        </View>
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
                        <Text style={styles.sectionSubtitle}>4 active</Text>
                    </View>
                    <View style={styles.membersGrid}>
                        {familyMembers.map(member => (
                            <View key={member.id} style={styles.memberItem}>
                                <View style={styles.avatarContainer}>
                                    <Image source={{ uri: member.avatar }} style={[styles.memberAvatar, { borderColor: member.borderColor }]} />
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
                                <TouchableOpacity style={styles.ringButton} onPress={() => handleRingDevice(member.name)}>
                                    <Ionicons name="notifications" size={12} color="white" />
                                    <Text style={styles.ringButtonText}>Ring</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            style={styles.quickActionGradient}
                        >
                            <View style={styles.quickActionIconBg}>
                                <Ionicons name="add" size={20} color="#10B981" />
                            </View>
                            <Text style={styles.quickActionText}>Add Task</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <LinearGradient
                            colors={['#EC4899', '#DB2777']}
                            style={styles.quickActionGradient}
                        >
                            <View style={styles.quickActionIconBg}>
                                <Ionicons name="heart" size={20} color="#EC4899" />
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

                    <TouchableOpacity style={styles.viewAllTasksButton}>
                        <Text style={styles.viewAllTasksButtonText}>View All Tasks</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Active Penalty */}
            <View style={styles.activePenaltySection}>
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
            </View>

            {/* This Week Activities */}
            <View style={styles.thisWeekSection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>This Week</Text>
                        <TouchableOpacity>
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
                                    <TouchableOpacity style={[styles.activityActionButton, { backgroundColor: activity.color }]}>
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
                <LinearGradient
                    colors={['#F59E0B', '#EA580C']}
                    style={styles.goalCard}
                >
                    <View style={styles.goalHeader}>
                        <Text style={styles.goalTitle}>Family Goal</Text>
                        <Ionicons name="trophy" size={20} color="white" />
                    </View>

                    <View style={styles.goalContent}>
                        <Text style={styles.goalName}>Save for Disney World Trip</Text>
                        <Text style={styles.goalAmount}>${familyGoal.saved} of ${familyGoal.target} saved</Text>

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
                                <Text style={styles.contributionAmount}>${contribution.amount}</Text>
                            </View>
                        ))}
                    </View>
                </LinearGradient>
            </View>

            {/* Bottom spacing for navigation */}
            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 60, // Adjusted for hidden status bar
        paddingBottom: 24,
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
        marginTop: -24, // Overlap with header
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
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
});

export default DashboardScreen;