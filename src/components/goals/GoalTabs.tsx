import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface GoalTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'milestones', label: 'Milestones', icon: '🎯' },
  { key: 'activity', label: 'Activity', icon: '📋' },
  { key: 'reflections', label: 'Reflections', icon: '💭' },
];

export default function GoalTabs({ activeTab, onTabChange }: GoalTabsProps) {
  return (
    <View className="bg-white border-b border-gray-200">
      <View className="flex-row">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            className={`flex-1 py-4 items-center ${
              activeTab === tab.key ? 'border-b-2 border-purple-600' : ''
            }`}
          >
            <Text className={`text-lg mb-1 ${
              activeTab === tab.key ? 'text-purple-600' : 'text-gray-400'
            }`}>
              {tab.icon}
            </Text>
            <Text className={`text-sm font-medium ${
              activeTab === tab.key ? 'text-purple-600' : 'text-gray-500'
            }`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
