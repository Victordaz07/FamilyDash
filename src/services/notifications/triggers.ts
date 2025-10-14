/**
 * 🔔 NOTIFICATION TRIGGERS
 * Creates notifications based on app events
 */

import { useAppStore } from '@/store';
import { Notification } from '@/types/notifications';
import { scheduleLocalNotification } from './expoNotifications';
import { scheduleNotificationWithDND } from './dndService';
import { ACHIEVEMENTS } from '@/features/achievements/definitions';

/**
 * Trigger notification when task is due soon
 */
export const triggerTaskDueSoon = async (taskId: string, title: string, dueAt: number) => {
  const settings = useAppStore.getState().settings;
  
  if (!settings.channels.tasks) return;
  
  // Schedule local notification 1 hour before (respecting DND)
  const oneHourBefore = dueAt - (60 * 60 * 1000);
  if (oneHourBefore > Date.now()) {
    const scheduled = await scheduleNotificationWithDND(
      '⏰ Task Due Soon',
      `"${title}" is due in 1 hour`,
      { date: new Date(oneHourBefore) },
      'tasks',
      { taskId, type: 'task_due_soon' }
    );
    
    if (!scheduled) {
      console.log('🔇 Task due notification blocked by DND');
    }
  }
  
  // Create in-app notification
  const notif: Notification = {
    id: `task_due_${taskId}_${Date.now()}`,
    type: 'task_due_soon',
    title: '⏰ Task Due Soon',
    body: `"${title}" is due soon`,
    createdAt: Date.now(),
    read: false,
    channel: 'tasks',
    metadata: { taskId, dueAt },
  };
  
  useAppStore.getState().addNotification(notif);
};

/**
 * Trigger notification when task is completed
 */
export const triggerTaskCompleted = (taskId: string, title: string) => {
  const settings = useAppStore.getState().settings;
  
  if (!settings.channels.tasks) return;
  
  const notif: Notification = {
    id: `task_completed_${taskId}_${Date.now()}`,
    type: 'task_completed',
    title: '✅ Task Completed!',
    body: `Great job completing "${title}"!`,
    createdAt: Date.now(),
    read: false,
    channel: 'tasks',
    metadata: { taskId },
  };
  
  useAppStore.getState().addNotification(notif);
};

/**
 * Trigger notification when achievement is unlocked
 */
export const triggerAchievementUnlocked = (achId: string) => {
  const settings = useAppStore.getState().settings;
  
  if (!settings.channels.achievements) return;
  
  const achievement = ACHIEVEMENTS[achId];
  if (!achievement) return;
  
  const notif: Notification = {
    id: `achievement_${achId}_${Date.now()}`,
    type: 'achievement_unlocked',
    title: '🏆 Achievement Unlocked!',
    body: `${achievement.title} - ${achievement.description} (+${achievement.points} pts)`,
    createdAt: Date.now(),
    read: false,
    channel: 'achievements',
    metadata: { achId },
  };
  
  useAppStore.getState().addNotification(notif);
  
  // Also send local notification (respecting DND)
  scheduleNotificationWithDND(
    '🏆 Achievement Unlocked!',
    `${achievement.title} (+${achievement.points} pts)`,
    null, // Immediate notification
    'achievements',
    { achId, type: 'achievement_unlocked' }
  ).catch(() => {});
};

/**
 * Schedule daily reminder (respecting DND)
 */
export const scheduleDailyReminder = async () => {
  const settings = useAppStore.getState().settings;
  
  if (!settings.dailyReminder.enabled) return;
  
  try {
    const scheduled = await scheduleNotificationWithDND(
      '📋 Daily Reminder',
      'Check your tasks for today!',
      { 
        hour: settings.dailyReminder.hour,
        minute: settings.dailyReminder.minute,
        repeats: true,
      },
      'general',
      { type: 'daily_reminder' }
    );
    
    if (!scheduled) {
      console.log('🔇 Daily reminder blocked by DND - will be rescheduled');
    }
  } catch (error) {
    console.warn('Failed to schedule daily reminder:', error);
  }
};




