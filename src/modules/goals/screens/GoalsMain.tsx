import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGoalsStore } from '../store/goalsStore';
import GoalCard from '../components/GoalCard';
import AddGoalModal from '../components/AddGoalModal';
import { Goal, GoalCategory } from '../types/goalTypes';
import { goalCategories } from '../mock/goalsData';
import { theme } from '../../../styles/simpleTheme';

interface GoalsMainProps {
    navigation: any;
}

const GoalsMain: React.FC<GoalsMainProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const {
        goals,
        isInitialized,
        initializeWithMockData,
        getActiveGoals,
        getCompletedGoals,
        getSpiritualAndFamilyGoals,
        getStats,
        completeMilestone,
    } = useGoalsStore();

    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
    const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'all'>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const stats = getStats();
    const activeGoals = getActiveGoals();
    const completedGoals = getCompletedGoals();
    const spiritualAndFamilyGoals = getSpiritualAndFamilyGoals();

    // Initialize store with mock data
    useEffect(() => {
        if (!isInitialized) {
            initializeWithMockData();
        }
    }, [isInitialized, initializeWithMockData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const handleGoalPress = useCallback((goalId: string) => {
        navigation.navigate('GoalDetails', { goalId });
    }, [navigation]);

    const handleCompleteMilestone = useCallback((goalId: string) => {
        const goal = goals.find(g => g.id === goalId);
        if (goal && goal.completedMilestones < goal.milestones) {
            completeMilestone(goalId, goal.completedMilestones);
        }
    }, [goals, completeMilestone]);

    const getFilteredGoals = () => {
        let filtered = goals;

        // Filter by tab
        if (activeTab === 'active') {
            filtered = filtered.filter(g => g.status === 'active');
        } else if (activeTab === 'completed') {
            filtered = filtered.filter(g => g.status === 'completed');
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(g => g.category === selectedCategory);
        }

        return filtered;
    };

    const StatCard = ({ title, value, icon, color, subtitle }: any) => (
        <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
    );

    const CategoryChip = ({ category, isSelected, onPress }: any) => {
        const config = goalCategories.find(c => c.id === category.id);
        return (
            <TouchableOpacity
                style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                    { backgroundColor: isSelected ? config?.color : theme.colors.background }
                ]}
                onPress={onPress}
            >
                <Text style={styles.categoryEmoji}>{config?.emoji}</Text>
                <Text style={[
                    styles.categoryText,
                    { color: isSelected ? 'white' : theme.colors.text }
                ]}>
                    {category.name}
                </Text>
            </TouchableOpacity>
        );
    };

    const filteredGoals = getFilteredGoals();

    return (
        <View style={styles.container}>
            {/* Beautiful Header */}
            <LinearGradient
                colors={['#F59E0B', '#FBBF24', '#F59E0B']}
                style={[styles.header, { paddingTop: insets.top + 20 }]}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>Family Goals</Text>
                        <Text style={styles.headerSubtitle}>Achieve Together ✨</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowAddModal(true)}
                    >
                        <LinearGradient
                            colors={['white', '#FEF3C7']}
                            style={styles.addButtonGradient}
                        >
                            <Ionicons name="add" size={24} color="#F59E0B" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Overview Stats */}
            <View style={styles.statsContainer}>
                <StatCard
                    title="Total Goals"
                    value={stats.totalGoals}
                    icon="bullseye"
                    color="#3B82F6"
                />
                <StatCard
                    title="Active Now"
                    value={stats.activeGoals}
                    icon="rocket"
                    color="#10B981"
                />
                <StatCard
                    title="Completed"
                    value={stats.completedGoals}
                    icon="trophy"
                    color="#7C3AED"
                    subtitle="🎉"
                />
                <StatCard
                    title="Avg Progress"
                    value={`${stats.averageProgress}%`}
                    icon="trending-up"
                    color="#F59E0B"
                />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'all' && styles.tabActive]}
                        onPress={() => setActiveTab('all')}
                    >
                        <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                            All Goals
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'active' && styles.tabActive]}
                        onPress={() => setActiveTab('active')}
                    >
                        <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
                            Active
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
                        onPress={() => setActiveTab('completed')}
                    >
                        <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
                            Completed
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Category Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}
            >
                <CategoryChip
                    category={{ id: 'all', name: 'All' }}
                    isSelected={selectedCategory === 'all'}
                    onPress={() => setSelectedCategory('all')}
                />
                {goalCategories.map((category) => (
                    <CategoryChip
                        key={category.id}
                        category={category}
                        isSelected={selectedCategory === category.id}
                        onPress={() => setSelectedCategory(category.id as GoalCategory)}
                    />
                ))}
            </ScrollView>

            {/* Spiritual & Family Highlight */}
            {spiritualAndFamilyGoals.length > 0 && (
                <View style={styles.highlightContainer}>
                    <LinearGradient
                        colors={['#7C3AED', '#A855F7', '#FBBF24']}
                        style={styles.highlightCard}
                    >
                        <View style={styles.highlightContent}>
                            <Text style={styles.highlightTitle}>🌟 Spiritual & Family Goals</Text>
                            <Text style={styles.highlightSubtitle}>Building eternal bonds together</Text>
                            <View style={styles.highlightStats}>
                                <Text style={styles.highlightStatText}>
                                    <Text style={styles.highlightStatBold}>{spiritualAndFamilyGoals.length} Active</Text>
                                    <Text style={styles.highlightStatLight}> • 3 This Week</Text>
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.highlightButton}>
                            <Text style={styles.highlightButtonText}>View All</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            )}

            {/* Goals List */}
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.goalsHeader}>
                    <Text style={styles.goalsTitle}>
                        {activeTab === 'all' ? 'All Goals' :
                            activeTab === 'active' ? 'Active Goals' : 'Completed Goals'}
                    </Text>
                    <View style={styles.goalsBadge}>
                        <Text style={styles.goalsBadgeText}>{filteredGoals.length}</Text>
                    </View>
                </View>

                {filteredGoals.length === 0 ? (
                    <View style={styles.emptyState}>
                        <LinearGradient
                            colors={['#F59E0B', '#FBBF24']}
                            style={styles.emptyIconContainer}
                        >
                            <Ionicons name="trophy" size={60} color="white" />
                        </LinearGradient>
                        <Text style={styles.emptyTitle}>No Goals Found</Text>
                        <Text style={styles.emptySubtitle}>
                            {selectedCategory === 'all'
                                ? 'Create your first family goal to get started!'
                                : `No ${selectedCategory} goals found. Try a different category or create a new goal.`
                            }
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => setShowAddModal(true)}
                        >
                            <LinearGradient
                                colors={['#F59E0B', '#FBBF24']}
                                style={styles.emptyButtonGradient}
                            >
                                <Ionicons name="add" size={20} color="white" />
                                <Text style={styles.emptyButtonText}>Create New Goal</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    filteredGoals.map((goal) => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            onPress={handleGoalPress}
                            onCompleteMilestone={handleCompleteMilestone}
                        />
                    ))
                )}
            </ScrollView>

            {/* Add Goal Modal */}
            <AddGoalModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={(goalData) => {
                    // Handle goal creation
                    setShowAddModal(false);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEF3C7',
    },
    header: {
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    addButtonGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 12,
        marginTop: -20,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
        color: theme.colors.gray,
        fontWeight: '600',
        textAlign: 'center',
    },
    statSubtitle: {
        fontSize: 10,
        color: theme.colors.gray,
        marginTop: 2,
        textAlign: 'center',
    },
    tabsContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: theme.colors.background,
        borderRadius: 16,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        color: theme.colors.gray,
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#F59E0B',
        fontWeight: '600',
    },
    categoriesContainer: {
        marginBottom: 16,
    },
    categoriesContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    categoryChipSelected: {
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    highlightContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    highlightCard: {
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    highlightContent: {
        flex: 1,
    },
    highlightTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    highlightSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 12,
    },
    highlightStats: {
        flexDirection: 'row',
    },
    highlightStatText: {
        fontSize: 14,
        color: 'white',
    },
    highlightStatBold: {
        fontWeight: 'bold',
    },
    highlightStatLight: {
        opacity: 0.8,
    },
    highlightButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    highlightButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    goalsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    goalsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        flex: 1,
    },
    goalsBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    goalsBadgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F59E0B',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: theme.colors.gray,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    emptyButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    emptyButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    emptyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
});

export default GoalsMain;
