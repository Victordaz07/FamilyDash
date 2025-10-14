/**
 * 🔇 DO NOT DISTURB (DND) SERVICE
 * Handles quiet hours and notification scheduling logic
 */

import { useAppStore } from '@/store';
import { NotificationSettings } from '@/types/notifications';
import { scheduleLocalNotification } from './expoNotifications';

/**
 * Checks if the current time falls within Do Not Disturb hours
 */
export function isWithinDND(settings: NotificationSettings['dnd']): boolean {
  if (!settings.enabled) return false;

  const now = new Date();
  const [startHour, startMinute] = settings.start.split(':').map(Number);
  const [endHour, endMinute] = settings.end.split(':').map(Number);

  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  if (startTimeInMinutes < endTimeInMinutes) {
    // DND is within the same day (e.g., 10:00 to 22:00)
    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
  } else {
    // DND crosses midnight (e.g., 22:00 to 07:00)
    return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes;
  }
}

/**
 * Checks if a specific time falls within DND hours
 */
export function isTimeWithinDND(date: Date, settings: NotificationSettings['dnd']): boolean {
  if (!settings.enabled) return false;

  const [startHour, startMinute] = settings.start.split(':').map(Number);
  const [endHour, endMinute] = settings.end.split(':').map(Number);

  const targetTimeInMinutes = date.getHours() * 60 + date.getMinutes();
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  if (startTimeInMinutes < endTimeInMinutes) {
    return targetTimeInMinutes >= startTimeInMinutes && targetTimeInMinutes <= endTimeInMinutes;
  } else {
    return targetTimeInMinutes >= startTimeInMinutes || targetTimeInMinutes <= endTimeInMinutes;
  }
}

/**
 * Schedules a notification respecting DND settings
 * Returns true if scheduled, false if blocked by DND
 */
export async function scheduleNotificationWithDND(
  title: string,
  body: string,
  trigger: any,
  channelId: string = 'default',
  data?: Record<string, any>
): Promise<boolean> {
  const { settings } = useAppStore.getState();
  
  // Check if we're currently in DND
  if (isWithinDND(settings.dnd)) {
    console.log('🔇 Notification blocked by DND');
    return false;
  }

  // Check if the scheduled time falls within DND
  if (trigger && typeof trigger === 'object' && trigger.hour !== undefined) {
    const scheduledDate = new Date();
    scheduledDate.setHours(trigger.hour, trigger.minute || 0, 0, 0);
    
    if (isTimeWithinDND(scheduledDate, settings.dnd)) {
      console.log('🔇 Scheduled notification falls within DND hours');
      return false;
    }
  }

  // Schedule the notification
  try {
    await scheduleLocalNotification({
      title,
      body,
      trigger,
      channelId,
      data,
    });
    return true;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return false;
  }
}

/**
 * Reschedules daily reminder to avoid DND hours
 */
export async function rescheduleDailyReminderAvoidingDND(): Promise<void> {
  const { settings } = useAppStore.getState();
  const { dailyReminder, dnd } = settings;

  if (!dailyReminder.enabled) return;

  const now = new Date();
  let reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), dailyReminder.hour, dailyReminder.minute, 0);

  // If the reminder time has passed today, schedule for tomorrow
  if (reminderTime.getTime() < now.getTime()) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  // Check if the reminder time falls within DND
  if (isTimeWithinDND(reminderTime, dnd)) {
    // Find the next available time after DND ends
    const [endHour, endMinute] = dnd.end.split(':').map(Number);
    const endTime = new Date(reminderTime);
    endTime.setHours(endHour, endMinute, 0, 0);

    // If DND ends tomorrow, schedule for tomorrow
    if (endTime.getTime() > reminderTime.getTime()) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    reminderTime.setHours(endHour, endMinute, 0, 0);
    console.log(`📅 Daily reminder rescheduled to avoid DND: ${reminderTime.toLocaleString()}`);
  }

  // Schedule the reminder
  await scheduleLocalNotification({
    title: "Daily Family Reminder",
    body: "Don't forget to check your tasks and achievements today!",
    trigger: {
      hour: reminderTime.getHours(),
      minute: reminderTime.getMinutes(),
      repeats: true,
    },
    channelId: 'general',
    data: { type: 'daily_reminder' },
  });
}

/**
 * Gets the next available time slot after DND ends
 */
export function getNextAvailableTimeAfterDND(settings: NotificationSettings['dnd']): Date {
  const now = new Date();
  const [endHour, endMinute] = settings.end.split(':').map(Number);
  
  const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute, 0);
  
  // If DND ends tomorrow, return tomorrow's end time
  if (endTime.getTime() < now.getTime()) {
    endTime.setDate(endTime.getDate() + 1);
  }
  
  return endTime;
}

/**
 * Formats DND time range for display
 */
export function formatDNDTimeRange(settings: NotificationSettings['dnd']): string {
  if (!settings.enabled) return 'Disabled';
  
  const start = settings.start;
  const end = settings.end;
  
  // Check if it crosses midnight
  const [startHour] = start.split(':').map(Number);
  const [endHour] = end.split(':').map(Number);
  
  if (startHour > endHour) {
    return `${start} - ${end} (next day)`;
  } else {
    return `${start} - ${end}`;
  }
}
