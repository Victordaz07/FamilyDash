/**
 * Tasks Service - Firebase Integration
 * FamilyDash v1.4.0-pre - Real-time Task Management
 */

import DatabaseService, { DatabaseResult } from './DatabaseService';
import Logger from './Logger';

export interface Task {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'monthly' | 'one-time';
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo: string | null; // User ID
    assignedBy: string; // User ID who created/assigned
    dueAt: Date | null;
    completedAt: Date | null;
    points: number;
    attachments: {
        type: 'image' | 'video' | 'audio' | 'document';
        url: string;
        name: string;
    }[];
    tags: string[];
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    archived: boolean;
    archivedAt: Date | null;
}

export interface TaskInput {
    title: string;
    description: string;
    type: Task['type'];
    priority: Task['priority'];
    assignedTo?: string | null;
    dueAt?: Date | null;
    points?: number;
    attachments?: Task['attachments'];
    tags?: string[];
    notes?: string;
}

export interface TaskFilters {
    status?: Task['status'];
    type?: Task['type'];
    priority?: Task['priority'];
    assignedTo?: string | null;
    archived?: boolean;
    tags?: string[];
}

const COLLECTION = 'tasks';

export const TasksService = {
    /**
     * Create a new task
     */
    async create(taskData: TaskInput, assignedBy: string): Promise<DatabaseResult<Task>> {
        Logger.debug('📝 Creating new task:', taskData);

        const task: Omit<Task, 'id'> = {
            ...taskData,
            status: 'pending',
            assignedBy,
            completedAt: null,
            attachments: taskData.attachments || [],
            tags: taskData.tags || [],
            notes: taskData.notes || '',
            archived: false,
            archivedAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return await DatabaseService.add<Task>(COLLECTION, task);
    },

    /**
     * Get all tasks with optional filtering
     */
    async getAll(filters?: TaskFilters): Promise<DatabaseResult<Task[]>> {
        Logger.debug('📖 Getting all tasks with filters:', filters);

        const options = filters ? {
            where: Object.entries(filters)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([field, value]) => ({
                    field,
                    operator: '==',
                    value
                })),
            orderBy: [{ field: 'createdAt', direction: 'desc' as const }]
        } : {
            orderBy: [{ field: 'createdAt', direction: 'desc' as const }]
        };

        return await DatabaseService.getAll<Task>(COLLECTION, options);
    },

    /**
     * Get tasks by user ID
     */
    async getByUser(userId: string, includeArchived: boolean = false): Promise<DatabaseResult<Task[]>> {
        Logger.debug(`📖 Getting tasks for user ${userId}`);

        const filters: TaskFilters = {
            assignedTo: userId,
            archived: includeArchived
        };

        return await this.getAll(filters);
    },

    /**
     * Get a single task by ID
     */
    async getById(id: string): Promise<DatabaseResult<Task>> {
        Logger.debug(`📖 Getting task ${id}`);
        return await DatabaseService.getById<Task>(COLLECTION, id);
    },

    /**
     * Update a task
     */
    async update(id: string, updates: Partial<TaskInput>): Promise<DatabaseResult<Task>> {
        Logger.debug(`📝 Updating task ${id}:`, updates);

        const updateData = {
            ...updates,
            updatedAt: new Date()
        };

        return await DatabaseService.update<Task>(COLLECTION, id, updateData);
    },

    /**
     * Mark task as completed
     */
    async complete(id: string): Promise<DatabaseResult<Task>> {
        Logger.debug(`✅ Completing task ${id}`);

        return await this.update(id, {
            status: 'completed',
            completedAt: new Date()
        });
    },

    /**
     * Archive a task
     */
    async archive(id: string): Promise<DatabaseResult<Task>> {
        Logger.debug(`📦 Archiving task ${id}`);

        return await this.update(id, {
            archived: true,
            archivedAt: new Date()
        });
    },

    /**
     * Restore an archived task
     */
    async restore(id: string): Promise<DatabaseResult<Task>> {
        Logger.debug(`🔄 Restoring task ${id}`);

        return await this.update(id, {
            archived: false,
            archivedAt: null
        });
    },

    /**
     * Delete a task permanently
     */
    async delete(id: string): Promise<DatabaseResult> {
        Logger.debug(`🗑️ Deleting task ${id}`);
        return await DatabaseService.remove(COLLECTION, id);
    },

    /**
     * Listen to real-time task updates
     */
    listen(
        callback: (tasks: Task[]) => void,
        filters?: TaskFilters
    ): () => void {
        Logger.debug('👂 Setting up real-time task listener');

        const options = filters ? {
            where: Object.entries(filters)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([field, value]) => ({
                    field,
                    operator: '==',
                    value
                })),
            orderBy: [{ field: 'createdAt', direction: 'desc' as const }]
        } : {
            orderBy: [{ field: 'createdAt', direction: 'desc' as const }]
        };

        return DatabaseService.listen<Task>(COLLECTION, callback, options);
    },

    /**
     * Listen to tasks for a specific user
     */
    listenByUser(
        userId: string,
        callback: (tasks: Task[]) => void,
        includeArchived: boolean = false
    ): () => void {
        Logger.debug(`👂 Setting up real-time task listener for user ${userId}`);

        const filters: TaskFilters = {
            assignedTo: userId,
            archived: includeArchived
        };

        return this.listen(callback, filters);
    },

    /**
     * Get task statistics
     */
    async getStats(userId?: string): Promise<DatabaseResult<{
        total: number;
        pending: number;
        inProgress: number;
        completed: number;
        archived: number;
        totalPoints: number;
        completedPoints: number;
    }>> {
        try {
            Logger.debug('📊 Getting task statistics');

            const filters: TaskFilters = userId ? { assignedTo: userId } : {};
            const result = await this.getAll(filters);

            if (!result.success || !result.data) {
                return { success: false, error: 'Failed to get tasks for statistics' };
            }

            const tasks = result.data;
            const stats = {
                total: tasks.length,
                pending: tasks.filter(t => t.status === 'pending').length,
                inProgress: tasks.filter(t => t.status === 'in-progress').length,
                completed: tasks.filter(t => t.status === 'completed').length,
                archived: tasks.filter(t => t.archived).length,
                totalPoints: tasks.reduce((sum, t) => sum + t.points, 0),
                completedPoints: tasks
                    .filter(t => t.status === 'completed')
                    .reduce((sum, t) => sum + t.points, 0)
            };

            Logger.debug('📊 Task statistics:', stats);
            return { success: true, data: stats };
        } catch (error: any) {
            Logger.error('❌ Error getting task statistics:', error);
            return {
                success: false,
                error: error.message || 'Failed to get statistics'
            };
        }
    },

    /**
     * Search tasks by title or description
     */
    async search(query: string, userId?: string): Promise<DatabaseResult<Task[]>> {
        try {
            Logger.debug(`🔍 Searching tasks with query: "${query}"`);

            // Get all tasks first (Firestore doesn't support full-text search)
            const filters: TaskFilters = userId ? { assignedTo: userId } : {};
            const result = await this.getAll(filters);

            if (!result.success || !result.data) {
                return { success: false, error: 'Failed to get tasks for search' };
            }

            // Filter by search query
            const searchQuery = query.toLowerCase();
            const filteredTasks = result.data.filter(task =>
                task.title.toLowerCase().includes(searchQuery) ||
                task.description.toLowerCase().includes(searchQuery) ||
                task.tags.some(tag => tag.toLowerCase().includes(searchQuery))
            );

            Logger.debug(`🔍 Found ${filteredTasks.length} tasks matching "${query}"`);
            return { success: true, data: filteredTasks };
        } catch (error: any) {
            Logger.error('❌ Error searching tasks:', error);
            return {
                success: false,
                error: error.message || 'Failed to search tasks'
            };
        }
    }
};

export default TasksService;




