import { useEffect, useRef } from 'react';
import { useGoalsStore } from '@/store/goalsSlice';
import { Goal, GoalStatus, GoalCategory } from '@/types/goals';
import { mockGoals } from '@/data/mockGoals';
import { useGoalsFirebase } from './useGoalsFirebase';

export function useGoals() {
  const store = useGoalsStore();
  const firebaseLogged = useRef(false);
  const mockLogged = useRef(false);
  
  // Always call the Firebase hook (it will handle errors internally)
  const firebaseHook = useGoalsFirebase('family-1');

  // Load mock data on mount if Firebase fails
  useEffect(() => {
    if (firebaseHook.error && store.items.length === 0) {
      console.warn('🔄 Firebase failed, loading mock data');
      store.setGoals(mockGoals);
    }
  }, [firebaseHook.error, store.items.length, store]);
  
  // Use Firebase if no error, otherwise use local store
  if (!firebaseHook.error) {
    // Only log once when Firebase becomes available
    if (!firebaseLogged.current) {
      console.log('🔥 Using Firebase for Goals');
      firebaseLogged.current = true;
    }
    
    return {
      ...firebaseHook,
      // getState method for backward compatibility
      getState: () => store,
    };
  }

  // Only log once when using mock data
  if (!mockLogged.current) {
    console.log('📱 Using mock data for Goals');
    mockLogged.current = true;
  }

  // Fallback to local store with mock data
  return {
    // State
    state: {
      items: store.items,
      loading: store.loading,
      error: store.error,
      search: store.search,
      statusFilter: store.statusFilter,
      categoryFilter: store.categoryFilter,
      sortBy: store.sortBy,
      view: store.view,
    },
    
    // Actions
    actions: {
      setLoading: store.setLoading,
      setError: store.setError,
      setGoals: store.setGoals,
      addGoal: store.addGoal,
      updateGoal: store.updateGoal,
      deleteGoal: store.deleteGoal,
      setSearch: store.setSearch,
      setStatusFilter: store.setStatusFilter,
      setCategoryFilter: store.setCategoryFilter,
      setSortBy: store.setSortBy,
      toggleView: store.toggleView,
      clearFilters: store.clearFilters,
    },
    
    // Selectors (for backward compatibility)
    goals: store.items,
    loading: store.loading,
    error: store.error,
    search: store.search,
    statusFilter: store.statusFilter,
    categoryFilter: store.categoryFilter,
    sortBy: store.sortBy,
    view: store.view,
    filteredGoals: store.getFilteredGoals(),
    stats: store.getStats(),
    overdueGoals: store.getOverdueGoals(),
    goalsByCategory: store.getGoalsByCategory(),
    
    // Quick actions
    quickFilter: (filter: 'active' | 'completed' | 'overdue') => {
      switch (filter) {
        case 'active':
          store.setStatusFilter('active');
          break;
        case 'completed':
          store.setStatusFilter('completed');
          break;
        case 'overdue':
          // Filter by overdue goals (active + deadline passed)
          store.setStatusFilter('active');
          // TODO: Add overdue filter logic
          break;
      }
    },
    
    // Direct access to store methods (for backward compatibility)
    setLoading: store.setLoading,
    setError: store.setError,
    setGoals: store.setGoals,
    addGoal: store.addGoal,
    updateGoal: store.updateGoal,
    deleteGoal: store.deleteGoal,
    setSearch: store.setSearch,
    setStatusFilter: store.setStatusFilter,
    setCategoryFilter: store.setCategoryFilter,
    setSortBy: store.setSortBy,
    toggleView: store.toggleView,
    clearFilters: store.clearFilters,
    
    // getState method for backward compatibility
    getState: () => store,
  };
}
