import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import InteractiveWidget from '../components/InteractiveWidget';

interface WidgetDemoProps {
    navigation: any;
}

const WidgetDemo: React.FC<WidgetDemoProps> = ({ navigation }) => {
    const [installedWidgets, setInstalledWidgets] = useState<string[]>(['tasks', 'penalty']);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleWidgetPress = (widgetType: string) => {
        Alert.alert(
            'Widget Tapped! 📱',
            `You tapped the ${widgetType} widget. In a real Android device, this would open the corresponding app section.`,
            [{ text: 'OK', style: 'default' }]
        );
    };

    const handleAddWidget = (widgetType: string) => {
        if (installedWidgets.includes(widgetType)) {
            Alert.alert('Widget Already Added', 'This widget is already on your home screen');
            return;
        }
        setInstalledWidgets(prev => [...prev, widgetType]);
        Alert.alert('Widget Added!', `${widgetType} widget has been added to your home screen`);
    };

    const handleRemoveWidget = (widgetType: string) => {
        setInstalledWidgets(prev => prev.filter(w => w !== widgetType));
        Alert.alert('Widget Removed', `${widgetType} widget has been removed from your home screen`);
    };

    const availableWidgets = [
        { type: 'tasks', name: 'Tasks Widget', description: 'Interactive task list with checkboxes' },
        { type: 'penalty', name: 'Penalty Timer', description: 'Live countdown with pulsing animation' },
        { type: 'activities', name: 'Calendar Widget', description: 'Upcoming family events' },
        { type: 'goals', name: 'Goals Progress', description: 'Family goals with progress bars' },
        { type: 'safe-room', name: 'Safe Room Alert', description: 'Family feelings and support' },
    ];

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                            <Ionicons name="arrow-back" size={20} color="white" />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.headerTitle}>Widget Demo 📱</Text>
                            <Text style={styles.headerSubtitle}>Android Home Screen Simulation</Text>
                        </View>
                    </View>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Home Screen Simulation */}
            <View style={styles.homeScreenSection}>
                <View style={styles.homeScreenCard}>
                    <View style={styles.homeScreenHeader}>
                        <Ionicons name="phone-portrait" size={20} color="#8B5CF6" />
                        <Text style={styles.homeScreenTitle}>Android Home Screen</Text>
                        <Text style={styles.homeScreenSubtitle}>Tap widgets to interact</Text>
                    </View>

                    {/* Widget Grid */}
                    <View style={styles.widgetGrid}>
                        {/* Row 1 */}
                        <View style={styles.widgetRow}>
                            {installedWidgets.includes('tasks') && (
                                <InteractiveWidget
                                    type="tasks"
                                    size="medium"
                                    onPress={() => handleWidgetPress('tasks')}
                                />
                            )}
                            {installedWidgets.includes('penalty') && (
                                <InteractiveWidget
                                    type="penalty"
                                    size="medium"
                                    onPress={() => handleWidgetPress('penalty')}
                                />
                            )}
                            {installedWidgets.includes('activities') && (
                                <InteractiveWidget
                                    type="activities"
                                    size="medium"
                                    onPress={() => handleWidgetPress('activities')}
                                />
                            )}
                        </View>

                        {/* Row 2 */}
                        <View style={styles.widgetRow}>
                            {installedWidgets.includes('goals') && (
                                <InteractiveWidget
                                    type="goals"
                                    size="medium"
                                    onPress={() => handleWidgetPress('goals')}
                                />
                            )}
                            {installedWidgets.includes('safe-room') && (
                                <InteractiveWidget
                                    type="safe-room"
                                    size="medium"
                                    onPress={() => handleWidgetPress('safe-room')}
                                />
                            )}
                        </View>
                    </View>

                    {/* Instructions */}
                    <View style={styles.instructionsCard}>
                        <Text style={styles.instructionsTitle}>💡 How it works:</Text>
                        <Text style={styles.instructionsText}>
                            • Tap widgets to simulate app opening{'\n'}
                            • Widgets update automatically{'\n'}
                            • Interactive elements respond to touch{'\n'}
                            • Animations show real-time data
                        </Text>
                    </View>
                </View>
            </View>

            {/* Widget Management */}
            <View style={styles.managementSection}>
                <Text style={styles.sectionTitle}>Widget Management</Text>
                <Text style={styles.sectionSubtitle}>Add or remove widgets from your home screen</Text>

                {availableWidgets.map((widget) => (
                    <View key={widget.type} style={styles.widgetManagementCard}>
                        <View style={styles.widgetManagementInfo}>
                            <View style={styles.widgetManagementLeft}>
                                <View style={styles.widgetIcon}>
                                    <InteractiveWidget type={widget.type as any} size="small" />
                                </View>
                                <View style={styles.widgetManagementText}>
                                    <Text style={styles.widgetManagementName}>{widget.name}</Text>
                                    <Text style={styles.widgetManagementDescription}>{widget.description}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.managementButton,
                                    installedWidgets.includes(widget.type) ? styles.removeButton : styles.addButton
                                ]}
                                onPress={() =>
                                    installedWidgets.includes(widget.type)
                                        ? handleRemoveWidget(widget.type)
                                        : handleAddWidget(widget.type)
                                }
                            >
                                <Ionicons
                                    name={installedWidgets.includes(widget.type) ? "trash" : "add"}
                                    size={16}
                                    color="white"
                                />
                                <Text style={styles.managementButtonText}>
                                    {installedWidgets.includes(widget.type) ? "Remove" : "Add"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>

            {/* Real Android Instructions */}
            <View style={styles.androidInstructionsSection}>
                <View style={styles.androidInstructionsCard}>
                    <View style={styles.androidInstructionsHeader}>
                        <Ionicons name="android" size={24} color="#10B981" />
                        <Text style={styles.androidInstructionsTitle}>Real Android Setup</Text>
                    </View>
                    <Text style={styles.androidInstructionsDescription}>
                        To add real widgets to your Android device:
                    </Text>
                    <View style={styles.androidInstructionsList}>
                        <View style={styles.androidInstructionItem}>
                            <Text style={styles.androidInstructionNumber}>1</Text>
                            <Text style={styles.androidInstructionText}>Long press on home screen</Text>
                        </View>
                        <View style={styles.androidInstructionItem}>
                            <Text style={styles.androidInstructionNumber}>2</Text>
                            <Text style={styles.androidInstructionText}>Tap "Widgets" from menu</Text>
                        </View>
                        <View style={styles.androidInstructionItem}>
                            <Text style={styles.androidInstructionNumber}>3</Text>
                            <Text style={styles.androidInstructionText}>Find "FamilyDash" widgets</Text>
                        </View>
                        <View style={styles.androidInstructionItem}>
                            <Text style={styles.androidInstructionNumber}>4</Text>
                            <Text style={styles.androidInstructionText}>Drag to home screen</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 32,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    timeContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    homeScreenSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    homeScreenCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    homeScreenHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    homeScreenTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 12,
    },
    homeScreenSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 8,
    },
    widgetGrid: {
        gap: 16,
    },
    widgetRow: {
        flexDirection: 'row',
        gap: 16,
        justifyContent: 'flex-start',
    },
    instructionsCard: {
        backgroundColor: '#F0F9FF',
        padding: 16,
        borderRadius: 12,
        marginTop: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    instructionsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E40AF',
        marginBottom: 8,
    },
    instructionsText: {
        fontSize: 12,
        color: '#1E40AF',
        lineHeight: 18,
    },
    managementSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    widgetManagementCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    widgetManagementInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    widgetManagementLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    widgetIcon: {
        marginRight: 12,
    },
    widgetManagementText: {
        flex: 1,
    },
    widgetManagementName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    widgetManagementDescription: {
        fontSize: 12,
        color: '#6B7280',
    },
    managementButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    addButton: {
        backgroundColor: '#10B981',
    },
    removeButton: {
        backgroundColor: '#EF4444',
    },
    managementButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    androidInstructionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    androidInstructionsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    androidInstructionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    androidInstructionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 12,
    },
    androidInstructionsDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    androidInstructionsList: {
        gap: 12,
    },
    androidInstructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    androidInstructionNumber: {
        width: 24,
        height: 24,
        backgroundColor: '#10B981',
        borderRadius: 12,
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 24,
    },
    androidInstructionText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
    },
    bottomSpacing: {
        height: 80,
    },
});

export default WidgetDemo;
