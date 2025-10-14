import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AndroidWidgetsProps {
    navigation: any;
}

interface WidgetPreviewProps {
    widget: any;
    isInstalled: boolean;
    onAdd: () => void;
    onRemove: () => void;
}

const WidgetPreview: React.FC<WidgetPreviewProps> = ({ widget, isInstalled, onAdd, onRemove }) => {
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        if (widget.id === 'penalty') {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, []);

    const renderWidgetContent = () => {
        switch (widget.id) {
            case 'tasks':
                return (
                    <View style={styles.widgetContent}>
                        <View style={styles.widgetHeader}>
                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                            <Text style={styles.widgetTitle}>Today's Tasks</Text>
                        </View>
                        <View style={styles.taskList}>
                            <View style={styles.taskItem}>
                                <View style={[styles.taskDot, { backgroundColor: '#10B981' }]} />
                                <Text style={styles.taskText}>Clean room</Text>
                                <TouchableOpacity style={styles.taskButton}>
                                    <Ionicons name="checkmark" size={12} color="white" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.taskItem}>
                                <View style={[styles.taskDot, { backgroundColor: '#F59E0B' }]} />
                                <Text style={styles.taskText}>Homework</Text>
                                <TouchableOpacity style={styles.taskButton}>
                                    <Ionicons name="checkmark" size={12} color="white" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.taskItem}>
                                <View style={[styles.taskDot, { backgroundColor: '#EF4444' }]} />
                                <Text style={styles.taskText}>Walk dog</Text>
                                <TouchableOpacity style={styles.taskButton}>
                                    <Ionicons name="checkmark" size={12} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.widgetFooter}>
                            <Text style={styles.widgetFooterText}>3 of 5 completed</Text>
                        </View>
                    </View>
                );

            case 'penalty':
                return (
                    <Animated.View style={[styles.widgetContent, { transform: [{ scale: pulseAnim }] }]}>
                        <View style={styles.widgetHeader}>
                            <Ionicons name="hourglass" size={16} color="#EF4444" />
                            <Text style={styles.widgetTitle}>Active Penalty</Text>
                        </View>
                        <View style={styles.penaltyContent}>
                            <View style={styles.penaltyMember}>
                                <View style={styles.memberAvatar} />
                                <Text style={styles.memberName}>Emma</Text>
                            </View>
                            <Text style={styles.penaltyReason}>Didn't clean room</Text>
                            <View style={styles.timerContainer}>
                                <Text style={styles.timerText}>12:34</Text>
                                <Text style={styles.timerLabel}>remaining</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: '65%' }]} />
                            </View>
                        </View>
                    </Animated.View>
                );

            case 'activities':
                return (
                    <View style={styles.widgetContent}>
                        <View style={styles.widgetHeader}>
                            <Ionicons name="calendar" size={16} color="#3B82F6" />
                            <Text style={styles.widgetTitle}>Family Calendar</Text>
                        </View>
                        <View style={styles.activityList}>
                            <View style={styles.activityItem}>
                                <View style={[styles.activityDot, { backgroundColor: '#3B82F6' }]} />
                                <Text style={styles.activityText}>Movie Night</Text>
                                <Text style={styles.activityTime}>7:00 PM</Text>
                            </View>
                            <View style={styles.activityItem}>
                                <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
                                <Text style={styles.activityText}>Family Dinner</Text>
                                <Text style={styles.activityTime}>6:00 PM</Text>
                            </View>
                        </View>
                        <View style={styles.widgetFooter}>
                            <Text style={styles.widgetFooterText}>2 events today</Text>
                        </View>
                    </View>
                );

            case 'goals':
                return (
                    <View style={styles.widgetContent}>
                        <View style={styles.widgetHeader}>
                            <Ionicons name="trophy" size={16} color="#F59E0B" />
                            <Text style={styles.widgetTitle}>Family Goals</Text>
                        </View>
                        <View style={styles.goalContent}>
                            <Text style={styles.goalTitle}>Reading Challenge</Text>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: '60%', backgroundColor: '#F59E0B' }]} />
                                </View>
                                <Text style={styles.progressText}>12/20 books</Text>
                            </View>
                            <View style={styles.goalMembers}>
                                <View style={styles.memberDot} />
                                <View style={styles.memberDot} />
                                <View style={styles.memberDot} />
                                <View style={styles.memberDot} />
                            </View>
                        </View>
                    </View>
                );

            case 'safe-room':
                return (
                    <View style={styles.widgetContent}>
                        <View style={styles.widgetHeader}>
                            <Ionicons name="heart" size={16} color="#EC4899" />
                            <Text style={styles.widgetTitle}>Safe Room</Text>
                        </View>
                        <View style={styles.safeRoomContent}>
                            <Text style={styles.safeRoomMessage}>"I'm feeling overwhelmed today"</Text>
                            <View style={styles.safeRoomMember}>
                                <View style={styles.memberAvatar} />
                                <Text style={styles.memberName}>Mom</Text>
                            </View>
                            <View style={styles.supportButtons}>
                                <TouchableOpacity style={styles.supportButton}>
                                    <Ionicons name="heart" size={12} color="#EC4899" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.supportButton}>
                                    <Ionicons name="thumbs-up" size={12} color="#10B981" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                );

            default:
                return (
                    <View style={styles.widgetContent}>
                        <Text style={styles.widgetTitle}>{widget.title}</Text>
                        <Text style={styles.widgetDescription}>{widget.description}</Text>
                    </View>
                );
        }
    };

    return (
        <View style={styles.widgetPreviewContainer}>
            <View style={styles.widgetPreview}>
                <LinearGradient colors={widget.gradient} style={styles.widgetGradient}>
                    {renderWidgetContent()}
                </LinearGradient>
            </View>
            <View style={styles.widgetInfo}>
                <Text style={styles.widgetName}>{widget.title}</Text>
                <Text style={styles.widgetSize}>{widget.size}</Text>
                <Text style={styles.widgetDescription}>{widget.description}</Text>
            </View>
            <TouchableOpacity
                style={[styles.addButton, isInstalled && styles.removeButton]}
                onPress={isInstalled ? onRemove : onAdd}
            >
                <Ionicons
                    name={isInstalled ? "trash" : "add"}
                    size={16}
                    color="white"
                />
                <Text style={styles.addButtonText}>
                    {isInstalled ? "Remove" : "Add to Home"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const AndroidWidgets: React.FC<AndroidWidgetsProps> = ({ navigation }) => {
    const [installedWidgets, setInstalledWidgets] = useState<string[]>([]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleAddWidget = (widgetId: string) => {
        if (installedWidgets.includes(widgetId)) {
            Alert.alert('Widget Already Added', 'This widget is already installed on your home screen');
            return;
        }

        setInstalledWidgets(prev => [...prev, widgetId]);
        Alert.alert('Widget Added! 📱', 'Widget has been added to your home screen. In a real Android device, you would find it in your widget drawer.');
    };

    const handleRemoveWidget = (widgetId: string) => {
        setInstalledWidgets(prev => prev.filter(id => id !== widgetId));
        Alert.alert('Widget Removed', 'Widget has been removed from your home screen');
    };

    const widgets = [
        {
            id: 'tasks',
            title: 'Tasks Widget',
            size: '4x2',
            color: '#10B981',
            gradient: ['#10B981', '#059669'],
            icon: 'checkmark-circle',
            description: 'Tap tasks to mark complete directly from home screen'
        },
        {
            id: 'penalty',
            title: 'Penalty Timer',
            size: '2x2',
            color: '#EF4444',
            gradient: ['#EF4444', '#DC2626'],
            icon: 'hourglass',
            description: 'Shows active penalty with live countdown timer'
        },
        {
            id: 'activities',
            title: 'Activities Widget',
            size: '4x2',
            color: '#3B82F6',
            gradient: ['#3B82F6', '#2563EB'],
            icon: 'calendar',
            description: 'View upcoming family events and activities'
        },
        {
            id: 'goals',
            title: 'Goals Progress',
            size: '2x2',
            color: '#F59E0B',
            gradient: ['#F59E0B', '#D97706'],
            icon: 'trophy',
            description: 'Track family goals and achievements'
        },
        {
            id: 'safe-room',
            title: 'Safe Room Alert',
            size: '2x2',
            color: '#EC4899',
            gradient: ['#EC4899', '#DB2777'],
            icon: 'heart',
            description: 'Quick access to family feelings and support'
        }
    ];

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
                            <Text style={styles.headerTitle}>Android Widgets 📱</Text>
                            <Text style={styles.headerSubtitle}>Home Screen Setup</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Overview */}
            <View style={styles.overviewSection}>
                <View style={styles.overviewCard}>
                    <View style={styles.overviewHeader}>
                        <Ionicons name="phone-portrait" size={24} color="#8B5CF6" />
                        <Text style={styles.overviewTitle}>Widget Overview</Text>
                    </View>
                    <Text style={styles.overviewDescription}>
                        Add FamilyDash widgets to your Android home screen for quick access to tasks,
                        penalties, activities, and family goals. Widgets update automatically and
                        provide interactive controls.
                    </Text>
                    <View style={styles.overviewStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{widgets.length}</Text>
                            <Text style={styles.statLabel}>Available Widgets</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{installedWidgets.length}</Text>
                            <Text style={styles.statLabel}>Installed</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Widgets List */}
            <View style={styles.widgetsSection}>
                <Text style={styles.sectionTitle}>Available Widgets</Text>
                {widgets.map((widget) => (
                    <WidgetPreview
                        key={widget.id}
                        widget={widget}
                        isInstalled={installedWidgets.includes(widget.id)}
                        onAdd={() => handleAddWidget(widget.id)}
                        onRemove={() => handleRemoveWidget(widget.id)}
                    />
                ))}
            </View>

            {/* Instructions */}
            <View style={styles.instructionsSection}>
                <View style={styles.instructionsCard}>
                    <View style={styles.instructionsHeader}>
                        <Ionicons name="help-circle" size={24} color="#3B82F6" />
                        <Text style={styles.instructionsTitle}>How to Add Widgets</Text>
                    </View>
                    <View style={styles.instructionsList}>
                        <View style={styles.instructionItem}>
                            <Text style={styles.instructionNumber}>1</Text>
                            <Text style={styles.instructionText}>Long press on your home screen</Text>
                        </View>
                        <View style={styles.instructionItem}>
                            <Text style={styles.instructionNumber}>2</Text>
                            <Text style={styles.instructionText}>Tap "Widgets" from the menu</Text>
                        </View>
                        <View style={styles.instructionItem}>
                            <Text style={styles.instructionNumber}>3</Text>
                            <Text style={styles.instructionText}>Find "FamilyDash" in the widget list</Text>
                        </View>
                        <View style={styles.instructionItem}>
                            <Text style={styles.instructionNumber}>4</Text>
                            <Text style={styles.instructionText}>Drag your preferred widget to home screen</Text>
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
    overviewSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    overviewCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    overviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    overviewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 12,
    },
    overviewDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 16,
    },
    overviewStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8B5CF6',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    widgetsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    widgetPreviewContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    widgetPreview: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
    },
    widgetGradient: {
        padding: 16,
        minHeight: 120,
    },
    widgetContent: {
        flex: 1,
    },
    widgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    widgetTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
    taskList: {
        gap: 8,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    taskDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    taskText: {
        flex: 1,
        fontSize: 12,
        color: 'white',
    },
    taskButton: {
        width: 20,
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    widgetFooter: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.3)',
    },
    widgetFooterText: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    penaltyContent: {
        alignItems: 'center',
        gap: 8,
    },
    penaltyMember: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    memberAvatar: {
        width: 24,
        height: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 12,
    },
    memberName: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    penaltyReason: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    timerContainer: {
        alignItems: 'center',
    },
    timerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    timerLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 2,
    },
    activityList: {
        gap: 8,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activityText: {
        flex: 1,
        fontSize: 12,
        color: 'white',
    },
    activityTime: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    goalContent: {
        gap: 8,
    },
    goalTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    progressContainer: {
        gap: 4,
    },
    progressText: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    goalMembers: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
    },
    memberDot: {
        width: 6,
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 3,
    },
    safeRoomContent: {
        alignItems: 'center',
        gap: 8,
    },
    safeRoomMessage: {
        fontSize: 10,
        color: 'white',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    safeRoomMember: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    supportButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    supportButton: {
        width: 24,
        height: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    widgetInfo: {
        marginBottom: 12,
    },
    widgetName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    widgetSize: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    widgetDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 18,
    },
    addButton: {
        backgroundColor: '#10B981',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    removeButton: {
        backgroundColor: '#EF4444',
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    instructionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    instructionsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    instructionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 12,
    },
    instructionsList: {
        gap: 12,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    instructionNumber: {
        width: 24,
        height: 24,
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 24,
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
    },
    bottomSpacing: {
        height: 80,
    },
});

export default AndroidWidgets;




