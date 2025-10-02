import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types/taskTypes';
import { theme } from '../../../styles/simpleTheme';

interface TaskCardProps {
  task: Task;
  memberName: string;
  memberAvatar: string;
  onPress: () => void;
  onComplete?: () => void;
  onStart?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  memberName,
  memberAvatar,
  onPress,
  onComplete,
  onStart,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.gray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'overdue': return 'warning';
      case 'pending': return 'ellipse-outline';
      default: return 'ellipse-outline';
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
    const now = new Date();
    const diffHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 0) {
      return `Overdue by ${Math.abs(diffHours)}h`;
    } else if (diffHours < 24) {
      return `Due: Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffHours < 48) {
      return `Due: Tomorrow ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `Due: ${date.toLocaleDateString()}`;
    }
  };

  const priorityColor = getPriorityColor(task.priority);
  const statusColor = getStatusColor(task.status);
  const statusIcon = getStatusIcon(task.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.statusIcon}>
            <Ionicons name={statusIcon as any} size={16} color={statusColor} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{task.title}</Text>
            <View style={styles.badges}>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                <Text style={styles.priorityText}>
                  {task.priority === 'high' ? 'High Priority' : 
                   task.priority === 'medium' ? 'Medium' : 'Low Priority'}
                </Text>
              </View>
              <Text style={styles.dueDate}>{formatDueDate(task.dueDate)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.description}>{task.description}</Text>

        {task.attachments && task.attachments.length > 0 && (
          <View style={styles.attachments}>
            <Ionicons name="videocam" size={14} color={theme.colors.primary} />
            <Text style={styles.attachmentText}>
              {task.attachments.length} attachment{task.attachments.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.memberInfo}>
            <Image source={{ uri: memberAvatar }} style={styles.memberAvatar} />
            <Text style={styles.memberName}>{memberName}</Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={onPress}>
              <Ionicons name="eye" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
            
            {task.status === 'pending' && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                onPress={onComplete}
              >
                <Ionicons name="checkmark" size={16} color="white" />
              </TouchableOpacity>
            )}
            
            {task.status === 'pending' && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: theme.colors.gray }]}
                onPress={onStart}
              >
                <Ionicons name="play" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priorityIndicator: {
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statusIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.medium,
    color: 'white',
  },
  dueDate: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  attachments: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  attachmentText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  memberName: {
    fontSize: 12,
    color: theme.colors.gray,
    fontWeight: theme.typography.fontWeight.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

export default TaskCard;
