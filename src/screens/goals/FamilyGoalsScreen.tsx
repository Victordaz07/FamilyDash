import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGoals } from '../../hooks/useGoals';
import { Goal } from '../../types/goals';
import GoalFilterBar from '../../components/goals/GoalFilterBar';
import EnhancedGoalCard from '../../components/goals/EnhancedGoalCard';
import EmptyState from '../../components/common/EmptyState';

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

  // TODO: Load goals from Firebase when ready
  useEffect(() => {
    // Mock data loading simulation
    // In real implementation, this would call Firebase
  }, []);

  const handleGoalPress = (goal: Goal) => {
    navigation.navigate('GoalDetails', { goalId: goal.id });
  };

  const handleCreateGoal = () => {
    navigation.navigate('AddGoal');
  };

  const renderGoalCard = ({ item }: { item: Goal }) => (
    <EnhancedGoalCard
      goal={item}
      onPress={() => handleGoalPress(item)}
    />
  );

  const renderStatsRow = () => {
    const statsData = [
      { key: 'total', label: 'Total', value: stats.total, color: '#7B6CF6' },
      { key: 'active', label: 'Active', value: stats.active, color: '#10B981' },
      { key: 'completed', label: 'Completed', value: stats.completed, color: '#059669' },
      { key: 'overdue', label: 'Overdue', value: stats.overdue, color: '#EF4444' },
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mt-4"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {statsData.map((stat) => (
          <TouchableOpacity
            key={stat.key}
            onPress={() => {
              if (stat.key === 'total') {
                clearFilters();
              } else {
                quickFilter(stat.key as 'active' | 'completed' | 'overdue');
              }
            }}
            className="bg-white/15 rounded-2xl px-4 py-3 mr-3"
            style={{ minWidth: 80 }}
          >
            <Text className="text-white/90 text-sm font-medium">{stat.label}</Text>
            <Text className="text-white text-2xl font-bold mt-1">{stat.value}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderContent = () => {
    if (filteredGoals.length === 0) {
      const emptyMessage = search || statusFilter !== 'all' || categoryFilter !== 'all'
        ? 'No goals match your filters'
        : 'No goals yet';
      
      const emptySubtitle = search || statusFilter !== 'all' || categoryFilter !== 'all'
        ? 'Try adjusting your filters'
        : 'Create your first family goal';

      return (
        <EmptyState
          icon="🎯"
          title={emptyMessage}
          subtitle={emptySubtitle}
          actionLabel="Create Goal"
          onAction={handleCreateGoal}
        />
      );
    }

    if (view === 'list') {
      // TODO: Implement list view
      return (
        <FlatList
          data={filteredGoals}
          keyExtractor={(goal) => goal.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={renderGoalCard}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    return (
      <FlatList
        data={filteredGoals}
        keyExtractor={(goal) => goal.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={renderGoalCard}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient 
        colors={['#7B6CF6', '#E96AC0']} 
        className="px-5 pt-12 pb-6"
      >
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-white text-2xl font-bold">Family Goals</Text>
            <Text className="text-white/90 mt-1 text-base">Achieve your targets, together 💖</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('GoalInfo')}
            className="bg-white/20 rounded-full p-2"
          >
            <Text className="text-white text-lg">ℹ️</Text>
          </TouchableOpacity>
        </View>
        
        {renderStatsRow()}
      </LinearGradient>

      {/* Filter Bar */}
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

      {/* Goals List */}
      {renderContent()}

      {/* Sticky CTA */}
      <View className="px-5 pb-6 bg-white border-t border-gray-100">
        <TouchableOpacity 
          onPress={handleCreateGoal} 
          className="rounded-2xl py-4 items-center" 
          style={{ backgroundColor: '#7B6CF6' }}
        >
          <Text className="text-white font-semibold text-base">
            Create New Family Goal
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
