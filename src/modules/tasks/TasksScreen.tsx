import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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

    const familyMembers = [
        { id: '1', name: 'Dad', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', tasks: 3, borderColor: '#3B82F6', points: 1250, streak: 7, status: 'online' },
        { id: '2', name: 'Mom', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg', tasks: 2, borderColor: '#EC4899', points: 1180, streak: 5, status: 'online' },
        { id: '3', name: 'Emma', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', tasks: 4, borderColor: '#8B5CF6', points: 890, streak: 3, status: 'away' },
        { id: '4', name: 'Jake', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', tasks: 1, borderColor: '#F59E0B', points: 650, streak: 1, status: 'offline' },
    ];

    const tasks = [
        { id: '1', title: 'Clean bedroom', description: 'Organize toys and make bed', assignedTo: 'Emma', dueDate: '2025-10-03', priority: 'high', completed: false, points: 50, category: 'chores' },
        { id: '2', title: 'Finish homework', description: 'Math worksheet and reading', assignedTo: 'Jake', dueDate: '2025-10-02', priority: 'high', completed: false, points: 30, category: 'education' },
        { id: '3', title: 'Take out trash', description: 'Empty all trash cans', assignedTo: 'Dad', dueDate: '2025-10-04', priority: 'medium', completed: false, points: 25, category: 'chores' },
        { id: '4', title: 'Walk the dog', description: '30-minute walk around the neighborhood', assignedTo: 'Mom', dueDate: '2025-10-02', priority: 'medium', completed: true, points: 40, category: 'health' },
        { id: '5', title: 'Practice piano', description: '30 minutes of practice', assignedTo: 'Emma', dueDate: '2025-10-05', priority: 'low', completed: false, points: 35, category: 'education' },
        { id: '6', title: 'Water plants', description: 'Water all indoor plants', assignedTo: 'Jake', dueDate: '2025-10-03', priority: 'low', completed: true, points: 20, category: 'chores' },
    ];

    const filteredTasks = useMemo(() => {
        let filtered = tasks;

        if (selectedTab === 'Pending') {
            filtered = filtered.filter(task => !task.completed);
        } else if (selectedTab === 'Completed') {
            filtered = filtered.filter(task => task.completed);
        }

        if (selectedMember !== 'All') {
            filtered = filtered.filter(task => task.assignedTo === selectedMember);
        }

        return filtered;
    }, [selectedTab, selectedMember]);

    const handleTaskPress = useCallback((taskId: string) => {
        navigation.navigate('TaskDetails', { taskId });
    }, [navigation]);

    const handleTaskComplete = useCallback((taskId: string) => {
        Alert.alert('Task Completed', 'Great job! Points earned.');
    }, []);

    const renderTaskItem = useCallback(({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.taskCard}
            onPress={() => handleTaskPress(item.id)}
        >
            <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskDescription}>{item.description}</Text>
                <View style={styles.taskMeta}>
                    <Text style={styles.taskAssignee}>Assigned to: {item.assignedTo}</Text>
                    <Text style={styles.taskPoints}>{item.points} pts</Text>
                </View>
            </View>
            <TouchableOpacity
                style={[styles.completeButton, item.completed && styles.completeButtonActive]}
                onPress={() => handleTaskComplete(item.id)}
            >
                <Ionicons
                    name={item.completed ? "checkmark-circle" : "checkmark-circle-outline"}
                    size={24}
                    color={item.completed ? "#10B981" : "#6B7280"}
                />
            </TouchableOpacity>
        </TouchableOpacity>
    ), [handleTaskPress, handleTaskComplete]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Family Tasks</Text>
                        <Text style={styles.headerSubtitle}>Stay organized together</Text>
                    </View>
                    <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
                        <Ionicons name="filter" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Family Members */}
            <View style={styles.membersSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersScroll}>
                    {familyMembers.map((member) => (
                        <TouchableOpacity
                            key={member.id}
                            style={[
                                styles.memberCard,
                                { borderColor: member.borderColor },
                                selectedMember === member.name && styles.memberCardSelected
                            ]}
                            onPress={() => setSelectedMember(member.name)}
                        >
                            <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                            <Text style={styles.memberName}>{member.name}</Text>
                            <Text style={styles.memberTasks}>{member.tasks} tasks</Text>
                            <View style={styles.memberStats}>
                                <Text style={styles.memberPoints}>{member.points} pts</Text>
                                <Text style={styles.memberStreak}>{member.streak} 🔥</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'Pending' && styles.tabActive]}
                    onPress={() => setSelectedTab('Pending')}
                >
                    <Text style={[styles.tabText, selectedTab === 'Pending' && styles.tabTextActive]}>
                        Pending ({tasks.filter(t => !t.completed).length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'Completed' && styles.tabActive]}
                    onPress={() => setSelectedTab('Completed')}
                >
                    <Text style={[styles.tabText, selectedTab === 'Completed' && styles.tabTextActive]}>
                        Completed ({tasks.filter(t => t.completed).length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tasks List */}
            <View style={styles.tasksContainer}>
                {filteredTasks.length > 0 ? (
                    <FlatList
                        data={filteredTasks}
                        renderItem={renderTaskItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-circle-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No tasks found</Text>
                        <Text style={styles.emptySubtitle}>
                            {selectedTab === 'Pending' ? 'All tasks are completed!' : 'No completed tasks yet.'}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    filterButton: {
        padding: 8,
    },
    membersSection: {
        paddingVertical: 16,
        backgroundColor: 'white',
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    membersScroll: {
        paddingHorizontal: 20,
    },
    memberCard: {
        alignItems: 'center',
        padding: 16,
        marginRight: 12,
        borderRadius: 16,
        borderWidth: 2,
        backgroundColor: 'white',
        minWidth: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    memberCardSelected: {
        backgroundColor: '#F3F4F6',
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: 8,
    },
    memberName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    memberTasks: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    memberStats: {
        alignItems: 'center',
    },
    memberPoints: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8B5CF6',
    },
    memberStreak: {
        fontSize: 10,
        color: '#F59E0B',
        marginTop: 2,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 4,
        marginTop: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: '#8B5CF6',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    tabTextActive: {
        color: 'white',
    },
    tasksContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    taskCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    taskDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    taskMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    taskAssignee: {
        fontSize: 12,
        color: '#8B5CF6',
    },
    taskPoints: {
        fontSize: 12,
        fontWeight: '600',
        color: '#F59E0B',
    },
    completeButton: {
        padding: 8,
    },
    completeButtonActive: {
        backgroundColor: '#F0FDF4',
        borderRadius: 20,
    },
});

export default TasksScreen;