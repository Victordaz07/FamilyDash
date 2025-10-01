import { useState, useEffect } from 'react';
import { mockGoals, mockCategories, mockFamilyMembers, Goal, GoalCategory, Milestone, Reward } from '../mock/goals';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [categories] = useState<GoalCategory[]>(mockCategories);
  const [familyMembers] = useState(mockFamilyMembers);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Get goals by category
  const getGoalsByCategory = (categoryId: string) => {
    return goals.filter(goal => goal.category === categoryId);
  };

  // Get goals by status
  const getGoalsByStatus = (status: string) => {
    return goals.filter(goal => goal.status === status);
  };

  // Get active goals (in_progress)
  const getActiveGoals = () => {
    return goals.filter(goal => goal.status === 'in_progress');
  };

  // Get completed goals
  const getCompletedGoals = () => {
    return goals.filter(goal => goal.status === 'completed');
  };

  // Get goal by ID
  const getGoalById = (id: string) => {
    return goals.find(goal => goal.id === id);
  };

  // Create new goal
  const createGoal = (goalData: Omit<Goal, 'id' | 'createdDate' | 'progress' | 'milestones' | 'rewards'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      progress: 0,
      milestones: [],
      rewards: []
    };
    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  };

  // Update goal
  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev =>
      prev.map(goal =>
        goal.id === id ? { ...goal, ...updates } : goal
      )
    );
  };

  // Update goal progress
  const updateGoalProgress = (id: string, progress: number) => {
    const goal = getGoalById(id);
    if (!goal) return;

    const updatedGoal = {
      ...goal,
      progress: Math.min(100, Math.max(0, progress)),
      status: progress === 100 ? 'completed' as const : goal.status
    };

    if (progress === 100 && goal.status !== 'completed') {
      updatedGoal.completedDate = new Date().toISOString().split('T')[0];
    }

    updateGoal(id, updatedGoal);
  };

  // Add milestone to goal
  const addMilestone = (goalId: string, milestone: Omit<Milestone, 'id'>) => {
    const goal = getGoalById(goalId);
    if (!goal) return;

    const newMilestone: Milestone = {
      ...milestone,
      id: `milestone_${Date.now()}`
    };

    updateGoal(goalId, {
      milestones: [...goal.milestones, newMilestone]
    });
  };

  // Update milestone
  const updateMilestone = (goalId: string, milestoneId: string, updates: Partial<Milestone>) => {
    const goal = getGoalById(goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(milestone =>
      milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
    );

    updateGoal(goalId, { milestones: updatedMilestones });
  };

  // Complete milestone
  const completeMilestone = (goalId: string, milestoneId: string) => {
    updateMilestone(goalId, milestoneId, {
      completed: true,
      completedDate: new Date().toISOString().split('T')[0],
      progress: 100
    });

    // Update overall goal progress
    const goal = getGoalById(goalId);
    if (goal) {
      const completedMilestones = goal.milestones.filter(m => m.completed).length;
      const totalMilestones = goal.milestones.length;
      const newProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
      updateGoalProgress(goalId, newProgress);
    }
  };

  // Add reward to goal
  const addReward = (goalId: string, reward: Omit<Reward, 'id'>) => {
    const goal = getGoalById(goalId);
    if (!goal) return;

    const newReward: Reward = {
      ...reward,
      id: `reward_${Date.now()}`
    };

    updateGoal(goalId, {
      rewards: [...goal.rewards, newReward]
    });
  };

  // Unlock reward
  const unlockReward = (goalId: string, rewardId: string) => {
    const goal = getGoalById(goalId);
    if (!goal) return;

    const updatedRewards = goal.rewards.map(reward =>
      reward.id === rewardId ? { 
        ...reward, 
        unlocked: true, 
        unlockedDate: new Date().toISOString().split('T')[0] 
      } : reward
    );

    updateGoal(goalId, { rewards: updatedRewards });
  };

  // Delete goal
  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  // Get goals statistics
  const getGoalsStats = () => {
    const total = goals.length;
    const completed = goals.filter(goal => goal.status === 'completed').length;
    const inProgress = goals.filter(goal => goal.status === 'in_progress').length;
    const notStarted = goals.filter(goal => goal.status === 'not_started').length;
    const averageProgress = goals.length > 0 
      ? goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length 
      : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      averageProgress: Math.round(averageProgress)
    };
  };

  // Get family leaderboard
  const getFamilyLeaderboard = () => {
    return [...familyMembers].sort((a, b) => b.points - a.points);
  };

  // Get upcoming milestones
  const getUpcomingMilestones = () => {
    const allMilestones: Array<Milestone & { goalId: string; goalTitle: string }> = [];
    
    goals.forEach(goal => {
      goal.milestones.forEach(milestone => {
        if (!milestone.completed) {
          allMilestones.push({
            ...milestone,
            goalId: goal.id,
            goalTitle: goal.title
          });
        }
      });
    });

    return allMilestones.sort((a, b) => 
      new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    ).slice(0, 5);
  };

  // Get recent achievements
  const getRecentAchievements = () => {
    const allRewards: Array<Reward & { goalId: string; goalTitle: string }> = [];
    
    goals.forEach(goal => {
      goal.rewards.forEach(reward => {
        if (reward.unlocked && reward.unlockedDate) {
          allRewards.push({
            ...reward,
            goalId: goal.id,
            goalTitle: goal.title
          });
        }
      });
    });

    return allRewards.sort((a, b) => 
      new Date(b.unlockedDate!).getTime() - new Date(a.unlockedDate!).getTime()
    ).slice(0, 5);
  };

  return {
    goals,
    categories,
    familyMembers,
    selectedCategory,
    selectedGoal,
    setSelectedCategory,
    setSelectedGoal,
    getGoalsByCategory,
    getGoalsByStatus,
    getActiveGoals,
    getCompletedGoals,
    getGoalById,
    createGoal,
    updateGoal,
    updateGoalProgress,
    addMilestone,
    updateMilestone,
    completeMilestone,
    addReward,
    unlockReward,
    deleteGoal,
    getGoalsStats,
    getFamilyLeaderboard,
    getUpcomingMilestones,
    getRecentAchievements
  };
};
