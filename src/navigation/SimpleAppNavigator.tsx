import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../locales/i18n';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import { FirebaseTest } from '../screens/FirebaseTest';
import TasksScreen from '../modules/tasks/TasksScreen';
import TaskDetails from '../modules/tasks/screens/TaskDetails';
import GoalsScreen from '../modules/goals/GoalsScreen';
import EmotionalSafeRoom from '../modules/safeRoom/screens/EmotionalSafeRoom';
import NewEmotionalEntry from '../modules/safeRoom/screens/NewEmotionalEntry';
import PermissionTest from '../modules/safeRoom/screens/PermissionTest';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Import Auth screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

// Import Penalties module screens
import PenaltiesMain from '../modules/penalties/screens/PenaltiesMain';
import PenaltyDetails from '../modules/penalties/screens/PenaltyDetails';
import PenaltyHistory from '../modules/penalties/screens/PenaltyHistory';

// Import Calendar module screens
import CalendarHubScreen from '../modules/calendar/screens/CalendarHubScreen';
import ActivityDetailScreen from '../modules/calendar/screens/ActivityDetailScreen';
import CalendarVotingScreen from '../modules/calendar/screens/VotingScreen';
import VotingScreen from '../modules/calendar/voting/VotingScreen';
import ExpandedCalendar from '../modules/calendar/screens/ExpandedCalendar';

// Import Profile module screens
import { HomeManagementScreen, JoinHouseScreen, EditableProfileScreen } from '../modules/profile/screens';
import EventEditorScreen from '../modules/calendar/screens/EventEditorScreen';

// Import Quick Actions module screens - TEMPORARILY COMMENTED FOR DEBUGGING
// import FamilyMembersScreen from '../modules/quickActions/screens/FamilyMembersScreen';
// import AchievementsScreen from '../modules/quickActions/screens/AchievementsScreen';
// import RecentActivityScreen from '../modules/quickActions/screens/RecentActivityScreen';
// import StatisticsScreen from '../modules/quickActions/screens/StatisticsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigators for each tab
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    <Stack.Screen name="FirebaseTest" component={FirebaseTest as any} />
    <Stack.Screen name="FirebaseTestLive" component={FirebaseTestLive as any} />
    <Stack.Screen name="SyncTesting" component={SyncTestingScreen as any} />
    <Stack.Screen name="DebugDashboard" component={DebugDashboard as any} />
    <Stack.Screen name="TestingReports" component={TestingReports as any} />
    <Stack.Screen name="LoginScreen" component={LoginScreen as any} />
    <Stack.Screen name="RegisterScreen" component={RegisterScreen as any} />
    <Stack.Screen name="PenaltiesMain" component={PenaltiesMain as any} />
    <Stack.Screen name="PenaltyDetails" component={PenaltyDetails as any} />
    <Stack.Screen name="PenaltyHistory" component={PenaltyHistory as any} />
  </Stack.Navigator>
);

const TasksStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TasksMain" component={TasksScreen as any} />
    <Stack.Screen name="TaskDetails" component={TaskDetails as any} />
  </Stack.Navigator>
);

const CalendarStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CalendarMain" component={CalendarHubScreen as any} />
    <Stack.Screen name="ExpandedCalendar" component={ExpandedCalendar as any} />
    <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen as any} />
    <Stack.Screen name="CalendarVoting" component={CalendarVotingScreen as any} />
    <Stack.Screen name="Voting" component={VotingScreen as any} />
    <Stack.Screen name="EventEditor" component={EventEditorScreen as any} />
  </Stack.Navigator>
);

const GoalsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GoalsMain" component={GoalsScreen as any} />
  </Stack.Navigator>
);

const SafeRoomStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SafeRoomMain" component={EmotionalSafeRoom as any} />
    <Stack.Screen name="NewEmotionalEntry" component={NewEmotionalEntry as any} />
    <Stack.Screen name="PermissionTest" component={PermissionTest as any} />
  </Stack.Navigator>
);

const PenaltiesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PenaltiesMain" component={PenaltiesMain as any} />
    <Stack.Screen name="PenaltyDetails" component={PenaltyDetails as any} />
    <Stack.Screen name="PenaltyHistory" component={PenaltyHistory as any} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen as any} />
    <Stack.Screen name="Settings" component={SettingsScreen as any} />
    <Stack.Screen name="HomeManagement" component={HomeManagementScreen as any} />
    <Stack.Screen name="JoinHouse" component={JoinHouseScreen as any} />
    <Stack.Screen name="EditableProfile" component={EditableProfileScreen as any} />
    {/* Quick Actions screens temporarily commented for debugging */}
    {/* <Stack.Screen name="FamilyMembers" component={FamilyMembersScreen as any} />
    <Stack.Screen name="Achievements" component={AchievementsScreen as any} />
    <Stack.Screen name="RecentActivity" component={RecentActivityScreen as any} />
    <Stack.Screen name="Statistics" component={StatisticsScreen as any} /> */}
  </Stack.Navigator>
);

const AppNavigator = () => {
  const insets = useSafeAreaInsets();

  // Fallback translations in case i18n fails
  const fallbackTranslations = {
    en: {
      dashboard: 'Dashboard',
      tasks: 'Tasks',
      calendar: 'Calendar',
      goals: 'Goals',
      penalties: 'Penalties',
      safeRoom: 'Safe Room',
      profile: 'Profile'
    },
    es: {
      dashboard: 'Tablero',
      tasks: 'Tareas',
      calendar: 'Calendario',
      goals: 'Metas',
      penalties: 'Penas',
      safeRoom: 'Cuarto Seguro',
      profile: 'Perfil'
    }
  };

  // Try to use i18n, fallback to English if it fails
  let t, language, isInitialized;
  try {
    const translationHook = useTranslation();
    t = translationHook.t;
    language = translationHook.language;
    isInitialized = translationHook.isInitialized;
  } catch (error) {
    console.log('Error with useTranslation, using fallback:', error);
    t = (key: string) => fallbackTranslations.en[key] || key;
    language = 'en';
    isInitialized = true;
  }

  // Get tab labels based on current language
  const getTabLabel = (tabName: string) => {
    const labels = {
      Dashboard: language === 'es' ? 'Tablero' : 'Dashboard',
      Tasks: language === 'es' ? 'Tareas' : 'Tasks',
      Calendar: language === 'es' ? 'Calendario' : 'Calendar',
      Goals: language === 'es' ? 'Metas' : 'Goals',
      Penalties: language === 'es' ? 'Penas' : 'Penalties',
      SafeRoom: language === 'es' ? 'Cuarto Seguro' : 'Safe Room',
      Profile: language === 'es' ? 'Perfil' : 'Profile'
    };
    return labels[tabName] || tabName;
  };

  // Debug: Log current language
  console.log('AppNavigator - Current language:', language);
  console.log('AppNavigator - Is initialized:', isInitialized);
  console.log('AppNavigator - Dashboard label:', getTabLabel('Dashboard'));
  console.log('AppNavigator - Tasks label:', getTabLabel('Tasks'));

  // Show loading while i18n initializes
  if (!isInitialized) {
    return null; // or a loading component
  }

  return (
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
          } else if (route.name === 'Penalties') {
            iconName = focused ? 'warning' : 'warning-outline';
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
        options={{ tabBarLabel: getTabLabel('Dashboard') }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksStack}
        options={{ tabBarLabel: getTabLabel('Tasks') }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarStack}
        options={{ tabBarLabel: getTabLabel('Calendar') }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsStack}
        options={{ tabBarLabel: getTabLabel('Goals') }}
      />
      <Tab.Screen
        name="Penalties"
        component={PenaltiesStack}
        options={{ tabBarLabel: getTabLabel('Penalties') }}
      />
      <Tab.Screen
        name="SafeRoom"
        component={SafeRoomStack}
        options={{ tabBarLabel: getTabLabel('SafeRoom') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ tabBarLabel: getTabLabel('Profile') }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
