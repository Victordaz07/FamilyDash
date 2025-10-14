import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Goal, Milestone, Reflection } from '@/types/goals';
import { useGoals } from '@/hooks/useGoals';
import GoalTabs from '@/components/goals/GoalTabs';
import GoalOverviewTab from '@/components/goals/GoalOverviewTab';
import GoalMilestonesTab from '@/components/goals/GoalMilestonesTab';
import GoalActivityTab from '@/components/goals/GoalActivityTab';
import GoalReflectionsTab from '@/components/goals/GoalReflectionsTab';

interface GoalDetailsScreenProps {
  navigation: any;
  route: any;
}

export default function GoalDetailsScreen({ navigation, route }: GoalDetailsScreenProps) {
  const { goalId } = route.params;
  const [activeTab, setActiveTab] = useState('overview');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  
  const { state, actions } = useGoals();

  useEffect(() => {
    // Find the goal from the store
    const foundGoal = state.items.find(g => g.id === goalId);
    if (foundGoal) {
      setGoal(foundGoal);
      // Mock milestones for this goal
      setMilestones([
        {
          id: '1',
          title: 'Set up study schedule',
          done: true,
          createdAt: Date.now() - 86400000 * 7,
        },
        {
          id: '2',
          title: 'Complete first lesson',
          done: true,
          createdAt: Date.now() - 86400000 * 5,
        },
        {
          id: '3',
          title: 'Practice with family member',
          done: false,
          createdAt: Date.now() - 86400000 * 3,
        },
        {
          id: '4',
          title: 'Take first quiz',
          done: false,
          createdAt: Date.now() - 86400000 * 1,
        },
        {
          id: '5',
          title: 'Have first conversation',
          done: false,
          createdAt: Date.now(),
        }
      ]);
      // Mock reflections
      setReflections([
        {
          id: '1',
          familyId: foundGoal.familyId,
          goalId: foundGoal.id,
          authorId: foundGoal.ownerId,
          content: 'Really excited to start learning Spanish with the family! The first lesson was challenging but fun.',
          createdAt: Date.now() - 86400000 * 2,
          mood: 'happy'
        },
        {
          id: '2',
          familyId: foundGoal.familyId,
          goalId: foundGoal.id,
          authorId: foundGoal.ownerId,
          content: 'Making good progress on the basics. Need to practice more pronunciation.',
          createdAt: Date.now() - 86400000 * 1,
          mood: 'thoughtful'
        }
      ]);
    }
  }, [goalId]);

  const handleEditGoal = () => {
    navigation.navigate('EditGoal', { goalId: goal.id });
  };

  const handleToggleStatus = () => {
    if (!goal) return;
    const newStatus = goal.status === 'active' ? 'paused' : 'active';
    actions.updateGoal(goal.id, { status: newStatus });
    setGoal({ ...goal, status: newStatus });
  };

  const handleToggleMilestone = (milestoneId: string, done: boolean) => {
    setMilestones(prev => prev.map(m => 
      m.id === milestoneId ? { ...m, done } : m
    ));
    // Update goal progress
    if (goal) {
      const newDoneCount = done ? goal.milestonesDone + 1 : goal.milestonesDone - 1;
      actions.updateGoal(goal.id, { milestonesDone: newDoneCount });
      setGoal({ ...goal, milestonesDone: newDoneCount });
    }
  };

  const handleAddMilestone = (title: string) => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title,
      done: false,
      createdAt: Date.now()
    };
    setMilestones(prev => [...prev, newMilestone]);
    if (goal) {
      actions.updateGoal(goal.id, { milestonesCount: goal.milestonesCount + 1 });
      setGoal({ ...goal, milestonesCount: goal.milestonesCount + 1 });
    }
  };

  const handleEditMilestone = (milestoneId: string, title: string) => {
    setMilestones(prev => prev.map(m => 
      m.id === milestoneId ? { ...m, title } : m
    ));
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    setMilestones(prev => prev.filter(m => m.id !== milestoneId));
    if (goal) {
      actions.updateGoal(goal.id, { milestonesCount: goal.milestonesCount - 1 });
      setGoal({ ...goal, milestonesCount: goal.milestonesCount - 1 });
    }
  };

  const handleAddReflection = (content: string, mood?: string) => {
    if (!goal) return;
    const newReflection: Reflection = {
      id: Date.now().toString(),
      familyId: goal.familyId,
      goalId: goal.id,
      authorId: goal.ownerId,
      content,
      createdAt: Date.now(),
      mood: mood as any
    };
    setReflections(prev => [newReflection, ...prev]);
    actions.updateGoal(goal.id, { reflectionCount: (goal.reflectionCount || 0) + 1 });
    setGoal({ ...goal, reflectionCount: (goal.reflectionCount || 0) + 1 });
  };

  const handleEditReflection = (reflectionId: string, content: string) => {
    setReflections(prev => prev.map(r => 
      r.id === reflectionId ? { ...r, content } : r
    ));
  };

  const handleDeleteReflection = (reflectionId: string) => {
    setReflections(prev => prev.filter(r => r.id !== reflectionId));
    if (goal) {
      actions.updateGoal(goal.id, { reflectionCount: Math.max(0, (goal.reflectionCount || 0) - 1) });
      setGoal({ ...goal, reflectionCount: Math.max(0, (goal.reflectionCount || 0) - 1) });
    }
  };

  if (!goal) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Goal not found</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <GoalOverviewTab
            goal={goal}
            onEditGoal={handleEditGoal}
            onToggleStatus={handleToggleStatus}
          />
        );
      case 'milestones':
        return (
          <GoalMilestonesTab
            milestones={milestones}
            onToggleMilestone={handleToggleMilestone}
            onAddMilestone={handleAddMilestone}
            onEditMilestone={handleEditMilestone}
            onDeleteMilestone={handleDeleteMilestone}
          />
        );
      case 'activity':
        return <GoalActivityTab goal={goal} />;
      case 'reflections':
        return (
          <GoalReflectionsTab
            reflections={reflections}
            onAddReflection={handleAddReflection}
            onEditReflection={handleEditReflection}
            onDeleteReflection={handleDeleteReflection}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient 
        colors={['#3B82F6', '#10B981']} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText} numberOfLines={1}>
              {goal.title}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleEditGoal}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>✏️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <GoalTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#64748B',
    fontSize: 16,
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});




