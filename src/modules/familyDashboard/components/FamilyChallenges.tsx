/**
 * Family Challenges Component
 * Gamification system for family activities and achievements
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, AdvancedCard, AdvancedButton, themeUtils } from '../../../components/ui';
import { FamilyChallenge, FamilyReward } from '../FamilyDashboardService';

interface FamilyChallengesProps {
    challenges: FamilyChallenge[];
    onChallengeSelect?: (challengeId: string) => void;
    onCreateChallenge?: () => void;
}

export const FamilyChallenges: React.FC<FamilyChallengesProps> = ({
    challenges,
    onChallengeSelect,
    onCreateChallenge,
}) => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');

    const getChallengeStatusColor = (status: FamilyChallenge['status']) => {
        switch (status) {
            case 'active':
                return theme.colors.success;
            case 'upcoming':
                return theme.colors.warning;
            case 'completed':
                return '#3B82F6'; // Blue color for info
            default:
                return '#6B7280'; // Gray color
        }
    };

    const getStatusData = () => {
        switch (activeTab) {
            case 'active':
                return challenges.filter(c => c.status === 'active');
            case 'upcoming':
                return challenges.filter(c => c.status === 'upcoming');
            case 'completed':
                return challenges.filter(c => c.status === 'completed');
            default:
                return challenges;
        }
    };

    const renderChallengeCard = (challenge: FamilyChallenge) => (
        <AdvancedCard
            key={challenge.id}
            variant="outlined"
            style={styles.challengeCard}
            onPress={() => onChallengeSelect?.(challenge.id)}
        >
            <View style={styles.challengeHeader}>
                <View style={styles.challengeInfo}>
                    <Text style={theme.typography.textStyles.title}>{challenge.title}</Text>
                    <Text style={theme.typography.textStyles.body}>{challenge.description}</Text>

                    <View style={styles.challengeMeta}>
                        <View style={styles.challengeDates}>
                            <Ionicons name="calendar" size={14} color="#6B7280" />
                            <Text style={theme.typography.textStyles.caption}>
                                {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                            </Text>
                        </View>

                        <View style={styles.challengeParticipants}>
                            <Ionicons name="people" size={14} color="#6B7280" />
                            <Text style={theme.typography.textStyles.caption}>
                                {challenge.participants.length} participants
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.challengeStatus}>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getChallengeStatusColor(challenge.status) }
                        ]}
                    >
                        <Text style={styles.statusText}>{challenge.status}</Text>
                    </View>
                </View>
            </View>

            {/* Progress */}
            {challenge.status === 'active' && (
                <View style={styles.challengeProgress}>
                    <Text style={theme.typography.textStyles.caption}>Progress</Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${(challenge.activities.filter(a => a.completed).length / challenge.activities.length) * 100}%`,
                                    backgroundColor: theme.colors.success,
                                }
                            ]}
                        />
                    </View>
                    <Text style={theme.typography.textStyles.caption}>
                        {challenge.activities.filter(a => a.completed).length}/{challenge.activities.length} activities
                    </Text>
                </View>
            )}

            {/* Rewards */}
            <View style={styles.challengeRewards}>
                <Text style={theme.typography.textStyles.caption}>Rewards:</Text>
                <View style={styles.rewardsList}>
                    {challenge.rewards.slice(0, 3).map((reward) => (
                        <View key={reward.id} style={styles.rewardBadge}>
                            <Ionicons name={reward.Icon as any || "gift"} size={12} color={theme.colors.primary} />
                            <Text style={styles.rewardText}>{reward.title}</Text>
                        </View>
                    ))}
                    {challenge.rewards.length > 3 && (
                        <Text style={styles.moreRewards}>+{challenge.rewards.length - 3} more</Text>
                    )}
                </View>
            </View>
        </AdvancedCard>
    );

    const activeChallenges = getStatusData();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <LinearGradient colors={themeUtils.gradients.warning as unknown as readonly [string, string, ...string[]]} style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Family Challenges</Text>
                    <Text style={styles.headerSubtitle}>Fun competitions & achievements</Text>
                </View>

                <AdvancedButton
                    variant="ghost"
                    size="md"
                    onPress={onCreateChallenge}
                    icon="add"
                    style={styles.createButton}
                >
                    Create Challenge
                </AdvancedButton>
            </LinearGradient>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {[
                    { id: 'active', label: 'Active', count: challenges.filter(c => c.status === 'active').length },
                    { id: 'upcoming', label: 'Upcoming', count: challenges.filter(c => c.status === 'upcoming').length },
                    { id: 'completed', label: 'Completed', count: challenges.filter(c => c.status === 'completed').length },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                        onPress={() => setActiveTab(tab.id as any)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                        <View style={[
                            styles.tabBadge,
                            activeTab === tab.id && styles.activeTabBadge,
                        ]}>
                            <Text style={[
                                styles.tabBadgeText,
                                activeTab === tab.id && styles.activeTabBadgeText,
                            ]}>
                                {tab.count}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {activeChallenges.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="trophy-outline" size={48} color="#6B7280" />
                        <Text style={[theme.typography.textStyles.h3, styles.emptyTitle]}>
                            No Challenges Yet
                        </Text>
                        <Text style={[theme.typography.textStyles.body, styles.emptySubtitle]}>
                            Create your first family challenge to start having fun together!
                        </Text>

                        <AdvancedButton
                            variant="primary"
                            size="lg"
                            onPress={onCreateChallenge}
                            icon="add"
                            style={styles.emptyAction}
                        >
                            Create First Challenge
                        </AdvancedButton>
                    </View>
                ) : (
                    activeChallenges.map(renderChallengeCard)
                )}
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
    createButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    activeTab: {
        backgroundColor: '#F59E0B',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabText: {
        color: 'white',
    },
    tabBadge: {
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
    },
    activeTabBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    tabBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabBadgeText: {
        color: 'white',
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },

    // Challenge cards
    challengeCard: {
        marginBottom: 16,
    },
    challengeHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    challengeInfo: {
        flex: 1,
        marginRight: 12,
    },
    challengeMeta: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    challengeDates: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    challengeParticipants: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    challengeStatus: {
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
        textTransform: 'capitalize',
    },

    // Progress
    challengeProgress: {
        marginBottom: 12,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
        marginVertical: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },

    // Rewards
    challengeRewards: {
        gap: 8,
    },
    rewardsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    rewardBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    rewardText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#374151',
    },
    moreRewards: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        textAlign: 'center',
        color: '#6B7280',
        marginBottom: 24,
    },
    emptyAction: {
        marginTop: 8,
    },
});

export default FamilyChallenges;
