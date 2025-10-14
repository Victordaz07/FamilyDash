import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  icon = '✨', 
  title, 
  subtitle, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-10">
      <Text className="text-5xl mb-4">{icon}</Text>
      <Text className="text-lg font-semibold text-center text-gray-900">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-center text-gray-600 mt-1 text-base">
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity 
          onPress={onAction} 
          className="mt-6 rounded-2xl px-5 py-3" 
          style={{ backgroundColor: '#3B82F6' }}
        >
          <Text className="text-white font-medium text-base">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}




