import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const TaskDetailsScreen = () => {
    const [taskStarted, setTaskStarted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const taskInfo = {
        title: 'Math Homework',
        assignedTo: 'Jake',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        priority: 'High Priority',
        priorityColor: '#F59E0B',
        dueTime: 'Due in 3h',
        dueColor: '#EF4444',
        assignedTime: '2h ago',
        dueTimeSpecific: '6:00 PM',
        points: '+15 ⭐',
        pointsColor: '#F59E0B'
    };

    const instructions = [
        'Complete pages 42-45 in your math workbook',
        'Show all your work for word problems',
        'Check your answers using the answer key'
    ];

    const attachments = [
        {
            id: '1',
            title: 'Math Tutorial Video',
            description: 'How to solve word problems • 3:42',
            type: 'video',
            icon: 'play',
            color: '#3B82F6',
            bgColor: '#EBF8FF'
        },
        {
            id: '2',
            title: 'Example Problems',
            description: 'Reference sheet with examples',
            type: 'image',
            icon: 'image',
            color: '#10B981',
            bgColor: '#F0FDF4'
        }
    ];

    const parentNote = {
        author: 'Mom',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
        message: '"Jake, remember to take your time with the word problems. If you need help, just ask! 💪"',
        time: '2 hours ago'
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (taskStarted && !isCompleted && progress < 100) {
            interval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + Math.random() * 10;
                    return newProgress > 100 ? 100 : newProgress;
                });
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [taskStarted, isCompleted]);

    const handleStartTask = () => {
        if (!taskStarted) {
            setTaskStarted(true);
        } else {
            setTaskStarted(false);
        }
    };

    const handleMarkComplete = () => {
        if (taskStarted) {
            setProgress(100);
            setIsCompleted(true);
            Alert.alert('Great job Jake!', 'You earned 15 stars! ⭐⭐⭐');
        }
    };

    const handleNeedHelp = () => {
        Alert.alert('Help Request', 'Help request sent to Mom and Dad! 💬');
    };

    const handleMoreTime = () => {
        Alert.alert('Time Extension', 'Time extension request sent! ⏰');
    };

    const handleAttachmentPress = (attachment: any) => {
        Alert.alert('Attachment', `Opening ${attachment.title}`);
    };

    const stepsCompleted = Math.floor(progress / 33.33);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Task Details</Text>
                        <Text style={styles.headerSubtitle}>Jake's Homework</Text>
                    </View>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="ellipsis-vertical" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Task Info Card */}
            <View style={styles.taskInfoSection}>
                <View style={styles.card}>
                    <View style={styles.taskInfoHeader}>
                        <Image source={{ uri: taskInfo.avatar }} style={styles.taskAvatar} />
                        <View style={styles.taskInfoContent}>
                            <Text style={styles.taskTitle}>{taskInfo.title}</Text>
                            <Text style={styles.taskAssignedTo}>Assigned to {taskInfo.assignedTo}</Text>
                            <View style={styles.taskBadges}>
                                <View style={[styles.priorityBadge, { backgroundColor: `${taskInfo.priorityColor}20` }]}>
                                    <Text style={[styles.priorityBadgeText, { color: taskInfo.priorityColor }]}>
                                        {taskInfo.priority}
                                    </Text>
                                </View>
                                <View style={[styles.dueBadge, { backgroundColor: '#FEF2F2' }]}>
                                    <Text style={[styles.dueBadgeText, { color: taskInfo.dueColor }]}>
                                        {taskInfo.dueTime}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.taskStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Assigned</Text>
                            <Text style={styles.statValue}>{taskInfo.assignedTime}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Due Time</Text>
                            <Text style={styles.statValue}>{taskInfo.dueTimeSpecific}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Points</Text>
                            <Text style={[styles.statValue, { color: taskInfo.pointsColor }]}>
                                {taskInfo.points}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsSection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="list" size={20} color="#10B981" />
                        <Text style={styles.sectionTitle}>Instructions</Text>
                    </View>
                    <View style={styles.instructionsList}>
                        {instructions.map((instruction, index) => (
                            <View key={index} style={styles.instructionItem}>
                                <View style={styles.instructionNumber}>
                                    <Text style={styles.instructionNumberText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.instructionText}>{instruction}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Attachments */}
            <View style={styles.attachmentsSection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="attach" size={20} color="#3B82F6" />
                        <Text style={styles.sectionTitle}>Attachments</Text>
                    </View>
                    <View style={styles.attachmentsList}>
                        {attachments.map(attachment => (
                            <TouchableOpacity
                                key={attachment.id}
                                style={[styles.attachmentItem, { backgroundColor: attachment.bgColor }]}
                                onPress={() => handleAttachmentPress(attachment)}
                            >
                                <View style={[styles.attachmentIcon, { backgroundColor: attachment.color }]}>
                                    <Ionicons name={attachment.icon as any} size={20} color="white" />
                                </View>
                                <View style={styles.attachmentContent}>
                                    <Text style={styles.attachmentTitle}>{attachment.title}</Text>
                                    <Text style={styles.attachmentDescription}>{attachment.description}</Text>
                                </View>
                                <TouchableOpacity style={[styles.attachmentButton, { backgroundColor: attachment.color }]}>
                                    <Ionicons name={attachment.icon as any} size={12} color="white" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Progress Tracker */}
            <View style={styles.progressSection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="trending-up" size={20} color="#F59E0B" />
                        <Text style={styles.sectionTitle}>Progress</Text>
                    </View>
                    <View style={styles.progressContent}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Task Completion</Text>
                            <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                        <View style={styles.progressStats}>
                            <View style={styles.progressStatItem}>
                                <Text style={styles.progressStatValue}>{stepsCompleted}</Text>
                                <Text style={styles.progressStatLabel}>Steps Completed</Text>
                            </View>
                            <View style={styles.progressStatItem}>
                                <Text style={[styles.progressStatValue, { color: '#F59E0B' }]}>15</Text>
                                <Text style={styles.progressStatLabel}>Points to Earn</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Parent Notes */}
            <View style={styles.parentNotesSection}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="chatbubbles" size={20} color="#EC4899" />
                        <Text style={styles.sectionTitle}>Parent Notes</Text>
                    </View>
                    <View style={styles.parentNoteCard}>
                        <Image source={{ uri: parentNote.avatar }} style={styles.parentAvatar} />
                        <View style={styles.parentNoteContent}>
                            <Text style={styles.parentName}>{parentNote.author}</Text>
                            <Text style={styles.parentMessage}>{parentNote.message}</Text>
                            <Text style={styles.parentTime}>{parentNote.time}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsSection}>
                <TouchableOpacity
                    style={[
                        styles.startButton,
                        taskStarted && !isCompleted && styles.pauseButton,
                        isCompleted && styles.completedButton
                    ]}
                    onPress={handleStartTask}
                    disabled={isCompleted}
                >
                    <LinearGradient
                        colors={isCompleted ? ['#10B981', '#059669'] : taskStarted ? ['#F59E0B', '#EA580C'] : ['#10B981', '#059669']}
                        style={styles.startButtonGradient}
                    >
                        <Ionicons
                            name={isCompleted ? "checkmark" : taskStarted ? "pause" : "play"}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.startButtonText}>
                            {isCompleted ? 'Task Completed' : taskStarted ? 'Pause Task' : 'Start Task'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.secondaryButtons}>
                    <TouchableOpacity style={styles.helpButton} onPress={handleNeedHelp}>
                        <Ionicons name="help-circle" size={20} color="#3B82F6" />
                        <Text style={styles.helpButtonText}>Need Help</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.timeButton} onPress={handleMoreTime}>
                        <Ionicons name="time" size={20} color="#F59E0B" />
                        <Text style={styles.timeButtonText}>More Time</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.completeButton, (!taskStarted || isCompleted) && styles.completeButtonDisabled]}
                    onPress={handleMarkComplete}
                    disabled={!taskStarted || isCompleted}
                >
                    <LinearGradient
                        colors={isCompleted ? ['#10B981', '#059669'] : ['#F59E0B', '#EA580C']}
                        style={styles.completeButtonGradient}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="white" />
                        <Text style={styles.completeButtonText}>
                            {isCompleted ? 'Completed! 🎉' : 'Mark as Complete'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Bottom spacing for navigation */}
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
        paddingHorizontal: 16,
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
    headerButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        alignItems: 'center',
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
    taskInfoSection: {
        paddingHorizontal: 16,
        marginTop: -8,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    taskInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    taskAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 4,
        borderColor: 'rgba(245, 158, 11, 0.2)',
        marginRight: 12,
    },
    taskInfoContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    taskAssignedTo: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    taskBadges: {
        flexDirection: 'row',
        gap: 8,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityBadgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    dueBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    dueBadgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    taskStats: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    instructionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 8,
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
        backgroundColor: '#10B981',
        borderRadius: 12,
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
        color: '#374151',
        flex: 1,
        lineHeight: 20,
    },
    attachmentsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    attachmentsList: {
        gap: 12,
    },
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
    },
    attachmentIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    attachmentContent: {
        flex: 1,
    },
    attachmentTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 2,
    },
    attachmentDescription: {
        fontSize: 12,
        color: '#6B7280',
    },
    attachmentButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    progressContent: {
        gap: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    progressPercentage: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F59E0B',
    },
    progressBar: {
        width: '100%',
        height: 12,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#F59E0B',
        borderRadius: 6,
    },
    progressStats: {
        flexDirection: 'row',
        gap: 16,
    },
    progressStatItem: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    progressStatValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    progressStatLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    parentNotesSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    parentNoteCard: {
        backgroundColor: '#FDF2F8',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#EC4899',
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    parentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    parentNoteContent: {
        flex: 1,
    },
    parentName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 4,
    },
    parentMessage: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
        lineHeight: 20,
    },
    parentTime: {
        fontSize: 12,
        color: '#6B7280',
    },
    actionButtonsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 80,
        gap: 12,
    },
    startButton: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    startButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    startButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    pauseButton: {
        // Additional styles for pause state
    },
    completedButton: {
        // Additional styles for completed state
    },
    secondaryButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    helpButton: {
        flex: 1,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#3B82F6',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    helpButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3B82F6',
    },
    timeButton: {
        flex: 1,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#F59E0B',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    timeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F59E0B',
    },
    completeButton: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    completeButtonDisabled: {
        opacity: 0.5,
    },
    completeButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    completeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    bottomSpacing: {
        height: 80,
    },
});

export default TaskDetailsScreen;




