import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { categoryLabels, GoalCategory } from '../../theme/goalsColors';
import { GoalStatus } from '../../types/goals';

interface GoalFilterBarProps {
  search: string;
  statusFilter: GoalStatus | 'all';
  categoryFilter: GoalCategory | 'all';
  sortBy: 'recent' | 'deadline' | 'progress' | 'alpha';
  view: 'list' | 'cards';
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: GoalStatus | 'all') => void;
  onCategoryFilterChange: (category: GoalCategory | 'all') => void;
  onSortChange: (sortBy: 'recent' | 'deadline' | 'progress' | 'alpha') => void;
  onViewToggle: () => void;
}

export default function GoalFilterBar({
  search,
  statusFilter,
  categoryFilter,
  sortBy,
  view,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onSortChange,
  onViewToggle,
}: GoalFilterBarProps) {
  const statuses: (GoalStatus | 'all')[] = ['all', 'active', 'completed', 'paused', 'cancelled'];
  const categories: (GoalCategory | 'all')[] = ['all', ...Object.keys(categoryLabels) as GoalCategory[]];
  const sortOptions: Array<{ key: typeof sortBy; label: string }> = [
    { key: 'recent', label: 'Recent' },
    { key: 'deadline', label: 'Deadline' },
    { key: 'progress', label: 'Progress' },
    { key: 'alpha', label: 'A-Z' },
  ];

  return (
    <View className="px-4 py-3 gap-3 bg-white">
      {/* Search Bar */}
      <TextInput
        placeholder="Search goals…"
        className="bg-gray-100 rounded-2xl px-4 py-3 text-base"
        value={search}
        onChangeText={onSearchChange}
        placeholderTextColor="#9CA3AF"
      />

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="-mx-4 px-4"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => onCategoryFilterChange(category)}
            className={`mr-2 px-3 py-2 rounded-2xl ${
              categoryFilter === category ? 'bg-purple-100' : 'bg-gray-100'
            }`}
          >
            <Text className={`text-sm font-medium ${
              categoryFilter === category ? 'text-purple-700' : 'text-gray-700'
            }`}>
              {category === 'all' ? 'All' : categoryLabels[category]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="-mx-4 px-4"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {statuses.map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => onStatusFilterChange(status)}
            className={`mr-2 px-3 py-2 rounded-2xl ${
              statusFilter === status ? 'bg-purple-100' : 'bg-gray-100'
            }`}
          >
            <Text className={`text-sm font-medium ${
              statusFilter === status ? 'text-purple-700' : 'text-gray-700'
            }`}>
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort and View Options */}
      <View className="flex-row items-center justify-between">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => onSortChange(option.key)}
              className={`px-3 py-2 rounded-2xl ${
                sortBy === option.key ? 'bg-purple-100' : 'bg-gray-100'
              }`}
            >
              <Text className={`text-sm font-medium ${
                sortBy === option.key ? 'text-purple-700' : 'text-gray-700'
              }`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          onPress={onViewToggle}
          className="bg-gray-100 rounded-2xl px-3 py-2"
        >
          <Text className="text-gray-700 text-sm font-medium">
            {view === 'cards' ? '📱' : '📋'} {view === 'cards' ? 'Cards' : 'List'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
