import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Goal, Milestone, Reflection } from '../../types/goals';
import { useGoals } from '../../hooks/useGoals';
import GoalTabs from '../../components/goals/GoalTabs';
import GoalOverviewTab from '../../components/goals/GoalOverviewTab';
import GoalMilestonesTab from '../../components/goals/GoalMilestonesTab';
import GoalActivityTab from '../../components/goals/GoalActivityTab';
import GoalReflectionsTab from '../../components/goals/GoalReflectionsTab';

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
  
  const { updateGoal } = useGoals();

  useEffect(() => {
    // Find the goal from the store
    const { goals } = useGoals.getState();
    const foundGoal = goals.find(g => g.id === goalId);
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
    Alert.alert(
      'Coming Soon',
      'Goal editing will be available in the next update!',
      [{ text: 'OK' }]
    );
  };

  const handleToggleStatus = () => {
    if (!goal) return;
    const newStatus = goal.status === 'active' ? 'paused' : 'active';
    updateGoal(goal.id, { status: newStatus });
    setGoal({ ...goal, status: newStatus });
  };

  const handleToggleMilestone = (milestoneId: string, done: boolean) => {
    setMilestones(prev => prev.map(m => 
      m.id === milestoneId ? { ...m, done } : m
    ));
    // Update goal progress
    if (goal) {
      const newDoneCount = done ? goal.milestonesDone + 1 : goal.milestonesDone - 1;
      updateGoal(goal.id, { milestonesDone: newDoneCount });
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
      updateGoal(goal.id, { milestonesCount: goal.milestonesCount + 1 });
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
      updateGoal(goal.id, { milestonesCount: goal.milestonesCount - 1 });
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
    updateGoal(goal.id, { reflectionCount: (goal.reflectionCount || 0) + 1 });
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
      updateGoal(goal.id, { reflectionCount: Math.max(0, (goal.reflectionCount || 0) - 1) });
      setGoal({ ...goal, reflectionCount: Math.max(0, (goal.reflectionCount || 0) - 1) });
    }
  };

  if (!goal) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Goal not found</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 bg-purple-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-medium">Go Back</Text>
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
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient 
        colors={['#7B6CF6', '#E96AC0']} 
        className="px-5 pt-12 pb-6"
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white/20 rounded-full p-2"
          >
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>
          <View className="flex-1 mx-4">
            <Text className="text-white text-lg font-bold text-center" numberOfLines={1}>
              {goal.title}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleEditGoal}
            className="bg-white/20 rounded-full p-2"
          >
            <Text className="text-white text-lg">✏️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <GoalTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {renderTabContent()}
    </View>
  );
}
