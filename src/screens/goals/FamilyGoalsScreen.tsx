import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Dimensions,
  Animated 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useGoals } from '@/hooks/useGoals';
import { Goal } from '@/types/goals';
import GoalFilterBar from '@/components/goals/GoalFilterBar';
import EnhancedGoalCard from '@/components/goals/EnhancedGoalCard';
import EmptyState from '@/components/common/EmptyState';
import { categoryColors, categoryLabels, statusColors } from '../../theme/goalsColors';

const screenWidth = Dimensions.get('window').width;

interface FamilyGoalsScreenProps {
  navigation: any;
}

export default function FamilyGoalsScreen({ navigation }: FamilyGoalsScreenProps) {
  const {
    filteredGoals,
    stats,
    search,
    statusFilter,
    categoryFilter,
    sortBy,
    view,
    setSearch,
    setStatusFilter,
    setCategoryFilter,
    setSortBy,
    toggleView,
    quickFilter,
    clearFilters,
  } = useGoals();

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleGoalPress = (goal: Goal) => {
    navigation.navigate('GoalDetails', { goalId: goal.id });
  };

  const handleCreateGoal = () => {
    navigation.navigate('AddGoal');
  };

  const handleAddReflection = () => {
    navigation.navigate('AddReflection');
  };

  // Get the 2 most recent goals
  const recentGoals = filteredGoals
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 2);

  // Get the 2 most advanced goals (excluding the 2 most recent)
  const advancedGoals = filteredGoals
    .filter(goal => !recentGoals.some(recent => recent.id === goal.id))
    .sort((a, b) => {
      const aProgress = a.milestonesCount > 0 ? (a.milestonesDone / a.milestonesCount) : 0;
      const bProgress = b.milestonesCount > 0 ? (b.milestonesDone / b.milestonesCount) : 0;
      return bProgress - aProgress;
    })
    .slice(0, 2);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <LinearGradient colors={["#3B82F6", "#10B981"]} style={styles.header}>
        <Text style={styles.headerTitle}>Family Goals</Text>
        <Text style={styles.headerSubtitle}>
          Achieve your targets, together 🎯
        </Text>
      </LinearGradient>

      {/* DASHBOARD */}
      <View style={styles.statsRow}>
        <GoalStat icon="flag" label="Total" value={stats.total} color="#3B82F6" onPress={() => clearFilters()} />
        <GoalStat icon="play-circle" label="Active" value={stats.active} color="#10B981" onPress={() => quickFilter('active')} />
        <GoalStat icon="checkmark-circle" label="Completed" value={stats.completed} color="#059669" onPress={() => quickFilter('completed')} />
      </View>

      {/* REFLECTIONS CORNER */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="heart-outline" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Reflection Corner</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Share your thoughts and celebrate achievements together.
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#3B82F6' }]}
          onPress={handleAddReflection}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addText}>Add Reflection</Text>
        </TouchableOpacity>
      </View>

      {/* FILTER BAR */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="funnel-outline" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Filter & Search</Text>
        </View>
        <GoalFilterBar
          search={search}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          sortBy={sortBy}
          view={view}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
          onCategoryFilterChange={setCategoryFilter}
          onSortChange={setSortBy}
          onViewToggle={toggleView}
        />
      </View>

      {/* FEATURED GOALS */}
      {(recentGoals.length > 0 || advancedGoals.length > 0) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Featured Goals</Text>
          </View>
          
          {/* Recent Goals */}
          {recentGoals.length > 0 && (
            <View style={styles.featuredSection}>
              <Text style={styles.featuredSectionTitle}>📅 Recent Goals</Text>
              <View style={styles.featuredGoalsContainer}>
                {recentGoals.map((goal) => (
                  <View key={goal.id} style={styles.featuredGoalCard}>
                    <TouchableOpacity 
                      onPress={() => handleGoalPress(goal)}
                      style={styles.featuredGoalContent}
                    >
                      <View style={styles.featuredGoalHeader}>
                        <View style={styles.featuredGoalTitleRow}>
                          <View style={[styles.featuredCategoryDot, { backgroundColor: categoryColors[goal.category] }]} />
                          <Text style={styles.featuredGoalTitle} numberOfLines={1}>
                            {goal.title}
                          </Text>
                        </View>
                        <View style={[styles.featuredStatusBadge, { backgroundColor: `${statusColors[goal.status]}20` }]}>
                          <Text style={[styles.featuredStatusText, { color: statusColors[goal.status] }]}>
                            {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.featuredGoalCategory}>{categoryLabels[goal.category]}</Text>
                      {goal.description && (
                        <Text style={styles.featuredGoalDescription} numberOfLines={2}>
                          {goal.description}
                        </Text>
                      )}
                      <View style={styles.featuredProgressContainer}>
                        <View style={styles.featuredProgressBar}>
                          <View 
                            style={[
                              styles.featuredProgressFill, 
                              { 
                                width: `${goal.milestonesCount > 0 ? (goal.milestonesDone / goal.milestonesCount) * 100 : 0}%`,
                                backgroundColor: categoryColors[goal.category]
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.featuredProgressText}>
                          {goal.milestonesDone}/{goal.milestonesCount} milestones
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Advanced Goals */}
          {advancedGoals.length > 0 && (
            <View style={styles.featuredSection}>
              <Text style={styles.featuredSectionTitle}>🚀 Most Advanced</Text>
              <View style={styles.featuredGoalsContainer}>
                {advancedGoals.map((goal) => (
                  <View key={goal.id} style={styles.featuredGoalCard}>
                    <TouchableOpacity 
                      onPress={() => handleGoalPress(goal)}
                      style={styles.featuredGoalContent}
                    >
                      <View style={styles.featuredGoalHeader}>
                        <View style={styles.featuredGoalTitleRow}>
                          <View style={[styles.featuredCategoryDot, { backgroundColor: categoryColors[goal.category] }]} />
                          <Text style={styles.featuredGoalTitle} numberOfLines={1}>
                            {goal.title}
                          </Text>
                        </View>
                        <View style={[styles.featuredStatusBadge, { backgroundColor: `${statusColors[goal.status]}20` }]}>
                          <Text style={[styles.featuredStatusText, { color: statusColors[goal.status] }]}>
                            {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.featuredGoalCategory}>{categoryLabels[goal.category]}</Text>
                      {goal.description && (
                        <Text style={styles.featuredGoalDescription} numberOfLines={2}>
                          {goal.description}
                        </Text>
                      )}
                      <View style={styles.featuredProgressContainer}>
                        <View style={styles.featuredProgressBar}>
                          <View 
                            style={[
                              styles.featuredProgressFill, 
                              { 
                                width: `${goal.milestonesCount > 0 ? (goal.milestonesDone / goal.milestonesCount) * 100 : 0}%`,
                                backgroundColor: categoryColors[goal.category]
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.featuredProgressText}>
                          {goal.milestonesDone}/{goal.milestonesCount} milestones
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* GOALS GALLERY */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy-outline" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Goals Gallery</Text>
        </View>
        {filteredGoals.length === 0 ? (
          <EmptyState
            icon="🎯"
            title={search || statusFilter !== 'all' || categoryFilter !== 'all' 
              ? 'No goals match your filters' 
              : 'No goals yet — create your first family target!'}
            subtitle={search || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Start your journey towards achieving dreams together'}
            actionLabel="Create Goal"
            onAction={handleCreateGoal}
          />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.goalsScrollView}
          >
            {filteredGoals.map((goal) => (
              <EnhancedGoalCard 
                key={goal.id} 
                goal={goal} 
                onPress={() => handleGoalPress(goal)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* INSPIRATION GALLERY */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bulb-outline" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Inspiration Gallery</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Visual inspiration for your family goals and dreams.
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#10B981' }]}
          onPress={() => navigation.navigate('InspirationGallery')}
        >
          <Ionicons name="images-outline" size={20} color="#fff" />
          <Text style={styles.addText}>Browse Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* CREATE GOAL CTA */}
      <TouchableOpacity 
        style={styles.createButton}
        onPress={handleCreateGoal}
      >
        <LinearGradient 
          colors={['#3B82F6', '#10B981']} 
          style={styles.createButtonGradient}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.createButtonText}>Create New Family Goal</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

// COMPONENT: Goal Stat
function GoalStat({ icon, label, value, color, onPress }: any) {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: -15,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 80,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  goalsScrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  createButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  featuredSection: {
    marginBottom: 20,
  },
  featuredSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  featuredGoalsContainer: {
    gap: 12,
  },
  featuredGoalCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  featuredGoalContent: {
    padding: 16,
  },
  featuredGoalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  featuredGoalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  featuredCategoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  featuredGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  featuredStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  featuredGoalCategory: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  featuredGoalDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 18,
  },
  featuredProgressContainer: {
    gap: 6,
  },
  featuredProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  featuredProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  featuredProgressText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});




