import { collection, addDoc, onSnapshot, query, orderBy, where, updateDoc, doc, serverTimestamp, Timestamp, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'task' | 'penalty' | 'activity' | 'reminder' | 'emergency' | 'family' | 'vote' | 'chat';
    time: Date;
    read: boolean;
    priority: 'low' | 'medium' | 'high';
    userId?: string; // For user-specific notifications
    familyId?: string; // For family-wide notifications
    actionData?: {
        screen?: string;
        params?: any;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

class NotificationService {
    private static instance: NotificationService;
    private listeners: Map<string, () => void> = new Map();

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    // Create a new notification
    async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const notificationData = {
                ...notification,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'notifications'), notificationData);
            console.log('✅ Notification created:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error creating notification:', error);
            throw error;
        }
    }

    // Listen to notifications for a user
    listenToNotifications(
        userId: string,
        familyId: string,
        onUpdate: (notifications: Notification[]) => void
    ): () => void {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('familyId', '==', familyId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                time: doc.data().createdAt?.toDate() || new Date(),
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt,
            })) as Notification[];

            // Filter notifications for this user (user-specific or family-wide)
            const userNotifications = notifications.filter(notif =>
                !notif.userId || notif.userId === userId
            );

            onUpdate(userNotifications);
        }, (error) => {
            console.error('❌ Error listening to notifications:', error);
            onUpdate([]);
        });

        // Store the unsubscribe function
        const listenerKey = `${userId}-${familyId}`;
        this.listeners.set(listenerKey, unsubscribe);

        return unsubscribe;
    }

    // Mark notification as read
    async markAsRead(notificationId: string): Promise<void> {
        try {
            await updateDoc(doc(db, 'notifications', notificationId), {
                read: true,
                updatedAt: serverTimestamp(),
            });
            console.log('✅ Notification marked as read:', notificationId);
        } catch (error) {
            console.error('❌ Error marking notification as read:', error);
            throw error;
        }
    }

    // Mark all notifications as read for a user
    async markAllAsRead(userId: string, familyId: string): Promise<void> {
        try {
            const notificationsRef = collection(db, 'notifications');
            const q = query(
                notificationsRef,
                where('familyId', '==', familyId),
                where('read', '==', false)
            );

            const snapshot = await getDocs(q);
            const batch = writeBatch(db);

            snapshot.docs.forEach((doc) => {
                const notification = doc.data();
                if (!notification.userId || notification.userId === userId) {
                    batch.update(doc.ref, {
                        read: true,
                        updatedAt: serverTimestamp(),
                    });
                }
            });

            await batch.commit();
            console.log('✅ All notifications marked as read');
        } catch (error) {
            console.error('❌ Error marking all notifications as read:', error);
            throw error;
        }
    }

    // Create notification types
    async createTaskNotification(taskTitle: string, assignedTo: string, familyId: string): Promise<void> {
        await this.createNotification({
            title: 'Nueva Tarea Asignada',
            message: `Tienes una nueva tarea: "${taskTitle}"`,
            type: 'task',
            time: new Date(),
            read: false,
            priority: 'medium',
            userId: assignedTo,
            familyId,
            actionData: {
                screen: 'Tasks',
                params: { screen: 'TasksMain' }
            }
        });
    }

    async createTaskCompletedNotification(taskTitle: string, completedBy: string, familyId: string): Promise<void> {
        await this.createNotification({
            title: 'Tarea Completada',
            message: `${completedBy} completó la tarea: "${taskTitle}"`,
            type: 'task',
            time: new Date(),
            read: false,
            priority: 'low',
            familyId,
            actionData: {
                screen: 'Tasks',
                params: { screen: 'TasksMain' }
            }
        });
    }

    async createVoteNotification(voteTitle: string, familyId: string): Promise<void> {
        await this.createNotification({
            title: 'Nueva Votación Familiar',
            message: `Nueva votación disponible: "${voteTitle}"`,
            type: 'vote',
            time: new Date(),
            read: false,
            priority: 'high',
            familyId,
            actionData: {
                screen: 'Tasks',
                params: { screen: 'FamilyVote' }
            }
        });
    }

    async createChatNotification(senderName: string, message: string, familyId: string): Promise<void> {
        await this.createNotification({
            title: 'Nuevo Mensaje Familiar',
            message: `${senderName}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
            type: 'chat',
            time: new Date(),
            read: false,
            priority: 'medium',
            familyId,
            actionData: {
                screen: 'Tasks',
                params: { screen: 'FamilyChat' }
            }
        });
    }

    async createEmergencyNotification(familyId: string): Promise<void> {
        await this.createNotification({
            title: 'Apoyo Emocional Solicitado',
            message: 'Un miembro de la familia necesita apoyo emocional',
            type: 'emergency',
            time: new Date(),
            read: false,
            priority: 'high',
            familyId,
            actionData: {
                screen: 'SafeRoom',
                params: { mode: 'emotional' }
            }
        });
    }

    // Clean up listeners
    cleanup(): void {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners.clear();
    }
}

export default NotificationService.getInstance();
