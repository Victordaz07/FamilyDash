import { useEffect } from 'react';
import { useGoalsStore } from '../store/goalsSlice';
import { Goal, GoalStatus, GoalCategory } from '../types/goals';
import { mockGoals } from '../data/mockGoals';

export function useGoals() {
  const store = useGoalsStore();

  // Load mock data on mount (Firebase disabled for testing)
  useEffect(() => {
    if (store.items.length === 0) {
      store.setGoals(mockGoals);
    }
  }, []);
  
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
  };
}
