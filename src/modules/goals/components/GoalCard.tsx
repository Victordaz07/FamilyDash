import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Goal, GoalCategory } from '../types/goalTypes';
import { goalCategoryConfig } from '../mock/goalsData';

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
  onMarkComplete: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress, onMarkComplete }) => {
  const categoryConfig = goalCategoryConfig[goal.category];
  const progressPercentage = goal.progress;
  
  const getDaysRemaining = () => {
    const dueDate = new Date(goal.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const isOverdue = daysRemaining < 0;
  const isThisWeek = daysRemaining >= 0 && daysRemaining <= 7;

  const getStatusBadge = () => {
    if (goal.status === 'completed') {
      return { text: 'Completed', color: '#10B981', bgColor: '#D1FAE5' };
    }
    if (isOverdue) {
      return { text: 'Overdue', color: '#EF4444', bgColor: '#FEE2E2' };
    }
    if (isThisWeek) {
      return { text: 'This Week', color: '#F59E0B', bgColor: '#FEF3C7' };
    }
    return { text: 'Active', color: categoryConfig.color, bgColor: `${categoryConfig.color}20` };
  };

  const statusBadge = getStatusBadge();

  const getPriorityBadge = () => {
    if (!goal.priority) return null;
    const priorityConfig = {
      high: { text: 'High Priority', color: '#EF4444', bgColor: '#FEE2E2' },
      medium: { text: 'Medium', color: '#F59E0B', bgColor: '#FEF3C7' },
      low: { text: 'Low', color: '#6B7280', bgColor: '#F3F4F6' }
    };
    return priorityConfig[goal.priority];
  };

  const priorityBadge = getPriorityBadge();

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={[styles.borderAccent, { backgroundColor: categoryConfig.color }]} />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.categoryEmoji}>{categoryConfig.emoji}</Text>
          </View>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{goal.title}</Text>
            <Text style={styles.category}>
              {categoryConfig.emoji} {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
            </Text>
            
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: statusBadge.bgColor }]}>
                <Text style={[styles.badgeText, { color: statusBadge.color }]}>
                  {statusBadge.text}
                </Text>
              </View>
              
              {priorityBadge && (
                <View style={[styles.badge, { backgroundColor: priorityBadge.bgColor }]}>
                  <Text style={[styles.badgeText, { color: priorityBadge.color }]}>
                    {priorityBadge.text}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.categoryIcon}>
            <Text style={styles.categoryEmojiSmall}>{categoryConfig.emoji}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={[styles.progressValue, { color: categoryConfig.color }]}>
              {goal.completedMilestones}/{goal.milestones} milestones
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[categoryConfig.color, categoryConfig.color]}
              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.milestonesContainer}>
          <View style={styles.milestones}>
            {Array.from({ length: Math.min(goal.milestones, 6) }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.milestone,
                  {
                    backgroundColor: index < goal.completedMilestones 
                      ? categoryConfig.color 
                      : '#E5E7EB'
                  }
                ]}
              />
            ))}
            {goal.milestones > 6 && (
              <Text style={styles.milestoneMore}>+{goal.milestones - 6}</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: categoryConfig.color }]}
            onPress={onMarkComplete}
          >
            <Text style={styles.actionButtonText}>
              {goal.status === 'completed' ? 'Completed' : 'Mark Complete'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reward */}
        {goal.reward && (
          <View style={styles.rewardContainer}>
            <Text style={[styles.rewardText, { color: categoryConfig.color }]}>
              🎁 Reward: {goal.reward}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  borderAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryEmojiSmall: {
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  milestonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  milestone: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  milestoneMore: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  rewardContainer: {
    marginTop: 8,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default GoalCard;
