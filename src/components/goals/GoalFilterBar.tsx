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
    <View style={{ paddingVertical: 12, gap: 12 }}>
      {/* Search Bar */}
      <TextInput
        placeholder="Search goals…"
        style={{
          backgroundColor: '#F1F5F9',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16,
          color: '#1E293B',
        }}
        value={search}
        onChangeText={onSearchChange}
        placeholderTextColor="#64748B"
      />

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={{ marginHorizontal: -20, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => onCategoryFilterChange(category)}
            style={{
              marginRight: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor: categoryFilter === category ? '#3B82F6' : '#F1F5F9',
            }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: categoryFilter === category ? '#FFFFFF' : '#64748B',
            }}>
              {category === 'all' ? 'All' : categoryLabels[category]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={{ marginHorizontal: -20, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {statuses.map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => onStatusFilterChange(status)}
            style={{
              marginRight: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor: statusFilter === status ? '#10B981' : '#F1F5F9',
            }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: statusFilter === status ? '#FFFFFF' : '#64748B',
            }}>
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort and View Options */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => onSortChange(option.key)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: sortBy === option.key ? '#6366F1' : '#F1F5F9',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: sortBy === option.key ? '#FFFFFF' : '#64748B',
              }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          onPress={onViewToggle}
          style={{
            backgroundColor: '#F1F5F9',
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: '#64748B',
          }}>
            {view === 'cards' ? '📱' : '📋'} {view === 'cards' ? 'Cards' : 'List'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
