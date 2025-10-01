import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../modules/tasks/TasksScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import GoalsScreen from '../modules/goals/screens/GoalsScreen';
// Import Safe Room module screens
import SafeRoomHome from '../modules/safeRoom/screens/SafeRoomHome';
import SafeRoomTabs from '../modules/safeRoom/screens/SafeRoomTabs';
// Import Device Tools module screens
import DeviceToolsMain from '../modules/deviceTools/screens/DeviceToolsMain';
import AndroidWidgets from '../modules/deviceTools/screens/AndroidWidgets';
import AppSettingsScreen from '../modules/deviceTools/screens/AppSettingsScreen';
import NotificationsScreen from '../modules/notifications/screens/NotificationsScreen';

// Import Penalties module screens
import PenaltiesOverview from '../modules/penalties/screens/PenaltiesOverview';
import PenaltyDetails from '../modules/penalties/screens/PenaltyDetails';

// Import Calendar module screens
import CalendarHubScreen from '../modules/calendar/screens/CalendarHubScreen';
import ActivityDetailScreen from '../modules/calendar/screens/ActivityDetailScreen';
import VotingScreen from '../modules/calendar/screens/VotingScreen';
import HistoryScreen from '../modules/calendar/screens/HistoryScreen';

// Wrapper components to handle navigation props
const PenaltyDetailsWrapper = (props: any) => <PenaltyDetails {...props} />;
const ActivityDetailWrapper = (props: any) => <ActivityDetailScreen {...props} />;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom Tab Icon Component for Kids
const CustomTabIcon = ({ route, focused, color, size }: any) => {
    const [bounceAnim] = React.useState(new Animated.Value(1));

    React.useEffect(() => {
        if (focused) {
            Animated.sequence([
                Animated.timing(bounceAnim, {
                    toValue: 1.2,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [focused]);

    const getIconConfig = (routeName: string) => {
        switch (routeName) {
            case 'Dashboard':
                return {
                    icon: focused ? 'home' : 'home-outline',
                    emoji: '🏠',
                    gradient: ['#3B82F6', '#1D4ED8'],
                    label: 'Casa'
                };
            case 'Tasks':
                return {
                    icon: focused ? 'checkmark-circle' : 'checkmark-circle-outline',
                    emoji: '✅',
                    gradient: ['#10B981', '#059669'],
                    label: 'Tareas'
                };
            case 'Penalties':
                return {
                    icon: focused ? 'warning' : 'warning-outline',
                    emoji: '⚠️',
                    gradient: ['#EF4444', '#DC2626'],
                    label: 'Penalidades'
                };
            case 'Calendar':
                return {
                    icon: focused ? 'calendar' : 'calendar-outline',
                    emoji: '📅',
                    gradient: ['#8B5CF6', '#7C3AED'],
                    label: 'Calendario'
                };
            case 'Goals':
                return {
                    icon: focused ? 'trophy' : 'trophy-outline',
                    emoji: '🏆',
                    gradient: ['#F59E0B', '#D97706'],
                    label: 'Metas'
                };
            case 'SafeRoom':
                return {
                    icon: focused ? 'heart' : 'heart-outline',
                    emoji: '❤️',
                    gradient: ['#EC4899', '#DB2777'],
                    label: 'Cuarto Seguro'
                };
            case 'DeviceTools':
                return {
                    icon: focused ? 'phone-portrait' : 'phone-portrait-outline',
                    emoji: '📱',
                    gradient: ['#6366F1', '#4F46E5'],
                    label: 'Dispositivos'
                };
            case 'Notifications':
                return {
                    icon: focused ? 'notifications' : 'notifications-outline',
                    emoji: '🔔',
                    gradient: ['#EF4444', '#DC2626'],
                    label: 'Notificaciones'
                };
            default:
                return {
                    icon: 'help-outline',
                    emoji: '❓',
                    gradient: ['#6B7280', '#4B5563'],
                    label: 'Ayuda'
                };
        }
    };

    const config = getIconConfig(route.name);

    return (
        <Animated.View style={[styles.tabIconContainer, { transform: [{ scale: bounceAnim }] }]}>
            {focused ? (
                <LinearGradient
                    colors={config.gradient as [string, string]}
                    style={styles.tabIconGradient}
                >
                    <Text style={styles.tabEmoji}>{config.emoji}</Text>
                    <Ionicons name={config.icon as any} size={size} color="white" />
                </LinearGradient>
            ) : (
                <View style={styles.tabIconOutline}>
                    <Text style={styles.tabEmojiOutline}>{config.emoji}</Text>
                    <Ionicons name={config.icon as any} size={size} color={color} />
                </View>
            )}
        </Animated.View>
    );
};

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
            <Stack.Screen name="PenaltyDetails" component={PenaltyDetailsWrapper} />
        </Stack.Navigator>
    );
};

// Stack Navigator for Calendar
const CalendarStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CalendarHub" component={CalendarHubScreen} />
            <Stack.Screen name="ActivityDetail" component={ActivityDetailWrapper} />
            <Stack.Screen name="Voting" component={VotingScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Navigator>
    );
};

// Stack Navigator for Safe Room
const SafeRoomStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SafeRoomHome" component={SafeRoomHome} />
            <Stack.Screen name="SafeRoomTabs" component={SafeRoomTabs} />
        </Stack.Navigator>
    );
};

// Stack Navigator for Device Tools
const DeviceToolsStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DeviceToolsMain" component={DeviceToolsMain} />
            <Stack.Screen name="AndroidWidgets" component={AndroidWidgets} />
            <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
        </Stack.Navigator>
    );
};

// Stack Navigator for Notifications
const NotificationsStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="NotificationsMain" component={NotificationsScreen} />
        </Stack.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => (
                        <CustomTabIcon route={route} focused={focused} color={color} size={size} />
                    ),
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: 'bold',
                        marginTop: 4,
                    },
                    tabBarStyle: {
                        backgroundColor: '#FFFFFF',
                        borderTopWidth: 0,
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        height: 80,
                        paddingBottom: 10,
                        paddingTop: 10,
                    },
                    tabBarActiveTintColor: moduleColors[route.name.toLowerCase().replace('room', 'room') as keyof typeof moduleColors],
                    tabBarInactiveTintColor: '#9CA3AF',
                    headerShown: false,
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
                    component={SafeRoomStack}
                    options={{
                        title: 'Cuarto Seguro ❤️',
                        tabBarLabel: 'Cuarto Seguro',
                        headerShown: false
                    }}
                />
                <Tab.Screen
                    name="DeviceTools"
                    component={DeviceToolsStack}
                    options={{
                        title: 'Herramientas 📱',
                        tabBarLabel: 'Dispositivos',
                        headerShown: false
                    }}
                />
                <Tab.Screen
                    name="Notifications"
                    component={NotificationsStack}
                    options={{
                        title: 'Notificaciones 🔔',
                        tabBarLabel: 'Notificaciones',
                        headerShown: false
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
    },
    tabIconGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    tabIconOutline: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    tabEmoji: {
        fontSize: 16,
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        borderRadius: 10,
        width: 20,
        height: 20,
        textAlign: 'center',
        lineHeight: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    tabEmojiOutline: {
        fontSize: 14,
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: 'white',
        borderRadius: 8,
        width: 16,
        height: 16,
        textAlign: 'center',
        lineHeight: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
});

export default AppNavigator;
