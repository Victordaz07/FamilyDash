import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePenalties } from '../hooks/usePenalties';
import SummaryStats from '../components/SummaryStats';
import PenaltyCard from '../components/PenaltyCard';
import ReflectionCard from '../components/ReflectionCard';
import NewPenaltyModal from '../components/NewPenaltyModal';
import { penaltyTypes } from '../mock/penalties';

interface PenaltiesOverviewProps {
    navigation: any;
}

const PenaltiesOverview: React.FC<PenaltiesOverviewProps> = ({ navigation }) => {
    const {
        penalties,
        reflections,
        stats,
        familyMembers,
        getActivePenalties,
        getRecentlyCompletedPenalties,
        getLatestReflections,
        addTimeToPenalty,
        subtractTimeFromPenalty,
        endPenaltyEarly,
        addReactionToReflection,
        createPenalty
    } = usePenalties();

    const [showNewPenaltyModal, setShowNewPenaltyModal] = useState(false);

    const activePenalties = getActivePenalties();
    const recentlyCompleted = getRecentlyCompletedPenalties();
    const latestReflections = getLatestReflections(2);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleAddPenalty = () => {
        console.log('Setting showNewPenaltyModal to true');
        setShowNewPenaltyModal(true);
    };

    const handleNewPenaltySubmit = (penaltyData: any) => {
        const member = familyMembers.find(m => m.id === penaltyData.memberId);
        const penaltyType = penaltyTypes.find(t => t.id === penaltyData.penaltyType);

        if (!member || !penaltyType) {
            Alert.alert('Error', 'Invalid member or penalty type');
            return;
        }

        const newPenalty = {
            memberId: penaltyData.memberId,
            memberName: member.name,
            memberAvatar: member.avatar,
            memberAge: member.id === 'jake' ? 8 : member.id === 'emma' ? 12 : 35, // Mock ages
            penaltyType: penaltyType.name,
            description: penaltyData.description || penaltyType.description,
            reason: penaltyData.reason,
            startedAt: `Today ${new Date().toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })}`,
            duration: penaltyData.duration,
            color: penaltyType.color,
            icon: penaltyType.icon
        };

        createPenalty(newPenalty);
        Alert.alert('Success', `Penalty created for ${member.name}!`);
    };

    const handleViewHistory = () => {
        Alert.alert('History', 'View penalty history functionality would go here');
    };

    const handlePenaltyPress = (penaltyId: string) => {
        navigation.navigate('PenaltyDetails', { penaltyId });
    };

    const handleAddTime = (penaltyId: string) => {
        addTimeToPenalty(penaltyId, 5);
    };

    const handleSubtractTime = (penaltyId: string) => {
        subtractTimeFromPenalty(penaltyId, 5);
    };

    const handleEndEarly = (penaltyId: string) => {
        Alert.alert(
            'End Penalty Early',
            'Are you sure you want to end this penalty early?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Early',
                    style: 'destructive',
                    onPress: () => endPenaltyEarly(penaltyId)
                }
            ]
        );
    };

    const handleReflectionPress = (reflectionId: string) => {
        Alert.alert('Reflection', `View reflection ${reflectionId} details`);
    };

    const handleReaction = (reflectionId: string, reactionType: 'heart' | 'clap' | 'muscle' | 'star') => {
        addReactionToReflection(reflectionId, reactionType);
    };

    const handleViewAllReflections = () => {
        Alert.alert('All Reflections', 'View all family reflections');
    };

    const handleViewAllCompleted = () => {
        Alert.alert('All Completed', 'View all completed penalties');
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Penalties Overview</Text>
                        <Text style={styles.headerSubtitle}>Family accountability</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={[styles.headerButton, { backgroundColor: 'rgba(255, 255, 255, 0.4)' }]}
                            onPress={handleAddPenalty}
                        >
                            <Ionicons name="add" size={20} color="white" />
                        </TouchableOpacity>
                        <View style={styles.userAvatar}>
                            <Text style={styles.userAvatarText}>M</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Summary Stats */}
            <View style={styles.statsSection}>
                <View style={styles.statsCard}>
                    <SummaryStats stats={stats} />
                </View>
            </View>

            {/* Active Penalties */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Penalties</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{activePenalties.length} running</Text>
                    </View>
                </View>

                {activePenalties.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                        <Text style={styles.emptyStateText}>No active penalties</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Great job! Everyone is following the rules
                        </Text>
                    </View>
                ) : (
                    <View style={styles.penaltiesList}>
                        {activePenalties.map(penalty => (
                            <PenaltyCard
                                key={penalty.id}
                                penalty={penalty}
                                onPress={() => handlePenaltyPress(penalty.id)}
                                onAddTime={() => handleAddTime(penalty.id)}
                                onSubtractTime={() => handleSubtractTime(penalty.id)}
                                onEndEarly={() => handleEndEarly(penalty.id)}
                                showActions={true}
                            />
                        ))}
                    </View>
                )}
            </View>

            {/* Recently Completed */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recently Completed</Text>
                    <TouchableOpacity onPress={handleViewAllCompleted}>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {recentlyCompleted.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="time-outline" size={32} color="#9CA3AF" />
                        <Text style={styles.emptyStateText}>No recent completions</Text>
                    </View>
                ) : (
                    <View style={styles.completedList}>
                        {recentlyCompleted.slice(0, 3).map(penalty => (
                            <View key={penalty.id} style={styles.completedCard}>
                                <View style={styles.completedCardHeader}>
                                    <View style={styles.completedIcon}>
                                        <Ionicons name="checkmark-circle" size={20} color="white" />
                                    </View>
                                    <View style={styles.completedAvatar}>
                                        <Text style={styles.completedAvatarText}>
                                            {penalty.memberName.charAt(0)}
                                        </Text>
                                    </View>
                                    <View style={styles.completedInfo}>
                                        <Text style={styles.completedTitle}>{penalty.penaltyType}</Text>
                                        <Text style={styles.completedMember}>
                                            {penalty.memberName} • Completed {penalty.completedAt?.includes('Yesterday') ? 'yesterday' : '2h ago'}
                                        </Text>
                                    </View>
                                    <View style={styles.completedTime}>
                                        <Text style={styles.completedTimeText}>
                                            {penalty.endedEarly ? '15:00' : '30:00'}
                                        </Text>
                                        <Text style={[
                                            styles.completedStatusText,
                                            { color: penalty.endedEarly ? '#10B981' : '#6B7280' }
                                        ]}>
                                            {penalty.endedEarly ? 'Early end' : 'Full time'}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.reflectionButton}>
                                    <Text style={styles.reflectionButtonText}>Reflection</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Learning & Growth */}
            <View style={styles.section}>
                <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.learningCard}
                >
                    <View style={styles.learningHeader}>
                        <Text style={styles.learningTitle}>Learning & Growth</Text>
                        <Ionicons name="bulb" size={24} color="white" />
                    </View>

                    {latestReflections.length === 0 ? (
                        <View style={styles.emptyReflections}>
                            <Text style={styles.emptyReflectionsText}>No reflections yet</Text>
                            <Text style={styles.emptyReflectionsSubtext}>
                                Encourage family members to reflect on their penalties
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.reflectionsList}>
                            {latestReflections.map(reflection => (
                                <View key={reflection.id} style={styles.reflectionCard}>
                                    <View style={styles.reflectionCardHeader}>
                                        <View style={styles.reflectionAvatar}>
                                            <Text style={styles.reflectionAvatarText}>
                                                {reflection.memberName.charAt(0)}
                                            </Text>
                                        </View>
                                        <View style={styles.reflectionInfo}>
                                            <Text style={styles.reflectionMemberName}>{reflection.memberName}'s Reflection</Text>
                                            <Text style={styles.reflectionPenaltyTitle}>{reflection.penaltyTitle}</Text>
                                        </View>
                                        <Text style={styles.reflectionTimestamp}>{reflection.createdAt}</Text>
                                    </View>

                                    <Text style={styles.reflectionText}>{reflection.reflectionText}</Text>

                                    <View style={styles.reflectionReactions}>
                                        {reflection.reactions.heart > 0 && (
                                            <View style={styles.reactionItem}>
                                                <Text style={styles.reactionEmoji}>❤️</Text>
                                                <Text style={styles.reactionCount}>{reflection.reactions.heart}</Text>
                                            </View>
                                        )}
                                        {reflection.reactions.clap > 0 && (
                                            <View style={styles.reactionItem}>
                                                <Text style={styles.reactionEmoji}>👏</Text>
                                                <Text style={styles.reactionCount}>{reflection.reactions.clap}</Text>
                                            </View>
                                        )}
                                        {reflection.reactions.muscle > 0 && (
                                            <View style={styles.reactionItem}>
                                                <Text style={styles.reactionEmoji}>💪</Text>
                                                <Text style={styles.reactionCount}>{reflection.reactions.muscle}</Text>
                                            </View>
                                        )}
                                        {reflection.reactions.star > 0 && (
                                            <View style={styles.reactionItem}>
                                                <Text style={styles.reactionEmoji}>⭐</Text>
                                                <Text style={styles.reactionCount}>{reflection.reactions.star}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    <TouchableOpacity style={styles.viewAllReflectionsButton} onPress={handleViewAllReflections}>
                        <Text style={styles.viewAllReflectionsText}>View All Reflections</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
                <TouchableOpacity style={styles.newPenaltyButton} onPress={handleAddPenalty}>
                    <View style={styles.buttonIcon}>
                        <Ionicons name="add" size={20} color="white" />
                    </View>
                    <Text style={styles.buttonText}>New Penalty</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.historyButton} onPress={handleViewHistory}>
                    <View style={styles.buttonIcon}>
                        <Ionicons name="time" size={20} color="white" />
                    </View>
                    <Text style={styles.buttonText}>History</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* New Penalty Modal - Outside ScrollView */}
        <NewPenaltyModal
            visible={showNewPenaltyModal}
            onClose={() => setShowNewPenaltyModal(false)}
            onSubmit={handleNewPenaltySubmit}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 60,
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
    headerButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 16,
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
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatarText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    statsSection: {
        paddingHorizontal: 16,
        marginTop: -20,
    },
    statsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    section: {
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
    badge: {
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#EF4444',
    },
    viewAllText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 12,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 4,
    },
    penaltiesList: {
        gap: 12,
    },
    completedList: {
        gap: 12,
    },
    completedCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    completedCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    completedIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    completedAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    completedAvatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    completedInfo: {
        flex: 1,
    },
    completedTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 2,
    },
    completedMember: {
        fontSize: 14,
        color: '#6B7280',
    },
    completedTime: {
        alignItems: 'flex-end',
    },
    completedTimeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    completedStatusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    reflectionButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    reflectionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    learningCard: {
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    learningHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    learningTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    emptyReflections: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyReflectionsText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    emptyReflectionsSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        marginTop: 4,
    },
    reflectionsList: {
        gap: 12,
    },
    reflectionCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
    },
    reflectionCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    reflectionAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    reflectionAvatarText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    reflectionInfo: {
        flex: 1,
    },
    reflectionMemberName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 2,
    },
    reflectionPenaltyTitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    reflectionTimestamp: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    reflectionText: {
        fontSize: 14,
        color: 'white',
        lineHeight: 20,
        marginBottom: 12,
    },
    reflectionReactions: {
        flexDirection: 'row',
        gap: 12,
    },
    reactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    reactionEmoji: {
        fontSize: 16,
    },
    reactionCount: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    viewAllReflectionsButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    viewAllReflectionsText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    quickActionsSection: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 16,
        gap: 12,
    },
    newPenaltyButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EF4444',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    historyButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    buttonIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    bottomSpacing: {
        height: 80,
    },
});

export default PenaltiesOverview;
