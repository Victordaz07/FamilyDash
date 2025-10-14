import { create } from 'zustand';
import { Goal, GoalStatus, GoalCategory, GoalStats } from '../types/goals';

interface GoalsState {
  // Data
  items: Goal[];
  loading: boolean;
  error: string | null;
  
  // Filters
  search: string;
  statusFilter: GoalStatus | 'all';
  categoryFilter: GoalCategory | 'all';
  sortBy: 'recent' | 'deadline' | 'progress' | 'alpha';
  view: 'list' | 'cards';
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Filters
  setSearch: (search: string) => void;
  setStatusFilter: (status: GoalStatus | 'all') => void;
  setCategoryFilter: (category: GoalCategory | 'all') => void;
  setSortBy: (sortBy: 'recent' | 'deadline' | 'progress' | 'alpha') => void;
  toggleView: () => void;
  clearFilters: () => void;
  
  // Selectors
  getFilteredGoals: () => Goal[];
  getStats: () => GoalStats;
  getOverdueGoals: () => Goal[];
  getGoalsByCategory: () => Record<GoalCategory, Goal[]>;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  // Initial state
  items: [],
  loading: false,
  error: null,
  search: '',
  statusFilter: 'all',
  categoryFilter: 'all',
  sortBy: 'recent',
  view: 'cards',

  // Basic actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setGoals: (items) => set({ items }),
  
  addGoal: (goal) => set((state) => ({ 
    items: [goal, ...state.items] 
  })),
  
  updateGoal: (id, updates) => set((state) => ({
    items: state.items.map(goal => 
      goal.id === id 
        ? { ...goal, ...updates, updatedAt: Date.now() }
        : goal
    )
  })),
  
  deleteGoal: (id) => set((state) => ({
    items: state.items.filter(goal => goal.id !== id)
  })),

  // Filter actions
  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setSortBy: (sortBy) => set({ sortBy }),
  toggleView: () => set((state) => ({ 
    view: state.view === 'list' ? 'cards' : 'list' 
  })),
  
  clearFilters: () => set({
    search: '',
    statusFilter: 'all',
    categoryFilter: 'all',
    sortBy: 'recent'
  }),

  // Selectors
  getFilteredGoals: () => {
    const state = get();
    let filtered = [...state.items];

    // Search filter
    if (state.search) {
      const searchLower = state.search.toLowerCase();
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(searchLower) ||
        goal.description?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (state.statusFilter !== 'all') {
      filtered = filtered.filter(goal => goal.status === state.statusFilter);
    }

    // Category filter
    if (state.categoryFilter !== 'all') {
      filtered = filtered.filter(goal => goal.category === state.categoryFilter);
    }

    // Sort
    switch (state.sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'deadline':
        filtered.sort((a, b) => {
          if (!a.deadlineAt && !b.deadlineAt) return b.createdAt - a.createdAt;
          if (!a.deadlineAt) return 1;
          if (!b.deadlineAt) return -1;
          return a.deadlineAt - b.deadlineAt;
        });
        break;
      case 'progress':
        filtered.sort((a, b) => {
          const progressA = a.milestonesCount === 0 ? 0 : a.milestonesDone / a.milestonesCount;
          const progressB = b.milestonesCount === 0 ? 0 : b.milestonesDone / b.milestonesCount;
          return progressB - progressA;
        });
        break;
      case 'alpha':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  },

  getStats: () => {
    const goals = get().items;
    const now = Date.now();
    
    return {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      paused: goals.filter(g => g.status === 'paused').length,
      overdue: goals.filter(g => 
        g.status === 'active' && 
        g.deadlineAt && 
        g.deadlineAt < now
      ).length,
    };
  },

  getOverdueGoals: () => {
    const now = Date.now();
    return get().items.filter(goal => 
      goal.status === 'active' && 
      goal.deadlineAt && 
      goal.deadlineAt < now
    );
  },

  getGoalsByCategory: () => {
    const goals = get().items;
    return goals.reduce((acc, goal) => {
      if (!acc[goal.category]) {
        acc[goal.category] = [];
      }
      acc[goal.category].push(goal);
      return acc;
    }, {} as Record<GoalCategory, Goal[]>);
  },
}));
