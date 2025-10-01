import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AndroidWidgetsProps {
    navigation: any;
}

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
        Alert.alert('Widget Added!', 'Widget has been added to your home screen');
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
            gradient: ['#3B82F6', '#1D4ED8'],
            icon: 'calendar',
            description: 'Quick access to family events and voting'
        },
        {
            id: 'goals',
            title: 'Goals Progress',
            size: '4x1',
            color: '#F59E0B',
            gradient: ['#F59E0B', '#D97706'],
            icon: 'trophy',
            description: 'Track family goal progress at a glance'
        },
        {
            id: 'safe-room',
            title: 'Safe Room Alert',
            size: '2x2',
            color: '#EC4899',
            gradient: ['#EC4899', '#DB2777'],
            icon: 'heart',
            description: 'Get notified when family needs emotional support'
        }
    ];

    const renderTasksWidget = () => (
        <View style={styles.widgetPreview}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.widgetGradient}>
                <View style={styles.widgetHeader}>
                    <Text style={styles.widgetTitle}>Today's Tasks</Text>
                    <View style={styles.progressBadge}>
                        <Text style={styles.progressText}>6/8</Text>
                    </View>
                </View>

                <View style={styles.taskList}>
                    <View style={styles.taskItem}>
                        <View style={styles.taskCheckbox}>
                            <Ionicons name="checkmark" size={12} color="#10B981" />
                        </View>
                        <View style={styles.memberAvatar}>
                            <Text style={styles.avatarText}>👩</Text>
                        </View>
                        <Text style={styles.taskText}>Clean bedroom</Text>
                    </View>

                    <View style={styles.taskItem}>
                        <View style={styles.taskCheckboxEmpty} />
                        <View style={styles.memberAvatar}>
                            <Text style={styles.avatarText}>👦</Text>
                        </View>
                        <Text style={styles.taskText}>Math homework</Text>
                        <TouchableOpacity style={styles.playButton}>
                            <Ionicons name="play" size={12} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    const renderPenaltyWidget = () => (
        <View style={styles.widgetPreview}>
            <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.widgetGradient}>
                <View style={styles.penaltyHeader}>
                    <View style={styles.memberAvatar}>
                        <Text style={styles.avatarText}>👦</Text>
                    </View>
                    <View style={styles.penaltyInfo}>
                        <Text style={styles.penaltyName}>Jake</Text>
                        <Text style={styles.penaltyType}>No tablet</Text>
                    </View>
                </View>

                <View style={styles.timerSection}>
                    <Text style={styles.timerText}>15:42</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '75%' }]} />
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    const renderActivitiesWidget = () => (
        <View style={styles.widgetPreview}>
            <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.widgetGradient}>
                <View style={styles.widgetHeader}>
                    <Text style={styles.widgetTitle}>This Week</Text>
                    <Ionicons name="calendar" size={16} color="white" />
                </View>

                <View style={styles.activityList}>
                    <View style={styles.activityItem}>
                        <View style={styles.activityIcon}>
                            <Ionicons name="film" size={12} color="white" />
                        </View>
                        <View style={styles.activityInfo}>
                            <Text style={styles.activityTitle}>Movie Night</Text>
                            <Text style={styles.activityTime}>Fri 7PM</Text>
                        </View>
                        <TouchableOpacity style={styles.voteButton}>
                            <Text style={styles.voteText}>Vote</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.activityItem}>
                        <View style={styles.activityIcon}>
                            <Ionicons name="gift" size={12} color="white" />
                        </View>
                        <View style={styles.activityInfo}>
                            <Text style={styles.activityTitle}>Emma's Party</Text>
                            <Text style={styles.activityTime}>Sat 2PM</Text>
                        </View>
                        <View style={styles.confirmedIcon}>
                            <Ionicons name="checkmark" size={12} color="white" />
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    const renderGoalsWidget = () => (
        <View style={styles.widgetPreview}>
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.widgetGradient}>
                <View style={styles.goalHeader}>
                    <View style={styles.goalInfo}>
                        <Text style={styles.goalTitle}>Disney World Trip</Text>
                        <Text style={styles.goalAmount}>$2,400 / $5,000</Text>
                    </View>
                    <Ionicons name="trophy" size={20} color="white" />
                </View>

                <View style={styles.goalProgress}>
                    <View style={styles.goalProgressBar}>
                        <View style={[styles.goalProgressFill, { width: '48%' }]} />
                    </View>
                    <Text style={styles.goalProgressText}>48% complete</Text>
                </View>
            </LinearGradient>
        </View>
    );

    const renderSafeRoomWidget = () => (
        <View style={styles.widgetPreview}>
            <LinearGradient colors={['#EC4899', '#DB2777']} style={styles.widgetGradient}>
                <View style={styles.safeRoomHeader}>
                    <Text style={styles.widgetTitle}>Safe Room</Text>
                    <View style={styles.notificationIcon}>
                        <Ionicons name="heart" size={20} color="white" />
                        <View style={styles.notificationDot} />
                    </View>
                </View>

                <View style={styles.safeRoomContent}>
                    <View style={styles.messageHeader}>
                        <View style={styles.memberAvatar}>
                            <Text style={styles.avatarText}>👧</Text>
                        </View>
                        <Text style={styles.messageAuthor}>Emma shared</Text>
                    </View>
                    <Text style={styles.messageTime}>New message • 5 min ago</Text>
                    <TouchableOpacity style={styles.readButton}>
                        <Text style={styles.readButtonText}>Read</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );

    const renderWidgetPreview = (widget: any) => {
        switch (widget.id) {
            case 'tasks':
                return renderTasksWidget();
            case 'penalty':
                return renderPenaltyWidget();
            case 'activities':
                return renderActivitiesWidget();
            case 'goals':
                return renderGoalsWidget();
            case 'safe-room':
                return renderSafeRoomWidget();
            default:
                return null;
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Android Widgets</Text>
                        <Text style={styles.headerSubtitle}>Home Screen Setup</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.headerButton}>
                            <Ionicons name="settings" size={16} color="white" />
                        </TouchableOpacity>
                        <View style={styles.userAvatar}>
                            <Text style={styles.userAvatarText}>M</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Widget Overview */}
            <View style={styles.overviewSection}>
                <View style={styles.overviewCard}>
                    <View style={styles.overviewHeader}>
                        <Text style={styles.overviewTitle}>Available Widgets</Text>
                        <View style={styles.widgetCountBadge}>
                            <Text style={styles.widgetCountText}>5 widgets</Text>
                        </View>
                    </View>
                    <Text style={styles.overviewDescription}>
                        Add these widgets to your Android home screen for quick family updates
                    </Text>

                    <View style={styles.widgetGrid}>
                        {widgets.slice(0, 4).map((widget) => (
                            <View key={widget.id} style={[styles.widgetCard, { backgroundColor: `${widget.color}15` }]}>
                                <View style={[styles.widgetIcon, { backgroundColor: widget.color }]}>
                                    <Ionicons name={widget.icon as any} size={16} color="white" />
                                </View>
                                <Text style={styles.widgetCardTitle}>{widget.title}</Text>
                                <Text style={styles.widgetCardSize}>{widget.size} size</Text>
                            </View>
                        ))}
                    </View>

                    <View style={[styles.widgetCard, styles.safeRoomCard, { backgroundColor: '#EC489915' }]}>
                        <View style={styles.safeRoomCardContent}>
                            <View style={[styles.widgetIcon, { backgroundColor: '#EC4899' }]}>
                                <Ionicons name="heart" size={16} color="white" />
                            </View>
                            <View style={styles.safeRoomCardText}>
                                <Text style={styles.widgetCardTitle}>Safe Room Alert</Text>
                                <Text style={styles.widgetCardSize}>2x2 size • Shows new messages</Text>
                            </View>
                            <View style={styles.pulseDot} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Widget Previews */}
            {widgets.map((widget) => (
                <View key={widget.id} style={styles.widgetSection}>
                    <View style={styles.widgetSectionCard}>
                        <View style={styles.widgetSectionHeader}>
                            <Text style={styles.widgetSectionTitle}>{widget.title} ({widget.size})</Text>
                            <TouchableOpacity
                                style={[
                                    styles.addButton,
                                    { backgroundColor: installedWidgets.includes(widget.id) ? '#10B981' : widget.color }
                                ]}
                                onPress={() => handleAddWidget(widget.id)}
                            >
                                <Text style={styles.addButtonText}>
                                    {installedWidgets.includes(widget.id) ? 'Added!' : 'Add to Home'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {renderWidgetPreview(widget)}

                        <Text style={styles.widgetDescription}>{widget.description}</Text>
                    </View>
                </View>
            ))}

            {/* Setup Instructions */}
            <View style={styles.instructionsSection}>
                <LinearGradient
                    colors={['#7C3AED', '#4F46E5']}
                    style={styles.instructionsCard}
                >
                    <View style={styles.instructionsHeader}>
                        <View style={styles.instructionsIcon}>
                            <Ionicons name="phone-portrait" size={20} color="white" />
                        </View>
                        <View style={styles.instructionsTitleContainer}>
                            <Text style={styles.instructionsTitle}>Setup Instructions</Text>
                            <Text style={styles.instructionsSubtitle}>How to add widgets</Text>
                        </View>
                    </View>

                    <View style={styles.instructionsList}>
                        <View style={styles.instructionItem}>
                            <View style={styles.instructionNumber}>
                                <Text style={styles.instructionNumberText}>1</Text>
                            </View>
                            <Text style={styles.instructionText}>Long press on your Android home screen</Text>
                        </View>

                        <View style={styles.instructionItem}>
                            <View style={styles.instructionNumber}>
                                <Text style={styles.instructionNumberText}>2</Text>
                            </View>
                            <Text style={styles.instructionText}>Tap "Widgets" from the menu</Text>
                        </View>

                        <View style={styles.instructionItem}>
                            <View style={styles.instructionNumber}>
                                <Text style={styles.instructionNumberText}>3</Text>
                            </View>
                            <Text style={styles.instructionText}>Find "Family Dashboard" widgets</Text>
                        </View>

                        <View style={styles.instructionItem}>
                            <View style={styles.instructionNumber}>
                                <Text style={styles.instructionNumberText}>4</Text>
                            </View>
                            <Text style={styles.instructionText}>Drag and drop to your home screen</Text>
                        </View>
                    </View>
                </LinearGradient>
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
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatarText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    overviewSection: {
        paddingHorizontal: 20,
        marginTop: -20,
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    overviewTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    widgetCountBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    widgetCountText: {
        fontSize: 12,
        color: '#059669',
        fontWeight: '500',
    },
    overviewDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 16,
    },
    widgetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    widgetCard: {
        width: '48%',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    widgetIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    widgetCardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 2,
    },
    widgetCardSize: {
        fontSize: 10,
        color: '#6B7280',
    },
    safeRoomCard: {
        width: '100%',
    },
    safeRoomCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    safeRoomCardText: {
        flex: 1,
        marginLeft: 12,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EC4899',
    },
    widgetSection: {
        paddingHorizontal: 20,
        marginTop: 16,
    },
    widgetSectionCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    widgetSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    widgetSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    addButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    addButtonText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600',
    },
    widgetPreview: {
        marginBottom: 8,
    },
    widgetGradient: {
        borderRadius: 12,
        padding: 16,
    },
    widgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    widgetTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    progressBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    progressText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600',
    },
    taskList: {
        gap: 8,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 8,
        borderRadius: 8,
    },
    taskCheckbox: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    taskCheckboxEmpty: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginRight: 8,
    },
    memberAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    avatarText: {
        fontSize: 10,
    },
    taskText: {
        fontSize: 12,
        color: 'white',
        flex: 1,
    },
    playButton: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#F59E0B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    penaltyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    penaltyInfo: {
        marginLeft: 12,
    },
    penaltyName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    penaltyType: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    timerSection: {
        alignItems: 'center',
    },
    timerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 8,
        borderRadius: 8,
    },
    activityIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    activityTime: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    voteButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#F59E0B',
        borderRadius: 4,
    },
    voteText: {
        fontSize: 10,
        color: 'white',
        fontWeight: '600',
    },
    confirmedIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    goalInfo: {
        flex: 1,
    },
    goalTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    goalAmount: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    goalProgress: {
        marginTop: 8,
    },
    goalProgressBar: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 4,
    },
    goalProgressFill: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 4,
    },
    goalProgressText: {
        fontSize: 12,
        color: 'white',
    },
    safeRoomHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    notificationIcon: {
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
    },
    safeRoomContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 12,
        borderRadius: 8,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    messageAuthor: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
    messageTime: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 8,
    },
    readButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'white',
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    readButtonText: {
        fontSize: 12,
        color: '#EC4899',
        fontWeight: '600',
    },
    widgetDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
    },
    instructionsSection: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 80,
    },
    instructionsCard: {
        borderRadius: 16,
        padding: 20,
    },
    instructionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    instructionsIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    instructionsTitleContainer: {
        flex: 1,
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 2,
    },
    instructionsSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    instructionsList: {
        gap: 12,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    instructionNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    instructionNumberText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
    },
    instructionText: {
        fontSize: 14,
        color: 'white',
        flex: 1,
        lineHeight: 20,
    },
    bottomSpacing: {
        height: 40,
    },
});

export default AndroidWidgets;
