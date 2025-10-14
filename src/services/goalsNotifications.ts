import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Goal } from '@/types/goals';

// Configure notification handler only if not in Expo Go
if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    console.warn('Notification handler setup failed (expected in Expo Go):', error);
  }
}

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedule notifications for a goal's deadline
 */
export const scheduleGoalDeadlineNotifications = async (goal: Goal): Promise<string[]> => {
  try {
    const notificationIds: string[] = [];

    if (!goal.deadlineAt) {
      return notificationIds;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Notification permissions not granted');
      return notificationIds;
    }

    const deadline = new Date(goal.deadlineAt);
    const now = new Date();

    // Don't schedule if deadline is in the past
    if (deadline < now) {
      return notificationIds;
    }

    // Schedule notifications at different intervals
    const notificationIntervals = [
      { days: 7, title: '1 week reminder 📅' },
      { days: 3, title: '3 days reminder ⏰' },
      { days: 1, title: 'Tomorrow! 🔔' },
      { days: 0, title: 'Today is the deadline! ⚠️' },
    ];

    for (const interval of notificationIntervals) {
      const notificationDate = new Date(deadline);
      notificationDate.setDate(notificationDate.getDate() - interval.days);
      notificationDate.setHours(9, 0, 0, 0); // 9 AM

      // Only schedule if notification date is in the future
      if (notificationDate > now) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `🎯 ${interval.title}`,
            body: `Goal: ${goal.title}`,
            data: { goalId: goal.id, type: 'deadline_reminder' },
          },
          trigger: {
            date: notificationDate,
          },
        });
        notificationIds.push(id);
      }
    }

    return notificationIds;
  } catch (error) {
    console.error('Error scheduling goal notifications:', error);
    return [];
  }
};

/**
 * Cancel all notifications for a goal
 */
export const cancelGoalNotifications = async (notificationIds: string[]): Promise<void> => {
  try {
    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch (error) {
    console.error('Error canceling goal notifications:', error);
  }
};

/**
 * Send immediate notification (e.g., milestone completed)
 */
export const sendMilestoneCompletedNotification = async (goal: Goal, milestoneTitle: string): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Milestone Completed!',
        body: `${milestoneTitle} - ${goal.title}`,
        data: { goalId: goal.id, type: 'milestone_completed' },
      },
      trigger: null, // Immediate
    });
  } catch (error) {
    console.error('Error sending milestone notification:', error);
  }
};

/**
 * Send goal completed notification
 */
export const sendGoalCompletedNotification = async (goal: Goal): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Goal Completed!',
        body: `Congratulations! You completed: ${goal.title}`,
        data: { goalId: goal.id, type: 'goal_completed' },
      },
      trigger: null, // Immediate
    });
  } catch (error) {
    console.error('Error sending goal completed notification:', error);
  }
};

/**
 * Send overdue goal notification
 */
export const sendOverdueGoalNotification = async (goal: Goal): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Goal Overdue',
        body: `Deadline passed for: ${goal.title}`,
        data: { goalId: goal.id, type: 'goal_overdue' },
      },
      trigger: null, // Immediate
    });
  } catch (error) {
    console.error('Error sending overdue notification:', error);
  }
};

/**
 * Check for overdue goals and send notifications
 */
export const checkOverdueGoals = async (goals: Goal[]): Promise<void> => {
  const now = Date.now();
  
  for (const goal of goals) {
    if (
      goal.status === 'active' &&
      goal.deadlineAt &&
      goal.deadlineAt < now &&
      goal.lastActivityAt &&
      now - goal.lastActivityAt > 86400000 // 24 hours
    ) {
      await sendOverdueGoalNotification(goal);
    }
  }
};

/**
 * Listen to notification responses
 */
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};
