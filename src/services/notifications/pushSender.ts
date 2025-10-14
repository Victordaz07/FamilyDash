/**
 * 📲 EXPO PUSH SENDER
 * Sends push notifications via Expo Push API
 * NOTE: This is for development/small scale. For production, use Firebase Cloud Functions.
 */

import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/services/firebase';

const db = getFirestore(app);
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export interface PushMessage {
  to: string | string[];
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

/**
 * Send push notification via Expo
 */
export async function sendPush(message: PushMessage): Promise<boolean> {
  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: message.to,
        sound: message.sound ?? 'default',
        title: message.title,
        body: message.body,
        data: message.data,
        badge: message.badge,
        channelId: message.channelId,
      }),
    });

    const result = await response.json();
    
    if (result.data && result.data.status === 'ok') {
      return true;
    } else {
      console.warn('Push send failed:', result);
      return false;
    }
  } catch (error) {
    console.error('Error sending push:', error);
    return false;
  }
}

/**
 * Broadcast push to all user's devices
 */
export async function broadcastToUser(
  uid: string,
  payload: { title: string; body: string; data?: any; channelId?: string }
): Promise<void> {
  try {
    // Get all push tokens for user
    const tokensSnapshot = await getDocs(collection(db, 'users', uid, 'pushTokens'));
    const tokens: string[] = [];
    
    tokensSnapshot.forEach((doc) => {
      tokens.push(doc.id); // doc.id is the token itself
    });

    if (tokens.length === 0) {
      console.warn('No push tokens found for user:', uid);
      return;
    }

    // Send to all tokens
    await sendPush({
      to: tokens,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      channelId: payload.channelId,
    });
  } catch (error) {
    console.warn('Failed to broadcast to user:', error);
  }
}

/**
 * NOTE: For production, implement server-side push via Firebase Cloud Functions:
 * 
 * functions/src/sendPush.ts:
 * - Trigger on Firestore write (notifications collection)
 * - Read user's pushTokens
 * - Send via Expo Push API from server
 * - Better security and rate limiting
 */




