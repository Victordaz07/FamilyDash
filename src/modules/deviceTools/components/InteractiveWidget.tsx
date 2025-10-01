import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface InteractiveWidgetProps {
    type: 'tasks' | 'penalty' | 'activities' | 'goals' | 'safe-room';
    size?: 'small' | 'medium' | 'large';
    onPress?: () => void;
}

const InteractiveWidget: React.FC<InteractiveWidgetProps> = ({ type, size = 'medium', onPress }) => {
    const [pulseAnim] = useState(new Animated.Value(1));
    const [taskCompleted, setTaskCompleted] = useState(false);

    useEffect(() => {
        if (type === 'penalty') {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, [type]);

    const getWidgetConfig = () => {
        switch (type) {
            case 'tasks':
                return {
                    gradient: ['#10B981', '#059669'],
                    icon: 'checkmark-circle',
                    title: 'Tasks',
                    size: size === 'small' ? 80 : size === 'large' ? 120 : 100,
                };
            case 'penalty':
                return {
                    gradient: ['#EF4444', '#DC2626'],
                    icon: 'hourglass',
                    title: 'Penalty',
                    size: size === 'small' ? 80 : size === 'large' ? 120 : 100,
                };
            case 'activities':
                return {
                    gradient: ['#3B82F6', '#2563EB'],
                    icon: 'calendar',
                    title: 'Events',
                    size: size === 'small' ? 80 : size === 'large' ? 120 : 100,
                };
            case 'goals':
                return {
                    gradient: ['#F59E0B', '#D97706'],
                    icon: 'trophy',
                    title: 'Goals',
                    size: size === 'small' ? 80 : size === 'large' ? 120 : 100,
                };
            case 'safe-room':
                return {
                    gradient: ['#EC4899', '#DB2777'],
                    icon: 'heart',
                    title: 'Safe Room',
                    size: size === 'small' ? 80 : size === 'large' ? 120 : 100,
                };
            default:
                return {
                    gradient: ['#6B7280', '#4B5563'],
                    icon: 'square',
                    title: 'Widget',
                    size: 100,
                };
        }
    };

    const config = getWidgetConfig();

    const renderWidgetContent = () => {
        switch (type) {
            case 'tasks':
                return (
                    <View style={styles.widgetContent}>
                        <View style={styles.widgetHeader}>
                            <Ionicons name={config.icon} size={16} color="white" />
                            <Text style={styles.widgetTitle}>Tasks</Text>
                        </View>
                        <View style={styles.taskList}>
                            <TouchableOpacity
                                style={styles.taskItem}
                                onPress={() => setTaskCompleted(!taskCompleted)}
                            >
                                <View style={[styles.taskDot, { backgroundColor: taskCompleted ? '#10B981' : '#F59E0B' }]} />
                                <Text style={[styles.taskText, taskCompleted && styles.completedTask]}>
                                    Clean room
                                </Text>
                                {taskCompleted && <Ionicons name="checkmark" size={12} color="#10B981" />}
                            </TouchableOpacity>
                            <View style={styles.taskItem}>
                                <View style={[styles.taskDot, { backgroundColor: '#EF4444' }]} />
                                <Text style={styles.taskText}>Homework</Text>
                            </View>
                        </View>
                        <Text style={styles.widgetFooter}>2 of 3 done</Text>
                    </View>
                );

            case 'penalty':
                return (
                    <Animated.View style={[styles.widgetContent, { transform: [{ scale: pulseAnim }] }]}>
                        <View style={styles.widgetHeader}>
                            <Ionicons name={config.icon} size={16} color="white" />
                            <Text style={styles.widgetTitle}>Penalty</Text>
                        </View>
                        <View style={styles.penaltyContent}>
                            <View style={styles.memberInfo}>
                                <View style={styles.memberAvatar} />
                                <Text style={styles.memberName}>Emma</Text>
                            </View>
                            <Text style={styles.timerText}>12:34</Text>
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
                            <Ionicons name={config.icon} size={16} color="white" />
                            <Text style={styles.widgetTitle}>Events</Text>
                        </View>
                        <View style={styles.activityList}>
                            <View style={styles.activityItem}>
                                <View style={[styles.activityDot, { backgroundColor: '#3B82F6' }]} />
                                <Text style={styles.activityText}>Movie Night</Text>
                                <Text style={styles.activityTime}>7PM</Text>
                            </View>
                            <View style={styles.activityItem}>
                                <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
                                <Text style={styles.activityText}>Dinner</Text>
                                <Text style={styles.activityTime}>6PM</Text>
                            </View>
                        </View>
                    </View>
                );

            case 'goals':
                return (
                    <View style={styles.widgetContent}>
                        <View style={styles.widgetHeader}>
                            <Ionicons name={config.icon} size={16} color="white" />
                            <Text style={styles.widgetTitle}>Goals</Text>
                        </View>
                        <View style={styles.goalContent}>
                            <Text style={styles.goalTitle}>Reading</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: '60%', backgroundColor: '#F59E0B' }]} />
                            </View>
                            <Text style={styles.progressText}>12/20</Text>
                        </View>
                    </View>
                );

            case 'safe-room':
                return (
                    <View style={styles.widgetContent}>
                        <View style={styles.widgetHeader}>
                            <Ionicons name={config.icon} size={16} color="white" />
                            <Text style={styles.widgetTitle}>Safe Room</Text>
                        </View>
                        <View style={styles.safeRoomContent}>
                            <Text style={styles.safeRoomMessage}>"Feeling overwhelmed"</Text>
                            <View style={styles.memberInfo}>
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
                        <Text style={styles.widgetTitle}>{config.title}</Text>
                    </View>
                );
        }
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <Animated.View style={[styles.widgetContainer, { width: config.size, height: config.size }]}>
                <LinearGradient colors={config.gradient} style={styles.widgetGradient}>
                    {renderWidgetContent()}
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    widgetContainer: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    widgetGradient: {
        flex: 1,
        borderRadius: 16,
        padding: 12,
        justifyContent: 'space-between',
    },
    widgetContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    widgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    widgetTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
        marginLeft: 6,
    },
    taskList: {
        gap: 6,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    taskDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    taskText: {
        flex: 1,
        fontSize: 10,
        color: 'white',
    },
    completedTask: {
        textDecorationLine: 'line-through',
        opacity: 0.7,
    },
    widgetFooter: {
        fontSize: 8,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    penaltyContent: {
        alignItems: 'center',
        gap: 6,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    memberAvatar: {
        width: 16,
        height: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 8,
    },
    memberName: {
        fontSize: 10,
        fontWeight: '600',
        color: 'white',
    },
    timerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    progressBar: {
        width: '100%',
        height: 3,
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
        gap: 6,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    activityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    activityText: {
        flex: 1,
        fontSize: 10,
        color: 'white',
    },
    activityTime: {
        fontSize: 8,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    goalContent: {
        alignItems: 'center',
        gap: 6,
    },
    goalTitle: {
        fontSize: 10,
        fontWeight: '600',
        color: 'white',
    },
    progressText: {
        fontSize: 8,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    safeRoomContent: {
        alignItems: 'center',
        gap: 6,
    },
    safeRoomMessage: {
        fontSize: 8,
        color: 'white',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    supportButtons: {
        flexDirection: 'row',
        gap: 6,
    },
    supportButton: {
        width: 16,
        height: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default InteractiveWidget;
