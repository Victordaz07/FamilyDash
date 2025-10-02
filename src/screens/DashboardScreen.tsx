import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFamilyDashStore } from '../state/store';
import NotificationsModal from '../components/NotificationsModal';
import { theme } from '../styles/simpleTheme';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardScreenProps {
    navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
    const { tasks, penalties, activities, goals } = useFamilyDashStore();

    // Memoized data
    const activeTasks = useMemo(() => tasks.filter(task => !task.completed), [tasks]);
    const activePenalties = useMemo(() => penalties.filter(penalty => penalty.isActive), [penalties]);
    const upcomingActivities = useMemo(() => activities.slice(0, 3), [activities]);
    const activeGoals = useMemo(() => goals.filter(goal => !goal.completed), [goals]);

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

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="home" size={24} color="white" />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Family Dashboard</Text>
                            <Text style={styles.headerSubtitle}>Welcome back!</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notificationButton} onPress={handleNotifications}>
                        <Ionicons name="notifications-outline" size={24} color="white" />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationCount}>3</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActions}>
                        <TouchableOpacity style={styles.actionCard} onPress={handleVote}>
                            <LinearGradient
                                colors={['#8B5CF6', '#7C3AED']}
                                style={styles.actionGradient}
                            >
                                <Ionicons name="ballot-outline" size={32} color="white" />
                                <Text style={styles.actionText}>Start Vote</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={handleActivePenalty}>
                            <LinearGradient
                                colors={['#EF4444', '#DC2626']}
                                style={styles.actionGradient}
                            >
                                <Ionicons name="warning-outline" size={32} color="white" />
                                <Text style={styles.actionText}>Active Penalty</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={handleNotifications}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.actionGradient}
                            >
                                <Ionicons name="notifications-outline" size={32} color="white" />
                                <Text style={styles.actionText}>Notifications</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Active Tasks */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Active Tasks</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {activeTasks.length > 0 ? (
                        activeTasks.slice(0, 3).map((task) => (
                            <TouchableOpacity
                                key={task.id}
                                style={styles.taskCard}
                                onPress={() => handleTaskPress(task.id)}
                            >
                                <View style={styles.taskContent}>
                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                    <Text style={styles.taskDescription}>{task.description}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.gray} />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="checkmark-circle-outline" size={48} color={theme.colors.gray} />
                            <Text style={styles.emptyText}>No active tasks</Text>
                        </View>
                    )}
                </View>

                {/* Upcoming Activities */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Upcoming Activities</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {upcomingActivities.length > 0 ? (
                        upcomingActivities.map((activity) => (
                            <TouchableOpacity
                                key={activity.id}
                                style={styles.activityCard}
                                onPress={() => handleActivityPress(activity.id)}
                            >
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityTitle}>{activity.title}</Text>
                                    <Text style={styles.activityTime}>{activity.startTime} - {activity.endTime}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.gray} />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={48} color={theme.colors.gray} />
                            <Text style={styles.emptyText}>No upcoming activities</Text>
                        </View>
                    )}
                </View>

                {/* Active Goals */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Active Goals</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {activeGoals.length > 0 ? (
                        activeGoals.slice(0, 2).map((goal) => (
                            <TouchableOpacity
                                key={goal.id}
                                style={styles.goalCard}
                                onPress={() => handleGoalPress(goal.id)}
                            >
                                <View style={styles.goalContent}>
                                    <Text style={styles.goalTitle}>{goal.title}</Text>
                                    <Text style={styles.goalProgress}>{goal.progress}% complete</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.gray} />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="trophy-outline" size={48} color={theme.colors.gray} />
                            <Text style={styles.emptyText}>No active goals</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: theme.spacing.medium,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...theme.shadows.medium,
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
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.medium,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: theme.typography.fontWeight.bold as any,
        color: theme.colors.white,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    notificationButton: {
        position: 'relative',
        padding: 8,
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: theme.colors.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationCount: {
        fontSize: 12,
        fontWeight: theme.typography.fontWeight.bold as any,
        color: theme.colors.white,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.medium,
    },
    section: {
        marginTop: theme.spacing.large,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.medium,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: theme.typography.fontWeight.bold as any,
        color: theme.colors.text,
    },
    seeAllText: {
        fontSize: 16,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeight.medium as any,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: theme.spacing.small,
    },
    actionCard: {
        flex: 1,
        borderRadius: theme.borderRadius.medium,
        overflow: 'hidden',
        ...theme.shadows.small,
    },
    actionGradient: {
        paddingVertical: theme.spacing.large,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        fontSize: 14,
        fontWeight: theme.typography.fontWeight.semibold as any,
        color: theme.colors.white,
        marginTop: theme.spacing.small,
    },
    taskCard: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.medium,
        padding: theme.spacing.medium,
        marginBottom: theme.spacing.small,
        flexDirection: 'row',
        alignItems: 'center',
        ...theme.shadows.small,
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: theme.typography.fontWeight.semibold as any,
        color: theme.colors.text,
    },
    taskDescription: {
        fontSize: 14,
        color: theme.colors.gray,
        marginTop: 2,
    },
    activityCard: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.medium,
        padding: theme.spacing.medium,
        marginBottom: theme.spacing.small,
        flexDirection: 'row',
        alignItems: 'center',
        ...theme.shadows.small,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: theme.typography.fontWeight.semibold as any,
        color: theme.colors.text,
    },
    activityTime: {
        fontSize: 14,
        color: theme.colors.gray,
        marginTop: 2,
    },
    goalCard: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.medium,
        padding: theme.spacing.medium,
        marginBottom: theme.spacing.small,
        flexDirection: 'row',
        alignItems: 'center',
        ...theme.shadows.small,
    },
    goalContent: {
        flex: 1,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: theme.typography.fontWeight.semibold as any,
        color: theme.colors.text,
    },
    goalProgress: {
        fontSize: 14,
        color: theme.colors.primary,
        marginTop: 2,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: theme.spacing.large,
    },
    emptyText: {
        fontSize: 16,
        color: theme.colors.gray,
        marginTop: theme.spacing.small,
    },
});

export default DashboardScreen;