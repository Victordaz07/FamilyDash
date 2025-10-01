import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/simpleTheme';

const { width: screenWidth } = Dimensions.get('window');

interface TabBarProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
  navigation?: any;
}

interface TabItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string | number;
  badgeColor?: string;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress, navigation }) => {
  const tabs: TabItem[] = [
    {
      name: 'Dashboard',
      label: 'Dashboard',
      icon: 'home',
      badge: 3,
      badgeColor: '#ef4444'
    },
    {
      name: 'Tasks',
      label: 'Tareas',
      icon: 'checkmark-circle',
      badge: 12,
      badgeColor: '#ef4444'
    },
    {
      name: 'Calendar',
      label: 'Calendario',
      icon: 'calendar'
    },
    {
      name: 'SafeRoom',
      label: 'SafeRoom',
      icon: 'shield-checkmark'
    },
    {
      name: 'Profile',
      label: 'Perfil',
      icon: 'person'
    }
  ];

  const handleTabPress = (tabName: string) => {
    if (tabName === 'Profile') {
      // Navegar a configuración dentro del perfil
      navigation?.navigate('Profile', { screen: 'Settings' });
    } else {
      onTabPress(tabName);
    }
  };

  const renderTab = (tab: TabItem) => {
    const isActive = activeTab === tab.name;
    const iconColor = isActive ? theme.colors.primary : theme.colors.textSecondary;
    const textColor = isActive ? theme.colors.primary : theme.colors.textSecondary;

    return (
      <TouchableOpacity
        key={tab.name}
        style={styles.tabItem}
        onPress={() => handleTabPress(tab.name)}
        activeOpacity={0.7}
      >
        <View style={styles.tabIconContainer}>
          <Ionicons 
            name={tab.icon} 
            size={24} 
            color={iconColor} 
          />
          {tab.badge && (
            <View style={[
              styles.badge, 
              { backgroundColor: tab.badgeColor || '#ef4444' }
            ]}>
              <Text style={styles.badgeText}>
                {tab.badge}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.tabLabel, { color: textColor }]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tabBar}>
      <View style={styles.tabBarContent}>
        {tabs.map(renderTab)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 8,
    paddingTop: 8,
    ...theme.shadows.md,
  },
  tabBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 60,
  },
  tabIconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TabBar;
