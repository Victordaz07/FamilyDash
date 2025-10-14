import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TaskStatus } from '@/types/taskTypes';
import { theme } from '@/styles/simpleTheme';

interface TaskTabsProps {
  activeTab: TaskStatus | 'all';
  onTabChange: (tab: TaskStatus | 'all') => void;
  counts: {
    all: number;
    pending: number;
    completed: number;
    overdue: number;
  };
}

const TaskTabs: React.FC<TaskTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const tabs = [
    { key: 'all' as const, label: 'All Tasks', count: counts.all },
    { key: 'pending' as const, label: 'Pending', count: counts.pending },
    { key: 'completed' as const, label: 'Completed', count: counts.completed },
    { key: 'overdue' as const, label: 'Overdue', count: counts.overdue },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive
            ]}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray,
  },
  tabTextActive: {
    color: 'white',
  },
});

export default TaskTabs;
