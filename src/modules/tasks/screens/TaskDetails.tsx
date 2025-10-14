import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store';
import { mockFamilyMembers } from '../mock/tasksData';
import InstructionsList from '@/components/InstructionsList';
import AttachmentsList from '@/components/AttachmentsList';
import ProgressTracker from '@/components/ProgressTracker';
import ParentNotes from '@/components/ParentNotes';
import { theme } from '@/styles/simpleTheme';

interface TaskDetailsProps {
  navigation: any;
  route: { params: { taskId: string } };
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ navigation, route }) => {
  const { taskId } = route.params;
  const insets = useSafeAreaInsets();
  const { items: tasks, toggle: completeTask } = useAppStore();
  
  const task = tasks[taskId]; // tasks es un Record<string, Task>, no un array
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (task) {
      // setSelectedTask(taskId); // No longer needed in unified store
      // Initialize completed steps based on progress
      const stepsToComplete = Math.floor((task.progress / 100) * task.steps.length);
      setCompletedSteps(Array.from({ length: stepsToComplete }, (_, i) => i));
    }
  }, [task, taskId]);

  const getMemberName = (memberId: string) => {
    return mockFamilyMembers.find(m => m.id === memberId)?.name || 'Unknown';
  };

  const getMemberAvatar = (memberId: string) => {
    return mockFamilyMembers.find(m => m.id === memberId)?.avatar || '';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.gray;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'overdue': return theme.colors.error;
      case 'pending': return theme.colors.warning;
      default: return theme.colors.gray;
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleResumeTask = useCallback(() => {
    if (task) {
      const newProgress = Math.min(100, task.progress + 25);
      // updateTask(task.id, { progress: newProgress }); // No longer available in unified store
      Alert.alert('Resumed', 'Task resumed! Keep going! 💪');
    }
  }, [task, updateTask]);

  const handleNeedHelp = useCallback(() => {
    Alert.alert('Need Help', 'Help feature coming soon! You can ask your parents for assistance.');
  }, []);

  const handleMoreTime = useCallback(() => {
    Alert.alert('More Time', 'Request more time feature coming soon!');
  }, []);

  const handleMarkComplete = useCallback(() => {
    if (task) {
      Alert.alert(
        'Mark as Complete',
        'Are you sure you want to mark this task as completed?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Complete', 
            onPress: () => {
              completeTask(task.id);
              Alert.alert('Congratulations!', 'Task completed! 🎉');
              navigation.goBack();
            }
          }
        ]
      );
    }
  }, [task, completeTask, navigation]);

  const handleAttachmentPress = useCallback((attachment: any) => {
    Alert.alert('Attachment', `Opening ${attachment.title}...`);
  }, []);

  const handleStepToggle = useCallback((stepIndex: number) => {
    setCompletedSteps(prev => {
      const newCompleted = prev.includes(stepIndex)
        ? prev.filter(i => i !== stepIndex)
        : [...prev, stepIndex];
      
      // Update task progress based on completed steps
      if (task) {
        const newProgress = Math.floor((newCompleted.length / task.steps.length) * 100);
        // updateTask(task.id, { progress: newProgress }); // No longer available in unified store
      }
      
      return newCompleted;
    });
  }, [task, updateTask]);

  if (!task) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 50 }]}>
        <Text style={styles.errorText}>Task not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const priorityColor = getPriorityColor(task.priority);
  const statusColor = getStatusColor(task.status);
  const memberName = getMemberName(task.assignedTo);
  const memberAvatar = getMemberAvatar(task.assignedTo);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[statusColor, statusColor]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Task Details</Text>
          <Text style={styles.headerSubtitle}>{memberName}'s Task</Text>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.taskHeader}>
            <Image source={{ uri: memberAvatar }} style={styles.taskAvatar} />
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskAssignee}>Assigned to {memberName}</Text>
            </View>
          </View>

          <View style={styles.badges}>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityText}>
                {task.priority === 'high' ? 'High Priority' : 
                 task.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
              </Text>
            </View>
            <View style={[styles.dueBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.dueText}>Due in 3h</Text>
            </View>
          </View>

          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Assigned</Text>
              <Text style={styles.metaValue}>2h ago</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Due Time</Text>
              <Text style={styles.metaValue}>6:00 PM</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Points</Text>
              <Text style={styles.metaValue}>
                +{task.points} <Ionicons name="star" size={14} color={theme.colors.warning} />
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <InstructionsList
          steps={task.steps}
          completedSteps={completedSteps}
        />

        {/* Attachments */}
        {task.attachments && task.attachments.length > 0 && (
          <AttachmentsList
            attachments={task.attachments}
            onAttachmentPress={handleAttachmentPress}
          />
        )}

        {/* Progress */}
        <ProgressTracker
          progress={task.progress}
          points={task.points}
          earnedPoints={task.status === 'completed' ? task.points : Math.floor(task.points * (task.progress / 100))}
          completedSteps={completedSteps.length}
          totalSteps={task.steps.length}
        />

        {/* Parent Notes */}
        {task.notes && task.notes.length > 0 && (
          <ParentNotes
            notes={task.notes}
            memberAvatars={{
              mom: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
              dad: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
            }}
          />
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {task.status === 'pending' && (
            <TouchableOpacity style={styles.resumeButton} onPress={handleResumeTask}>
              <LinearGradient
                colors={[theme.colors.success, '#059669']}
                style={styles.resumeButtonGradient}
              >
                <Ionicons name="play" size={20} color="white" />
                <Text style={styles.resumeButtonText}>Resume Task</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.helpButton} onPress={handleNeedHelp}>
            <Ionicons name="help-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.helpButtonText}>Need Help</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.timeButton} onPress={handleMoreTime}>
            <Ionicons name="time" size={20} color={theme.colors.warning} />
            <Text style={styles.timeButtonText}>More Time</Text>
          </TouchableOpacity>

          {task.status === 'pending' && (
            <TouchableOpacity style={styles.completeButton} onPress={handleMarkComplete}>
              <LinearGradient
                colors={[theme.colors.warning, '#D97706']}
                style={styles.completeButtonGradient}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.completeButtonText}>Mark as Complete</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
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
  moreButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    marginTop: -12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  taskAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  taskAssignee: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.medium,
    color: 'white',
  },
  dueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dueText: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.medium,
    color: 'white',
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: theme.colors.gray,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  resumeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  resumeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  resumeButtonText: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold,
    color: 'white',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: 8,
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    gap: 8,
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.warning,
  },
  completeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold,
    color: 'white',
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 50,
  },
  backButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default TaskDetails;




