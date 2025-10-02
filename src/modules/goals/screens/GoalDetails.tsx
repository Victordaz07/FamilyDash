import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGoalsStore } from '../store/goalsStore';
import { Goal } from '../types/goalTypes';
import { goalCategories, mockFamilyMembers } from '../mock/goalsData';
import { theme } from '../../../styles/simpleTheme';

interface GoalDetailsProps {
    navigation: any;
    route: { params: { goalId: string } };
}

const GoalDetails: React.FC<GoalDetailsProps> = ({ navigation, route }) => {
    const { goalId } = route.params;
    const insets = useSafeAreaInsets();
    const { getGoalById, completeMilestone, addNote, extendDueDate, completeGoal } = useGoalsStore();

    const goal = getGoalById(goalId);
    const [newNote, setNewNote] = useState('');
    const [showNoteInput, setShowNoteInput] = useState(false);

    const categoryConfig = goal ? goalCategories.find(c => c.id === goal.category) : undefined;
    const categoryColor = categoryConfig?.color || theme.colors.primary;
    const categoryGradient = categoryConfig?.gradient || [theme.colors.primary, theme.colors.primaryDark];

    const handleCompleteMilestone = useCallback(() => {
        if (goal && goal.completedMilestones < goal.milestones) {
            completeMilestone(goalId, goal.completedMilestones);
            Alert.alert('Milestone Completed!', 'Great job! Keep up the good work! 🎉');
        }
    }, [goal, goalId, completeMilestone]);

    const handleCompleteGoal = useCallback(() => {
        Alert.alert(
            'Complete Goal',
            'Are you sure you want to mark this goal as completed?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Complete',
                    onPress: () => {
                        completeGoal(goalId);
                        Alert.alert('Goal Completed!', 'Congratulations! 🎉🎊');
                        navigation.goBack();
                    }
                }
            ]
        );
    }, [goalId, completeGoal, navigation]);

    const handleAddNote = useCallback(() => {
        if (newNote.trim()) {
            addNote(goalId, newNote.trim());
            setNewNote('');
            setShowNoteInput(false);
            Alert.alert('Note Added', 'Your note has been saved!');
        }
    }, [goalId, newNote, addNote]);

    const handleExtendDueDate = useCallback(() => {
        Alert.prompt(
            'Extend Due Date',
            'Enter new due date (YYYY-MM-DD):',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Extend',
                    onPress: (newDate?: string) => {
                        if (newDate && newDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            extendDueDate(goalId, newDate);
                            Alert.alert('Due Date Extended', 'The due date has been updated!');
                        } else {
                            Alert.alert('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format');
                        }
                    }
                }
            ],
            'plain-text',
            goal?.dueDate || ''
        );
    }, [goalId, goal?.dueDate, extendDueDate]);

    const getDaysRemaining = () => {
        if (!goal) return '';
        const today = new Date();
        const dueDate = new Date(goal.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Due today';
        if (diffDays === 1) return '1 day left';
        return `${diffDays} days left`;
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return '#EF4444';
            case 'medium': return '#F59E0B';
            case 'low': return '#10B981';
            default: return theme.colors.gray;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#10B981';
            case 'overdue': return '#EF4444';
            case 'active': return categoryColor;
            default: return theme.colors.gray;
        }
    };

    const renderMilestones = () => {
        if (!goal) return null;
        const milestoneDots = [];
        for (let i = 0; i < goal.milestones; i++) {
            const isCompleted = i < goal.completedMilestones;
            milestoneDots.push(
                <View
                    key={i}
                    style={[
                        styles.milestoneDot,
                        {
                            backgroundColor: isCompleted ? categoryColor : theme.colors.border,
                        },
                    ]}
                />
            );
        }
        return milestoneDots;
    };

    const renderAssignedMembers = () => {
        if (!goal) return null;

        if (goal.assignedTo.includes('all')) {
            return (
                <View style={styles.memberContainer}>
                    <Text style={styles.memberLabel}>Assigned to:</Text>
                    <Text style={styles.memberText}>👨‍👩‍👧‍👦 All Family</Text>
                </View>
            );
        }

        return (
            <View style={styles.memberContainer}>
                <Text style={styles.memberLabel}>Assigned to:</Text>
                <View style={styles.membersList}>
                    {goal.assignedTo.map((memberId) => {
                        const member = mockFamilyMembers.find(m => m.id === memberId);
                        return member ? (
                            <View key={memberId} style={styles.memberItem}>
                                <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                                <Text style={styles.memberName}>{member.name}</Text>
                            </View>
                        ) : null;
                    })}
                </View>
            </View>
        );
    };

    const renderHistory = () => {
        if (!goal?.history || goal.history.length === 0) return null;

        return (
            <View style={styles.historySection}>
                <Text style={styles.sectionTitle}>📈 Progress History</Text>
                {goal.history.map((entry) => (
                    <View key={entry.id} style={styles.historyItem}>
                        <View style={styles.historyIcon}>
                            <Ionicons
                                name={
                                    entry.action === 'milestone_completed' ? 'checkmark-circle' :
                                        entry.action === 'goal_completed' ? 'trophy' :
                                            entry.action === 'note_added' ? 'chatbubble' :
                                                'calendar'
                                }
                                size={20}
                                color={categoryColor}
                            />
                        </View>
                        <View style={styles.historyContent}>
                            <Text style={styles.historyDescription}>{entry.description}</Text>
                            <Text style={styles.historyDate}>{entry.date}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    if (!goal) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Text style={styles.errorText}>Goal not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={categoryGradient as [string, string]}
                style={[styles.header, { paddingTop: insets.top + 20 }]}
            >
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Goal Details</Text>
                <View style={{ width: 24 }} />
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Goal Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.goalHeader}>
                        <View style={[styles.categoryIcon, { backgroundColor: categoryColor + '20' }]}>
                            <Text style={styles.categoryEmoji}>{categoryConfig?.emoji}</Text>
                        </View>
                        <View style={styles.goalInfo}>
                            <Text style={styles.goalTitle}>{goal.title}</Text>
                            <Text style={styles.goalCategory}>{categoryConfig?.name} • {getDaysRemaining()}</Text>
                        </View>
                    </View>

                    {goal.description && (
                        <Text style={styles.goalDescription}>{goal.description}</Text>
                    )}

                    {/* Status and Priority */}
                    <View style={styles.badgesContainer}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(goal.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(goal.status) }]}>
                                {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                            </Text>
                        </View>
                        {goal.priority && (
                            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(goal.priority) + '20' }]}>
                                <Text style={[styles.priorityText, { color: getPriorityColor(goal.priority) }]}>
                                    {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Assigned Members */}
                    {renderAssignedMembers()}

                    {/* Progress */}
                    <View style={styles.progressSection}>
                        <Text style={styles.sectionTitle}>Progress</Text>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Milestones</Text>
                                <Text style={[styles.progressText, { color: categoryColor }]}>
                                    {goal.completedMilestones}/{goal.milestones}
                                </Text>
                            </View>
                            <View style={styles.progressBar}>
                                <LinearGradient
                                    colors={categoryGradient as [string, string]}
                                    style={[styles.progressFill, { width: `${goal.progress}%` }]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                />
                            </View>
                            <View style={styles.milestonesContainer}>
                                {renderMilestones()}
                            </View>
                        </View>
                    </View>

                    {/* Reward */}
                    {goal.reward && (
                        <View style={styles.rewardSection}>
                            <Text style={styles.sectionTitle}>🎁 Reward</Text>
                            <Text style={[styles.rewardText, { color: categoryColor }]}>{goal.reward}</Text>
                        </View>
                    )}
                </View>

                {/* Notes Section */}
                <View style={styles.notesSection}>
                    <View style={styles.notesHeader}>
                        <Text style={styles.sectionTitle}>📝 Notes</Text>
                        <TouchableOpacity
                            style={styles.addNoteButton}
                            onPress={() => setShowNoteInput(!showNoteInput)}
                        >
                            <Ionicons name="add" size={20} color={categoryColor} />
                        </TouchableOpacity>
                    </View>

                    {showNoteInput && (
                        <View style={styles.noteInputContainer}>
                            <TextInput
                                style={styles.noteInput}
                                placeholder="Add a note..."
                                multiline
                                numberOfLines={3}
                                value={newNote}
                                onChangeText={setNewNote}
                            />
                            <View style={styles.noteInputActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setShowNoteInput(false);
                                        setNewNote('');
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.saveButton, { backgroundColor: categoryColor }]}
                                    onPress={handleAddNote}
                                >
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {goal.notes && goal.notes.length > 0 ? (
                        goal.notes.map((note, index) => (
                            <View key={index} style={styles.noteItem}>
                                <Text style={styles.noteText}>{note}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noNotesText}>No notes yet. Add one above!</Text>
                    )}
                </View>

                {/* History */}
                {renderHistory()}

                {/* Actions */}
                <View style={styles.actionsSection}>
                    <Text style={styles.sectionTitle}>Actions</Text>
                    <View style={styles.actionsContainer}>
                        {goal.status === 'active' && goal.completedMilestones < goal.milestones && (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleCompleteMilestone}
                            >
                                <LinearGradient
                                    colors={categoryGradient as [string, string]}
                                    style={styles.actionButtonGradient}
                                >
                                    <Ionicons name="checkmark-circle" size={20} color="white" />
                                    <Text style={styles.actionButtonText}>Mark Milestone</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {goal.status === 'active' && goal.progress === 100 && (
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleCompleteGoal}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#059669'] as [string, string]}
                                    style={styles.actionButtonGradient}
                                >
                                    <Ionicons name="trophy" size={20} color="white" />
                                    <Text style={styles.actionButtonText}>Complete Goal</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleExtendDueDate}
                        >
                            <LinearGradient
                                colors={['#3B82F6', '#2563EB'] as [string, string]}
                                style={styles.actionButtonGradient}
                            >
                                <Ionicons name="calendar" size={20} color="white" />
                                <Text style={styles.actionButtonText}>Extend Due Date</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: insets.bottom + 20 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEF3C7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginTop: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    categoryEmoji: {
        fontSize: 28,
    },
    goalInfo: {
        flex: 1,
    },
    goalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    goalCategory: {
        fontSize: 16,
        color: theme.colors.gray,
    },
    goalDescription: {
        fontSize: 16,
        color: theme.colors.text,
        lineHeight: 24,
        marginBottom: 16,
    },
    badgesContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    priorityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '600',
    },
    memberContainer: {
        marginBottom: 20,
    },
    memberLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 8,
    },
    memberText: {
        fontSize: 16,
        color: theme.colors.gray,
    },
    membersList: {
        flexDirection: 'row',
        gap: 12,
    },
    memberItem: {
        alignItems: 'center',
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: 4,
    },
    memberName: {
        fontSize: 12,
        color: theme.colors.gray,
    },
    progressSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 12,
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 16,
        color: theme.colors.gray,
    },
    progressText: {
        fontSize: 16,
        fontWeight: '600',
    },
    progressBar: {
        height: 12,
        backgroundColor: theme.colors.border,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        borderRadius: 6,
    },
    milestonesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 4,
    },
    milestoneDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        flex: 1,
    },
    rewardSection: {
        marginBottom: 20,
    },
    rewardText: {
        fontSize: 16,
        fontWeight: '600',
    },
    notesSection: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    notesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addNoteButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noteInputContainer: {
        marginBottom: 16,
    },
    noteInput: {
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: theme.colors.text,
        backgroundColor: theme.colors.background,
        textAlignVertical: 'top',
        minHeight: 80,
        marginBottom: 12,
    },
    noteInputActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    noteItem: {
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    noteText: {
        fontSize: 16,
        color: theme.colors.text,
        lineHeight: 22,
    },
    noNotesText: {
        fontSize: 16,
        color: theme.colors.gray,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    historySection: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    historyContent: {
        flex: 1,
    },
    historyDescription: {
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: 2,
    },
    historyDate: {
        fontSize: 12,
        color: theme.colors.gray,
    },
    actionsSection: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    actionsContainer: {
        gap: 12,
    },
    actionButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    actionButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
    errorText: {
        fontSize: 18,
        color: theme.colors.error,
        textAlign: 'center',
        marginTop: 50,
    },
    backButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: theme.colors.text,
    },
});

export default GoalDetails;
