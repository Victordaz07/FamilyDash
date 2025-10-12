import React from 'react';
import { View, Text } from 'react-native';

interface GoalProgressBarProps {
  completed: number;
  total: number;
  color?: string;
  showPercentage?: boolean;
}

export default function GoalProgressBar({ 
  completed, 
  total, 
  color = '#7B6CF6',
  showPercentage = true 
}: GoalProgressBarProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  return (
    <View className="w-full">
      <View className="h-2 rounded-full bg-gray-200">
        <View 
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color 
          }} 
          className="h-2 rounded-full" 
        />
      </View>
      {showPercentage && (
        <Text className="mt-1 text-xs text-gray-600">
          {percentage}% • {completed}/{total} milestones
        </Text>
      )}
    </View>
  );
}
