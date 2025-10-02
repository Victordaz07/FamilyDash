import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Goal } from '../types/goalTypes';
import { goalCategories } from '../mock/goalsData';
import { theme } from '../../../styles/simpleTheme';

interface GoalCardProps {
  goal: Goal;
  onPress: (goalId: string) => void;
  onCompleteMilestone?: (goalId: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress, onCompleteMilestone }) => {
  const categoryConfig = goalCategories.find(c => c.id === goal.category);
  const categoryColor = categoryConfig?.color || theme.colors.primary;
  const categoryEmoji = categoryConfig?.emoji || '🎯';
  const categoryGradient = categoryConfig?.gradient || [theme.colors.primary, theme.colors.primaryDark];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return theme.colors.gray;
    }
  };

  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return '';
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'overdue': return 'Overdue';
      case 'active': return 'Active';
      default: return 'Unknown';
    }
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const dueDate = new Date(goal.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  const renderMilestones = () => {
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

  const getActionButtonText = () => {
    if (goal.status === 'completed') return 'Completed';
    if (goal.progress === 100) return 'Mark Complete';
    if (goal.completedMilestones < goal.milestones) return 'Mark Milestone';
    return 'Update Progress';
  };

  const handleActionPress = () => {
    if (goal.status === 'completed') return;
    if (onCompleteMilestone) {
      onCompleteMilestone(goal.id);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: categoryColor }]} 
      onPress={() => onPress(goal.id)}
      activeOpacity={0.8}
    >
      {/* Category Badge */}
      <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
        <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{goal.title}</Text>
            <Text style={styles.category}>
              {categoryConfig?.name} • {getDaysRemaining()}
            </Text>
          </View>
          
          {/* Status and Priority Badges */}
          <View style={styles.badgesContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(goal.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(goal.status) }]}>
                {getStatusText(goal.status)}
              </Text>
            </View>
            {goal.priority && (
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(goal.priority) + '20' }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(goal.priority) }]}>
                  {getPriorityText(goal.priority)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={[styles.progressText, { color: categoryColor }]}>
              {goal.completedMilestones}/{goal.milestones} milestones
            </Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={categoryGradient}
              style={[styles.progressFill, { width: `${goal.progress}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.progressEnd} />
            </LinearGradient>
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.milestonesContainer}>
          {renderMilestones()}
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleActionPress}
          disabled={goal.status === 'completed'}
        >
          <LinearGradient
            colors={goal.status === 'completed' ? ['#10B981', '#059669'] : categoryGradient}
            style={styles.actionButtonGradient}
          >
            <Ionicons 
              name={goal.status === 'completed' ? 'checkmark-circle' : 'add-circle'} 
              size={16} 
              color="white" 
            />
            <Text style={styles.actionButtonText}>{getActionButtonText()}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Reward */}
        {goal.reward && (
          <Text style={[styles.rewardText, { color: categoryColor }]}>
            🎁 Reward: {goal.reward}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
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
    fontSize: 14,
    color: theme.colors.gray,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    position: 'relative',
  },
  progressEnd: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  milestonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 4,
  },
  milestoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flex: 1,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 6,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default GoalCard;