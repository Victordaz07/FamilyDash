/**
 * Real-time Dashboard Component
 * Shows live updates across all family modules
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Animated,
    Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, AdvancedCard, themeUtils } from '../ui';
import { RealTimeStatus } from './RealTimeStatus';
import { useRealTimeData, useRealTimeFamilyStatus } from '@/hooks/useRealTime';

interface ActivityUpdate {
    id: string;
    type: 'task_assigned' | 'goal_progress' | 'penalty_expired' | 'member_online' | 'saferoom_message';
    title: string;
    description: string;
    timestamp: number;
    author: string;
    authorAvatar: string;
}

const activityIcons = {
    task_assigned: 'checkbox',
    goal_progress: 'trophy',
    penalty_expired: 'checkmark-circle',
    member_online: 'person',
    saferoom_message: 'chatbubble',
};

const activityColors = {
    task_assigned: '#3B82F6',
    goal_progress: '#10B981',
    penalty_expired: '#F59E0B',
    member_online: '#8B5CF6',
    saferoom_message: '#EC4899',
};

interface ActivityFeedItemProps {
    activity: ActivityUpdate;
    index: number;
}

const ActivityFeedItem: React.FC<ActivityFeedItemProps> = React.memo(({
    activity,
    index,
}) => {
    const theme = useTheme();
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Animate in with delay
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 100,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay: index * 100,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();
    }, [index, fadeAnim, slideAnim]);

    const iconName = activityIcons[activity.type] as keyof typeof Ionicons.glyphMap;
    const color = activityColors[activity.type];

    return (
        <Animated.View
            style={[
                styles.activityItem,
                {
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }],
                },
            ]}
        >
            <AdvancedCard variant="outlined" size="sm" style={styles.activityCard}>
                <View style={styles.activityHeader}>
                    <View style={[styles.activityIcon, { backgroundColor: `${color}20` }]}>
                        <Ionicons name={iconName} size={20} color={color} />
                    </View>

                    <View style={styles.activityContent}>
                        <Text style={[theme.typography.textStyles.title, styles.activityTitle]}>
                            {activity.title}
                        </Text>
                        <Text style={[theme.typography.textStyles.body, styles.activityDescription]}>
                            {activity.description}
                        </Text>
                    </View>

                    <View style={styles.activityAuthor}>
                        <Text style={styles.authorAvatar}>{activity.authorAvatar}</Text>
                    </View>
                </View>

                <Text style={[theme.typography.textStyles.caption, styles.activityTime]}>
                    {new Date(activity.timestamp).toLocaleTimeString()}
                </Text>
            </AdvancedCard>
        </Animated.View>
    );
});

export const RealTimeDashboard: React.FC = () => {
    const theme = useTheme();

    // Get family status in real-time
    const { members, memberCounts } = useRealTimeFamilyStatus();

    // Get activity feed in real-time
    const { data: activityFeed, loading: activityLoading } = useRealTimeData<ActivityUpdate>(
        'family_activity',
        [],
        {
            autoUpdate: true,
            maxItems: 20,
            retentionPeriod: 3600000, // 1 hour
        }
    );

    const [stats, setStats] = useState({
        tasksCompletedToday: 0,
        goalsAchieved: 0,
        penaltiesActive: 0,
        familyInteractionScore: 95,
    });

    // Update stats based on real-time data
    useEffect(() => {
        const newStats = {
            tasksCompletedToday: activityFeed.filter(a =>
                a.type === 'task_assigned' &&
                new Date(a.timestamp).toDateString() === new Date().toDateString()
            ).length,
            goalsAchieved: activityFeed.filter(a => a.type === 'goal_progress').length,
            penaltiesActive: activityFeed.filter(a =>
                a.type === 'penalty_expired'
            ).length,
            familyInteractionScore: Math.min(100, Math.max(0,
                70 + memberCounts.online * 5 + Math.floor(Math.random() * 20)
            )),
        };

        setStats(newStats);
    }, [activityFeed, memberCounts]);

    const StatCard: React.FC<{
        title: string;
        value: string | number;
        icon: keyof typeof Ionicons.glyphMap;
        color: string;
        trend?: 'up' | 'down' | 'stable';
    }> = React.memo(({ title, value, icon, color, trend }) => (
        <AdvancedCard variant="gradient" size="md" style={styles.statCard}>
            <LinearGradient
                colors={[`${color}20`, `${color}10`]}
                style={styles.statGradient}
            >
                <View style={styles.statHeader}>
                    <View style={[styles.statIcon, { backgroundColor: color }]}>
                        <Ionicons name={icon} size={24} color="white" />
                    </View>

                    {trend && (
                        <View style={styles.trendIndicator}>
                            <Ionicons
                                name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'}
                                size={12}
                                color={trend === 'up' ? '#10B981' : trend === 'down' ? theme.colors.error : '#6B7280'}
                            />
                        </View>
                    )}
                </View>

                <Text style={[theme.typography.textStyles.h3, styles.statValue]}>
                    {value}
                </Text>
                <Text style={[theme.typography.textStyles.caption, styles.statTitle]}>
                    {title}
                </Text>
            </LinearGradient>
        </AdvancedCard>
    ));

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={['#3B82F6', '#2563EB'] as const}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Real-time Family</Text>
                    <Text style={styles.headerSubtitle}>
                        {memberCounts.online} online • {stats.familyInteractionScore}% active
                    </Text>
                </View>

                <View style={styles.headerStats}>
                    <Text style={styles.familyScoreLabel}>Family Score</Text>
                    <Text style={styles.familyScore}>
                        {stats.familyInteractionScore}%
                    </Text>
                </View>
            </LinearGradient>

            {/* Real-time Status */}
            <RealTimeStatus
                showSyncStatus={true}
                showConflictResolution={true}
            />

            {/* Live Stats */}
            <View style={styles.statsContainer}>
                <StatCard
                    title="Tasks Today"
                    value={stats.tasksCompletedToday}
                    icon="checkbox"
                    color="#3B82F6"
                    trend="up"
                />
                <StatCard
                    title="Goals Achieved"
                    value={stats.goalsAchieved}
                    icon="trophy"
                    color="#10B981"
                    trend="up"
                />
                <StatCard
                    title="Active Penalties"
                    value={stats.penaltiesActive}
                    icon="warning"
                    color="#F59E0B"
                    trend="down"
                />
            </View>

            {/* Family Members Online */}
            <AdvancedCard variant="outlined" size="md" style={styles.membersCard}>
                <Text style={[theme.typography.textStyles.h3, styles.cardTitle]}>
                    Family Members Online
                </Text>

                <View style={styles.membersGrid}>
                    {members.map((member) => (
                        <View key={member.id} style={styles.memberItem}>
                            <View style={[
                                styles.memberStatusDot,
                                { backgroundColor: member.status === 'online' ? '#10B981' : '#6B7280' }
                            ]} />
                            <Text style={[theme.typography.textStyles.body, styles.memberName]}>
                                {member.name}
                            </Text>
                            <Text style={[theme.typography.textStyles.caption, styles.memberStatus]}>
                                {member.status}
                            </Text>
                        </View>
                    ))}
                </View>

                {members.length === 0 && (
                    <Text style={[theme.typography.textStyles.body, styles.noMembersText]}>
                        No other family members online right now
                    </Text>
                )}
            </AdvancedCard>

            {/* Live Activity Feed */}
            <AdvancedCard variant="outlined" size="lg" style={styles.activityFeedCard}>
                <Text style={[theme.typography.textStyles.h3, styles.cardTitle]}>
                    Live Activity Feed
                </Text>

                {activityLoading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={[theme.typography.textStyles.body, styles.loadingText]}>
                            Loading recent activity...
                        </Text>
                    </View>
                ) : activityFeed.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[theme.typography.textStyles.body, styles.emptyText]}>
                            No recent activity. Family members will appear here when they take actions!
                        </Text>
                    </View>
                ) : (
                    <View style={styles.activityFeed}>
                        {activityFeed.slice(0, 10).map((activity, index) => (
                            <ActivityFeedItem
                                key={activity.id}
                                activity={activity}
                                index={index}
                            />
                        ))}
                    </View>
                )}
            </AdvancedCard>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // Header styles
    header: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: 'white',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'white',
        opacity: 0.9,
    },
    headerStats: {
        alignItems: 'center',
    },
    familyScoreLabel: {
        fontSize: 12,
        color: 'white',
        opacity: 0.8,
    },
    familyScore: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
    },

    // Stats
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    statGradient: {
        padding: 16,
        alignItems: 'center',
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 8,
    },
    statIcon: {
        borderRadius: 12,
        padding: 8,
    },
    trendIndicator: {
        padding: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },

    // Members card
    membersCard: {
        marginHorizontal: 20,
        marginVertical: 8,
    },
    cardTitle: {
        marginBottom: 16,
    },
    membersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 8,
        gap: 8,
        flex: 1,
        minWidth: 140,
    },
    memberStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    memberName: {
        fontWeight: '600',
        flex: 1,
    },
    memberStatus: {
        textTransform: 'capitalize',
        opacity: 0.7,
    },
    noMembersText: {
        textAlign: 'center',
        color: '#6B7280',
        fontStyle: 'italic',
    },

    // Activity feed
    activityFeedCard: {
        marginHorizontal: 20,
        marginVertical: 8,
        marginBottom: 32,
    },
    activityFeed: {
        gap: 12,
    },
    activityItem: {
        marginBottom: 4,
    },
    activityCard: {
        borderRadius: 12,
    },
    activityHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    activityIcon: {
        borderRadius: 8,
        padding: 8,
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    activityDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    activityAuthor: {
        marginLeft: 8,
    },
    authorAvatar: {
        fontSize: 20,
    },
    activityTime: {
        textAlign: 'right',
        opacity: 0.6,
    },

    // Empty states
    loadingContainer: {
        padding: 32,
        alignItems: 'center',
    },
    loadingText: {
        color: '#6B7280',
        textAlign: 'center',
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
});


export default RealTimeDashboard;




