import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../modules/tasks/TasksScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import GoalsScreen from '../modules/goals/screens/GoalsScreen';
import SafeRoomScreen from '../modules/safeRoom/screens/SafeRoomScreen';
import DeviceToolsScreen from '../modules/deviceTools/DeviceToolsScreen';

// Import Penalties module screens
import PenaltiesOverview from '../modules/penalties/screens/PenaltiesOverview';
import PenaltyDetails from '../modules/penalties/screens/PenaltyDetails';

// Import Calendar module screens
import CalendarHubScreen from '../modules/calendar/screens/CalendarHubScreen';
import ActivityDetailScreen from '../modules/calendar/screens/ActivityDetailScreen';
import VotingScreen from '../modules/calendar/screens/VotingScreen';
import HistoryScreen from '../modules/calendar/screens/HistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Color scheme for each module
const moduleColors = {
    dashboard: '#4F46E5',    // Primary Purple
    tasks: '#10B981',        // Green
    penalties: '#EF4444',    // Red
    activities: '#3B82F6',   // Blue
    goals: '#F59E0B',        // Gold
    safeRoom: '#EC4899',     // Pink
    deviceTools: '#8B5CF6'   // Purple
};

// Stack Navigator for Tasks
const TasksStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="TasksMain" component={TasksScreen} />
            <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
        </Stack.Navigator>
    );
};

// Stack Navigator for Penalties
const PenaltiesStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PenaltiesOverview" component={PenaltiesOverview} />
            <Stack.Screen name="PenaltyDetails" component={PenaltyDetails} />
        </Stack.Navigator>
    );
};

// Stack Navigator for Calendar
const CalendarStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CalendarHub" component={CalendarHubScreen} />
            <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
            <Stack.Screen name="Voting" component={VotingScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName: string;

                        switch (route.name) {
                            case 'Dashboard':
                                iconName = focused ? 'home' : 'home-outline';
                                break;
                            case 'Tasks':
                                iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
                                break;
                            case 'Penalties':
                                iconName = focused ? 'warning' : 'warning-outline';
                                break;
                            case 'Activities':
                                iconName = focused ? 'calendar' : 'calendar-outline';
                                break;
                            case 'Goals':
                                iconName = focused ? 'trophy' : 'trophy-outline';
                                break;
                            case 'SafeRoom':
                                iconName = focused ? 'heart' : 'heart-outline';
                                break;
                            case 'DeviceTools':
                                iconName = focused ? 'phone-portrait' : 'phone-portrait-outline';
                                break;
                            default:
                                iconName = 'help-outline';
                        }

                        return <Ionicons name={iconName as any} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: moduleColors[route.name.toLowerCase().replace('room', 'room') as keyof typeof moduleColors],
                    tabBarInactiveTintColor: 'gray',
                    headerStyle: {
                        backgroundColor: moduleColors[route.name.toLowerCase().replace('room', 'room') as keyof typeof moduleColors],
                    },
                    headerTintColor: 'white',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                })}
            >
                <Tab.Screen
                    name="Dashboard"
                    component={DashboardScreen}
                    options={{
                        title: 'Dashboard',
                        tabBarLabel: 'Home',
                        headerShown: false
                    }}
                />
                <Tab.Screen
                    name="Tasks"
                    component={TasksStack}
                    options={{
                        title: 'Tareas',
                        tabBarLabel: 'Tareas',
                        headerShown: false
                    }}
                />
                <Tab.Screen
                    name="Penalties"
                    component={PenaltiesStack}
                    options={{
                        title: 'Penalizaciones',
                        tabBarLabel: 'Penalizaciones',
                        headerShown: false
                    }}
                />
                <Tab.Screen
                    name="Calendar"
                    component={CalendarStack}
                    options={{
                        title: 'Calendario',
                        tabBarLabel: 'Calendario',
                        headerShown: false
                    }}
                />
                <Tab.Screen
                    name="Goals"
                    component={GoalsScreen}
                    options={{
                        title: 'Metas',
                        tabBarLabel: 'Metas',
                        headerShown: false
                    }}
                />
                <Tab.Screen
                    name="SafeRoom"
                    component={SafeRoomScreen}
                    options={{
                        title: 'Cuarto Seguro ❤️',
                        tabBarLabel: 'Cuarto Seguro',
                        headerShown: false
                    }}
                />
                <Tab.Screen
                    name="DeviceTools"
                    component={DeviceToolsScreen}
                    options={{
                        title: 'Herramientas 📱',
                        tabBarLabel: 'Dispositivos',
                        headerShown: false
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
