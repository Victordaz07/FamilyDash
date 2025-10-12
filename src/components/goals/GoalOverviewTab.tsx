import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Goal } from '../../types/goals';
import { categoryColors, categoryLabels, statusColors, statusLabels } from '../../theme/goalsColors';
import GoalProgressBar from './GoalProgressBar';

interface GoalOverviewTabProps {
  goal: Goal;
  onEditGoal: () => void;
  onToggleStatus: () => void;
}

export default function GoalOverviewTab({ goal, onEditGoal, onToggleStatus }: GoalOverviewTabProps) {
  const categoryColor = categoryColors[goal.category];
  const statusColor = statusColors[goal.status];
  const isOverdue = goal.status === 'active' && 
    goal.deadlineAt && 
    goal.deadlineAt < Date.now();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilDeadline = () => {
    if (!goal.deadlineAt) return null;
    const now = Date.now();
    const diff = goal.deadlineAt - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysLeft = getDaysUntilDeadline();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 space-y-6">
        {/* Header Card */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-2">
                <View 
                  style={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: 6, 
                    backgroundColor: categoryColor 
                  }} 
                />
                <Text className="text-sm text-gray-500">{categoryLabels[goal.category]}</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-2">{goal.title}</Text>
              {goal.description && (
                <Text className="text-gray-700 text-base leading-6">{goal.description}</Text>
              )}
            </View>
          </View>

          {/* Status and Actions */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View 
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${statusColor}20` }}
              >
                <Text 
                  className="text-sm font-medium"
                  style={{ color: statusColor }}
                >
                  {statusLabels[goal.status]}
                </Text>
              </View>
              {isOverdue && (
                <View className="bg-red-100 px-3 py-1 rounded-full">
                  <Text className="text-red-600 text-sm font-medium">Overdue</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={onEditGoal}
              className="bg-gray-100 px-4 py-2 rounded-xl"
            >
              <Text className="text-gray-700 font-medium">Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Card */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">Progress</Text>
          <GoalProgressBar 
            completed={goal.milestonesDone}
            total={goal.milestonesCount}
            color={categoryColor}
            showPercentage={true}
          />
          <View className="mt-4 flex-row justify-between">
            <View>
              <Text className="text-sm text-gray-500">Milestones</Text>
              <Text className="text-2xl font-bold text-gray-900">
                {goal.milestonesDone}/{goal.milestonesCount}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-gray-500">Reflections</Text>
              <Text className="text-2xl font-bold text-gray-900">
                {goal.reflectionCount || 0}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-gray-500">Visibility</Text>
              <Text className="text-lg font-semibold text-gray-900">
                {goal.visibility === 'family' ? '👨‍👩‍👧‍👦' : '🔒'}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline Card */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">Timeline</Text>
          <View className="space-y-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600">Created</Text>
              <Text className="font-medium">{formatDate(goal.createdAt)}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600">Last Updated</Text>
              <Text className="font-medium">{formatDate(goal.updatedAt)}</Text>
            </View>
            {goal.deadlineAt && (
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600">Deadline</Text>
                <View className="items-end">
                  <Text className="font-medium">{formatDate(goal.deadlineAt)}</Text>
                  {daysLeft !== null && (
                    <Text className={`text-sm ${
                      daysLeft < 0 ? 'text-red-600' : 
                      daysLeft <= 3 ? 'text-orange-600' : 
                      'text-green-600'
                    }`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` :
                       daysLeft === 0 ? 'Due today' :
                       `${daysLeft} days left`}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onToggleStatus}
              className={`flex-1 py-3 rounded-xl ${
                goal.status === 'active' ? 'bg-orange-100' : 'bg-green-100'
              }`}
            >
              <Text className={`text-center font-medium ${
                goal.status === 'active' ? 'text-orange-700' : 'text-green-700'
              }`}>
                {goal.status === 'active' ? '⏸️ Pause' : '▶️ Resume'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-3 rounded-xl bg-purple-100">
              <Text className="text-center font-medium text-purple-700">
                💭 Add Reflection
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-3 rounded-xl bg-blue-100">
              <Text className="text-center font-medium text-blue-700">
                ✅ Add Milestone
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
