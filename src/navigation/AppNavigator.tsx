import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../modules/tasks/TasksScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import PenaltiesScreen from '../modules/penalties/PenaltiesScreen';
import PenaltyDetailsScreen from '../screens/PenaltyDetailsScreen';
import ActivitiesScreen from '../modules/activities/ActivitiesScreen';
import GoalsScreen from '../modules/goals/GoalsScreen';
import SafeRoomScreen from '../modules/safeRoom/SafeRoomScreen';
import DeviceToolsScreen from '../modules/deviceTools/DeviceToolsScreen';

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
            <Stack.Screen name="PenaltiesMain" component={PenaltiesScreen} />
            <Stack.Screen name="PenaltyDetails" component={PenaltyDetailsScreen} />
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
                    name="Activities"
                    component={ActivitiesScreen}
                    options={{
                        title: 'Actividades',
                        tabBarLabel: 'Actividades',
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
