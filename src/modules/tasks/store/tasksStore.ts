/**
 * TaskStore with Firebase Integration
 * Real-time task management with Firebase Firestore
 */

import { create } from 'zustand';
import React from 'react';
import { Task, TaskStatus, TaskPriority, TaskFilter } from '../types/taskTypes';
// TEMPORARILY DISABLED FOR DEBUGGING
// import { RealDatabaseService, RealAuthService } from '../../../services';
// TEMPORARILY DISABLED - Services causing import conflicts
// import { trackEvent } from '../../../services';
// import { scheduleTaskNotification } from '../../../services/notificationService';

interface TasksState {
  tasks: Task[];
  selectedTask?: Task;
  filters: TaskFilter;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  subscription?: () => void; // For unsubscribing from real-time updates

  // Actions
  initializeTasks: () => Promise<void>;
  setSelectedTask: (id: string) => void;
  clearSelectedTask: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<{ success: boolean; error?: string }>;
  completeTask: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteTask: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Offline Actions (when Firebase is unavailable)
  addTaskOffline: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTaskOffline: (id: string, updates: Partial<Task>) => void;
  completeTaskOffline: (id: string) => void;
  deleteTaskOffline: (id: string) => void;
  syncOfflineTasks: () => Promise<void>;

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

  // Connection & Sync
  checkConnection: () => Promise<boolean>;
  reconnect: () => Promise<void>;
}

export const useTasksStoreWithFirebase = create<TasksState>((set, get) => ({
  tasks: [],
  selectedTask: undefined,
  filters: {},
  isInitialized: false,
  isLoading: false,
  error: null,
  subscription: undefined,

  initializeTasks: async () => {
    const { isInitialized } = get();

    if (isInitialized) {
      console.log('📋 Tasks already initialized, skipping...');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      console.log('📋 Initializing tasks with Firebase...');

      // Check if user is authenticated
      const user = await RealAuthService.getCurrentUser();
      if (!user) {
        console.log('⚠️ No authenticated user, initializing with empty state');
        set({ tasks: [], isInitialized: true, isLoading: false });
        return;
      }

      // Check Firebase connection
      const isConnected = await RealDatabaseService.checkConnection();
      if (!isConnected) {
        console.log('⚠️ Firebase connection failed, falling back to offline mode');
        set({
          tasks: [],
          isInitialized: true,
          isLoading: false,
          error: 'Firebase connection unavailable'
        });
        return;
      }

      // Set up real-time listener for tasks
      const unsubscribe = RealDatabaseService.listenToCollection<Task>(
        `families/${user.uid}/tasks`,
        (tasks, error) => {
          if (error) {
            console.error('❌ Error listening to tasks:', error);
            set({ error: error, isLoading: false });
          } else {
            console.log(`📋 Real-time update: ${tasks.length} tasks received`);
            set({
              tasks,
              isInitialized: true,
              isLoading: false,
              error: null
            });

            // Track analytics (DISABLED - Service conflict)
            // trackEvent('tasks_synced', { 
            //   count: tasks.length,
            //   user_id: user.uid 
            // });
          }
        },
        {
          orderBy: [{ field: 'createdAt', direction: 'desc' }]
        }
      );

      // Store subscription for cleanup
      set({ subscription: unsubscribe });

      console.log('✅ Tasks initialized with Firebase real-time updates');
    } catch (error: any) {
      console.error('❌ Error initializing tasks:', error);
      set({
        error: error.message,
        isInitialized: true,
        isLoading: false
      });
    }
  },

  setSelectedTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    set({ selectedTask: task });
  },

  clearSelectedTask: () => {
    set({ selectedTask: undefined });
  },

  addTask: async (taskData) => {
    set({ isLoading: true, error: null });

    try {
      const user = await RealAuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('📝 Adding task to Firebase...');

      const taskWithMetadata = {
        ...taskData,
        familyId: user.uid, // Assuming single family per user for now
        createdBy: user.uid,
        status: taskData.status || 'pending' as TaskStatus,
        progress: taskData.progress || 0,
        points: taskData.points || 10,
      };

      const result = await RealDatabaseService.createDocument<Task>(
        `families/${user.uid}/tasks`,
        taskWithMetadata
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create task');
      }

      const newTask = result.data;
      set({ isLoading: false });

      // Schedule notification (DISABLED - Service conflict)
      // scheduleTaskNotification({
      //   id: newTask.id,
      //   title: newTask.title,
      //   assignedTo: newTask.assignedTo,
      //   dueDate: newTask.dueDate,
      // });

      // Track analytics (DISABLED - Service conflict)
      // trackEvent('task_created', { 
      //   task_id: newTask.id,
      //   user_id: user.uid,
      //   priority: newTask.priority,
      //   assigned_to: newTask.assignedTo
      // });

      console.log('✅ Task created successfully:', newTask.title);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Error adding task:', error);
      set({ isLoading: false, error: error.message });

      return {
        success: false,
        error: error.message || 'Failed to add task'
      };
    }
  },

  updateTask: async (id, updates) => {
    set({ isLoading: true, error: null });

    try {
      const user = await RealAuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('✏️ Updating task in Firebase...');

      const result = await RealDatabaseService.updateDocument<Task>(
        `families/${user.uid}/tasks`,
        id,
        {
          ...updates,
          updatedBy: user.uid,
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to update task');
      }

      set({ isLoading: false });

      // Track analytics (DISABLED - Service conflict)
      // trackEvent('task_updated', { 
      //   task_id: id,
      //   user_id: user.uid,
      //   updated_fields: Object.keys(updates)
      // });

      console.log('✅ Task updated successfully:', id);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Error updating task:', error);
      set({ isLoading: false, error: error.message });

      return {
        success: false,
        error: error.message || 'Failed to update task'
      };
    }
  },

  completeTask: async (id) => {
    return get().updateTask(id, {
      status: 'completed' as TaskStatus,
      progress: 100,
      completedAt: new Date().toISOString(),
    });
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const user = await RealAuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🗑️ Deleting task from Firebase...');

      const result = await RealDatabaseService.deleteDocument(
        `families/${user.uid}/tasks`,
        id
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete task');
      }

      set({ isLoading: false });

      // Track analytics (DISABLED - Service conflict)
      // trackEvent('task_deleted', { 
      //   task_id: id,
      //   user_id: user.uid
      // });

      console.log('✅ Task deleted successfully:', id);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Error deleting task:', error);
      set({ isLoading: false, error: error.message });

      return {
        success: false,
        error: error.message || 'Failed to delete task'
      };
    }
  },

  // Offline fallback methods
  addTaskOffline: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: `offline_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ tasks: [...state.tasks, newTask] }));

    console.log('📝 Task added offline, will sync when online:', newTask.title);

    // Schedule notification (DISABLED - Service conflict)
    // scheduleTaskNotification({
    //   id: newTask.id,
    //   title: newTask.title,
    //   assignedTo: newTask.assignedTo,
    //   dueDate: newTask.dueDate,
    // });
  },

  updateTaskOffline: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      ),
    }));

    console.log('✏️ Task updated offline, will sync when online:', id);
  },

  completeTaskOffline: (id) => {
    get().updateTaskOffline(id, {
      status: 'completed' as TaskStatus,
      progress: 100,
      completedAt: new Date().toISOString(),
    });
  },

  deleteTaskOffline: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTask: state.selectedTask?.id === id ? undefined : state.selectedTask,
    }));

    console.log('🗑️ Task deleted offline, will sync when online:', id);
  },

  syncOfflineTasks: async () => {
    const { tasks } = get();
    const offlineTasks = tasks.filter(task => task.id.startsWith('offline_task_'));

    if (offlineTasks.length === 0) {
      console.log('📋 No offline tasks to sync');
      return;
    }

    console.log(`📡 Syncing ${offlineTasks.length} offline tasks...`);

    let successCount = 0;
    let errorCount = 0;

    for (const task of offlineTasks) {
      try {
        // Remove offline prefix from ID
        const { id, ...taskData } = task;
        const result = await get().addTask(taskData);

        if (result.success) {
          // Remove offline task
          get().deleteTaskOffline(task.id);
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error('❌ Error syncing offline task:', task.id, error);
        errorCount++;
      }
    }

    console.log(`📡 Sync completed: ${successCount} successful, ${errorCount} errors`);

    // Track analytics (DISABLED - Service conflict)
    // trackEvent('offline_tasks_synced', { 
    //   successful: successCount,
    //   failed: errorCount
    // });
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

  checkConnection: async () => {
    try {
      return await RealDatabaseService.checkConnection();
    } catch (error) {
      console.error('❌ Connection check failed:', error);
      return false;
    }
  },

  reconnect: async () => {
    try {
      console.log('🔄 Attempting to reconnect to Firebase...');
      set({ isLoading: true, error: null });

      // Cleanup existing subscription
      const { subscription } = get();
      if (subscription) {
        subscription();
      }

      // Reinitialize
      await get().initializeTasks();

      console.log('✅ Reconnected to Firebase successfully');
    } catch (error: any) {
      console.error('❌ Reconnection failed:', error);
      set({
        error: error.message,
        isLoading: false
      });
    }
  },
}));

// Hook for easy cleanup on component unmount
export const useTasksStore = () => {
  const store = useTasksStoreWithFirebase();

  // Initialize tasks on first use
  React.useEffect(() => {
    if (!store.isInitialized) {
      store.initializeTasks();
    }

    // Cleanup on unmount
    return () => {
      if (store.subscription) {
        store.subscription();
      }
    };
  }, []);

  return store;
};
