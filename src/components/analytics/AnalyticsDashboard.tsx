/**
 * Analytics Dashboard Component
 * Comprehensive analytics visualization and insights display
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
import { Card, Button } from '../ui/WorkingComponents';
import { theme } from '@/styles/simpleTheme';
// Temporarily commented out - service not available
// import {
//     UserBehaviorMetrics,
//     FamilyAnalytics,
//     AnalyticsInsight,
//     SmartReport,
// } from '@/services/analytics/DataAnalyticsService';

// Mock types for now
type UserBehaviorMetrics = any;
type FamilyAnalytics = any;
type AnalyticsInsight = any;
type SmartReport = any;

interface AnalyticsDashboardProps {
    userId?: string;
    familyId?: string;
    reportType?: 'individual' | 'family' | 'parental' | 'productivity';
    period?: 'daily' | 'weekly' | 'monthly';
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
    userId = 'current_user',
    familyId = 'current_family',
    reportType = 'individual',
    period = 'weekly',
}) => {
    // const theme = useTheme();
    // const analyticsService = useAnalytics({ debugMode: true });

    const [behaviorMetrics, setBehaviorMetrics] = useState<UserBehaviorMetrics | null>(null);
    const [familyMetrics, setFamilyMetrics] = useState<FamilyAnalytics | null>(null);
    const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
    const [report, setReport] = useState<SmartReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'productivity' | 'engagement' | 'insights'>('overview');

    // Load analytics data
    useEffect(() => {
        loadAnalyticsData();
    }, [period, reportType]);

    const loadAnalyticsData = async () => {
        try {
            setIsLoading(true);

            // Temporarily disabled - analytics service not available
            // // Load metrics based on report type
            // if (reportType === 'individual' || reportType === 'productivity') {
            //     const metrics = await analyticsService.generateUserMetrics(userId, period);
            //     setBehaviorMetrics(metrics);
            // }

            // if (reportType === 'family' || reportType === 'parental') {
            //     const fmetrics = await analyticsService.generateFamilyMetrics(familyId, period === 'daily' ? 'weekly' : period);
            //     setFamilyMetrics(fmetrics);
            // }

            // // Generate insights
            // const analyticsInsights = await analyticsService.generateInsights(userId, familyId);
            // setInsights(analyticsInsights);

            // // Generate report
            // const analyticsReport = await analyticsService.generateReport(reportType, userId, familyId, period);
            // setReport(analyticsReport);

        } catch (error) {
            console.error('Error loading analytics data:', error);
            Alert.alert('Error', 'Failed to load analytics data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = useCallback(() => {
        loadAnalyticsData();
    }, [loadAnalyticsData]);

    const handleExportData = async () => {
        try {
            // Temporarily disabled - analytics service not available
            // const data = await analyticsService.exportData(userId, 'json');
            Alert.alert('Data Export', 'Analytics data export is temporarily unavailable');
            // console.log('Exported data:', data);
        } catch (error) {
            Alert.alert('Error', 'Failed to export data');
        }
    };

    const renderOverviewTab = () => {
        if (reportType === 'individual' && behaviorMetrics) {
            return (
                <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                    {/* Executive Summary */}
                    {report && (
                        <Card style={styles.summaryCard}>
                            <LinearGradient
                                colors={[theme.colors.primary, '#7C3AED']}
                                style={styles.summaryGradient}
                            >
                                <Text style={styles.summaryTitle}>Performance Summary</Text>
                                <View style={styles.summaryMetrics}>
                                    <View style={styles.summaryMetric}>
                                        <Text style={styles.summaryMetricValue}>
                                            {Math.round(behaviorMetrics.engagement.totalTimeSpent)}
                                        </Text>
                                        <Text style={styles.summaryMetricLabel}>Minutes Spent</Text>
                                    </View>
                                    <View style={styles.summaryMetric}>
                                        <Text style={styles.summaryMetricValue}>
                                            {behaviorMetrics.productivity.tasksCompleted}
                                        </Text>
                                        <Text style={styles.summaryMetricLabel}>Tasks Completed</Text>
                                    </View>
                                    <View style={styles.summaryMetric}>
                                        <Text style={styles.summaryMetricValue}>
                                            {behaviorMetrics.productivity.goalsProgressUpdated}
                                        </Text>
                                        <Text style={styles.summaryMetricLabel}>Goals Updated</Text>
                                    </View>
                                    <View style={styles.summaryMetric}>
                                        <Text style={styles.summaryMetricValue}>
                                            {behaviorMetrics.sessionsCount}
                                        </Text>
                                        <Text style={styles.summaryMetricLabel}>Sessions</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </Card>
                    )}

                    {/* Navigation Patterns */}
                    <Card style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Most Visited Screens</Text>
                        {behaviorMetrics.navigation.mostVisitedScreens.slice(0, 5).map((screen, index) => (
                            <View key={screen.screen} style={styles.listItem}>
                                <Text style={styles.listItemNumber}>{index + 1}</Text>
                                <View style={styles.listItemContent}>
                                    <Text style={styles.listItemTitle}>{screen.screen}</Text>
                                    <Text style={styles.listItemSubtitle}>{screen.count} visits</Text>
                                </View>
                                <Ionicons name="eye" size={20} color={theme.colors.textSecondary} />
                            </View>
                        ))}
                    </Card>

                    {/* Feature Usage */}
                    <Card style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Feature Usage Time</Text>
                        {Object.entries(behaviorMetrics.engagement.featureUsageTime)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .slice(0, 5)
                            .map(([feature, time]) => (
                                <View key={feature} style={styles.featureItem}>
                                    <Text style={styles.featureTitle}>{feature}</Text>
                                    <View style={styles.featureProgress}>
                                        <View
                                            style={[
                                                styles.featureProgressBar,
                                                {
                                                    backgroundColor: theme.colors.primary,
                                                    width: `${Math.min(((time as number) / Math.max(...Object.values(behaviorMetrics.engagement.featureUsageTime).map(v => v as number))) * 100, 100)}%`,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.featureCaption}>{time as number} interactions</Text>
                                </View>
                            ))}
                    </Card>
                </ScrollView>
            );
        }

        if ((reportType === 'family' || reportType === 'parental') && familyMetrics) {
            return (
                <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                    {/* Family Summary */}
                    <Card style={styles.summaryCard}>
                        <LinearGradient
                            colors={[theme.colors.success, '#10B981']}
                            style={styles.summaryGradient}
                        >
                            <Text style={styles.summaryTitle}>Family Collaboration Summary</Text>
                            <View style={styles.summaryMetrics}>
                                <View style={styles.summaryMetric}>
                                    <Text style={styles.summaryMetricValue}>
                                        {familyMetrics.overall.activeMembers}
                                    </Text>
                                    <Text style={styles.summaryMetricLabel}>Active Members</Text>
                                </View>
                                <View style={styles.summaryMetric}>
                                    <Text style={styles.summaryMetricValue}>
                                        {familyMetrics.productivity.totalTasksCompleted}
                                    </Text>
                                    <Text style={styles.summaryMetricLabel}>Tasks Completed</Text>
                                </View>
                                <View style={styles.summaryMetric}>
                                    <Text style={styles.summaryMetricValue}>
                                        {familyMetrics.collaboration.safeRoomActivity}
                                    </Text>
                                    <Text style={styles.summaryMetricLabel}>SafeRoom Messages</Text>
                                </View>
                                <View style={styles.summaryMetric}>
                                    <Text style={styles.summaryMetricValue}>
                                        {Math.round(familyMetrics.collaboration.avgInteractionsPerDay)}
                                    </Text>
                                    <Text style={styles.summaryMetricLabel}>Daily Interactions</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </Card>

                    {/* Family Engagement */}
                    <Card style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Family Engagement Distribution</Text>
                        {Object.entries(familyMetrics.engagement.engagementByMember).map(([memberId, engagement]) => (
                            <View key={memberId} style={styles.listItem}>
                                <Text style={styles.listItemNumber}>👥</Text>
                                <View style={styles.listItemContent}>
                                    <Text style={styles.memberTitle}>{memberId}</Text>
                                    <Text style={styles.memberSubtitle}>{engagement as number} minutes engaged</Text>
                                </View>
                                <View style={styles.engagementIndicator}>
                                    <View
                                        style={[
                                            styles.engagementBar,
                                            {
                                                backgroundColor: (engagement as number) > 100 ? theme.colors.success :
                                                    (engagement as number) > 50 ? theme.colors.warning : theme.colors.error,
                                                width: `${Math.min(((engagement as number) / 150) * 100, 100)}%`,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        ))}
                    </Card>
                </ScrollView>
            );
        }

        return (
            <View style={styles.emptyState}>
                <Ionicons name="analytics" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyTitle}>No Data Available</Text>
                <Text style={styles.emptySubtitle}>
                    Enable analytics tracking to see your data here
                </Text>
            </View>
        );
    };

    const renderProductivityTab = () => {
        if (!behaviorMetrics && !familyMetrics) return null;

        return (
            <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                <Card style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Productivity Metrics</Text>

                    {behaviorMetrics ? (
                        <>
                            <View style={styles.metricRow}>
                                <Text style={styles.metricTitle}>Tasks Completed</Text>
                                <Text style={styles.metricValue}>{behaviorMetrics.productivity.tasksCompleted}</Text>
                            </View>
                            <View style={styles.metricRow}>
                                <Text style={styles.metricTitle}>Goals Progress</Text>
                                <Text style={styles.metricValue}>{behaviorMetrics.productivity.goalsProgressUpdated}</Text>
                            </View>
                            <View style={styles.metricRow}>
                                <Text style={styles.metricTitle}>Avg Task Time</Text>
                                <Text style={styles.metricValue}>{behaviorMetrics.productivity.avgTaskCompletionTime}m</Text>
                            </View>
                            <View style={styles.metricRow}>
                                <Text style={styles.metricTitle}>On-Time Rate</Text>
                                <Text style={styles.metricValue}>{behaviorMetrics.productivity.onTimeTaskRate.toFixed(1)}%</Text>
                            </View>
                        </>
                    ) : familyMetrics ? (
                        <>
                            <View style={styles.metricRow}>
                                <Text style={styles.metricTitle}>Family Tasks</Text>
                                <Text style={styles.metricValue}>{familyMetrics.productivity.totalTasksCompleted}</Text>
                            </View>
                            <View style={styles.metricRow}>
                                <Text style={styles.metricTitle}>Goal Progress</Text>
                                <Text style={styles.metricValue}>{familyMetrics.productivity.totalGoalsProgress}</Text>
                            </View>
                            <View style={styles.metricRow}>
                                <Text style={styles.metricTitle}>Completion Rate</Text>
                                <Text style={styles.metricValue}>{familyMetrics.productivity.familyGoalCompletionRate.toFixed(1)}%</Text>
                            </View>
                        </>
                    ) : null}
                </Card>
            </ScrollView>
        );
    };

    const renderEngagementTab = () => {
        if (!behaviorMetrics && !familyMetrics) return null;

        return (
            <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                <Card style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Engagement Analysis</Text>

                    <Card style={styles.subCard}>
                        <Text style={styles.cardTitle}>Session Statistics</Text>
                        <View style={styles.metricGrid}>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>Total Sessions</Text>
                                <Text style={styles.metricValue}>{behaviorMetrics?.engagement.sessionsCount || familyMetrics?.overall.totalMembers || 0}</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>Avg Duration</Text>
                                <Text style={styles.metricValue}>{behaviorMetrics?.engagement.avgSessionDuration.toFixed(1) || familyMetrics?.overall.avgSessionDurationPerMember.toFixed(1) || 0}m</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>Total Time</Text>
                                <Text style={styles.metricValue}>{behaviorMetrics?.engagement.totalTimeSpent.toFixed(0) || familyMetrics?.overall.totalFamilyTimeSpent.toFixed(0) || 0}m</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>Screens/Session</Text>
                                <Text style={styles.metricValue}>{behaviorMetrics?.navigation.avgScreensPerSession.toFixed(1) || 'N/A'}</Text>
                            </View>
                        </View>
                    </Card>

                    <Card style={styles.subCard}>
                        <Text style={styles.cardTitle}>Navigation Flow</Text>
                    </Card>
                </Card>
            </ScrollView>
        );
    };

    const renderInsightsTab = () => {
        return (
            <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                <Card style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Smart Insights</Text>

                    {insights.length === 0 ? (
                        <View style={styles.emptyInsightsState}>
                            <Ionicons name="bulb" size={32} color={theme.colors.textSecondary} />
                            <Text style={styles.emptyInsightsText}>
                                No insights available yet. Keep using the app to generate personalized insights!
                            </Text>
                        </View>
                    ) : (
                        insights.map((insight) => (
                            <Card
                                key={insight.id}
                                style={{
                                    ...styles.insightCard,
                                    borderLeftColor: insight.impact === 'high' ? theme.colors.error :
                                        insight.impact === 'medium' ? theme.colors.warning : theme.colors.success,
                                }}
                            >
                                <View style={styles.insightHeader}>
                                    <Text style={styles.insightTitle}>{insight.title}</Text>
                                    <View style={styles.insightBadge}>
                                        <Text style={styles.insightBadgeText}>{insight.confidence}%</Text>
                                    </View>
                                </View>

                                <Text style={styles.insightDescription}>
                                    {insight.description}
                                </Text>

                                {insight.actionable && insight.recommendations && (
                                    <View style={styles.recommendationsContainer}>
                                        <Text style={styles.recommendationTitle}>Recommendations:</Text>
                                        {insight.recommendations.slice(0, 3).map((recommendation, index) => (
                                            <Text key={index} style={styles.recommendation}>
                                                • {recommendation}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </Card>
                        ))
                    )}
                </Card>
            </ScrollView>
        );
    };

    const renderCurrentTab = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverviewTab();
            case 'productivity':
                return renderProductivityTab();
            case 'engagement':
                return renderEngagementTab();
            case 'insights':
                return renderInsightsTab();
            default:
                return renderOverviewTab();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <LinearGradient colors={[theme.colors.primary, '#7C3AED']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Analytics Dashboard</Text>
                    <Text style={styles.headerSubtitle}>
                        {reportType === 'individual' ? 'Personal' :
                            reportType === 'family' ? 'Family' :
                                reportType === 'parental' ? 'Parental' : 'Productivity'} Report - {period}
                    </Text>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleRefresh} style={styles.actionButton}>
                        <Ionicons name="refresh" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleExportData} style={styles.actionButton}>
                        <Ionicons name="download" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {[
                    { id: 'overview', label: 'Overview', icon: 'home' },
                    { id: 'productivity', label: 'Productivity', icon: 'checkmark-circle' },
                    { id: 'engagement', label: 'Engagement', icon: 'trending-up' },
                    { id: 'insights', label: 'Insights', icon: 'bulb' },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                        onPress={() => setActiveTab(tab.id as any)}
                    >
                        <Ionicons
                            name={tab.icon as any}
                            size={16}
                            color={activeTab === tab.id ? 'white' : theme.colors.textSecondary}
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
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    activeTab: {
        backgroundColor: '#6366f1',
    },
    tabText: {
        fontSize: 12,
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

    // Summary Card
    summaryCard: {
        marginBottom: 20,
    },
    summaryGradient: {
        padding: 20,
        borderRadius: 12,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginBottom: 16,
    },
    summaryMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryMetric: {
        alignItems: 'center',
        flex: 1,
    },
    summaryMetricValue: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
    },
    summaryMetricLabel: {
        fontSize: 12,
        color: 'white',
        opacity: 0.9,
        textAlign: 'center',
        marginTop: 4,
    },

    // Section Cards
    sectionCard: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },

    // List items
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    listItemNumber: {
        fontSize: 16,
        fontWeight: '600',
        width: 24,
        textAlign: 'center',
        marginRight: 12,
    },
    listItemContent: {
        flex: 1,
        marginRight: 12,
    },

    // Feature items
    featureItem: {
        marginBottom: 16,
    },
    featureProgress: {
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginVertical: 8,
    },
    featureProgressBar: {
        height: '100%',
        borderRadius: 2,
    },

    // Metrics
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    metricGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginTop: 12,
    },
    metricItem: {
        flex: 1,
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 4,
    },

    // Sub-cards
    subCard: {
        marginBottom: 16,
    },

    // Insight cards
    insightCard: {
        marginBottom: 16,
        borderLeftWidth: 4,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    insightBadge: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    insightBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    insightDescription: {
        marginBottom: 8,
        lineHeight: 20,
    },
    recommendationsContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    recommendation: {
        marginTop: 6,
        paddingLeft: 8,
    },

    // Empty states
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        textAlign: 'center',
        color: '#6B7280',
    },
    emptyInsightsState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyInsightsText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 12,
        lineHeight: 20,
    },

    // Engagement indicators
    engagementIndicator: {
        width: 60,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
    },
    engagementBar: {
        height: '100%',
        borderRadius: 2,
    },

    // Additional styles for text elements
    listItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    listItemSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    featureCaption: {
        fontSize: 12,
        color: '#6B7280',
    },
    memberTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    memberSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    metricTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    recommendationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
});

export default AnalyticsDashboard;
