/**
 * 🔔 NOTIFICATIONS SLICE
 * Manages in-app notifications, settings, and sync
 */

import { Notification, NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from '@/types/notifications';
import { getFirestore, collection, doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/services/firebase';

const db = getFirestore(app);

let unsubscribeNotifications: (() => void) | null = null;
let unsubscribeSettings: (() => void) | null = null;
let unsubscribeAuth: (() => void) | null = null;

export interface NotificationsState {
  notifications: Record<string, Notification>;
  unreadCount: number;
  settings: NotificationSettings;
  
  // Actions
  addNotification: (n: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setSettings: (partial: Partial<NotificationSettings>) => void;
  startNotificationsSync: () => (() => void);
}

/**
 * Calculate unread count
 */
const calculateUnreadCount = (notifications: Record<string, Notification>): number => {
  return Object.values(notifications).filter(n => !n.read).length;
};

/**
 * Initial state
 */
export const initialNotificationsState: Pick<NotificationsState, 'notifications' | 'unreadCount' | 'settings'> = {
  notifications: {},
  unreadCount: 0,
  settings: DEFAULT_NOTIFICATION_SETTINGS,
};

/**
 * Create notifications slice for Zustand store
 */
export const createNotificationsSlice = (set: any, get: any) => ({
  ...initialNotificationsState,
  
  /**
   * Add notification (idempotent by id)
   */
  addNotification: (n: Notification) => {
    const state = get();
    if (state.notifications[n.id]) return; // Already exists
    
    const newNotifications = { ...state.notifications, [n.id]: n };
    set({
      notifications: newNotifications,
      unreadCount: calculateUnreadCount(newNotifications),
    });
    
    // Push to Firestore
    const auth = getAuth(app);
    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, 'users', uid, 'notifications', n.id), {
        ...n,
        createdAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});
    }
  },
  
  /**
   * Mark notification as read
   */
  markAsRead: (id: string) => {
    const state = get();
    const notif = state.notifications[id];
    if (!notif || notif.read) return; // Already read
    
    const newNotifications = {
      ...state.notifications,
      [id]: { ...notif, read: true },
    };
    
    set({
      notifications: newNotifications,
      unreadCount: calculateUnreadCount(newNotifications),
    });
    
    // Update in Firestore
    const auth = getAuth(app);
    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, 'users', uid, 'notifications', id), {
        read: true,
      }, { merge: true }).catch(() => {});
    }
  },
  
  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => {
    const state = get();
    const newNotifications = Object.fromEntries(
      Object.entries(state.notifications).map(([id, notif]) => [id, { ...notif, read: true }])
    );
    
    set({
      notifications: newNotifications,
      unreadCount: 0,
    });
    
    // Update all in Firestore (batch would be better, but simple approach for now)
    const auth = getAuth(app);
    const uid = auth.currentUser?.uid;
    if (uid) {
      Object.keys(state.notifications).forEach(id => {
        setDoc(doc(db, 'users', uid, 'notifications', id), {
          read: true,
        }, { merge: true }).catch(() => {});
      });
    }
  },
  
  /**
   * Update notification settings
   */
  setSettings: (partial: Partial<NotificationSettings>) => {
    const state = get();
    const newSettings = { ...state.settings, ...partial };
    set({ settings: newSettings });
    
    // Save to Firestore
    const auth = getAuth(app);
    const uid = auth.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, 'users', uid, 'settings', 'notifications'), newSettings, { merge: true }).catch(() => {});
    }
  },
  
  /**
   * Start notifications sync
   */
  startNotificationsSync: () => {
    const auth = getAuth(app);
    
    if (unsubscribeAuth) unsubscribeAuth();
    
    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Cleanup previous listeners
      if (unsubscribeNotifications) { unsubscribeNotifications(); unsubscribeNotifications = null; }
      if (unsubscribeSettings) { unsubscribeSettings(); unsubscribeSettings = null; }
      
      if (!user) return;
      const uid = user.uid;
      
      // Listen to settings
      unsubscribeSettings = onSnapshot(doc(db, 'users', uid, 'settings', 'notifications'), (docSnap) => {
        if (docSnap.exists()) {
          set({ settings: { ...DEFAULT_NOTIFICATION_SETTINGS, ...docSnap.data() } });
        }
      });
      
      // Listen to notifications collection
      unsubscribeNotifications = onSnapshot(collection(db, 'users', uid, 'notifications'), (snapshot) => {
        const notifications: Record<string, Notification> = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          notifications[doc.id] = {
            id: doc.id,
            type: data.type,
            title: data.title,
            body: data.body,
            createdAt: data.createdAt?.toMillis?.() || Date.now(),
            read: data.read ?? false,
            channel: data.channel || 'general',
            metadata: data.metadata,
          };
        });
        
        set({
          notifications,
          unreadCount: calculateUnreadCount(notifications),
        });
      });
    });
    
    return () => {
      if (unsubscribeNotifications) { unsubscribeNotifications(); unsubscribeNotifications = null; }
      if (unsubscribeSettings) { unsubscribeSettings(); unsubscribeSettings = null; }
      if (unsubscribeAuth) { unsubscribeAuth(); unsubscribeAuth = null; }
    };
  },
});




