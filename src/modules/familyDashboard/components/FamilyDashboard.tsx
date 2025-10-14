/**
 * Family Dashboard Component
 * Advanced family management and insights visualization
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, AdvancedCard, AdvancedButton, themeUtils } from '@/components/ui';
import { FamilyDashboardService, FamilyDashboardData } from '../FamilyDashboardService';

interface FamilyDashboardProps {
    familyId: string;
    onNavigate?: (screen: string, params?: any) => void;
}

export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
    familyId,
    onNavigate,
}) => {
    const theme = useTheme();
    const dashboardService = FamilyDashboardService.getInstance();

    const [dashboardData, setDashboardData] = useState<FamilyDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'goals' | 'activities' | 'leaderboard'>('overview');

    // Load dashboard data
    useEffect(() => {
        loadDashboardData();
    }, [familyId]);

    const loadDashboardData = async () => {
        try {
            setIsLoading(true);
            const data = await dashboardService.getFamilyDashboard(familyId);
            setDashboardData(data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            Alert.alert('Error', 'Failed to load family dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = useCallback(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const renderOverviewTab = () => {
        if (!dashboardData) return null;

        return (
            <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                {/* Key Metrics Cards */}
                <View style={styles.metricsGrid}>
                    <AdvancedCard variant="elevated" size="md" style={styles.metricCard}>
                        <LinearGradient
                            colors={themeUtils.gradients.success as unknown as readonly [string, string, ...string[]]}
                            style={styles.metricGradient}
                        >
                            <Ionicons name="people" size={32} color="white" />
                            <Text style={styles.metricValue}>{dashboardData.members.length}</Text>
                            <Text style={styles.metricLabel}>Family Members</Text>
                        </LinearGradient>
                    </AdvancedCard>

                    <AdvancedCard variant="elevated" size="md" style={styles.metricCard}>
                        <LinearGradient
                            colors={themeUtils.gradients.primary as unknown as readonly [string, string, ...string[]]}
                            style={styles.metricGradient}
                        >
                            <Ionicons name="checkmark-circle" size={32} color="white" />
                            <Text style={styles.metricValue}>{dashboardData.activity.totalTasksCompleted}</Text>
                            <Text style={styles.metricLabel}>Tasks Completed</Text>
                        </LinearGradient>
                    </AdvancedCard>

                    <AdvancedCard variant="elevated" size="md" style={styles.metricCard}>
                        <LinearGradient
                            colors={themeUtils.gradients.warning as unknown as readonly [string, string, ...string[]]}
                            style={styles.metricGradient}
                        >
                            <Ionicons name="trophy" size={32} color="white" />
                            <Text style={styles.metricValue}>{dashboardData.activity.totalGoalsProgress}%</Text>
                            <Text style={styles.metricLabel}>Goals Progress</Text>
                        </LinearGradient>
                    </AdvancedCard>

                    <AdvancedCard variant="elevated" size="md" style={styles.metricCard}>
                        <LinearGradient
                            colors={themeUtils.gradients.primary as unknown as readonly [string, string, ...string[]]}
                            style={styles.metricGradient}
                        >
                            <Ionicons name="chatbubbles" size={32} color="white" />
                            <Text style={styles.metricValue}>{dashboardData.activity.totalSafeRoomMessages}</Text>
                            <Text style={styles.metricLabel}>SafeRoom Messages</Text>
                        </LinearGradient>
                    </AdvancedCard>
                </View>

                {/* Family Score Overview */}
                <AdvancedCard variant="outlined" size="lg" style={styles.scoreCard}>
                    <Text style={styles.sectionTitle}>Family Performance Score</Text>
                    <View style={styles.scoreContainer}>
                        <View style={styles.scoreMain}>
                            <Text style={styles.scoreValue}>{dashboardData.metrics.overallFamilyScore}</Text>
                            <Text style={styles.scoreLabel}>Overall Family Score</Text>
                        </View>
                        <View style={styles.scoreBreakdown}>
                            <View style={styles.scoreItem}>
                                <Text style={styles.scoreItemLabel}>Collaboration</Text>
                                <View style={styles.scoreBar}>
                                    <View
                                        style={[styles.scoreBarFill, {
                                            width: `${dashboardData.metrics.collaborationScore}%`,
                                            backgroundColor: theme.colors.success,
                                        }]}
                                    />
                                </View>
                                <Text style={styles.scoreItemValue}>{dashboardData.metrics.collaborationScore}</Text>
                            </View>

                            <View style={styles.scoreItem}>
                                <Text style={styles.scoreItemLabel}>Productivity</Text>
                                <View style={styles.scoreBar}>
                                    <View
                                        style={[styles.scoreBarFill, {
                                            width: `${dashboardData.metrics.productivityScore}%`,
                                            backgroundColor: '#6366f1',
                                        }]}
                                    />
                                </View>
                                <Text style={styles.scoreItemValue}>{dashboardData.metrics.productivityScore}</Text>
                            </View>

                            <View style={styles.scoreItem}>
                                <Text style={styles.scoreItemLabel}>Communication</Text>
                                <View style={styles.scoreBar}>
                                    <View
                                        style={[styles.scoreBarFill, {
                                            width: `${dashboardData.metrics.communicationScore}%`,
                                            backgroundColor: '#3B82F6',
                                        }]}
                                    />
                                </View>
                                <Text style={styles.scoreItemValue}>{dashboardData.metrics.communicationScore}</Text>
                            </View>

                            <View style={styles.scoreItem}>
                                <Text style={styles.scoreItemLabel}>Consistency</Text>
                                <View style={styles.scoreBar}>
                                    <View
                                        style={[styles.scoreBarFill, {
                                            width: `${dashboardData.metrics.consistencyScore}%`,
                                            backgroundColor: theme.colors.warning,
                                        }]}
                                    />
                                </View>
                                <Text style={styles.scoreItemValue}>{dashboardData.metrics.consistencyScore}</Text>
                            </View>
                        </View>
                    </View>
                </AdvancedCard>

                {/* Activity Summary */}
                <AdvancedCard variant="outlined" size="lg" style={styles.activityCard}>
                    <Text style={styles.sectionTitle}>Today's Activity</Text>
                    <View style={styles.activityGrid}>
                        <View style={styles.activityItem}>
                            <Ionicons name="calendar" size={24} color="#3B82F6" />
                            <Text style={styles.activityValue}>{dashboardData.activity.totalCalendarEvents}</Text>
                            <Text style={styles.activityLabel}>Events</Text>
                        </View>

                        <View style={styles.activityItem}>
                            <Ionicons name="time" size={24} color={theme.colors.warning} />
                            <Text style={styles.activityValue}>{Math.round(dashboardData.activity.totalTimeSpent)}m</Text>
                            <Text style={styles.activityLabel}>Total Time</Text>
                        </View>

                        <View style={styles.activityItem}>
                            <Ionicons name="star" size={24} color={theme.colors.success} />
                            <Text style={styles.activityValue}>12</Text>
                            <Text style={styles.activityLabel}>Streaks</Text>
                        </View>

                        <View style={styles.activityItem}>
                            <Ionicons name="medal" size={24} color={theme.colors.error} />
                            <Text style={styles.activityValue}>22</Text>
                            <Text style={styles.activityLabel}>Achievements</Text>
                        </View>
                    </View>
                </AdvancedCard>
            </ScrollView>
        );
    };

    const renderMembersTab = () => {
        if (!dashboardData) return null;

        return (
            <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                {dashboardData.members.map((member, index) => (
                    <AdvancedCard key={member.id} variant="outlined" size="lg" style={styles.memberCard}>
                        <View style={styles.memberHeader}>
                            <View style={styles.memberAvatar}>
                                <Text style={styles.memberAvatarText}>
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                </Text>
                            </View>

                            <View style={styles.memberInfo}>
                                <Text style={theme.typography.textStyles.title}>{member.name}</Text>
                                <Text style={theme.typography.textStyles.body}>{member.role.charAt(0).toUpperCase() + member.role.substring(1)}</Text>
                                <Text style={theme.typography.textStyles.caption}>{member.activity}</Text>
                            </View>

                            <View style={styles.memberStatus}>
                                <View style={[
                                    styles.statusIndicator,
                                    {
                                        backgroundColor: member.status === 'online' ? theme.colors.success :
                                            member.status === 'busy' ? theme.colors.error :
                                                member.status === 'away' ? theme.colors.warning : '#6B7280'
                                    }
                                ]} />
                                <Text style={[theme.typography.textStyles.caption, styles.statusText]}>
                                    {member.status.charAt(0).toUpperCase() + member.status.substring(1)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.memberMetrics}>
                            <View style={styles.memberMetric}>
                                <Ionicons name="time" size={16} color="#6B7280" />
                                <Text style={theme.typography.textStyles.caption}>{member.timeSpent}m today</Text>
                            </View>

                            <AdvancedButton
                                variant="outline"
                                size="sm"
                                onPress={() => onNavigate?.('FamilyManagement', { memberId: member.id })}
                                icon="person"
                            >
                                View Profile
                            </AdvancedButton>
                        </View>
                    </AdvancedCard>
                ))}
            </ScrollView>
        );
    };

    const renderLeaderboardTab = () => {
        if (!dashboardData) return null;

        return (
            <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                <AdvancedCard variant="elevated" size="lg" style={styles.leaderboardCard}>
                    <LinearGradient
                        colors={themeUtils.gradients.primary as unknown as readonly [string, string, ...string[]]}
                        style={styles.leaderboardGradient}
                    >
                        <Text style={styles.leaderboardTitle}>Family Leaderboard</Text>
                        <Text style={styles.leaderboardSubtitle}>Weekly Performance Rankings</Text>
                    </LinearGradient>
                </AdvancedCard>

                {dashboardData.leaderboard.map((member, index) => (
                    <AdvancedCard key={member.memberId} variant="outlined" size="md" style={styles.leaderboardItem}>
                        <View style={styles.leaderboardRank}>
                            <View style={[
                                styles.rankBadge,
                                { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#6B7280' }
                            ]}>
                                <Text style={styles.rankNumber}>{member.rank}</Text>
                            </View>
                        </View>

                        <View style={styles.leaderboardContent}>
                            <Text style={theme.typography.textStyles.title}>{member.name}</Text>
                            <Text style={theme.typography.textStyles.body}>
                                {member.points} points • {member.achievements} achievements
                            </Text>
                            <Text style={theme.typography.textStyles.caption}>
                                {member.streakDays} day streak
                            </Text>
                        </View>

                        <View style={styles.leaderboardScore}>
                            <Text style={styles.scoreBadge}>{member.score}</Text>
                            <Ionicons
                                name={index < 3 ? "trophy" : "medal"}
                                size={24}
                                color={index < 3 ? '#FFD700' : '#6B7280'}
                            />
                        </View>
                    </AdvancedCard>
                ))}
            </ScrollView>
        );
    };

    const renderCurrentTab = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverviewTab();
            case 'members':
                return renderMembersTab();
            case 'leaderboard':
                return renderLeaderboardTab();
            default:
                return renderOverviewTab();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <LinearGradient colors={themeUtils.gradients.primary as unknown as readonly [string, string, ...string[]]} style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Family Dashboard</Text>
                    <Text style={styles.headerSubtitle}>Advanced Family Management</Text>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleRefresh} style={styles.actionButton}>
                        <Ionicons name="refresh" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onNavigate?.('Analytics')} style={styles.actionButton}>
                        <Ionicons name="analytics" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {[
                    { id: 'overview', label: 'Overview', icon: 'home' },
                    { id: 'members', label: 'Members', icon: 'people' },
                    { id: 'goals', label: 'Goals', icon: 'flag' },
                    { id: 'activities', label: 'Activities', icon: 'list' },
                    { id: 'leaderboard', label: 'Board', icon: 'trophy' },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                        onPress={() => setActiveTab(tab.id as any)}
                    >
                        <Ionicons
                            name={tab.icon as any}
                            size={16}
                            color={activeTab === tab.id ? 'white' : '#6B7280'}
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === tab.id && styles.activeTabText,
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
            >
                {renderCurrentTab()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // Header
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'white',
        opacity: 0.9,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 8,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        gap: 6,
    },
    activeTab: {
        backgroundColor: '#6366f1',
    },
    tabText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabText: {
        color: 'white',
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    tabContent: {
        flex: 1,
    },

    // Metrics
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    metricCard: {
        flex: 1,
        minWidth: '45%',
    },
    metricGradient: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricValue: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        marginTop: 8,
    },
    metricLabel: {
        fontSize: 12,
        color: 'white',
        opacity: 0.9,
        textAlign: 'center',
        marginTop: 4,
    },

    // Score card
    scoreCard: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    scoreContainer: {
        gap: 20,
    },
    scoreMain: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: '700',
        color: '#6366f1',
    },
    scoreLabel: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 4,
    },
    scoreBreakdown: {
        gap: 16,
    },
    scoreItem: {
        gap: 8,
    },
    scoreItemLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    scoreBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    scoreBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    scoreItemValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textAlign: 'right',
    },

    // Activity card
    activityCard: {
        marginBottom: 20,
    },
    activityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    activityItem: {
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        paddingVertical: 16,
    },
    activityValue: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 8,
        marginBottom: 4,
    },
    activityLabel: {
        fontSize: 12,
        color: '#6B7280',
    },

    // Member cards
    memberCard: {
        marginBottom: 16,
    },
    memberHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    memberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    memberAvatarText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    memberInfo: {
        flex: 1,
    },
    memberStatus: {
        alignItems: 'center',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 10,
    },
    memberMetrics: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    memberMetric: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    // Leaderboard
    leaderboardCard: {
        marginBottom: 20,
    },
    leaderboardGradient: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    leaderboardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
    },
    leaderboardSubtitle: {
        fontSize: 14,
        color: 'white',
        opacity: 0.9,
        marginTop: 4,
    },
    leaderboardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    leaderboardRank: {
        marginRight: 16,
    },
    rankBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankNumber: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    leaderboardContent: {
        flex: 1,
    },
    leaderboardScore: {
        alignItems: 'center',
    },
    scoreBadge: {
        fontSize: 18,
        fontWeight: '700',
        color: '#6366f1',
        marginBottom: 4,
    },
});

export default FamilyDashboard;
