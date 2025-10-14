import { useEffect, useState } from 'react';
import { useGoalsStore } from '../store/goalsSlice';
import { Goal, Milestone, Reflection } from '../types/goals';

export function useGoalsFirebase(familyId: string = 'family-1') {
  const store = useGoalsStore();
  const [loading, setLoading] = useState(false); // Start with false
  const [error, setError] = useState<string | null>(null);
  const [firebaseAvailable, setFirebaseAvailable] = useState(false);

  // Check Firebase availability (no auth required for development)
  useEffect(() => {
    const checkFirebase = async () => {
      try {
        // Try to import Firebase services dynamically
        const { db } = await import('@/config/firebase');
        
        console.log('✅ Firebase available (development mode - no auth required)');
        setFirebaseAvailable(true);
        setError(null);
      } catch (err) {
        console.warn('❌ Firebase not available:', err);
        setError('Firebase not available');
        setFirebaseAvailable(false);
        setLoading(false);
      }
    };

    checkFirebase();
  }, []);

  // Load goals from Firebase when available
  useEffect(() => {
    if (!firebaseAvailable) return;

    let unsubscribe: (() => void) | null = null;

    const loadGoals = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamic import to avoid initialization issues
        const { subscribeFamilyGoals } = await import('../services/goalsService');
        
        // Subscribe to real-time updates
        unsubscribe = subscribeFamilyGoals(
          familyId,
          (goals) => {
            console.log('📊 Goals loaded from Firebase:', goals.length);
            store.setGoals(goals);
            setLoading(false);
            setError(null);
          },
          (error) => {
            console.error('❌ Goals subscription error:', error);
            setError(error.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('❌ Error loading goals:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    loadGoals();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [familyId, firebaseAvailable]); // Removed 'store' from dependencies

  // Goals CRUD operations with dynamic imports
  const addGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!firebaseAvailable) {
        throw new Error('Firebase not available');
      }

      setError(null);
      const { createGoal } = await import('../services/goalsService');
      const goalId = await createGoal({
        ...goalData,
        familyId
      });
      
      return goalId;
    } catch (err) {
      console.error('Error adding goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to add goal');
      throw err;
    }
  };

  const updateGoalById = async (goalId: string, updates: Partial<Goal>) => {
    try {
      if (!firebaseAvailable) {
        throw new Error('Firebase not available');
      }

      setError(null);
      const { updateGoal } = await import('../services/goalsService');
      await updateGoal(goalId, updates);
    } catch (err) {
      console.error('Error updating goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to update goal');
      throw err;
    }
  };

  const removeGoal = async (goalId: string) => {
    try {
      if (!firebaseAvailable) {
        throw new Error('Firebase not available');
      }

      setError(null);
      const { deleteGoal } = await import('../services/goalsService');
      await deleteGoal(goalId);
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
      throw err;
    }
  };

  // Milestones operations
  const addMilestone = async (goalId: string, milestoneData: Omit<Milestone, 'id' | 'createdAt'>) => {
    try {
      if (!firebaseAvailable) {
        throw new Error('Firebase not available');
      }

      setError(null);
      const { createMilestone } = await import('../services/goalsService');
      const milestoneId = await createMilestone(goalId, milestoneData);
      
      // Update goal's milestone count
      const goal = store.items.find(g => g.id === goalId);
      if (goal) {
        await updateGoalById(goalId, {
          milestonesCount: goal.milestonesCount + 1
        });
      }
      
      return milestoneId;
    } catch (err) {
      console.error('Error adding milestone:', err);
      setError(err instanceof Error ? err.message : 'Failed to add milestone');
      throw err;
    }
  };

  const updateMilestoneById = async (goalId: string, milestoneId: string, updates: Partial<Milestone>) => {
    try {
      if (!firebaseAvailable) {
        throw new Error('Firebase not available');
      }

      setError(null);
      const { updateMilestone } = await import('../services/goalsService');
      await updateMilestone(goalId, milestoneId, updates);
      
      // Update goal's milestone progress if needed
      if (updates.hasOwnProperty('done')) {
        const goal = store.items.find(g => g.id === goalId);
        if (goal) {
          const newDoneCount = updates.done ? goal.milestonesDone + 1 : goal.milestonesDone - 1;
          await updateGoalById(goalId, {
            milestonesDone: Math.max(0, newDoneCount)
          });
        }
      }
    } catch (err) {
      console.error('Error updating milestone:', err);
      setError(err instanceof Error ? err.message : 'Failed to update milestone');
      throw err;
    }
  };

  const removeMilestone = async (goalId: string, milestoneId: string) => {
    try {
      if (!firebaseAvailable) {
        throw new Error('Firebase not available');
      }

      setError(null);
      const { deleteMilestone } = await import('../services/goalsService');
      await deleteMilestone(goalId, milestoneId);
      
      // Update goal's milestone count
      const goal = store.items.find(g => g.id === goalId);
      if (goal) {
        await updateGoalById(goalId, {
          milestonesCount: Math.max(0, goal.milestonesCount - 1)
        });
      }
    } catch (err) {
      console.error('Error deleting milestone:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete milestone');
      throw err;
    }
  };

  // Reflections operations
  const addReflection = async (reflectionData: Omit<Reflection, 'id' | 'createdAt'>) => {
    try {
      if (!firebaseAvailable) {
        throw new Error('Firebase not available');
      }

      setError(null);
      const { createReflection } = await import('../services/goalsService');
      const reflectionId = await createReflection(reflectionData);
      
      // Update goal's reflection count if it's associated with a goal
      if (reflectionData.goalId) {
        const goal = store.items.find(g => g.id === reflectionData.goalId);
        if (goal) {
          await updateGoalById(reflectionData.goalId, {
            reflectionCount: (goal.reflectionCount || 0) + 1
          });
        }
      }
      
      return reflectionId;
    } catch (err) {
      console.error('Error adding reflection:', err);
      setError(err instanceof Error ? err.message : 'Failed to add reflection');
      throw err;
    }
  };

  const updateReflectionById = async (reflectionId: string, updates: Partial<Reflection>) => {
    try {
      if (!firebaseAvailable) {
        throw new Error('Firebase not available');
      }

      setError(null);
      const { updateReflection } = await import('../services/goalsService');
      await updateReflection(reflectionId, updates);
    } catch (err) {
      console.error('Error updating reflection:', err);
      setError(err instanceof Error ? err.message : 'Failed to update reflection');
      throw err;
    }
  };

  const removeReflection = async (reflectionId: string, goalId?: string) => {
    try {
      if (!firebaseAvailable) {
        throw new Error('Firebase not available');
      }

      setError(null);
      const { deleteReflection } = await import('../services/goalsService');
      await deleteReflection(reflectionId);
      
      // Update goal's reflection count if it's associated with a goal
      if (goalId) {
        const goal = store.items.find(g => g.id === goalId);
        if (goal) {
          await updateGoalById(goalId, {
            reflectionCount: Math.max(0, (goal.reflectionCount || 0) - 1)
          });
        }
      }
    } catch (err) {
      console.error('Error deleting reflection:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete reflection');
      throw err;
    }
  };

  return {
    // State
    goals: store.items,
    loading,
    error,
    search: store.search,
    statusFilter: store.statusFilter,
    categoryFilter: store.categoryFilter,
    sortBy: store.sortBy,
    view: store.view,
    filteredGoals: store.getFilteredGoals(),
    stats: store.getStats(),
    overdueGoals: store.getOverdueGoals(),
    goalsByCategory: store.getGoalsByCategory(),

    // Actions
    setSearch: store.setSearch,
    setStatusFilter: store.setStatusFilter,
    setCategoryFilter: store.setCategoryFilter,
    setSortBy: store.setSortBy,
    toggleView: store.toggleView,
    clearFilters: store.clearFilters,

    // Firebase CRUD operations
    addGoal,
    updateGoal: updateGoalById,
    deleteGoal: removeGoal,
    addMilestone,
    updateMilestone: updateMilestoneById,
    deleteMilestone: removeMilestone,
    addReflection,
    updateReflection: updateReflectionById,
    deleteReflection: removeReflection,

    // Quick filters
    quickFilter: (filter: 'active' | 'completed' | 'overdue') => {
      switch (filter) {
        case 'active':
          store.setStatusFilter('active');
          break;
        case 'completed':
          store.setStatusFilter('completed');
          break;
        case 'overdue':
          store.setStatusFilter('active');
          // TODO: Add overdue filter logic
          break;
      }
    },
  };
}