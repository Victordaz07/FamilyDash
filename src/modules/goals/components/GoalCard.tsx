import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Goal } from '../mock/goals';

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress, onEdit, onDelete }) => {
  const getStatusColor = () => {
    const colors = {
      'not_started': '#6B7280',
      'in_progress': '#3B82F6',
      'completed': '#10B981',
      'paused': '#F59E0B'
    };
    return colors[goal.status] || '#6B7280';
  };

  const getStatusIcon = () => {
    const icons = {
      'not_started': 'play-circle-outline',
      'in_progress': 'play-circle',
      'completed': 'checkmark-circle',
      'paused': 'pause-circle'
    };
    return icons[goal.status] || 'play-circle-outline';
  };

  const getPriorityColor = () => {
    const colors = {
      'low': '#10B981',
      'medium': '#F59E0B',
      'high': '#EF4444'
    };
    return colors[goal.priority] || '#6B7280';
  };

  const getCategoryIcon = () => {
    const icons = {
      'family': 'people',
      'personal': 'person',
      'health': 'fitness',
      'education': 'school',
      'financial': 'wallet',
      'recreation': 'game-controller'
    };
    return icons[goal.category] || 'flag';
  };

  const getCategoryColor = () => {
    const colors = {
      'family': '#3B82F6',
      'personal': '#EC4899',
      'health': '#10B981',
      'education': '#8B5CF6',
      'financial': '#F59E0B',
      'recreation': '#EF4444'
    };
    return colors[goal.category] || '#6B7280';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const isOverdue = daysRemaining < 0 && goal.status !== 'completed';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.goalInfo}>
          <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor() }]}>
            <Ionicons name={getCategoryIcon() as any} size={20} color="white" />
          </View>
          <View style={styles.goalDetails}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalDescription} numberOfLines={2}>
              {goal.description}
            </Text>
          </View>
        </View>
        
        <View style={styles.goalActions}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
            <Text style={styles.priorityText}>{goal.priority.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusIcon, { backgroundColor: getStatusColor() }]}>
            <Ionicons name={getStatusIcon() as any} size={16} color="white" />
          </View>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressText}>{goal.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${goal.progress}%`,
                backgroundColor: getStatusColor()
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.participantsContainer}>
          {goal.assignedTo.slice(0, 3).map((participant, index) => {
            const member = goal.assignedTo.find(m => m === participant);
            return (
              <View key={index} style={styles.participantAvatar}>
                <Text style={styles.participantInitial}>
                  {participant.charAt(0)}
                </Text>
              </View>
            );
          })}
          {goal.assignedTo.length > 3 && (
            <View style={styles.moreParticipants}>
              <Text style={styles.moreText}>+{goal.assignedTo.length - 3}</Text>
            </View>
          )}
        </View>

        <View style={styles.dateInfo}>
          <Text style={[
            styles.dateText,
            isOverdue && styles.overdueText
          ]}>
            {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
          </Text>
          <Text style={styles.targetDateText}>
            Due: {formatDate(goal.targetDate)}
          </Text>
        </View>
      </View>

      <View style={styles.milestonesPreview}>
        <Text style={styles.milestonesLabel}>Milestones</Text>
        <View style={styles.milestonesList}>
          {goal.milestones.slice(0, 2).map(milestone => (
            <View key={milestone.id} style={styles.milestoneItem}>
              <View style={[
                styles.milestoneDot,
                { backgroundColor: milestone.completed ? '#10B981' : '#E5E7EB' }
              ]} />
              <Text style={[
                styles.milestoneText,
                milestone.completed && styles.completedMilestoneText
              ]}>
                {milestone.title}
              </Text>
            </View>
          ))}
          {goal.milestones.length > 2 && (
            <Text style={styles.moreMilestones}>
              +{goal.milestones.length - 2} more
            </Text>
          )}
        </View>
      </View>

      {onEdit && onDelete && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Ionicons name="create" size={16} color="#3B82F6" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Ionicons name="trash" size={16} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalDetails: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  goalActions: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -4,
  },
  participantInitial: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  moreParticipants: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  moreText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  dateInfo: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  overdueText: {
    color: '#EF4444',
  },
  targetDateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  milestonesPreview: {
    marginBottom: 12,
  },
  milestonesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  milestonesList: {
    gap: 4,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  milestoneText: {
    fontSize: 12,
    color: '#6B7280',
  },
  completedMilestoneText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  moreMilestones: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EBF8FF',
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
});

export default GoalCard;
