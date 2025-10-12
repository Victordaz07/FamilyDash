import { useEffect, useState } from 'react';
import { useGoals } from './useGoals';
import { useAuth } from '../contexts/AuthContext';
import * as goalsService from '../services/goalsService';
import { Goal, Milestone, Reflection } from '../types/goals';

/**
 * Hook to sync Goals with Firebase
 */
export function useGoalsFirebase() {
  const { user } = useAuth();
  const { setGoals, setLoading, setError } = useGoals();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!user?.familyId) {
      setInitialized(false);
      return;
    }

    // Subscribe to real-time updates
    const unsubscribe = goalsService.subscribeFamilyGoals(
      user.familyId,
      (goals) => {
        setGoals(goals);
        setLoading(false);
        setInitialized(true);
      },
      (error) => {
        console.error('Goals subscription error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.familyId]);

  return { initialized };
}

/**
 * Hook to sync a specific goal's milestones with Firebase
 */
export function useGoalMilestonesFirebase(goalId: string) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!goalId) return;

    setLoading(true);
    
    const unsubscribe = goalsService.subscribeGoalMilestones(
      goalId,
      (data) => {
        setMilestones(data);
        setLoading(false);
      },
      (err) => {
        console.error('Milestones subscription error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [goalId]);

  return { milestones, loading, error };
}

/**
 * Hook to sync a specific goal's reflections with Firebase
 */
export function useGoalReflectionsFirebase(goalId: string) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!goalId) return;

    setLoading(true);
    
    const unsubscribe = goalsService.subscribeGoalReflections(
      goalId,
      (data) => {
        setReflections(data);
        setLoading(false);
      },
      (err) => {
        console.error('Reflections subscription error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [goalId]);

  return { reflections, loading, error };
}
