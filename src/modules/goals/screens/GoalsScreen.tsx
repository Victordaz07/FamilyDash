import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useGoals } from '../hooks/useGoals';
import GoalCard from '../components/GoalCard';

interface GoalsScreenProps {
  navigation: any;
}

const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation }) => {
  const {
    goals,
    categories,
    selectedCategory,
    setSelectedCategory,
    getGoalsByCategory,
    getActiveGoals,
    getCompletedGoals,
    getGoalsStats,
    getFamilyLeaderboard,
    getUpcomingMilestones,
    getRecentAchievements,
    deleteGoal
  } = useGoals();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCreateGoal = () => {
    Alert.alert('Create Goal', 'Create new goal functionality would go here');
  };

  const handleGoalPress = (goalId: string) => {
    navigation.navigate('GoalDetails', { goalId });
  };

  const handleEditGoal = (goalId: string) => {
    Alert.alert('Edit Goal', `Edit goal ${goalId} functionality would go here`);
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteGoal(goalId);
            Alert.alert('Success', 'Goal deleted successfully');
          }
        }
      ]
    );
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const getFilteredGoals = () => {
    let filteredGoals = goals;

    if (selectedCategory) {
      filteredGoals = getGoalsByCategory(selectedCategory);
    }

    switch (activeTab) {
      case 'active':
        return filteredGoals.filter(goal => goal.status === 'in_progress');
      case 'completed':
        return filteredGoals.filter(goal => goal.status === 'completed');
      default:
        return filteredGoals;
    }
  };

  const stats = getGoalsStats();
  const leaderboard = getFamilyLeaderboard();
  const upcomingMilestones = getUpcomingMilestones();
  const recentAchievements = getRecentAchievements();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#F59E0B', '#D97706']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Family Goals</Text>
            <Text style={styles.headerSubtitle}>Achieve together</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton} onPress={handleCreateGoal}>
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Overview */}
      <View style={styles.statsSection}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Goals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.inProgress}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.averageProgress}%</Text>
              <Text style={styles.statLabel}>Avg Progress</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  { backgroundColor: selectedCategory === category.id ? category.color : '#F3F4F6' }
                ]}
                onPress={() => handleCategoryPress(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={20}
                  color={selectedCategory === category.id ? 'white' : category.color}
                />
                <Text style={[
                  styles.categoryText,
                  { color: selectedCategory === category.id ? 'white' : '#374151' }
                ]}>
                  {category.name}
                </Text>
                <View style={[
                  styles.categoryCount,
                  { backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : '#E5E7EB' }
                ]}>
                  <Text style={[
                    styles.categoryCountText,
                    { color: selectedCategory === category.id ? 'white' : '#6B7280' }
                  ]}>
                    {category.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsSection}>
        <View style={styles.card}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'all' && styles.activeTab]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                All Goals
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'active' && styles.activeTab]}
              onPress={() => setActiveTab('active')}
            >
              <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
              onPress={() => setActiveTab('completed')}
            >
              <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
                Completed
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Goals List */}
      <View style={styles.goalsSection}>
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeTab === 'all' ? 'All Goals' :
                activeTab === 'active' ? 'Active Goals' : 'Completed Goals'}
            </Text>
            <Text style={styles.goalsCount}>
              {getFilteredGoals().length} goal{getFilteredGoals().length !== 1 ? 's' : ''}
            </Text>
          </View>

          {getFilteredGoals().length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flag-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No goals found</Text>
              <Text style={styles.emptyStateSubtext}>
                {activeTab === 'all' ? 'Create your first family goal!' :
                  activeTab === 'active' ? 'No active goals at the moment' : 'No completed goals yet'}
              </Text>
            </View>
          ) : (
            <View style={styles.goalsList}>
              {getFilteredGoals().map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onPress={() => handleGoalPress(goal.id)}
                  onEdit={() => handleEditGoal(goal.id)}
                  onDelete={() => handleDeleteGoal(goal.id)}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Family Leaderboard */}
      <View style={styles.leaderboardSection}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Family Leaderboard</Text>
          <View style={styles.leaderboardList}>
            {leaderboard.map((member, index) => (
              <View key={member.id} style={styles.leaderboardItem}>
                <View style={styles.leaderboardRank}>
                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                </View>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitial}>
                    {member.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberLevel}>Level {member.level}</Text>
                </View>
                <View style={styles.memberPoints}>
                  <Text style={styles.pointsText}>{member.points}</Text>
                  <Text style={styles.pointsLabel}>points</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Upcoming Milestones */}
      <View style={styles.milestonesSection}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Upcoming Milestones</Text>
          {upcomingMilestones.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={32} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No upcoming milestones</Text>
            </View>
          ) : (
            <View style={styles.milestonesList}>
              {upcomingMilestones.map(milestone => (
                <View key={milestone.id} style={styles.milestoneItem}>
                  <View style={styles.milestoneIcon}>
                    <Ionicons name="flag" size={16} color="#3B82F6" />
                  </View>
                  <View style={styles.milestoneContent}>
                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                    <Text style={styles.milestoneGoal}>{milestone.goalTitle}</Text>
                  </View>
                  <Text style={styles.milestoneDate}>
                    {new Date(milestone.targetDate).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Bottom spacing */}
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
    paddingTop: 50,
    paddingBottom: 32,
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
    color: '#F59E0B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoriesSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  categoriesScroll: {
    marginTop: -16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryCount: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryCountText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#374151',
    fontWeight: '600',
  },
  goalsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalsCount: {
    fontSize: 14,
    color: '#6B7280',
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
  goalsList: {
    gap: 16,
  },
  leaderboardSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  leaderboardRank: {
    width: 32,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  memberLevel: {
    fontSize: 12,
    color: '#6B7280',
  },
  memberPoints: {
    alignItems: 'flex-end',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  milestonesSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  milestonesList: {
    gap: 12,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  milestoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  milestoneGoal: {
    fontSize: 12,
    color: '#6B7280',
  },
  milestoneDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bottomSpacing: {
    height: 80,
  },
});

export default GoalsScreen;
