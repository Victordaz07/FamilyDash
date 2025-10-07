/**
 * TaskListScreen - Main Tasks Dashboard
 * Real-time task list with Quick Actions and filtering
 */

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors, useThemeFonts, useThemeGradient } from '../../contexts/ThemeContext';
import { listenTasks, completeTask, restoreTask, deleteTask, Task, TaskStatus } from '../../services/tasks';
import { EmptyState, TaskPreviewModal } from '../../components/ui';

const { width } = Dimensions.get('window');

type FilterTab = 'all' | 'pending' | 'completed' | 'overdue' | 'archived';

export default function TaskListScreen() {
    const navigation = useNavigation();
    const colors = useThemeColors();
    const fonts = useThemeFonts();
    const themeGradient = useThemeGradient();

    // Ensure gradient has at least 2 colors for LinearGradient
    const gradient = themeGradient.length >= 2
        ? themeGradient as [string, string, ...string[]]
        : ['#667eea', '#764ba2'] as [string, string];

    const [tasks, setTasks] = useState<Task[]>([]);
    const [tab, setTab] = useState<FilterTab>('all');
    const [loading, setLoading] = useState(true);
    const [previewTask, setPreviewTask] = useState<Task | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        console.log('📋 Setting up task listener for tab:', tab);

        const unsubscribe = listenTasks({
            status: tab === 'archived' ? 'all' : tab,
            archived: tab === 'archived',
            onData: (newTasks) => {
                setTasks(newTasks);
                setLoading(false);
            },
        });

        return () => {
            console.log('📋 Cleaning up task listener');
            unsubscribe();
        };
    }, [tab]);

    const handleCompleteTask = async (taskId: string) => {
        try {
            await completeTask(taskId);
            console.log('✅ Task completed and archived successfully');
        } catch (error) {
            console.error('❌ Error completing task:', error);
        }
    };

    const handleRestoreTask = async (taskId: string) => {
        try {
            await restoreTask(taskId);
            console.log('🔄 Task restored successfully');
        } catch (error) {
            console.error('❌ Error restoring task:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask(taskId);
            console.log('🗑️ Task deleted successfully');
        } catch (error) {
            console.error('❌ Error deleting task:', error);
        }
    };

    const handlePreviewTask = (task: Task) => {
        setPreviewTask(task);
        setShowPreview(true);
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setPreviewTask(null);
    };

    const handleEditFromPreview = () => {
        setShowPreview(false);
        navigation.navigate('EditTask' as never, { task: previewTask } as never);
    };

    const renderTask = ({ item }: { item: Task }) => (
        <TouchableOpacity
            style={[styles.taskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handlePreviewTask(item)}
            activeOpacity={0.7}
        >
            <View style={styles.taskContent}>
                <View style={styles.taskHeader}>
                    <Text style={[styles.taskTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                        {item.title}
                    </Text>
                    <View style={[
                        styles.statusBadge,
                        {
                            backgroundColor: item.status === 'completed' ? colors.success :
                                item.status === 'overdue' ? colors.error : colors.warning
                        }
                    ]}>
                        <Text style={[styles.statusText, { fontSize: fonts.caption }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {item.description && (
                    <Text style={[styles.taskDescription, { color: colors.textSecondary, fontSize: fonts.body }]}>
                        {item.description}
                    </Text>
                )}

                <View style={styles.taskMeta}>
                    <View style={styles.taskMetaItem}>
                        <Ionicons
                            name={item.type === 'photo' ? 'camera' : 'document-text'}
                            size={16}
                            color={colors.textSecondary}
                        />
                        <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                            {item.type.toUpperCase()}
                        </Text>
                    </View>

                    {item.points > 0 && (
                        <View style={styles.taskMetaItem}>
                            <Ionicons name="star" size={16} color={colors.warning} />
                            <Text style={[styles.metaText, { color: colors.warning, fontSize: fonts.caption }]}>
                                {item.points} pts
                            </Text>
                        </View>
                    )}

                    {item.attachments.length > 0 && (
                        <View style={styles.taskMetaItem}>
                            <Ionicons
                                name={item.attachments[0].kind === 'photo' ? 'image' : 'videocam'}
                                size={16}
                                color={colors.primary}
                            />
                            <Text style={[styles.metaText, { color: colors.primary, fontSize: fonts.caption }]}>
                                {item.attachments[0].kind.toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('EditTask' as never, { task: item } as never);
                    }}
                >
                    <Ionicons name="create" size={16} color="white" />
                </TouchableOpacity>

                {tab === 'archived' ? (
                    <>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.success }]}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleRestoreTask(item.id);
                            }}
                        >
                            <Ionicons name="refresh" size={16} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.error }]}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(item.id);
                            }}
                        >
                            <Ionicons name="trash" size={16} color="white" />
                        </TouchableOpacity>
                    </>
                ) : (
                    item.status !== 'completed' && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.success }]}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleCompleteTask(item.id);
                            }}
                        >
                            <Ionicons name="checkmark" size={16} color="white" />
                        </TouchableOpacity>
                    )
                )}
            </View>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <EmptyState
            icon="checkmark-circle-outline"
            title="No Tasks Found"
            description={tab === 'all' ? "Create your first task to get started!" :
                tab === 'pending' ? "No pending tasks - great job!" :
                    tab === 'completed' ? "No completed tasks yet" :
                        tab === 'overdue' ? "No overdue tasks" :
                            "No archived tasks"}
            buttonText={tab === 'archived' ? undefined : "Create Task"}
            onPress={tab === 'archived' ? undefined : () => navigation.navigate('AddTask' as never)}
        />
    );

    const tabs: { key: FilterTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { key: 'all', label: 'All', icon: 'list' },
        { key: 'pending', label: 'Pending', icon: 'time' },
        { key: 'completed', label: 'Done', icon: 'checkmark-circle' },
        { key: 'overdue', label: 'Overdue', icon: 'warning' },
        { key: 'archived', label: 'Archived', icon: 'archive' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={gradient}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.headerTitle, { color: colors.textInverse }]}>Tasks</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textInverseSecondary }]}>
                            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Filter Tabs */}
            <View style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
                <FlatList
                    data={tabs}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.key}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                { backgroundColor: tab === item.key ? colors.primary : colors.border },
                                tab === item.key && styles.tabActive
                            ]}
                            onPress={() => setTab(item.key)}
                        >
                            <Ionicons
                                name={item.icon}
                                size={16}
                                color={tab === item.key ? 'white' : colors.textSecondary}
                            />
                            <Text style={[
                                styles.tabText,
                                {
                                    color: tab === item.key ? 'white' : colors.textSecondary,
                                    fontSize: fonts.caption
                                }
                            ]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.tabsContent}
                />
            </View>

            {/* Task List */}
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={renderTask}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={[
                    styles.listContainer,
                    tasks.length === 0 && styles.emptyListContainer
                ]}
                showsVerticalScrollIndicator={false}
                refreshing={loading}
                onRefresh={() => setLoading(true)}
            />

            {/* Quick Actions */}
            <View style={[styles.quickActionsCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.quickActionsTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                    Quick Actions
                </Text>

                <View style={styles.quickActionsRow}>
                    <TouchableOpacity
                        style={[styles.quickActionButton, { backgroundColor: '#17a673' }]}
                        onPress={() => navigation.navigate('AddTask' as never)}
                    >
                        <Ionicons name="add-circle" size={24} color="white" />
                        <Text style={[styles.quickActionText, { fontSize: fonts.caption }]}>Add New Task</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickActionButton, { backgroundColor: '#6C63FF' }]}
                        onPress={() => navigation.navigate('AddPhotoTask' as never)}
                    >
                        <Ionicons name="camera" size={24} color="white" />
                        <Text style={[styles.quickActionText, { fontSize: fonts.caption }]}>Add Photo Task</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.quickActionsRow}>
                    <TouchableOpacity
                        style={[styles.quickActionButton, { backgroundColor: '#7c4dff' }]}
                        onPress={() => navigation.navigate('VideoInstructions' as never)}
                    >
                        <Ionicons name="videocam" size={24} color="white" />
                        <Text style={[styles.quickActionText, { fontSize: fonts.caption }]}>Video Instructions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickActionButton, { backgroundColor: '#f0a500' }]}
                        onPress={() => navigation.navigate('AddReward' as never)}
                    >
                        <Ionicons name="star" size={24} color="white" />
                        <Text style={[styles.quickActionText, { fontSize: fonts.caption }]}>Add Reward</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Task Preview Modal */}
            <TaskPreviewModal
                visible={showPreview}
                task={previewTask}
                onClose={handleClosePreview}
                onEdit={handleEditFromPreview}
                onComplete={previewTask ? () => handleCompleteTask(previewTask.id) : undefined}
                onRestore={previewTask ? () => handleRestoreTask(previewTask.id) : undefined}
                onDelete={previewTask ? () => handleDeleteTask(previewTask.id) : undefined}
                showActions={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginRight: 15,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    tabsContainer: {
        paddingVertical: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabsContent: {
        paddingHorizontal: 20,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 12,
    },
    tabActive: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    tabText: {
        marginLeft: 6,
        fontWeight: '600',
    },
    listContainer: {
        padding: 20,
        paddingBottom: 200, // Space for Quick Actions
    },
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    taskContent: {
        flex: 1,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    taskTitle: {
        flex: 1,
        fontWeight: 'bold',
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontWeight: 'bold',
    },
    taskDescription: {
        marginBottom: 8,
        lineHeight: 18,
    },
    taskMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    taskMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        marginLeft: 4,
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 12,
    },
    actionButton: {
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionsCard: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    quickActionsTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    quickActionsRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    quickActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 6,
    },
});
