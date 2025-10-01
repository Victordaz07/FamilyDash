import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../modules/tasks/TasksScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import GoalsScreen from '../modules/goals/screens/GoalsScreen';
import SafeRoomScreen from '../modules/safeRoom/screens/SafeRoomScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Import Calendar module screens
import CalendarHubScreen from '../modules/calendar/screens/CalendarHubScreen';
import ActivityDetailScreen from '../modules/calendar/screens/ActivityDetailScreen';
import VotingScreen from '../modules/calendar/screens/VotingScreen';

// Import TabBar component
import TabBar from '../components/navigation/TabBar';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigators for each tab
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
  </Stack.Navigator>
);

const TasksStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TasksMain" component={TasksScreen} />
    <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
  </Stack.Navigator>
);

const CalendarStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CalendarMain" component={CalendarHubScreen} />
    <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen as any} />
    <Stack.Screen name="Voting" component={VotingScreen as any} />
  </Stack.Navigator>
);

const GoalsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GoalsMain" component={GoalsScreen} />
  </Stack.Navigator>
);

const SafeRoomStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SafeRoomMain" component={SafeRoomScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

// Custom Tab Bar Component
const CustomTabBar = (props: any) => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    const { navigation } = props;
    
    switch (tabName) {
      case 'Dashboard':
        navigation.navigate('Dashboard');
        break;
      case 'Tasks':
        navigation.navigate('Tasks');
        break;
      case 'Calendar':
        navigation.navigate('Calendar');
        break;
      case 'Goals':
        navigation.navigate('Goals');
        break;
      case 'SafeRoom':
        navigation.navigate('SafeRoom');
        break;
      case 'Profile':
        navigation.navigate('Profile');
        break;
    }
  };

  return (
    <TabBar 
      activeTab={activeTab} 
      onTabPress={handleTabPress}
      navigation={props.navigation}
    />
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardStack}
          options={{ tabBarLabel: 'Dashboard' }}
        />
        <Tab.Screen 
          name="Tasks" 
          component={TasksStack}
          options={{ tabBarLabel: 'Tareas' }}
        />
        <Tab.Screen 
          name="Calendar" 
          component={CalendarStack}
          options={{ tabBarLabel: 'Calendario' }}
        />
        <Tab.Screen 
          name="Goals" 
          component={GoalsStack}
          options={{ tabBarLabel: 'Metas' }}
        />
        <Tab.Screen 
          name="SafeRoom" 
          component={SafeRoomStack}
          options={{ tabBarLabel: 'SafeRoom' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileStack}
          options={{ tabBarLabel: 'Perfil' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
