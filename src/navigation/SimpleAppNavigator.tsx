import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// i18n removed - using hardcoded English labels

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import { FirebaseTest } from '../screens/FirebaseTest';
// import TasksScreen from '../modules/tasks/TasksScreen'; // Replaced with new TaskListScreen
import TaskDetails from '../modules/tasks/screens/TaskDetails';
import FamilyVisionNavigator from '../screens/FamilyVision/FamilyVisionNavigator';
import FamilyVoteScreen from '../screens/FamilyVoteScreen';
import FamilyChatScreen from '../screens/FamilyChatScreen';
import NotificationsScreen from '../modules/notifications/screens/NotificationsScreen';
import SafeRoomWrapper from '../modules/safeRoom/screens/SafeRoomWrapper';
import NewEmotionalEntry from '../modules/safeRoom/screens/NewEmotionalEntry';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MainHomeScreen from '../screens/MainHomeScreen';
import SavedLocationsScreen from '../screens/SavedLocationsScreen';
import FamilySchedulesScreen from '../screens/schedules/FamilySchedulesScreen';
import FamilyRemindersScreen from '../screens/reminders/FamilyRemindersScreen';

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
import FamilyRoleManagementScreen from '../screens/FamilyRoleManagementScreen';
import VideoTestScreen from '../screens/VideoTestScreen';

// Import Support screens
import HelpScreen from '../screens/Support/HelpScreen';
import ContactScreen from '../screens/Support/ContactScreen';
import AboutScreen from '../screens/Support/AboutScreen';

// Import Account screens
import AccountProfileScreen from '../screens/Settings/Account/ProfileScreen';
import AccountFamilyScreen from '../screens/Settings/Account/FamilyScreen';
import AccountPrivacyScreen from '../screens/Settings/Account/PrivacyScreen';

// Import Appearance screen
import AppearanceScreen from '../screens/Settings/AppearanceScreen';

// Import Safe Room screens
import SafeRoomScreen from '../screens/SafeRoom/SafeRoomScreen';
import TextMessageScreen from '../screens/SafeRoom/TextMessageScreen';
import VoiceMessageScreen from '../screens/SafeRoom/VoiceMessageScreen';
import MoodTestScreen from '../screens/SafeRoom/MoodTestScreen';

// Import Tasks screens
import TaskListScreen from '../screens/Tasks/TaskListScreen';
import AddTaskScreen from '../screens/Tasks/AddTaskScreen';
import EditTaskScreen from '../screens/Tasks/EditTaskScreen';
import AddPhotoTaskScreen from '../screens/Tasks/AddPhotoTaskScreen';
import VideoInstructionsScreen from '../screens/Tasks/VideoInstructionsScreen';
import AddRewardScreen from '../screens/Tasks/AddRewardScreen';

// Import Testing & Debug screens
import FirebaseTestLive from '../screens/FirebaseTestLive';
import SyncTestingScreen from '../screens/SyncTestingScreen';
import DebugDashboard from '../screens/DebugDashboard';
import TestingReports from '../screens/TestingReports';

// Import Quick Actions module screens
import { FamilyMembersScreen } from '../modules/quickActions/screens/FamilyMembersScreen';
import { AchievementsScreen } from '../modules/quickActions/screens/AchievementsScreen';
import { RecentActivityScreen } from '../modules/quickActions/screens/RecentActivityScreen';
import { StatisticsScreen } from '../modules/quickActions/screens/StatisticsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigators for each tab
const DashboardStack = () => (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
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
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TasksMain" component={TaskListScreen as any} />
    <Stack.Screen name="TaskDetails" component={TaskDetails as any} />

    {/* Tasks creation screens */}
    <Stack.Screen name="AddTask" component={AddTaskScreen as any} />
    <Stack.Screen name="EditTask" component={EditTaskScreen as any} />
    <Stack.Screen name="AddPhotoTask" component={AddPhotoTaskScreen as any} />
    <Stack.Screen name="VideoInstructions" component={VideoInstructionsScreen as any} />
    <Stack.Screen name="AddReward" component={AddRewardScreen as any} />

    {/* Family features */}
    <Stack.Screen name="FamilyVote" component={FamilyVoteScreen as any} />
    <Stack.Screen name="FamilyChat" component={FamilyChatScreen as any} />
  </Stack.Navigator>
);

const CalendarStack = () => (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CalendarMain" component={CalendarHubScreen as any} />
    <Stack.Screen name="ExpandedCalendar" component={ExpandedCalendar as any} />
    <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen as any} />
    <Stack.Screen name="CalendarVoting" component={CalendarVotingScreen as any} />
    <Stack.Screen name="Voting" component={VotingScreen as any} />
    <Stack.Screen name="EventEditor" component={EventEditorScreen as any} />
    <Stack.Screen name="FamilySchedules" component={FamilySchedulesScreen as any} />
    <Stack.Screen name="FamilyReminders" component={FamilyRemindersScreen as any} />
  </Stack.Navigator>
);


const SafeRoomStack = () => (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SafeRoomMain" component={SafeRoomWrapper as any} />
    <Stack.Screen name="NewEmotionalEntry" component={NewEmotionalEntry as any} />
    <Stack.Screen name="TextMessage" component={TextMessageScreen as any} />
    <Stack.Screen name="VoiceMessage" component={VoiceMessageScreen as any} />
  </Stack.Navigator>
);

const PenaltiesStack = () => (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PenaltiesMain" component={PenaltiesMain as any} />
    <Stack.Screen name="PenaltyDetails" component={PenaltyDetails as any} />
    <Stack.Screen name="PenaltyHistory" component={PenaltyHistory as any} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen as any} />
    <Stack.Screen name="Settings" component={SettingsScreen as any} />
    <Stack.Screen name="HomeManagement" component={HomeManagementScreen as any} />
    <Stack.Screen name="JoinHouse" component={JoinHouseScreen as any} />
    <Stack.Screen name="EditableProfile" component={EditableProfileScreen as any} />
    
    {/* Family Information Screens */}
    <Stack.Screen name="MainHome" component={MainHomeScreen as any} />
    <Stack.Screen name="SavedLocations" component={SavedLocationsScreen as any} />
    <Stack.Screen name="FamilySchedules" component={FamilySchedulesScreen as any} />
    <Stack.Screen name="FamilyRoles" component={FamilyRoleManagementScreen as any} />
    <Stack.Screen name="VideoTest" component={VideoTestScreen as any} />

    {/* Support screens */}
    <Stack.Screen name="Help" component={HelpScreen as any} />
    <Stack.Screen name="Contact" component={ContactScreen as any} />
    <Stack.Screen name="About" component={AboutScreen as any} />

    {/* Account screens */}
    <Stack.Screen name="AccountProfile" component={AccountProfileScreen as any} />
    <Stack.Screen name="AccountFamily" component={AccountFamilyScreen as any} />
    <Stack.Screen name="AccountPrivacy" component={AccountPrivacyScreen as any} />

    {/* Appearance screen */}
    <Stack.Screen name="Appearance" component={AppearanceScreen as any} />

    {/* Safe Room screens */}
    <Stack.Screen name="SafeRoom" component={SafeRoomScreen as any} />
    <Stack.Screen name="MoodTest" component={MoodTestScreen as any} />

    {/* Notifications */}
    <Stack.Screen name="Notifications" component={NotificationsScreen as any} />

    {/* Tasks screens - moved to TasksStack */}

        {/* Quick Actions screens */}
        <Stack.Screen name="FamilyMembers" component={FamilyMembersScreen} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} />
        <Stack.Screen name="RecentActivity" component={RecentActivityScreen} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const insets = useSafeAreaInsets();

  // Hardcoded English labels (i18n removed)
  const getTabLabel = (tabName: string) => {
    const labels = {
      Dashboard: 'Dashboard',
      Tasks: 'Tasks',
      Calendar: 'Calendar',
      Vision: 'Vision',
      Penalties: 'Penalties',
      SafeRoom: 'Safe Room',
      Profile: 'Profile'
    };
    return labels[tabName] || tabName;
  };

  return (
    <Tab.Navigator
      id={undefined}
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
          } else if (route.name === 'Vision') {
            iconName = focused ? 'eye' : 'eye-outline';
          } else if (route.name === 'Penalties') {
            iconName = focused ? 'warning' : 'warning-outline';
          } else if (route.name === 'SafeRoom') {
            iconName = focused ? 'shield' : 'shield-outline';
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
        name="Vision"
        component={FamilyVisionNavigator}
        options={{ tabBarLabel: getTabLabel('Vision') }}
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
