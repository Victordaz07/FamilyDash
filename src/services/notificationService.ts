import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  scheduledTime: Date;
  type: 'reminder' | 'event_start' | 'event_end' | 'voting_deadline';
  activityId?: string;
}

class NotificationService {
  private expoPushToken: string | null = null;

  // Register for push notifications
  async registerForPushNotifications(): Promise<string | null> {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      try {
        const pushToken = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        token = pushToken.data;
        this.expoPushToken = token;
        console.log('Expo push token:', token);
      } catch (error) {
        console.error('Error getting Expo push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  // Schedule a local notification
  async scheduleNotification(notificationData: NotificationData): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: 'default',
        },
        trigger: notificationData.scheduledTime as any,
      });

      console.log('Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Schedule multiple notifications for an activity
  async scheduleActivityNotifications(activity: any): Promise<string[]> {
    const notificationIds: string[] = [];
    const activityDate = new Date(activity.date);
    const activityTime = activity.time.split(':');
    const activityDateTime = new Date(activityDate);
    activityDateTime.setHours(parseInt(activityTime[0]), parseInt(activityTime[1]));

    // Reminder 1 hour before
    const reminderTime = new Date(activityDateTime.getTime() - 60 * 60 * 1000);
    if (reminderTime > new Date()) {
      const reminderId = await this.scheduleNotification({
        id: `reminder_${activity.id}`,
        title: `Reminder: ${activity.title}`,
        body: `${activity.title} starts in 1 hour at ${activity.location}`,
        scheduledTime: reminderTime,
        type: 'reminder',
        activityId: activity.id,
        data: { activityId: activity.id, type: 'reminder' }
      });
      notificationIds.push(reminderId);
    }

    // Event start notification
    if (activityDateTime > new Date()) {
      const startId = await this.scheduleNotification({
        id: `start_${activity.id}`,
        title: `${activity.title} is starting now!`,
        body: `Time for ${activity.title} at ${activity.location}`,
        scheduledTime: activityDateTime,
        type: 'event_start',
        activityId: activity.id,
        data: { activityId: activity.id, type: 'event_start' }
      });
      notificationIds.push(startId);
    }

    // Event end notification (assuming 2 hours duration)
    const endTime = new Date(activityDateTime.getTime() + 2 * 60 * 60 * 1000);
    if (endTime > new Date()) {
      const endId = await this.scheduleNotification({
        id: `end_${activity.id}`,
        title: `${activity.title} has ended`,
        body: `Hope you enjoyed ${activity.title}!`,
        scheduledTime: endTime,
        type: 'event_end',
        activityId: activity.id,
        data: { activityId: activity.id, type: 'event_end' }
      });
      notificationIds.push(endId);
    }

    return notificationIds;
  }

  // Schedule voting deadline notification
  async scheduleVotingDeadline(activity: any, deadlineHours: number = 24): Promise<string> {
    const deadlineTime = new Date();
    deadlineTime.setHours(deadlineTime.getHours() + deadlineHours);

    return await this.scheduleNotification({
      id: `voting_${activity.id}`,
      title: `Voting Deadline: ${activity.title}`,
      body: `Don't forget to vote for ${activity.title}!`,
      scheduledTime: deadlineTime,
      type: 'voting_deadline',
      activityId: activity.id,
      data: { activityId: activity.id, type: 'voting_deadline' }
    });
  }

  // Cancel all notifications for an activity
  async cancelActivityNotifications(activityId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.activityId === activityId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
      
      console.log(`Cancelled notifications for activity ${activityId}`);
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  // Cancel a specific notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Cancelled notification ${notificationId}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Send immediate notification (for testing)
  async sendImmediateNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }

  // Handle notification received
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Handle notification response (when user taps notification)
  addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Get push token
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }
}

export const notificationService = new NotificationService();
