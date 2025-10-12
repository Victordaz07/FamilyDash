import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Goal } from '../../types/goals';
import { categoryColors, categoryLabels, statusColors, statusLabels } from '../../theme/goalsColors';
import GoalProgressBar from './GoalProgressBar';
import { Ionicons } from '@expo/vector-icons';

interface EnhancedGoalCardProps {
  goal: Goal;
  onPress: () => void;
}

export default function EnhancedGoalCard({ goal, onPress }: EnhancedGoalCardProps) {
  const categoryColor = categoryColors[goal.category];
  const statusColor = statusColors[goal.status];
  const isOverdue = goal.status === 'active' && 
    goal.deadlineAt && 
    goal.deadlineAt < Date.now();

  const getStatusIcon = () => {
    if (isOverdue) return 'warning';
    switch (goal.status) {
      case 'active': return 'play-circle';
      case 'completed': return 'checkmark-circle';
      case 'paused': return 'pause-circle';
      case 'cancelled': return 'close-circle';
      default: return 'flag';
    }
  };

  const getDisplayStatus = () => {
    if (isOverdue) return 'Overdue';
    return statusLabels[goal.status];
  };

  const getDisplayStatusColor = () => {
    if (isOverdue) return '#EF4444';
    return statusColor;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
          <Text style={styles.title} numberOfLines={2}>
            {goal.title}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getDisplayStatusColor()}20` }]}>
          <Ionicons 
            name={getStatusIcon() as any} 
            size={12} 
            color={getDisplayStatusColor()} 
          />
          <Text style={[styles.statusText, { color: getDisplayStatusColor() }]}>
            {getDisplayStatus()}
          </Text>
        </View>
      </View>

      {/* Category */}
      <Text style={styles.category}>
        {categoryLabels[goal.category]}
      </Text>

      {/* Description */}
      {goal.description && (
        <Text style={styles.description} numberOfLines={2}>
          {goal.description}
        </Text>
      )}

      {/* Progress */}
      <View style={styles.progressContainer}>
        <GoalProgressBar 
          completed={goal.milestonesDone}
          total={goal.milestonesCount}
          color={categoryColor}
          showPercentage={false}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons 
            name={goal.visibility === 'family' ? 'people' : 'lock-closed'} 
            size={14} 
            color="#64748B" 
          />
          <Text style={styles.footerText}>
            {goal.visibility === 'family' ? 'Family' : 'Private'}
          </Text>
        </View>
        {goal.reflectionCount && goal.reflectionCount > 0 && (
          <View style={styles.footerItem}>
            <Ionicons name="chatbubble" size={14} color="#64748B" />
            <Text style={styles.footerText}>
              {goal.reflectionCount} reflections
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  category: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 18,
  },
  progressContainer: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
});
