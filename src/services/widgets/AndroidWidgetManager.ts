/**
 * Android Home Screen Widgets Implementation
 * Provides quick access to FamilyDash features from Android home screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Widget Types
export type WidgetType = 'tasks' | 'calendar' | 'goals' | 'penalties' | 'weather' | 'family_stats';

export interface WidgetConfig {
    id: string;
    type: WidgetType;
    title: string;
    size: 'small' | 'medium' | 'large';
    position: { x: number; y: number };
    enabled: boolean;
    refreshInterval: number; // minutes
}

export interface WidgetData {
    tasks: {
        pending: number;
        completed: number;
        overdue: number;
    };
    calendar: {
        todayEvents: number;
        upcomingEvents: number;
        currentWeek: string;
    };
    goals: {
        active: number;
        completed: number;
        progress: number;
    };
    penalties: {
        active: number;
        completed: number;
        total: number;
    };
    weather: {
        temperature: number;
        condition: string;
        forecast: Array<{
            day: string;
            temp: number;
            condition: string;
        }>;
    };
    family_stats: {
        totalMembers: number;
        onlineMembers: number;
        messagesToday: number;
        connectionScore: number;
    };
}

// Widget Manager Service
export class AndroidWidgetManager {
    private static instance: AndroidWidgetManager;
    private widgets: Map<string, WidgetConfig> = new Map();
    private widgetData: WidgetData | null = null;

    static getInstance(): AndroidWidgetManager {
        if (!AndroidWidgetManager.instance) {
            AndroidWidgetManager.instance = new AndroidWidgetManager();
        }
        return AndroidWidgetManager.instance;
    }

    // Initialize default widgets
    async initializeDefaultWidgets(): Promise<void> {
        const defaultWidgets: WidgetConfig[] = [
            {
                id: 'tasks_widget',
                type: 'tasks',
                title: 'Family Tasks',
                size: 'medium',
                position: { x: 0, y: 0 },
                enabled: true,
                refreshInterval: 15
            },
            {
                id: 'calendar_widget',
                type: 'calendar',
                title: 'Family Calendar',
                size: 'medium',
                position: { x: 1, y: 0 },
                enabled: true,
                refreshInterval: 30
            },
            {
                id: 'weather_widget',
                type: 'weather',
                title: 'Weather',
                size: 'small',
                position: { x: 0, y: 1 },
                enabled: true,
                refreshInterval: 60
            },
            {
                id: 'family_stats_widget',
                type: 'family_stats',
                title: 'Family Stats',
                size: 'large',
                position: { x: 0, y: 2 },
                enabled: true,
                refreshInterval: 60
            }
        ];

        for (const widget of defaultWidgets) {
            this.widgets.set(widget.id, widget);
        }

        await this.refreshAllWidgets();
    }

    // Refresh widget data
    async refreshAllWidgets(): Promise<void> {
        try {
            // Simulate data fetching from stores
            this.widgetData = {
                tasks: {
                    pending: 5,
                    completed: 12,
                    overdue: 2
                },
                calendar: {
                    todayEvents: 3,
                    upcomingEvents: 8,
                    currentWeek: 'This Week'
                },
                goals: {
                    active: 7,
                    completed: 4,
                    progress: 65
                },
                penalties: {
                    active: 1,
                    completed: 3,
                    total: 4
                },
                weather: {
                    temperature: 22,
                    condition: 'Sunny',
                    forecast: [
                        { day: 'Mon', temp: 20, condition: 'Cloudy' },
                        { day: 'Tue', temp: 24, condition: 'Sunny' },
                        { day: 'Wed', temp: 18, condition: 'Rainy' },
                        { day: 'Thu', temp: 26, condition: 'Sunny' },
                        { day: 'Fri', temp: 23, condition: 'Partly Cloudy' }
                    ]
                },
                family_stats: {
                    totalMembers: 4,
                    onlineMembers: 3,
                    messagesToday: 12,
                    connectionScore: 85
                }
            };
        } catch (error) {
            console.error('Error refreshing widget data:', error);
        }
    }

    // Get widget data
    getWidgetData(type: WidgetType): any {
        if (!this.widgetData) return null;
        return this.widgetData[type];
    }

    // Update widget configuration
    updateWidgetConfig(widgetId: string, config: Partial<WidgetConfig>): void {
        const widget = this.widgets.get(widgetId);
        if (widget) {
            this.widgets.set(widgetId, { ...widget, ...config });
        }
    }

    // Get all widgets
    getAllWidgets(): WidgetConfig[] {
        return Array.from(this.widgets.values());
    }

    // Enable/disable widget
    toggleWidget(widgetId: string): void {
        const widget = this.widgets.get(widgetId);
        if (widget) {
            widget.enabled = !widget.enabled;
            this.widgets.set(widgetId, widget);
        }
    }
}

// Widget Components
export const TasksWidget: React.FC<{ data: any; onPress: () => void }> = ({ data, onPress }) => {
    if (!data) return null;

    return (
        <TouchableOpacity style= { styles.widgetContainer } onPress = { onPress } >
            <LinearGradient
        colors={ ['#3B82F6', '#1E40AF'] }
    style = { styles.widgetGradient }
        >
        <View style={ styles.widgetHeader }>
            <Ionicons name="list-outline" size = { 24} color = "white" />
                <Text style={ styles.widgetTitle }> Tasks </Text>
                    </View>

                    < View style = { styles.widgetContent } >
                        <View style={ styles.statRow }>
                            <Text style={ styles.statNumber }> { data.pending } </Text>
                                < Text style = { styles.statLabel } > Pending </Text>
                                    </View>
                                    < View style = { styles.statRow } >
                                        <Text style={ styles.statNumber }> { data.completed } </Text>
                                            < Text style = { styles.statLabel } > Completed </Text>
                                                </View>
    {
        data.overdue > 0 && (
            <View style={ styles.statRow }>
                <Text style={ [styles.statNumber, { color: '#EF4444' }] }> { data.overdue } </Text>
                    < Text style = { styles.statLabel } > Overdue </Text>
                        </View>
          )}
</View>
    </LinearGradient>
    </TouchableOpacity>
  );
};

export const CalendarWidget: React.FC<{ data: any; onPress: () => void }> = ({ data, onPress }) => {
    if (!data) return null;

    return (
        <TouchableOpacity style= { styles.widgetContainer } onPress = { onPress } >
            <LinearGradient
        colors={ ['#10B981', '#047857'] }
    style = { styles.widgetGradient }
        >
        <View style={ styles.widgetHeader }>
            <Ionicons name="calendar-outline" size = { 24} color = "white" />
                <Text style={ styles.widgetTitle }> Calendar </Text>
                    </View>

                    < View style = { styles.widgetContent } >
                        <Text style={ styles.weekText }> { data.currentWeek } </Text>
                            < View style = { styles.statRow } >
                                <Text style={ styles.statNumber }> { data.todayEvents } </Text>
                                    < Text style = { styles.statLabel } > Today </Text>
                                        </View>
                                        < View style = { styles.statRow } >
                                            <Text style={ styles.statNumber }> { data.upcomingEvents } </Text>
                                                < Text style = { styles.statLabel } > Upcoming </Text>
                                                    </View>
                                                    </View>
                                                    </LinearGradient>
                                                    </TouchableOpacity>
  );
};

export const WeatherWidget: React.FC<{ data: any; onPress: () => void }> = ({ data, onPress }) => {
    if (!data) return null;

    return (
        <TouchableOpacity style= { [styles.widgetContainer, styles.smallWidget]} onPress = { onPress } >
            <LinearGradient
        colors={ ['#8B5CF6', '#7C3AED'] }
    style = { styles.widgetGradient }
        >
        <View style={ styles.widgetHeader }>
            <Ionicons name="partly-sunny-outline" size = { 20} color = "white" />
                <Text style={ styles.widgetTitle }> Weather </Text>
                    </View>

                    < View style = { styles.widgetContent } >
                        <Text style={ styles.temperatureText }> { data.temperature }°C </Text>
                            < Text style = { styles.conditionText } > { data.condition } </Text>
                                </View>
                                </LinearGradient>
                                </TouchableOpacity>
  );
};

export const FamilyStatsWidget: React.FC<{ data: any; onPress: () => void }> = ({ data, onPress }) => {
    if (!data) return null;

    return (
        <TouchableOpacity style= { [styles.widgetContainer, styles.largeWidget]} onPress = { onPress } >
            <LinearGradient
        colors={ ['#F59E0B', '#D97706'] }
    style = { styles.widgetGradient }
        >
        <View style={ styles.widgetHeader }>
            <Ionicons name="people-outline" size = { 24} color = "white" />
                <Text style={ styles.widgetTitle }> Family Stats </Text>
                    </View>

                    < View style = { styles.widgetContent } >
                        <View style={ styles.statsGrid }>
                            <View style={ styles.statItem }>
                                <Text style={ styles.statNumber }> { data.totalMembers } </Text>
                                    < Text style = { styles.statLabel } > Members </Text>
                                        </View>
                                        < View style = { styles.statItem } >
                                            <Text style={ styles.statNumber }> { data.onlineMembers } </Text>
                                                < Text style = { styles.statLabel } > Online </Text>
                                                    </View>
                                                    < View style = { styles.statItem } >
                                                        <Text style={ styles.statNumber }> { data.messagesToday } </Text>
                                                            < Text style = { styles.statLabel } > Messages </Text>
                                                                </View>
                                                                < View style = { styles.statItem } >
                                                                    <Text style={ styles.statNumber }> { data.connectionScore } % </Text>
                                                                        < Text style = { styles.statLabel } > Connection </Text>
                                                                            </View>
                                                                            </View>
                                                                            </View>
                                                                            </LinearGradient>
                                                                            </TouchableOpacity>
  );
};

// Widget Configuration Screen
export const WidgetConfigurationScreen: React.FC = () => {
    const [widgets, setWidgets] = React.useState<WidgetConfig[]>([]);
    const widgetManager = AndroidWidgetManager.getInstance();

    React.useEffect(() => {
        loadWidgets();
    }, []);

    const loadWidgets = () => {
        setWidgets(widgetManager.getAllWidgets());
    };

    const toggleWidget = (widgetId: string) => {
        widgetManager.toggleWidget(widgetId);
        loadWidgets();
    };

    const renderWidget = (widget: WidgetConfig) => {
        const data = widgetManager.getWidgetData(widget.type);

        switch (widget.type) {
            case 'tasks':
                return <TasksWidget data={ data } onPress = {() => { }} />;
      case 'calendar':
return <CalendarWidget data={ data } onPress = {() => { }} />;
      case 'weather':
return <WeatherWidget data={ data } onPress = {() => { }} />;
      case 'family_stats':
return <FamilyStatsWidget data={ data } onPress = {() => { }} />;
      default:
return null;
    }
  };

return (
    <View style= { styles.configContainer } >
    <Text style={ styles.configTitle }> Android Widgets Configuration </Text>

        < View style = { styles.widgetsGrid } >
        {
            widgets.map((widget) => (
                <View key= { widget.id } style = { styles.widgetConfigItem } >
                <View style={ styles.widgetPreview } >
                { renderWidget(widget) }
                </View>

            < View style = { styles.widgetControls } >
            <Text style={ styles.widgetName } > { widget.title } </Text>
            < TouchableOpacity
                style = {
                    [
                    styles.toggleButton,
                    { backgroundColor: widget.enabled ? '#10B981' : '#EF4444' }
                    ]}
                onPress = {() => toggleWidget(widget.id)}
            >
            <Text style={ styles.toggleText }>
                { widget.enabled ? 'Enabled' : 'Disabled' }
                </Text>
                </TouchableOpacity>
                </View>
                </View>
        ))}
</View>
    </View>
  );
};

const styles = StyleSheet.create({
    widgetContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        margin: 8,
    },
    smallWidget: {
        width: 120,
        height: 100,
    },
    largeWidget: {
        width: 200,
        height: 150,
    },
    widgetGradient: {
        padding: 12,
        height: '100%',
    },
    widgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    widgetTitle: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    widgetContent: {
        flex: 1,
        justifyContent: 'center',
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    statNumber: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    statLabel: {
        color: 'white',
        fontSize: 12,
        opacity: 0.8,
    },
    weekText: {
        color: 'white',
        fontSize: 12,
        marginBottom: 8,
        opacity: 0.9,
    },
    temperatureText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    conditionText: {
        color: 'white',
        fontSize: 12,
        opacity: 0.8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        width: '48%',
        alignItems: 'center',
        marginBottom: 8,
    },
    configContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F9FAFB',
    },
    configTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    widgetsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    widgetConfigItem: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    widgetPreview: {
        marginBottom: 12,
    },
    widgetControls: {
        alignItems: 'center',
    },
    widgetName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    toggleButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    toggleText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default AndroidWidgetManager;

