/**
 * Android Widgets Screen
 * Main screen for managing Android home screen widgets
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AndroidWidgetManager, {
    WidgetConfig,
    WidgetType,
    TasksWidget,
    CalendarWidget,
    WeatherWidget,
    FamilyStatsWidget,
} from '../services/widgets/AndroidWidgetManager';

interface AndroidWidgetsScreenProps {
    navigation: any;
}

const AndroidWidgetsScreen: React.FC<AndroidWidgetsScreenProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const widgetManager = AndroidWidgetManager.getInstance();

    useEffect(() => {
        loadWidgets();
    }, []);

    const loadWidgets = async () => {
        try {
            setRefreshing(true);
            await widgetManager.refreshAllWidgets();
            setWidgets(widgetManager.getAllWidgets());
        } catch (error) {
            console.error('Error loading widgets:', error);
            Alert.alert('Error', 'Failed to load widgets');
        } finally {
            setRefreshing(false);
        }
    };

    const toggleWidget = (widgetId: string) => {
        widgetManager.toggleWidget(widgetId);
        setWidgets([...widgetManager.getAllWidgets()]);
    };

    const updateWidgetRefreshInterval = (widgetId: string, interval: number) => {
        widgetManager.updateWidgetConfig(widgetId, { refreshInterval: interval });
        setWidgets([...widgetManager.getAllWidgets()]);
    };

    const renderWidgetPreview = (widget: WidgetConfig) => {
        const data = widgetManager.getWidgetData(widget.type);

        switch (widget.type) {
            case 'tasks':
                return <TasksWidget data={data} onPress={() => navigation.navigate('Tasks')} />;
            case 'calendar':
                return <CalendarWidget data={data} onPress={() => navigation.navigate('Calendar')} />;
            case 'weather':
                return <WeatherWidget data={data} onPress={() => Alert.alert('Weather', 'Opening weather details...')} />;
            case 'family_stats':
                return <FamilyStatsWidget data={data} onPress={() => navigation.navigate('Statistics')} />;
            default:
                return null;
        }
    };

    const getWidgetIcon = (type: WidgetType) => {
        switch (type) {
            case 'tasks': return 'list-outline' as const;
            case 'calendar': return 'calendar-outline' as const;
            case 'goals': return 'flag-outline' as const;
            case 'penalties': return 'warning-outline' as const;
            case 'weather': return 'partly-sunny-outline' as const;
            case 'family_stats': return 'people-outline' as const;
            default: return 'square-outline' as const;
        }
    };

    const getWidgetDescription = (type: WidgetType): string => {
        switch (type) {
            case 'tasks': return 'Quick access to family tasks and progress';
            case 'calendar': return 'View upcoming events and family schedule';
            case 'goals': return 'Track family goals and achievements';
            case 'penalties': return 'Monitor active penalties and reflections';
            case 'weather': return 'Current weather and forecast information';
            case 'family_stats': return 'Family activity and connection statistics';
            default: return 'Widget description';
        }
    };

    const getRefreshIntervalOptions = () => [
        { label: '5 minutes', value: 5 },
        { label: '15 minutes', value: 15 },
        { label: '30 minutes', value: 30 },
        { label: '1 hour', value: 60 },
        { label: '2 hours', value: 120 },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <LinearGradient
                colors={['#3B82F6', '#1E40AF']}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Android Widgets</Text>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={loadWidgets}
                    disabled={refreshing}
                >
                    <Ionicons
                        name={refreshing ? "refresh" : "refresh-outline"}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Introduction */}
                <View style={styles.introSection}>
                    <Text style={styles.introTitle}>Home Screen Widgets</Text>
                    <Text style={styles.introText}>
                        Add FamilyDash widgets to your Android home screen for quick access to family information and tasks.
                    </Text>
                </View>

                {/* Widgets List */}
                <View style={styles.widgetsSection}>
                    <Text style={styles.sectionTitle}>Available Widgets</Text>

                    {widgets.map((widget) => (
                        <View key={widget.id} style={styles.widgetCard}>
                            <View style={styles.widgetHeader}>
                                <View style={styles.widgetInfo}>
                                    <Ionicons
                                        name={getWidgetIcon(widget.type)}
                                        size={24}
                                        color="#3B82F6"
                                    />
                                    <View style={styles.widgetTextInfo}>
                                        <Text style={styles.widgetName}>{widget.title}</Text>
                                        <Text style={styles.widgetDescription}>
                                            {getWidgetDescription(widget.type)}
                                        </Text>
                                    </View>
                                </View>

                                <Switch
                                    value={widget.enabled}
                                    onValueChange={() => toggleWidget(widget.id)}
                                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                                    thumbColor={widget.enabled ? '#FFFFFF' : '#FFFFFF'}
                                />
                            </View>

                            {/* Widget Preview */}
                            {widget.enabled && (
                                <View style={styles.widgetPreview}>
                                    <Text style={styles.previewTitle}>Preview:</Text>
                                    <View style={styles.previewContainer}>
                                        {renderWidgetPreview(widget)}
                                    </View>
                                </View>
                            )}

                            {/* Widget Settings */}
                            {widget.enabled && (
                                <View style={styles.widgetSettings}>
                                    <Text style={styles.settingsTitle}>Refresh Interval:</Text>
                                    <View style={styles.intervalOptions}>
                                        {getRefreshIntervalOptions().map((option) => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={[
                                                    styles.intervalButton,
                                                    widget.refreshInterval === option.value && styles.intervalButtonActive
                                                ]}
                                                onPress={() => updateWidgetRefreshInterval(widget.id, option.value)}
                                            >
                                                <Text style={[
                                                    styles.intervalButtonText,
                                                    widget.refreshInterval === option.value && styles.intervalButtonTextActive
                                                ]}>
                                                    {option.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Instructions */}
                <View style={styles.instructionsSection}>
                    <Text style={styles.sectionTitle}>How to Add Widgets</Text>
                    <View style={styles.instructionSteps}>
                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <Text style={styles.stepText}>
                                Long press on your Android home screen
                            </Text>
                        </View>

                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <Text style={styles.stepText}>
                                Tap "Widgets" from the menu
                            </Text>
                        </View>

                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <Text style={styles.stepText}>
                                Find "FamilyDash" and select your desired widget
                            </Text>
                        </View>

                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>4</Text>
                            </View>
                            <Text style={styles.stepText}>
                                Drag and drop to your preferred location
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Tips */}
                <View style={styles.tipsSection}>
                    <Text style={styles.sectionTitle}>Tips</Text>
                    <View style={styles.tipsList}>
                        <View style={styles.tip}>
                            <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
                            <Text style={styles.tipText}>
                                Widgets update automatically based on your refresh interval settings
                            </Text>
                        </View>
                        <View style={styles.tip}>
                            <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
                            <Text style={styles.tipText}>
                                Tap on widgets to open the corresponding section in FamilyDash
                            </Text>
                        </View>
                        <View style={styles.tip}>
                            <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
                            <Text style={styles.tipText}>
                                Disable widgets you don't use to save battery and data
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    refreshButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    introSection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    introTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1F2937',
    },
    introText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    widgetsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1F2937',
    },
    widgetCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    widgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    widgetInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    widgetTextInfo: {
        marginLeft: 12,
        flex: 1,
    },
    widgetName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    widgetDescription: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 16,
    },
    widgetPreview: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    previewTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    previewContainer: {
        alignItems: 'center',
    },
    widgetSettings: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    settingsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    intervalOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    intervalButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    intervalButtonActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    intervalButtonText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    intervalButtonTextActive: {
        color: 'white',
    },
    instructionsSection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    instructionSteps: {
        marginTop: 16,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    tipsSection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tipsList: {
        marginTop: 16,
    },
    tip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginLeft: 12,
    },
});

export default AndroidWidgetsScreen;

