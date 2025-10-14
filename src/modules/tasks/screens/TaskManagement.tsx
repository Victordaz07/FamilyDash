import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTasksStore } from '../store/tasksStore';
import { mockFamilyMembers } from '../mock/tasksData';
import TaskFilter from '../components/TaskFilter';
import TaskTabs from '../components/TaskTabs';
import TaskCard from '../components/TaskCard';
import { SharedQuickActions } from '../../../components/quick/SharedQuickActions';
import { TaskStatus } from '../types/taskTypes';
import { theme } from '@/styles/simpleTheme';

interface TaskManagementProps {
  navigation: any;
}

const TaskManagement: React.FC<TaskManagementProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    tasks,
    filters,
    isInitialized,
    setFilter,
    clearFilters,
    getFilteredTasks,
    getTaskStats,
    getMemberStats,
    completeTask,
    updateTask,
    initializeTasks,
  } = useTasksStore();

  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all');

  // Initialize store with mock data
  useEffect(() => {
    if (!isInitialized) {
      initializeTasks();
    }
  }, [isInitialized, initializeTasks]);

  const stats = getTaskStats();
  const filteredTasks = getFilteredTasks();

  // Filter tasks by active tab
  const tasksByTab = filteredTasks.filter(task => {
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  });

  // Get task counts by member
  const memberTaskCounts = mockFamilyMembers.reduce((acc, member) => {
    acc[member.id] = getMemberStats(member.id).total;
    return acc;
  }, {} as { [key: string]: number });

  const handleMemberSelect = useCallback((memberId: string) => {
    setFilter({ memberId });
  }, [setFilter]);

  const handleTabChange = useCallback((tab: TaskStatus | 'all') => {
    setActiveTab(tab);
  }, []);

  const handleTaskPress = useCallback((taskId: string) => {
    navigation.navigate('TaskDetails', { taskId });
  }, [navigation]);

  const handleCompleteTask = useCallback((taskId: string) => {
    Alert.alert(
      'Complete Task',
      'Are you sure you want to mark this task as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            completeTask(taskId);
            Alert.alert('Success', 'Task completed! 🎉');
          }
        }
      ]
    );
  }, [completeTask]);

  const handleStartTask = useCallback((taskId: string) => {
    updateTask(taskId, { progress: Math.min(100, 25) });
    Alert.alert('Started', 'Task started! Keep going! 💪');
  }, [updateTask]);

  const handleAddTask = useCallback(() => {
    Alert.alert('Add Task', 'Add new task feature coming soon!');
  }, []);

  const handleAddPhotoTask = useCallback(() => {
    Alert.alert('Photo Task', 'Add photo task feature coming soon!');
  }, []);

  const handleAddVideoInstructions = useCallback(() => {
    Alert.alert('Video Instructions', 'Add video instructions feature coming soon!');
  }, []);

  const handleAddReward = useCallback(() => {
    Alert.alert('Add Reward', 'Add reward feature coming soon!');
  }, []);

  const getMemberName = (memberId: string) => {
    return mockFamilyMembers.find(m => m.id === memberId)?.name || 'Unknown';
  };

  const getMemberAvatar = (memberId: string) => {
    return mockFamilyMembers.find(m => m.id === memberId)?.avatar || '';
  };

  const getSelectedMemberName = () => {
    if (!filters.memberId) return 'All Tasks';
    return `${getMemberName(filters.memberId)}'s Tasks`;
  };

  const getSelectedMemberAvatar = () => {
    if (!filters.memberId) return null;
    return getMemberAvatar(filters.memberId);
  };

  // Create ListHeaderComponent
  const ListHeader = useMemo(() => (
    <View style={styles.headerContent}>
      {/* Filter by Member */}
      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filter by Member</Text>
          {filters.memberId && (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => setFilter({ memberId: undefined })}
            >
              <Ionicons name="close-circle" size={20} color={theme.colors.gray} />
              <Text style={styles.clearFilterText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        {mockFamilyMembers.length > 0 ? (
          <TaskFilter
            members={mockFamilyMembers}
            selectedMemberId={filters.memberId}
            onMemberSelect={handleMemberSelect}
            taskCounts={memberTaskCounts}
          />
        ) : (
          <View style={styles.emptyMembersContainer}>
            <Ionicons name="people-outline" size={32} color={theme.colors.gray} />
            <Text style={styles.emptyMembersText}>No family members yet</Text>
            <Text style={styles.emptyMembersSubtext}>Add family members to filter tasks</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <SharedQuickActions
          mode="task"
          familyId="default_family"
          userId="default_user"
          taskId="current_task"
          onAddNewTask={handleAddTask}
          onAddPhotoTask={handleAddPhotoTask}
          onAddVideoTask={handleAddVideoInstructions}
        />
      </View>
    </View>
  ), [filters.memberId, mockFamilyMembers, memberTaskCounts, handleMemberSelect, setFilter, handleAddTask, handleAddPhotoTask, handleAddVideoInstructions]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, '#7C3AED']}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Task Management</Text>
          <Text style={styles.headerSubtitle}>Assign & Complete Tasks</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' }}
            style={styles.profileImage}
          />
        </View>
      </LinearGradient>

      {/* Task Status Tabs - Outside ScrollView */}
      <TaskTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={{
          all: filteredTasks.length,
          pending: filteredTasks.filter(t => t.status === 'pending').length,
          completed: filteredTasks.filter(t => t.status === 'completed').length,
          overdue: filteredTasks.filter(t => t.status === 'overdue').length,
        }}
      />

      <FlatList
        data={tasksByTab}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            memberName={getMemberName(item.assignedTo)}
            memberAvatar={getMemberAvatar(item.assignedTo)}
            onPress={() => handleTaskPress(item.id)}
            onComplete={() => handleCompleteTask(item.id)}
            onStart={() => handleStartTask(item.id)}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Tasks Found</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'all'
                ? 'No tasks match your current filters.'
                : `No ${activeTab} tasks found.`
              }
            </Text>
          </View>
        )}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold,
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  flatListContent: {
    paddingBottom: 100,
  },
  headerContent: {
    paddingTop: 8,
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearFilterText: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  taskCountBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  taskCountText: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.bold,
    color: 'white',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyMembersContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyMembersText: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyMembersSubtext: {
    fontSize: 14,
    color: theme.colors.gray,
    textAlign: 'center',
  },
});

export default TaskManagement;
