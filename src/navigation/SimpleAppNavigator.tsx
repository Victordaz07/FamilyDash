import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../modules/tasks/TasksScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import GoalsScreen from '../modules/goals/screens/GoalsScreen';
import SafeRoomScreen from '../modules/safeRoom/screens/SafeRoomScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VotingScreen from '../modules/voting/screens/VotingScreen';
import ButtonTestScreen from '../screens/ButtonTestScreen';

// Import Calendar module screens
import CalendarHubScreen from '../modules/calendar/screens/CalendarHubScreen';
import ActivityDetailScreen from '../modules/calendar/screens/ActivityDetailScreen';
import CalendarVotingScreen from '../modules/calendar/screens/VotingScreen';

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
    <Stack.Screen name="CalendarVoting" component={CalendarVotingScreen as any} />
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

const VotingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="VotingMain" component={VotingScreen} />
  </Stack.Navigator>
);

const TestStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TestMain" component={ButtonTestScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Tasks') {
              iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
            } else if (route.name === 'Calendar') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Goals') {
              iconName = focused ? 'trophy' : 'trophy-outline';
            } else if (route.name === 'Voting') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Test') {
              iconName = focused ? 'bug' : 'bug-outline';
            } else if (route.name === 'SafeRoom') {
              iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            paddingBottom: Math.max(insets.bottom, 20),
            paddingTop: 8,
            height: 80 + Math.max(insets.bottom, 0),
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
        })}
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
          name="Voting" 
          component={VotingStack}
          options={{ tabBarLabel: 'Votaciones' }}
        />
        <Tab.Screen 
          name="Test" 
          component={TestStack}
          options={{ tabBarLabel: 'Test' }}
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
