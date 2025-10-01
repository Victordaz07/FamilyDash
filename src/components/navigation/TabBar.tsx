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
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress, navigation }) => {
  const tabs: TabItem[] = [
    {
      name: 'Dashboard',
      label: 'Dashboard',
      icon: 'home'
    },
    {
      name: 'Tasks',
      label: 'Tareas',
      icon: 'checkmark-circle'
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
        <Ionicons 
          name={tab.icon} 
          size={24} 
          color={iconColor} 
        />
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
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default TabBar;
