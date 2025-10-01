import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface TaskItemProps {
    task: {
        id: string;
        title: string;
        assignedTo: string;
        status: string;
        priority: string;
        dueDate: string;
        estimatedTime: string;
        actualTime?: string;
        difficulty: string;
        progress: number;
        avatar: string;
        category: string;
        description: string;
        tags: string[];
        completedAt?: string;
        createdAt: string;
        updatedAt: string;
    };
    onPress: (taskId: string) => void;
    onAction: (taskId: string, action: string) => void;
    viewMode: 'grid' | 'list';
}

const TaskItem: React.FC<TaskItemProps> = memo(({ task, onPress, onAction, viewMode }) => {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return '#EF4444';
            case 'Medium': return '#F59E0B';
            case 'Low': return '#10B981';
            default: return '#6B7280';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#10B981';
            case 'in_progress': return '#3B82F6';
            case 'pending': return '#F59E0B';
            default: return '#6B7280';
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return '#10B981';
            case 'Medium': return '#F59E0B';
            case 'Hard': return '#EF4444';
            default: return '#6B7280';
        }
    };

    if (viewMode === 'grid') {
        return (
            <TouchableOpacity
                style={styles.gridItem}
                onPress={() => onPress(task.id)}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#FFFFFF', '#F8FAFC']}
                    style={styles.gridGradient}
                >
                    <View style={styles.gridHeader}>
                        <View style={styles.gridAvatarContainer}>
                            <Image source={{ uri: task.avatar }} style={styles.gridAvatar} />
                            <View style={[styles.gridStatusDot, { backgroundColor: getStatusColor(task.status) }]} />
                        </View>
                        <View style={styles.gridPriorityBadge}>
                            <View style={[styles.gridPriorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                        </View>
                    </View>

                    <View style={styles.gridContent}>
                        <Text style={styles.gridTitle} numberOfLines={2}>{task.title}</Text>
                        <Text style={styles.gridAssignee}>Assigned to {task.assignedTo}</Text>

                        <View style={styles.gridProgressContainer}>
                            <View style={styles.gridProgressBar}>
                                <View style={[styles.gridProgressFill, { width: `${task.progress}%` }]} />
                            </View>
                            <Text style={styles.gridProgressText}>{task.progress}%</Text>
                        </View>

                        <View style={styles.gridFooter}>
                            <View style={styles.gridDifficulty}>
                                <Ionicons name="trending-up" size={12} color={getDifficultyColor(task.difficulty)} />
                                <Text style={[styles.gridDifficultyText, { color: getDifficultyColor(task.difficulty) }]}>
                                    {task.difficulty}
                                </Text>
                            </View>
                            <Text style={styles.gridDueDate}>{task.dueDate}</Text>
                        </View>
                    </View>

                    <View style={styles.gridActions}>
                        <TouchableOpacity
                            style={styles.gridActionButton}
                            onPress={() => onAction(task.id, 'complete')}
                        >
                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.gridActionButton}
                            onPress={() => onAction(task.id, 'edit')}
                        >
                            <Ionicons name="create" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={styles.listItem}
            onPress={() => onPress(task.id)}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.listGradient}
            >
                <View style={styles.listHeader}>
                    <View style={styles.listAvatarContainer}>
                        <Image source={{ uri: task.avatar }} style={styles.listAvatar} />
                        <View style={[styles.listStatusDot, { backgroundColor: getStatusColor(task.status) }]} />
                    </View>

                    <View style={styles.listContent}>
                        <View style={styles.listTitleRow}>
                            <Text style={styles.listTitle} numberOfLines={1}>{task.title}</Text>
                            <View style={styles.listPriorityBadge}>
                                <View style={[styles.listPriorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                                <Text style={styles.listPriorityText}>{task.priority}</Text>
                            </View>
                        </View>

                        <Text style={styles.listAssignee}>Assigned to {task.assignedTo}</Text>

                        <View style={styles.listProgressContainer}>
                            <View style={styles.listProgressBar}>
                                <View style={[styles.listProgressFill, { width: `${task.progress}%` }]} />
                            </View>
                            <Text style={styles.listProgressText}>{task.progress}%</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.listFooter}>
                    <View style={styles.listMeta}>
                        <View style={styles.listDifficulty}>
                            <Ionicons name="trending-up" size={12} color={getDifficultyColor(task.difficulty)} />
                            <Text style={[styles.listDifficultyText, { color: getDifficultyColor(task.difficulty) }]}>
                                {task.difficulty}
                            </Text>
                        </View>
                        <Text style={styles.listDueDate}>{task.dueDate}</Text>
                        <Text style={styles.listTime}>{task.estimatedTime}</Text>
                    </View>

                    <View style={styles.listActions}>
                        <TouchableOpacity
                            style={styles.listActionButton}
                            onPress={() => onAction(task.id, 'complete')}
                        >
                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.listActionButton}
                            onPress={() => onAction(task.id, 'edit')}
                        >
                            <Ionicons name="create" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.listActionButton}
                            onPress={() => onAction(task.id, 'delete')}
                        >
                            <Ionicons name="trash" size={16} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
});

TaskItem.displayName = 'TaskItem';

const styles = StyleSheet.create({
    // Grid styles
    gridItem: {
        width: (screenWidth - 60) / 2,
        marginBottom: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    gridGradient: {
        borderRadius: 16,
        padding: 16,
    },
    gridHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    gridAvatarContainer: {
        position: 'relative',
    },
    gridAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    gridStatusDot: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    gridPriorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gridPriorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    gridContent: {
        marginBottom: 12,
    },
    gridTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
        lineHeight: 18,
    },
    gridAssignee: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    gridProgressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    gridProgressBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginRight: 8,
    },
    gridProgressFill: {
        height: 4,
        backgroundColor: '#3B82F6',
        borderRadius: 2,
    },
    gridProgressText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#3B82F6',
    },
    gridFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    gridDifficulty: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gridDifficultyText: {
        fontSize: 10,
        fontWeight: '500',
        marginLeft: 2,
    },
    gridDueDate: {
        fontSize: 10,
        color: '#6B7280',
    },
    gridActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    gridActionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },

    // List styles
    listItem: {
        marginBottom: 12,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    listGradient: {
        borderRadius: 16,
        padding: 16,
    },
    listHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    listAvatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    listAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    listStatusDot: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    listContent: {
        flex: 1,
    },
    listTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
        marginRight: 8,
    },
    listPriorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    listPriorityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    listPriorityText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#374151',
    },
    listAssignee: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    listProgressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listProgressBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        marginRight: 8,
    },
    listProgressFill: {
        height: 6,
        backgroundColor: '#3B82F6',
        borderRadius: 3,
    },
    listProgressText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3B82F6',
    },
    listFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    listDifficulty: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    listDifficultyText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 2,
    },
    listDueDate: {
        fontSize: 12,
        color: '#6B7280',
        marginRight: 12,
    },
    listTime: {
        fontSize: 12,
        color: '#6B7280',
    },
    listActions: {
        flexDirection: 'row',
    },
    listActionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        marginLeft: 4,
    },
});

export default TaskItem;
