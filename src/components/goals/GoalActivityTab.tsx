import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Goal } from '../../types/goals';

interface ActivityItem {
  id: string;
  type: 'milestone_completed' | 'milestone_added' | 'goal_created' | 'goal_updated' | 'reflection_added';
  title: string;
  description: string;
  timestamp: number;
  user?: string;
}

interface GoalActivityTabProps {
  goal: Goal;
}

export default function GoalActivityTab({ goal }: GoalActivityTabProps) {
  // Mock activity data - in real app this would come from Firebase
  const mockActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'goal_created',
      title: 'Goal Created',
      description: `${goal.title} was created`,
      timestamp: goal.createdAt,
      user: 'You'
    },
    {
      id: '2',
      type: 'milestone_added',
      title: 'Milestone Added',
      description: 'First milestone was added to the goal',
      timestamp: goal.createdAt + 86400000, // 1 day later
      user: 'You'
    },
    {
      id: '3',
      type: 'milestone_completed',
      title: 'Milestone Completed',
      description: 'First milestone was marked as completed',
      timestamp: goal.createdAt + 172800000, // 2 days later
      user: 'You'
    },
    {
      id: '4',
      type: 'reflection_added',
      title: 'Reflection Added',
      description: 'A reflection was added to this goal',
      timestamp: goal.createdAt + 259200000, // 3 days later
      user: 'You'
    },
    {
      id: '5',
      type: 'goal_updated',
      title: 'Goal Updated',
      description: 'Goal description was updated',
      timestamp: goal.updatedAt,
      user: 'You'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'goal_created':
        return '🎯';
      case 'milestone_added':
        return '➕';
      case 'milestone_completed':
        return '✅';
      case 'goal_updated':
        return '📝';
      case 'reflection_added':
        return '💭';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'goal_created':
        return '#10B981';
      case 'milestone_added':
        return '#3B82F6';
      case 'milestone_completed':
        return '#059669';
      case 'goal_updated':
        return '#F59E0B';
      case 'reflection_added':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-6">Activity Timeline</Text>
          
          {mockActivity.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-4xl mb-3">📋</Text>
              <Text className="text-gray-500 text-center">No activity yet</Text>
              <Text className="text-gray-400 text-center text-sm mt-1">
                Start working on your goal to see activity here
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {mockActivity.map((activity, index) => (
                <View key={activity.id} className="flex-row gap-4">
                  {/* Timeline line */}
                  <View className="items-center">
                    <View 
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${getActivityColor(activity.type)}20` }}
                    >
                      <Text className="text-lg">{getActivityIcon(activity.type)}</Text>
                    </View>
                    {index < mockActivity.length - 1 && (
                      <View className="w-0.5 h-12 bg-gray-200 mt-2" />
                    )}
                  </View>
                  
                  {/* Activity content */}
                  <View className="flex-1 pb-4">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="font-semibold text-gray-900">{activity.title}</Text>
                      <Text className="text-sm text-gray-500">{formatTimestamp(activity.timestamp)}</Text>
                    </View>
                    <Text className="text-gray-600 text-sm">{activity.description}</Text>
                    {activity.user && (
                      <Text className="text-gray-400 text-xs mt-1">by {activity.user}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
