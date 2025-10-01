import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Animated, Dimensions, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import OptimizedList from '../../components/OptimizedList';
import TaskItem from './components/TaskItem';
import { usePerformanceOptimizations } from '../../hooks/usePerformance';

const { width: screenWidth } = Dimensions.get('window');

interface TasksScreenProps {
    navigation: any;
}

const TasksScreen: React.FC<TasksScreenProps> = ({ navigation }) => {
    const [selectedMember, setSelectedMember] = useState('Dad');
    const [selectedTab, setSelectedTab] = useState('Pending');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('dueDate');
    const [viewMode, setViewMode] = useState('grid'); // grid or list

    // Usar hook de optimización de performance
    const { animateIn, animatedStyles } = usePerformanceOptimizations();
    const filterAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        animateIn();
    }, [animateIn]);

    useEffect(() => {
        // Filter panel animation
        Animated.timing(filterAnim, {
            toValue: showFilters ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [showFilters]);

    const familyMembers = [
        { id: '1', name: 'Dad', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', tasks: 3, borderColor: '#3B82F6', points: 1250, streak: 7, status: 'online' },
        { id: '2', name: 'Mom', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg', tasks: 2, borderColor: '#EC4899', points: 1180, streak: 5, status: 'online' },
        { id: '3', name: 'Emma', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', tasks: 4, borderColor: '#8B5CF6', points: 890, streak: 3, status: 'away' },
        { id: '4', name: 'Jake', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', tasks: 1, borderColor: '#F59E0B', points: 650, streak: 1, status: 'offline' },
    ];

    const taskTabs = [
        { id: 'Pending', label: 'Pending', count: 3, active: true, color: '#F59E0B' },
        { id: 'Completed', label: 'Completed', count: 6, active: false, color: '#10B981' },
        { id: 'Overdue', label: 'Overdue', count: 1, active: false, color: '#EF4444' },
    ];

    const dadTasks = [
        {
            id: '1',
            title: 'Fix kitchen sink',
            priority: 'High',
            priorityColor: '#EF4444',
            bgColor: '#FEF2F2',
            borderColor: '#EF4444',
            icon: 'warning',
            dueDate: 'Today 6:00 PM',
            description: 'The kitchen sink is leaking. Need to check the pipes and fix the issue before dinner.',
            status: 'Overdue by 2h',
            statusIcon: 'time',
            actionButton: 'Complete',
            actionButtonColor: '#10B981',
            actionButtonText: 'Complete',
            category: 'Home Maintenance',
            difficulty: 'Hard',
            estimatedTime: '2 hours',
            actualTime: null,
            progress: 30,
            points: 100,
            tags: ['urgent', 'plumbing', 'kitchen'],
            attachments: ['instruction_video.mp4', 'parts_list.pdf'],
            checklist: [
                { id: '1', text: 'Turn off water supply', completed: true },
                { id: '2', text: 'Remove old pipes', completed: false },
                { id: '3', text: 'Install new pipes', completed: false },
                { id: '4', text: 'Test for leaks', completed: false }
            ]
        },
        {
            id: '2',
            title: 'Assemble new bookshelf',
            priority: 'Medium',
            priorityColor: '#F59E0B',
            bgColor: '#FFFBEB',
            borderColor: '#F59E0B',
            icon: 'construct',
            dueDate: 'Tomorrow 2:00 PM',
            description: 'Video instructions attached',
            descriptionIcon: 'videocam',
            status: '18h remaining',
            statusIcon: 'time',
            actionButton: 'Start',
            actionButtonColor: '#6B7280',
            actionButtonText: 'Start'
        },
        {
            id: '3',
            title: 'Wash the car',
            priority: 'Low',
            priorityColor: '#10B981',
            bgColor: '#F0FDF4',
            borderColor: '#10B981',
            icon: 'car',
            dueDate: 'This weekend',
            description: 'Clean the family car inside and out. Weather looks good for this weekend.',
            status: 'Flexible timing',
            statusIcon: 'calendar',
            actionButton: 'Start',
            actionButtonColor: '#6B7280',
            actionButtonText: 'Start'
        }
    ];

    const quickActions = [
        { id: '1', title: 'Add New Task', icon: 'add', colors: ['#10B981', '#059669'] },
        { id: '2', title: 'Add Photo Task', icon: 'camera', colors: ['#3B82F6', '#2563EB'] },
        { id: '3', title: 'Video Instructions', icon: 'videocam', colors: ['#8B5CF6', '#7C3AED'] },
        { id: '4', title: 'Add Reward', icon: 'star', colors: ['#F59E0B', '#EA580C'] },
    ];

    const handleMemberSelect = useCallback((memberName: string) => {
        setSelectedMember(memberName);
    }, []);

    const handleTabSelect = useCallback((tabId: string) => {
        setSelectedTab(tabId);
    }, []);

    const handleTaskAction = useCallback((taskId: string, action: string) => {
        Alert.alert('Task Action', `${action} task: ${taskId}`);
    }, []);

    const handleQuickAction = useCallback((actionTitle: string) => {
        Alert.alert('Quick Action', `Selected: ${actionTitle}`);
    }, []);

    // Navigation handlers
    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleAddTask = useCallback(() => {
        Alert.alert('Add Task', 'New task creation coming soon!');
    }, []);

    const handleViewTaskDetails = useCallback((taskId: string) => {
        navigation.navigate('TaskDetails', { taskId });
    }, [navigation]);

    return (
        <Animated.View style={[styles.container, animatedStyles]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                                <Ionicons name="arrow-back" size={20} color="white" />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.headerTitle}>Task Management</Text>
                                <Text style={styles.headerSubtitle}>Assign & Complete Tasks</Text>
                            </View>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.headerButton} onPress={handleAddTask}>
                                <Ionicons name="add" size={16} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerButton} onPress={() => setShowFilters(!showFilters)}>
                                <Ionicons name="filter" size={16} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerButton} onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                                <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={16} color="white" />
                            </TouchableOpacity>
                            <Image
                                source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' }}
                                style={styles.profileImage}
                            />
                        </View>
                    </View>
                </LinearGradient>

                {/* Family Member Filter */}
                <View style={styles.memberFilterSection}>
                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Filter by Member</Text>
                            <View style={styles.sectionActions}>
                                <TouchableOpacity>
                                    <Text style={styles.allTasksText}>All Tasks</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
                                    <Ionicons name="options" size={16} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersScroll}>
                            {familyMembers.map((member, index) => (
                                <Animated.View
                                    key={member.id}
                                    style={[
                                        styles.memberCard,
                                        selectedMember === member.name && styles.memberCardSelected,
                                        {
                                            transform: [{
                                                translateX: filterAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, index * 15],
                                                })
                                            }]
                                        }
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={styles.memberCardContent}
                                        onPress={() => handleMemberSelect(member.name)}
                                    >
                                        <View style={styles.memberAvatarContainer}>
                                            <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                                            <View style={[styles.statusIndicator, { backgroundColor: member.status === 'online' ? '#10B981' : member.status === 'away' ? '#F59E0B' : '#6B7280' }]} />
                                        </View>
                                        <Text style={[
                                            styles.memberName,
                                            selectedMember === member.name && styles.memberNameSelected
                                        ]}>
                                            {member.name}
                                        </Text>
                                        <Text style={styles.memberTaskCount}>{member.tasks} tasks</Text>
                                        <View style={styles.memberStats}>
                                            <Text style={styles.memberPoints}>{member.points} pts</Text>
                                            <Text style={styles.memberStreak}>{member.streak} 🔥</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Task Status Tabs */}
                <View style={styles.taskTabsSection}>
                    <View style={styles.tabsCard}>
                        <View style={styles.tabsContainer}>
                            {taskTabs.map(tab => (
                                <TouchableOpacity
                                    key={tab.id}
                                    style={[
                                        styles.tabButton,
                                        selectedTab === tab.id && styles.tabButtonActive
                                    ]}
                                    onPress={() => handleTabSelect(tab.id)}
                                >
                                    <Text style={[
                                        styles.tabButtonText,
                                        selectedTab === tab.id && styles.tabButtonTextActive
                                    ]}>
                                        {tab.label} ({tab.count})
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Dad's Tasks List */}
                <View style={styles.tasksListSection}>
                    <View style={styles.card}>
                        <View style={styles.tasksListHeader}>
                            <View style={styles.tasksListHeaderLeft}>
                                <Image
                                    source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg' }}
                                    style={[styles.tasksListAvatar, { borderColor: '#3B82F6' }]}
                                />
                                <View>
                                    <Text style={styles.tasksListTitle}>Dad's Tasks</Text>
                                    <Text style={styles.tasksListSubtitle}>3 pending tasks</Text>
                                </View>
                            </View>
                            <View style={styles.tasksListBadge}>
                                <Text style={styles.tasksListBadgeText}>3</Text>
                            </View>
                        </View>

                        <View style={styles.tasksContainer}>
                            {dadTasks.map(task => (
                                <View key={task.id} style={[styles.taskCard, { backgroundColor: task.bgColor, borderLeftColor: task.borderColor }]}>
                                    <View style={styles.taskHeader}>
                                        <View style={styles.taskHeaderLeft}>
                                            <View style={[styles.taskIcon, { backgroundColor: task.priorityColor }]}>
                                                <Ionicons name={task.icon as any} size={16} color="white" />
                                            </View>
                                            <View>
                                                <Text style={styles.taskTitle}>{task.title}</Text>
                                                <View style={styles.taskMeta}>
                                                    <View style={[styles.priorityBadge, { backgroundColor: task.priorityColor }]}>
                                                        <Text style={styles.priorityBadgeText}>{task.priority} Priority</Text>
                                                    </View>
                                                    <Text style={styles.dueDate}>Due: {task.dueDate}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <TouchableOpacity>
                                            <Ionicons name="ellipsis-vertical" size={16} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.taskDescription}>{task.description}</Text>

                                    {task.descriptionIcon && (
                                        <View style={styles.taskDescriptionIcon}>
                                            <Ionicons name={task.descriptionIcon as any} size={16} color="#3B82F6" />
                                            <Text style={styles.taskDescriptionIconText}>Video instructions attached</Text>
                                        </View>
                                    )}

                                    <View style={styles.taskFooter}>
                                        <View style={styles.taskStatus}>
                                            <Ionicons name={task.statusIcon as any} size={12} color="#9CA3AF" />
                                            <Text style={styles.taskStatusText}>{task.status}</Text>
                                        </View>
                                        <View style={styles.taskActions}>
                                            <TouchableOpacity style={styles.viewButton} onPress={() => handleViewTaskDetails(task.id)}>
                                                <Ionicons name="eye" size={12} color="white" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionButton, { backgroundColor: task.actionButtonColor }]}
                                                onPress={() => handleTaskAction(task.id, task.actionButton)}
                                            >
                                                <Text style={styles.actionButtonText}>{task.actionButtonText}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsSection}>
                    <View style={styles.card}>
                        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                        <View style={styles.quickActionsGrid}>
                            {quickActions.map(action => (
                                <TouchableOpacity
                                    key={action.id}
                                    style={styles.quickActionButton}
                                    onPress={() => handleQuickAction(action.title)}
                                >
                                    <LinearGradient
                                        colors={action.colors as [string, string]}
                                        style={styles.quickActionGradient}
                                    >
                                        <Ionicons name={action.icon as any} size={24} color="white" />
                                        <Text style={styles.quickActionText}>{action.title}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Bottom spacing for navigation */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </Animated.View>
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginLeft: 8,
    },
    memberFilterSection: {
        paddingHorizontal: 16,
        marginTop: -24,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    allTasksText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#4F46E5',
    },
    membersScroll: {
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    memberCard: {
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        marginRight: 12,
        minWidth: 80,
    },
    memberCardSelected: {
        backgroundColor: '#EBF8FF',
        borderColor: '#3B82F6',
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: 4,
    },
    memberName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 2,
    },
    memberNameSelected: {
        color: '#3B82F6',
    },
    memberTaskCount: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    taskTabsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    tabsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    tabsContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    tabButtonActive: {
        backgroundColor: '#4F46E5',
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    tabButtonTextActive: {
        color: 'white',
    },
    tasksListSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    tasksListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tasksListHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tasksListAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 3,
        marginRight: 12,
    },
    tasksListTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    tasksListSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    tasksListBadge: {
        width: 48,
        height: 48,
        backgroundColor: '#EBF8FF',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tasksListBadgeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    tasksContainer: {
        paddingTop: 16,
        gap: 16,
    },
    taskCard: {
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    taskHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    taskIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    priorityBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
    dueDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    taskDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
    },
    taskDescriptionIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    taskDescriptionIconText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#3B82F6',
        marginLeft: 8,
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    taskStatusText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    taskActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    viewButton: {
        width: 32,
        height: 32,
        backgroundColor: '#3B82F6',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'white',
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 80,
    },
    quickActionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionButton: {
        width: '48%',
    },
    quickActionGradient: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'white',
        textAlign: 'center',
    },
    bottomSpacing: {
        height: 80,
    },
    sectionActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    memberCardContent: {
        alignItems: 'center',
        padding: 8,
    },
    memberAvatarContainer: {
        position: 'relative',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'white',
    },
    memberStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    memberPoints: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: '500',
    },
    memberStreak: {
        fontSize: 10,
        color: '#F59E0B',
        fontWeight: '500',
    },
});

export default TasksScreen;