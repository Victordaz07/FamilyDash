/**
 * 🔔 EXPO NOTIFICATIONS SERVICE
 * Handles local notifications, push tokens, and Android channels
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '@/services/firebase';

const db = getFirestore(app);

// Cached token
let cachedToken: string | null = null;

/**
 * Register for push notifications and get token
 */
export async function registerForPushAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return null;
  }

  try {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission denied');
      return null;
    }

    // Get token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'family-dash-15944',
    });
    
    cachedToken = tokenData.data;
    return cachedToken;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Get push token (from cache or register)
 */
export async function getPushToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  
  const token = await registerForPushAsync();
  
  if (token) {
    // Save to Firestore
    try {
      const auth = getAuth(app);
      const uid = auth.currentUser?.uid;
      if (uid) {
        await setDoc(doc(db, 'users', uid, 'pushTokens', token), {
          platform: Platform.OS,
          createdAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (error) {
      console.warn('Failed to save push token:', error);
    }
  }
  
  return token;
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(opts: {
  title: string;
  body: string;
  trigger?: Notifications.NotificationTriggerInput;
  data?: any;
}): Promise<string> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: opts.title,
        body: opts.body,
        data: opts.data,
      },
      trigger: opts.trigger || null, // null = immediate
    });
    
    return id;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    throw error;
  }
}

/**
 * Cancel a local notification
 */
export async function cancelLocalNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.warn('Failed to cancel notification:', error);
  }
}

/**
 * Create Android notification channel
 */
export async function createAndroidChannel(
  id: string,
  name: string,
  importance: Notifications.AndroidImportance = Notifications.AndroidImportance.HIGH
): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(id, {
        name,
        importance,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF8A00',
      });
    } catch (error) {
      console.warn('Failed to create Android channel:', error);
    }
  }
}

/**
 * Initialize notification channels (Android)
 */
export async function initializeNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await createAndroidChannel('tasks', 'Tasks', Notifications.AndroidImportance.HIGH);
    await createAndroidChannel('achievements', 'Achievements', Notifications.AndroidImportance.DEFAULT);
    await createAndroidChannel('general', 'General', Notifications.AndroidImportance.DEFAULT);
  }
}
