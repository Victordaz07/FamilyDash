/**
 * 🔔 NOTIFICATIONS TYPE DEFINITIONS
 */

export type NotificationType = 
  | 'task_due_soon'
  | 'task_completed'
  | 'achievement_unlocked'
  | 'daily_reminder';

export type NotificationChannel = 'tasks' | 'achievements' | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  channel: NotificationChannel;
  metadata?: {
    taskId?: string;
    achId?: string;
    dueAt?: number;
  };
}

export interface NotificationSettings {
  dnd: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "07:00"
  };
  channels: {
    tasks: boolean;
    achievements: boolean;
    general: boolean;
  };
  dailyReminder: {
    enabled: boolean;
    hour: number;    // 20 (8 PM)
    minute: number;  // 0
  };
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  dnd: {
    enabled: false,
    start: '22:00',
    end: '07:00',
  },
  channels: {
    tasks: true,
    achievements: true,
    general: true,
  },
  dailyReminder: {
    enabled: true,
    hour: 20,
    minute: 0,
  },
};