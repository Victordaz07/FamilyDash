import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCalendar } from '../hooks/useCalendar';

interface HistoryScreenProps {
    navigation: any;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
    const { recentDecisions } = useCalendar();

    const handleBack = () => {
        navigation.goBack();
    };

    const handleDecisionPress = (decisionId: string) => {
        Alert.alert('Decision Details', `View details for decision ${decisionId}`);
    };

    const handleFilterPress = (filter: string) => {
        Alert.alert('Filter', `Filter by ${filter}`);
    };

    const handleExportPress = () => {
        Alert.alert('Export', 'Export voting history functionality would go here');
    };

    const getDecisionIcon = (iconName: string) => {
        const icons: { [key: string]: string } = {
            'pizza': 'pizza',
            'bowling-ball': 'bowling-ball',
            'book': 'book',
            'movie': 'film',
            'birthday': 'gift',
            'doctor': 'medical',
            'shopping': 'cart',
            'reading': 'book',
            'picnic': 'leaf',
            'library': 'library'
        };
        return icons[iconName] || 'calendar';
    };

    const getDecisionColor = (iconName: string) => {
        const colors: { [key: string]: string } = {
            'pizza': '#10B981',
            'bowling-ball': '#3B82F6',
            'book': '#8B5CF6',
            'movie': '#EC4899',
            'birthday': '#8B5CF6',
            'doctor': '#F59E0B',
            'shopping': '#3B82F6',
            'reading': '#F59E0B',
            'picnic': '#10B981',
            'library': '#8B5CF6'
        };
        return colors[iconName] || '#6B7280';
    };

    const getVoteResultColor = (result: string) => {
        if (result.includes('4/4')) return '#10B981';
        if (result.includes('3/4')) return '#F59E0B';
        return '#6B7280';
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Voting History</Text>
                        <Text style={styles.headerSubtitle}>Past decisions & results</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleExportPress}>
                            <Ionicons name="download" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            {/* Stats Overview */}
            <View style={styles.statsSection}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Voting Statistics</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>24</Text>
                            <Text style={styles.statLabel}>Total Votes</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>18</Text>
                            <Text style={styles.statLabel}>Decisions Made</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>85%</Text>
                            <Text style={styles.statLabel}>Participation</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>12</Text>
                            <Text style={styles.statLabel}>This Month</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Filter Options */}
            <View style={styles.filterSection}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Filter by Category</Text>
                    <View style={styles.filterButtons}>
                        <TouchableOpacity
                            style={[styles.filterButton, styles.activeFilter]}
                            onPress={() => handleFilterPress('All')}
                        >
                            <Text style={[styles.filterButtonText, styles.activeFilterText]}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => handleFilterPress('Movies')}
                        >
                            <Text style={styles.filterButtonText}>Movies</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => handleFilterPress('Activities')}
                        >
                            <Text style={styles.filterButtonText}>Activities</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => handleFilterPress('Food')}
                        >
                            <Text style={styles.filterButtonText}>Food</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Recent Decisions */}
            <View style={styles.decisionsSection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Decisions</Text>
                        <TouchableOpacity onPress={() => Alert.alert('Sort', 'Sort options')}>
                            <Ionicons name="swap-vertical" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.decisionsList}>
                        {recentDecisions.map(decision => (
                            <TouchableOpacity
                                key={decision.id}
                                style={styles.decisionItem}
                                onPress={() => handleDecisionPress(decision.id)}
                            >
                                <View style={[
                                    styles.decisionIcon,
                                    { backgroundColor: getDecisionColor(decision.icon) }
                                ]}>
                                    <Ionicons name={getDecisionIcon(decision.icon) as any} size={20} color="white" />
                                </View>

                                <View style={styles.decisionContent}>
                                    <Text style={styles.decisionTitle}>{decision.title}</Text>
                                    <View style={styles.decisionDetails}>
                                        <Text style={[
                                            styles.decisionResult,
                                            { color: getVoteResultColor(decision.result) }
                                        ]}>
                                            {decision.result}
                                        </Text>
                                        <Text style={styles.decisionDate}>• {decision.date}</Text>
                                    </View>
                                </View>

                                <View style={styles.decisionActions}>
                                    {decision.winner && (
                                        <View style={styles.winnerBadge}>
                                            <Ionicons name="trophy" size={16} color="#F59E0B" />
                                        </View>
                                    )}
                                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Monthly Breakdown */}
            <View style={styles.monthlySection}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>This Month's Breakdown</Text>
                    <View style={styles.monthlyStats}>
                        <View style={styles.monthlyStatItem}>
                            <View style={styles.monthlyStatHeader}>
                                <Text style={styles.monthlyStatTitle}>Most Voted</Text>
                                <Text style={styles.monthlyStatValue}>Movie Night</Text>
                            </View>
                            <View style={styles.monthlyStatBar}>
                                <View style={[styles.monthlyStatBarFill, { width: '90%', backgroundColor: '#3B82F6' }]} />
                            </View>
                        </View>

                        <View style={styles.monthlyStatItem}>
                            <View style={styles.monthlyStatHeader}>
                                <Text style={styles.monthlyStatTitle}>Most Active</Text>
                                <Text style={styles.monthlyStatValue}>Emma</Text>
                            </View>
                            <View style={styles.monthlyStatBar}>
                                <View style={[styles.monthlyStatBarFill, { width: '75%', backgroundColor: '#EC4899' }]} />
                            </View>
                        </View>

                        <View style={styles.monthlyStatItem}>
                            <View style={styles.monthlyStatHeader}>
                                <Text style={styles.monthlyStatTitle}>Quickest Decision</Text>
                                <Text style={styles.monthlyStatValue}>Pizza Night</Text>
                            </View>
                            <View style={styles.monthlyStatBar}>
                                <View style={[styles.monthlyStatBarFill, { width: '60%', backgroundColor: '#10B981' }]} />
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Archive Section */}
            <View style={styles.archiveSection}>
                <View style={styles.card}>
                    <View style={styles.archiveHeader}>
                        <View style={styles.archiveIcon}>
                            <Ionicons name="archive" size={20} color="#6B7280" />
                        </View>
                        <View style={styles.archiveContent}>
                            <Text style={styles.archiveTitle}>Archive Old Decisions</Text>
                            <Text style={styles.archiveDescription}>Move decisions older than 6 months to archive</Text>
                        </View>
                        <TouchableOpacity style={styles.archiveButton}>
                            <Text style={styles.archiveButtonText}>Archive</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    statsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3B82F6',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    filterSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    filterButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    activeFilter: {
        backgroundColor: '#3B82F6',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    activeFilterText: {
        color: 'white',
    },
    decisionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    decisionsList: {
        gap: 12,
    },
    decisionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    decisionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    decisionContent: {
        flex: 1,
    },
    decisionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    decisionDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    decisionResult: {
        fontSize: 14,
        fontWeight: '500',
    },
    decisionDate: {
        fontSize: 14,
        color: '#6B7280',
    },
    decisionActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    winnerBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    monthlySection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    monthlyStats: {
        gap: 16,
    },
    monthlyStatItem: {
        marginBottom: 8,
    },
    monthlyStatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    monthlyStatTitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    monthlyStatValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    monthlyStatBar: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
    },
    monthlyStatBarFill: {
        height: 6,
        borderRadius: 3,
    },
    archiveSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    archiveHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    archiveIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    archiveContent: {
        flex: 1,
    },
    archiveTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 2,
    },
    archiveDescription: {
        fontSize: 12,
        color: '#6B7280',
    },
    archiveButton: {
        backgroundColor: '#6B7280',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    archiveButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'white',
    },
    bottomSpacing: {
        height: 80,
    },
});

export default HistoryScreen;
