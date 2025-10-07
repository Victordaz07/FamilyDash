/**
 * Tasks Service - Firebase Integration
 * Complete task management with real-time updates, photo uploads, and offline support
 */

import { db, storage } from '../config/firebase';
import {
    addDoc, collection, doc, onSnapshot, orderBy, query,
    serverTimestamp, updateDoc, where, Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TaskStatus = 'pending' | 'completed' | 'overdue';
export type TaskType = 'text' | 'photo';

export interface TaskInput {
    title: string;
    description?: string;
    type?: TaskType;
    assignedTo?: string | null;
    dueAt?: Date | null;
    points?: number;
    attachments?: { kind: 'photo' | 'video'; url: string }[];
}

export interface Task {
    id: string;
    title: string;
    description: string;
    type: TaskType;
    status: TaskStatus;
    assignedTo: string | null;
    dueAt: Timestamp | null;
    points: number;
    attachments: { kind: 'photo' | 'video'; url: string }[];
    createdBy: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    archived: boolean;
    archivedAt?: Timestamp;
}

export interface Reward {
    id: string;
    name: string;
    points: number;
    active: boolean;
    createdAt: Timestamp;
}

const TASKS = 'tasks';
const REWARDS = 'rewards';

/**
 * Listen to tasks in real-time with optional filtering
 * Fetches all documents and filters client-side to avoid any Firebase index requirements
 */
export function listenTasks(opts: {
    status?: TaskStatus | 'all';
    assignedTo?: string | null;
    archived?: boolean;
    onData: (docs: Task[]) => void;
}) {
    console.log('📋 Setting up tasks listener with options:', opts);

    const base = collection(db, TASKS);

    // Fetch ALL documents without any filters to avoid any index requirements
    const q = query(base);

    return onSnapshot(q,
        (snapshot) => {
            let items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task));

            // Apply ALL filtering on the client side
            const archived = opts.archived !== undefined ? opts.archived : false;
            items = items.filter(task => task.archived === archived);

            if (opts.status && opts.status !== 'all') {
                items = items.filter(task => task.status === opts.status);
            }

            if (opts.assignedTo) {
                items = items.filter(task => task.assignedTo === opts.assignedTo);
            }

            // Sort by creation date (most recent first)
            items = items.sort((a, b) => {
                const aTime = a.createdAt?.toDate?.() || new Date(0);
                const bTime = b.createdAt?.toDate?.() || new Date(0);
                return bTime.getTime() - aTime.getTime();
            });

            console.log(`📋 Received ${items.length} tasks from Firebase (filtered from ${snapshot.docs.length} total)`);
            opts.onData(items);
        },
        (error) => {
            console.error('📋 Error listening to tasks:', error);
            // If even fetching all documents fails, there's a deeper issue
            opts.onData([]);
        }
    );
}

/**
 * Create a new task
 */
export async function createTask(input: TaskInput): Promise<string> {
    console.log('📋 Creating new task:', input.title);

    const payload = {
        title: input.title,
        description: input.description ?? '',
        type: input.type ?? 'text',
        status: 'pending' as TaskStatus,
        assignedTo: input.assignedTo ?? null,
        dueAt: input.dueAt ? Timestamp.fromDate(input.dueAt) : null,
        points: input.points ?? 0,
        attachments: input.attachments ?? [],
        createdBy: 'current-user', // TODO: Get from auth context
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        archived: false,
    };

    try {
        const docRef = await addDoc(collection(db, TASKS), payload);
        console.log('✅ Task created successfully:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error creating task:', error);

        // Fallback offline - save to AsyncStorage
        try {
            const pending = JSON.parse((await AsyncStorage.getItem('pending_tasks')) || '[]');
            pending.push({ ...payload, id: `pending_${Date.now()}` });
            await AsyncStorage.setItem('pending_tasks', JSON.stringify(pending));
            console.log('💾 Task saved offline, will retry when online');
        } catch (storageError) {
            console.error('❌ Failed to save task offline:', storageError);
        }

        throw error;
    }
}

/**
 * Update an existing task
 */
export async function updateTask(taskId: string, updates: Partial<TaskInput>): Promise<void> {
    console.log('📝 Updating task:', taskId, updates);

    try {
        const updateData: any = {
            updatedAt: serverTimestamp(),
        };

        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.type !== undefined) updateData.type = updates.type;
        if (updates.assignedTo !== undefined) updateData.assignedTo = updates.assignedTo;
        if (updates.dueAt !== undefined) {
            updateData.dueAt = updates.dueAt ? Timestamp.fromDate(updates.dueAt) : null;
        }
        if (updates.points !== undefined) updateData.points = updates.points;
        if (updates.attachments !== undefined) updateData.attachments = updates.attachments;

        await updateDoc(doc(db, TASKS, taskId), updateData);
        console.log('✅ Task updated successfully');
    } catch (error) {
        console.error('❌ Error updating task:', error);
        throw error;
    }
}

/**
 * Mark task as completed and archive it
 */
export async function completeTask(taskId: string): Promise<void> {
    console.log('✅ Completing and archiving task:', taskId);

    try {
        await updateDoc(doc(db, TASKS, taskId), {
            status: 'completed',
            archived: true,
            archivedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        console.log('✅ Task completed and archived successfully');
    } catch (error) {
        console.error('❌ Error completing task:', error);
        throw error;
    }
}

/**
 * Restore an archived task (unarchive it)
 */
export async function restoreTask(taskId: string): Promise<void> {
    console.log('🔄 Restoring archived task:', taskId);

    try {
        await updateDoc(doc(db, TASKS, taskId), {
            archived: false,
            archivedAt: null,
            updatedAt: serverTimestamp(),
        });
        console.log('✅ Task restored successfully');
    } catch (error) {
        console.error('❌ Error restoring task:', error);
        throw error;
    }
}

/**
 * Delete a task permanently
 */
export async function deleteTask(taskId: string): Promise<void> {
    console.log('🗑️ Deleting task permanently:', taskId);

    try {
        await updateDoc(doc(db, TASKS, taskId), {
            archived: true,
            archivedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        console.log('✅ Task deleted successfully');
    } catch (error) {
        console.error('❌ Error deleting task:', error);
        throw error;
    }
}

/**
 * Upload photo and create task with image
 */
export async function uploadPhotoAndCreateTask(params: {
    localUri: string;
    title: string;
    description?: string;
    assignedTo?: string | null;
    points?: number;
}): Promise<string> {
    console.log('📸 Uploading photo and creating task:', params.title);
    console.log('📸 Local URI:', params.localUri);

    try {
        // Upload image to Firebase Storage
        const fileName = `tasks/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        console.log('📸 Storage file name:', fileName);

        const storageRef = ref(storage, fileName);
        console.log('📸 Storage ref created');

        console.log('📸 Fetching image from local URI...');
        const response = await fetch(params.localUri);
        console.log('📸 Fetch response status:', response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        console.log('📸 Blob created, size:', blob.size);

        console.log('📸 Uploading to Firebase Storage...');
        await uploadBytes(storageRef, blob);
        console.log('📸 Upload completed');

        const url = await getDownloadURL(storageRef);
        console.log('📸 Photo uploaded successfully:', url);

        // Create task with photo attachment
        console.log('📸 Creating task in Firestore...');
        const taskId = await createTask({
            title: params.title,
            description: params.description,
            type: 'photo',
            assignedTo: params.assignedTo ?? null,
            points: params.points ?? 0,
            attachments: [{ kind: 'photo', url }],
        });

        console.log('✅ Photo task created with ID:', taskId);
        return taskId;
    } catch (error) {
        console.error('❌ Error uploading photo task:', error);
        console.error('❌ Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            params
        });
        throw error;
    }
}

/**
 * Upload video and create task with video attachment
 */
export async function uploadVideoAndCreateTask(params: {
    localUri: string;
    title: string;
    description?: string;
    points?: number;
}): Promise<string> {
    console.log('🎥 Uploading video and creating task:', params.title);

    try {
        // Upload video to Firebase Storage
        const fileName = `tasks/videos/${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`;
        const storageRef = ref(storage, fileName);

        const response = await fetch(params.localUri);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);

        console.log('🎥 Video uploaded successfully:', url);

        // Create task with video attachment
        return await createTask({
            title: params.title,
            description: params.description ?? 'Please follow these video instructions.',
            type: 'text',
            points: params.points ?? 0,
            attachments: [{ kind: 'video', url }],
        });
    } catch (error) {
        console.error('❌ Error uploading video task:', error);
        throw error;
    }
}

/**
 * Create a new reward
 */
export async function createReward(name: string, points: number): Promise<string> {
    console.log('🏆 Creating new reward:', name, 'worth', points, 'points');

    try {
        const docRef = await addDoc(collection(db, REWARDS), {
            name,
            points,
            active: true,
            createdAt: serverTimestamp(),
        });
        console.log('✅ Reward created successfully:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error creating reward:', error);
        throw error;
    }
}

/**
 * Listen to rewards in real-time
 */
export function listenRewards(onData: (rewards: Reward[]) => void) {
    console.log('🏆 Setting up rewards listener');

    const q = query(
        collection(db, REWARDS),
        where('active', '==', true),
        orderBy('points', 'asc')
    );

    return onSnapshot(q,
        (snapshot) => {
            const rewards = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Reward));
            console.log(`🏆 Received ${rewards.length} rewards from Firebase`);
            onData(rewards);
        },
        (error) => {
            console.error('🏆 Error listening to rewards:', error);
            onData([]);
        }
    );
}

/**
 * Retry pending tasks when back online
 */
export async function retryPendingTasks(): Promise<void> {
    try {
        const pending = JSON.parse((await AsyncStorage.getItem('pending_tasks')) || '[]');

        if (pending.length === 0) {
            console.log('📋 No pending tasks to retry');
            return;
        }

        console.log(`📋 Retrying ${pending.length} pending tasks`);

        for (const task of pending) {
            try {
                await createTask(task);
                console.log('✅ Retried task successfully:', task.title);
            } catch (error) {
                console.error('❌ Failed to retry task:', task.title, error);
            }
        }

        // Clear pending tasks after retry
        await AsyncStorage.removeItem('pending_tasks');
        console.log('📋 Cleared pending tasks after retry');
    } catch (error) {
        console.error('❌ Error retrying pending tasks:', error);
    }
}
