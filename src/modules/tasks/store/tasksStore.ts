import { create } from 'zustand';
import { Task, TaskStatus, TaskPriority, TaskFilter } from '../types/taskTypes';

interface TasksState {
  tasks: Task[];
  selectedTask?: Task;
  filters: TaskFilter;
  
  // Actions
  setSelectedTask: (id: string) => void;
  clearSelectedTask: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  
  // Filters
  setFilter: (filter: Partial<TaskFilter>) => void;
  clearFilters: () => void;
  
  // Getters
  getFilteredTasks: () => Task[];
  getTasksByMember: (memberId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByPriority: (priority: TaskPriority) => Task[];
  
  // Stats
  getTaskStats: () => {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
    totalPoints: number;
    earnedPoints: number;
  };
  
  getMemberStats: (memberId: string) => {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
    totalPoints: number;
    earnedPoints: number;
  };
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  selectedTask: undefined,
  filters: {},

  setSelectedTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    set({ selectedTask: task });
  },

  clearSelectedTask: () => {
    set({ selectedTask: undefined });
  },

  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id 
          ? { ...t, ...updates, updatedAt: new Date().toISOString() } 
          : t
      ),
    }));
    
    // Update selected task if it's the one being updated
    const currentSelectedTask = get().selectedTask;
    if (currentSelectedTask?.id === id) {
      const updatedTask = get().tasks.find((t) => t.id === id);
      set({ selectedTask: updatedTask });
    }
  },

  completeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id 
          ? { 
              ...t, 
              status: "completed" as TaskStatus, 
              progress: 100,
              updatedAt: new Date().toISOString()
            } 
          : t
      ),
    }));
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTask: state.selectedTask?.id === id ? undefined : state.selectedTask,
    }));
  },

  setFilter: (filter) => {
    set((state) => ({
      filters: { ...state.filters, ...filter }
    }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      if (filters.memberId && task.assignedTo !== filters.memberId) return false;
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      return true;
    });
  },

  getTasksByMember: (memberId) => {
    return get().tasks.filter((task) => task.assignedTo === memberId);
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((task) => task.status === status);
  },

  getTasksByPriority: (priority) => {
    return get().tasks.filter((task) => task.priority === priority);
  },

  getTaskStats: () => {
    const tasks = get().tasks;
    const completed = tasks.filter((t) => t.status === "completed");
    const pending = tasks.filter((t) => t.status === "pending");
    const overdue = tasks.filter((t) => t.status === "overdue");
    
    return {
      total: tasks.length,
      pending: pending.length,
      completed: completed.length,
      overdue: overdue.length,
      totalPoints: tasks.reduce((sum, t) => sum + t.points, 0),
      earnedPoints: completed.reduce((sum, t) => sum + t.points, 0),
    };
  },

  getMemberStats: (memberId) => {
    const memberTasks = get().getTasksByMember(memberId);
    const completed = memberTasks.filter((t) => t.status === "completed");
    const pending = memberTasks.filter((t) => t.status === "pending");
    const overdue = memberTasks.filter((t) => t.status === "overdue");
    
    return {
      total: memberTasks.length,
      pending: pending.length,
      completed: completed.length,
      overdue: overdue.length,
      totalPoints: memberTasks.reduce((sum, t) => sum + t.points, 0),
      earnedPoints: completed.reduce((sum, t) => sum + t.points, 0),
    };
  },
}));
