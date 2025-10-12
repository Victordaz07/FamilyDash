import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Goal } from '../../types/goals';
import { categoryColors, categoryLabels, statusColors, statusLabels } from '../../theme/goalsColors';
import GoalProgressBar from './GoalProgressBar';

interface EnhancedGoalCardProps {
  goal: Goal;
  onPress: () => void;
}

export default function EnhancedGoalCard({ goal, onPress }: EnhancedGoalCardProps) {
  const categoryColor = categoryColors[goal.category];
  const statusColor = statusColors[goal.status];
  const isOverdue = goal.status === 'active' && 
    goal.deadlineAt && 
    goal.deadlineAt < Date.now();

  return (
    <TouchableOpacity 
      onPress={onPress} 
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2 flex-1">
          <View 
            style={{ 
              width: 10, 
              height: 10, 
              borderRadius: 6, 
              backgroundColor: categoryColor 
            }} 
          />
          <Text className="font-semibold text-base text-gray-900 flex-1" numberOfLines={1}>
            {goal.title}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {isOverdue && (
            <View className="bg-red-100 px-2 py-1 rounded-full">
              <Text className="text-red-600 text-xs font-medium">Overdue</Text>
            </View>
          )}
          <View 
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: `${statusColor}20` }}
          >
            <Text 
              className="text-xs font-medium"
              style={{ color: statusColor }}
            >
              {statusLabels[goal.status]}
            </Text>
          </View>
        </View>
      </View>

      {/* Category */}
      <Text className="text-xs text-gray-500 mb-3">
        {categoryLabels[goal.category]}
      </Text>

      {/* Description */}
      {goal.description && (
        <Text className="text-sm text-gray-700 mb-3" numberOfLines={2}>
          {goal.description}
        </Text>
      )}

      {/* Progress */}
      <GoalProgressBar 
        completed={goal.milestonesDone}
        total={goal.milestonesCount}
        color={categoryColor}
      />

      {/* Footer */}
      <View className="flex-row items-center justify-between mt-3">
        <Text className="text-xs text-gray-500">
          {goal.visibility === 'family' ? '👨‍👩‍👧‍👦 Family' : '🔒 Private'}
        </Text>
        {goal.reflectionCount && goal.reflectionCount > 0 && (
          <Text className="text-xs text-gray-500">
            💭 {goal.reflectionCount} reflections
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
