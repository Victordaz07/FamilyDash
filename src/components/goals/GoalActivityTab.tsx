import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Goal } from '../../types/goals';
import { Ionicons } from '@expo/vector-icons';

interface ActivityItem {
  id: string;
  type: 'milestone_completed' | 'milestone_added' | 'goal_created' | 'goal_updated' | 'reflection_added';
  title: string;
  description: string;
  timestamp: number;
  user?: string;
}

interface GoalActivityTabProps {
  goal: Goal;
}

export default function GoalActivityTab({ goal }: GoalActivityTabProps) {
  // Mock activity data - in real app this would come from Firebase
  const mockActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'goal_created',
      title: 'Goal Created',
      description: `${goal.title} was created`,
      timestamp: goal.createdAt,
      user: 'You'
    },
    {
      id: '2',
      type: 'milestone_added',
      title: 'Milestone Added',
      description: 'First milestone was added to the goal',
      timestamp: goal.createdAt + 86400000, // 1 day later
      user: 'You'
    },
    {
      id: '3',
      type: 'milestone_completed',
      title: 'Milestone Completed',
      description: 'First milestone was marked as completed',
      timestamp: goal.createdAt + 172800000, // 2 days later
      user: 'You'
    },
    {
      id: '4',
      type: 'reflection_added',
      title: 'Reflection Added',
      description: 'A reflection was added to this goal',
      timestamp: goal.createdAt + 259200000, // 3 days later
      user: 'You'
    },
    {
      id: '5',
      type: 'goal_updated',
      title: 'Goal Updated',
      description: 'Goal description was updated',
      timestamp: goal.updatedAt,
      user: 'You'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'goal_created':
        return 'flag';
      case 'milestone_added':
        return 'add-circle';
      case 'milestone_completed':
        return 'checkmark-circle';
      case 'goal_updated':
        return 'pencil';
      case 'reflection_added':
        return 'chatbubble';
      default:
        return 'list';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'goal_created':
        return '#10B981';
      case 'milestone_added':
        return '#3B82F6';
      case 'milestone_completed':
        return '#059669';
      case 'goal_updated':
        return '#F59E0B';
      case 'reflection_added':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity Timeline</Text>
          
          {mockActivity.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No activity yet</Text>
              <Text style={styles.emptySubtext}>
                Start working on your goal to see activity here
              </Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {mockActivity.map((activity, index) => (
                <View key={activity.id} style={styles.timelineItem}>
                  {/* Timeline line */}
                  <View style={styles.timelineIcon}>
                    <View 
                      style={[
                        styles.iconContainer,
                        { backgroundColor: `${getActivityColor(activity.type)}20` }
                      ]}
                    >
                      <Ionicons 
                        name={getActivityIcon(activity.type) as any} 
                        size={20} 
                        color={getActivityColor(activity.type)} 
                      />
                    </View>
                    {index < mockActivity.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>
                  
                  {/* Activity content */}
                  <View style={styles.activityContent}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityTime}>{formatTimestamp(activity.timestamp)}</Text>
                    </View>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    {activity.user && (
                      <Text style={styles.activityUser}>by {activity.user}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineIcon: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    height: 48,
    backgroundColor: '#E2E8F0',
    marginTop: 8,
  },
  activityContent: {
    flex: 1,
    paddingBottom: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  activityTime: {
    fontSize: 14,
    color: '#64748B',
  },
  activityDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  activityUser: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
