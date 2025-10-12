import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={[
              styles.tab,
              activeTab === tab.key ? styles.activeTab : styles.inactiveTab
            ]}
          >
            <Text style={[
              styles.tabIcon,
              activeTab === tab.key ? styles.activeTabText : styles.inactiveTabText
            ]}>
              {tab.icon}
            </Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key ? styles.activeTabText : styles.inactiveTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabsRow: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  inactiveTab: {
    borderBottomColor: 'transparent',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  inactiveTabText: {
    color: '#9CA3AF',
  },
});
