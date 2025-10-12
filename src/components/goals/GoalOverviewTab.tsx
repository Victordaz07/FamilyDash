import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Goal } from '../../types/goals';
import { categoryColors, categoryLabels, statusColors, statusLabels } from '../../theme/goalsColors';
import GoalProgressBar from './GoalProgressBar';
import { Ionicons } from '@expo/vector-icons';

interface GoalOverviewTabProps {
  goal: Goal;
  onEditGoal: () => void;
  onToggleStatus: () => void;
}

export default function GoalOverviewTab({ goal, onEditGoal, onToggleStatus }: GoalOverviewTabProps) {
  const categoryColor = categoryColors[goal.category];
  const statusColor = statusColors[goal.status];
  const isOverdue = goal.status === 'active' && 
    goal.deadlineAt && 
    goal.deadlineAt < Date.now();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilDeadline = () => {
    if (!goal.deadlineAt) return null;
    const now = Date.now();
    const diff = goal.deadlineAt - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysLeft = getDaysUntilDeadline();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header Card */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.titleSection}>
              <View style={styles.categoryRow}>
                <View 
                  style={[styles.categoryDot, { backgroundColor: categoryColor }]} 
                />
                <Text style={styles.categoryText}>{categoryLabels[goal.category]}</Text>
              </View>
              <Text style={styles.title}>{goal.title}</Text>
              {goal.description && (
                <Text style={styles.description}>{goal.description}</Text>
              )}
            </View>
          </View>

          {/* Status and Actions */}
          <View style={styles.statusRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View 
                style={[
                  styles.statusBadge,
                  { backgroundColor: isOverdue ? '#EF4444' : statusColor }
                ]}
              >
                <Text style={styles.statusText}>
                  {isOverdue ? 'Overdue' : statusLabels[goal.status]}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onEditGoal}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Progress</Text>
          <GoalProgressBar 
            completed={goal.milestonesDone}
            total={goal.milestonesCount}
            color={categoryColor}
            showPercentage={true}
          />
          <View style={[styles.statsRow, { marginTop: 16 }]}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Milestones</Text>
              <Text style={styles.statValue}>
                {goal.milestonesDone}/{goal.milestonesCount}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Reflections</Text>
              <Text style={styles.statValue}>
                {goal.reflectionCount || 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Visibility</Text>
              <Text style={styles.statIcon}>
                {goal.visibility === 'family' ? '👨‍👩‍👧‍👦' : '🔒'}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Timeline</Text>
          <View style={styles.timelineContent}>
            <View style={styles.timelineRow}>
              <Text style={styles.timelineLabel}>Created</Text>
              <Text style={styles.timelineValue}>{formatDate(goal.createdAt)}</Text>
            </View>
            <View style={styles.timelineRow}>
              <Text style={styles.timelineLabel}>Last Updated</Text>
              <Text style={styles.timelineValue}>{formatDate(goal.updatedAt)}</Text>
            </View>
            {goal.deadlineAt && (
              <View style={styles.timelineRow}>
                <Text style={styles.timelineLabel}>Deadline</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.timelineValue}>{formatDate(goal.deadlineAt)}</Text>
                  {daysLeft !== null && (
                    <Text style={[
                      styles.timelineValue,
                      {
                        fontSize: 12,
                        color: daysLeft < 0 ? '#EF4444' : 
                               daysLeft <= 3 ? '#F59E0B' : '#10B981'
                      }
                    ]}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` :
                       daysLeft === 0 ? 'Due today' :
                       `${daysLeft} days left`}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsContent}>
            <TouchableOpacity
              onPress={onToggleStatus}
              style={styles.actionButton}
            >
              <Ionicons 
                name={goal.status === 'active' ? 'pause-circle' : 'play-circle'} 
                size={24} 
                color="#3B82F6" 
              />
              <Text style={styles.actionText}>
                {goal.status === 'active' ? 'Pause' : 'Resume'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#10B981" />
              <Text style={styles.actionText}>Add Reflection</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-circle-outline" size={24} color="#F59E0B" />
              <Text style={styles.actionText}>Add Milestone</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 14,
    color: '#64748B',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  editButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  timelineContent: {
    gap: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  actionsContent: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#475569',
  },
});
