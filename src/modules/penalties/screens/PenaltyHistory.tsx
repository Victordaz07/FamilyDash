import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePenaltiesStore } from '@/store/penaltiesStore';
import ReflectionCard from '@/components/ReflectionCard';

interface PenaltyHistoryProps {
    navigation: any;
}

const PenaltyHistory: React.FC<PenaltyHistoryProps> = ({ navigation }) => {
    const { getCompletedPenalties, familyMembers, getStats } = usePenaltiesStore();
    const [selectedMember, setSelectedMember] = useState<string>('all');

    const completedPenalties = getCompletedPenalties();
    const stats = getStats();

    const filteredPenalties = selectedMember === 'all'
        ? completedPenalties
        : completedPenalties.filter(p => p.memberId === selectedMember);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;

        return date.toLocaleDateString();
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            behavior: '#EF4444',
            chores: '#F59E0B',
            screen_time: '#8B5CF6',
            homework: '#3B82F6',
            other: '#6B7280'
        };
        return colors[category as keyof typeof colors] || colors.other;
    };

    const getMemberStats = (memberId: string) => {
        const memberPenalties = completedPenalties.filter(p => p.memberId === memberId);
        const totalTime = memberPenalties.reduce((sum, p) => sum + p.duration, 0);
        const avgDuration = memberPenalties.length > 0 ? totalTime / memberPenalties.length : 0;

        return {
            count: memberPenalties.length,
            totalTime,
            avgDuration: Math.round(avgDuration)
        };
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#6B7280', '#4B5563'] as unknown as readonly [string, string, ...string[]]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Penalty History</Text>
                        <Text style={styles.headerSubtitle}>
                            {stats.completedPenalties} completed penalties
                        </Text>
                    </View>

                    <View style={styles.placeholder} />
                </View>
            </LinearGradient>

            {/* Member Filter */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            selectedMember === 'all' && styles.filterButtonActive
                        ]}
                        onPress={() => setSelectedMember('all')}
                    >
                        <Text style={[
                            styles.filterText,
                            selectedMember === 'all' && styles.filterTextActive
                        ]}>
                            All ({completedPenalties.length})
                        </Text>
                    </TouchableOpacity>

                    {familyMembers.filter(m => m.role !== 'parent').map((member) => {
                        const memberStats = getMemberStats(member.id);
                        return (
                            <TouchableOpacity
                                key={member.id}
                                style={[
                                    styles.filterButton,
                                    selectedMember === member.id && styles.filterButtonActive
                                ]}
                                onPress={() => setSelectedMember(member.id)}
                            >
                                <Image source={{ uri: member.avatar }} style={styles.filterAvatar} />
                                <Text style={[
                                    styles.filterText,
                                    selectedMember === member.id && styles.filterTextActive
                                ]}>
                                    {member.name} ({memberStats.count})
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Stats Summary */}
            {selectedMember !== 'all' && (
                <View style={styles.memberStatsContainer}>
                    {(() => {
                        const memberStats = getMemberStats(selectedMember);
                        const member = familyMembers.find(m => m.id === selectedMember);
                        return (
                            <View style={styles.memberStatsCard}>
                                <View style={styles.memberStatsHeader}>
                                    <Image source={{ uri: member?.avatar }} style={styles.memberStatsAvatar} />
                                    <View>
                                        <Text style={styles.memberStatsName}>{member?.name}'s Summary</Text>
                                        <Text style={styles.memberStatsSubtitle}>Completed penalties</Text>
                                    </View>
                                </View>

                                <View style={styles.memberStatsGrid}>
                                    <View style={styles.memberStatItem}>
                                        <Text style={styles.memberStatNumber}>{memberStats.count}</Text>
                                        <Text style={styles.memberStatLabel}>Total</Text>
                                    </View>
                                    <View style={styles.memberStatItem}>
                                        <Text style={styles.memberStatNumber}>{Math.floor(memberStats.totalTime / 60)}h</Text>
                                        <Text style={styles.memberStatLabel}>Time Served</Text>
                                    </View>
                                    <View style={styles.memberStatItem}>
                                        <Text style={styles.memberStatNumber}>{memberStats.avgDuration}m</Text>
                                        <Text style={styles.memberStatLabel}>Avg Duration</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })()}
                </View>
            )}

            {/* History List */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {filteredPenalties.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="time" size={64} color="#6B7280" />
                        <Text style={styles.emptyTitle}>No History</Text>
                        <Text style={styles.emptySubtitle}>
                            {selectedMember === 'all'
                                ? 'No completed penalties yet.'
                                : `${familyMembers.find(m => m.id === selectedMember)?.name} has no completed penalties.`
                            }
                        </Text>
                    </View>
                ) : (
                    filteredPenalties.map((penalty) => (
                        <View key={penalty.id} style={styles.historyItem}>
                            {/* Penalty Info */}
                            <View style={styles.penaltyInfo}>
                                <View style={styles.penaltyHeader}>
                                    <View style={styles.penaltyMember}>
                                        <Image source={{ uri: penalty.memberAvatar }} style={styles.penaltyAvatar} />
                                        <View>
                                            <Text style={styles.penaltyMemberName}>{penalty.memberName}</Text>
                                            <Text style={styles.penaltyDate}>
                                                {penalty.endTime ? formatDate(penalty.endTime) : 'Unknown'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(penalty.category) }]}>
                                        <Text style={styles.categoryBadgeText}>
                                            {penalty.category.replace('_', ' ')}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.penaltyReason}>{penalty.reason}</Text>

                                <View style={styles.penaltyStats}>
                                    <View style={styles.penaltyStat}>
                                        <Ionicons name="time" size={14} color="#6B7280" />
                                        <Text style={styles.penaltyStatText}>{penalty.duration} minutes</Text>
                                    </View>
                                    <View style={styles.penaltyStat}>
                                        <Ionicons name="person" size={14} color="#6B7280" />
                                        <Text style={styles.penaltyStatText}>by {penalty.createdBy}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Reflection */}
                            {penalty.reflection && (
                                <ReflectionCard
                                    reflection={penalty.reflection}
                                    memberName={penalty.memberName}
                                    memberAvatar={penalty.memberAvatar}
                                    timestamp={penalty.endTime || penalty.startTime}
                                />
                            )}
                        </View>
                    ))
                )}
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
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    placeholder: {
        width: 40,
    },
    filterContainer: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    filterButtonActive: {
        borderColor: '#8B5CF6',
        backgroundColor: '#F3F4F6',
    },
    filterAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 8,
    },
    filterText: {
        fontSize: 14,
        color: '#6B7280',
    },
    filterTextActive: {
        color: '#8B5CF6',
        fontWeight: '500',
    },
    memberStatsContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    memberStatsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    memberStatsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    memberStatsAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    memberStatsName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    memberStatsSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    memberStatsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    memberStatItem: {
        alignItems: 'center',
    },
    memberStatNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#8B5CF6',
        marginBottom: 4,
    },
    memberStatLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    content: {
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    historyItem: {
        marginBottom: 24,
    },
    penaltyInfo: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    penaltyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    penaltyMember: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    penaltyAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    penaltyMemberName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    penaltyDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: '500',
        color: 'white',
        textTransform: 'uppercase',
    },
    penaltyReason: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 12,
    },
    penaltyStats: {
        flexDirection: 'row',
        gap: 16,
    },
    penaltyStat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    penaltyStatText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
});

export default PenaltyHistory;
