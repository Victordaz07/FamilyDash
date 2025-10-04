/**
 * Smart Notifications Hook
 * Easy integration of push notifications in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import {
  AdvancedNotificationService,
  SmartNotification,
  UserNotificationPreferences,
  NotificationChannel,
} from '../services/notifications/AdvancedNotificationService';
import { DeepLinkService } from '../services/notifications/DeepLinkService';

export interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  byCategory: Record<string, number>;
  responseRate: number;
  avgResponseTime: number;
}

export interface NotificationConfig {
  autoConnect?: boolean;
  requestPermissions?: boolean;
  enableAnalytics?: boolean;
  showToasts?: boolean;
}

export const useNotifications = (config: NotificationConfig = {}) => {
  const {
    autoConnect = true,
    requestPermissions = true,
    enableAnalytics = true,
    showToasts = true,
  } = config;

  const notificationService = AdvancedNotificationService.getInstance();
  const deepLinkService = DeepLinkService.getInstance();
  
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [unreadCount, setUnreadCount] = useState(0);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [preferences, setPreferences] = useState<UserNotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize on mount
  useEffect(() => {
    if (autoConnect) {
      initializeNotifications();
    }
  }, [autoConnect]);

  const initializeNotifications = async () => {
    setIsLoading(true);
    
    try {
      // Request permissions if needed
      if (requestPermissions) {
        const hasPermission = await notificationService.requestPermissions();
        setPermissionStatus(hasPermission ? 'granted' : 'denied');
      }

      // Load channels and preferences
      await loadChannels();
      await loadPreferences();

      // Create notification categories
      await notificationService.createNotificationCategories();

      console.log('✅ Notifications initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChannels = async () => {
    const channelList = notificationService.getChannels();
    setChannels(channelList);
  };

  const loadPreferences = async () => {
    const userPrefs = notificationService.getUserPreferences();
    setPreferences(userPrefs);
  };

  // Core notification functions
  const sendTaskNotification = useCallback(async (
    taskId: string,
    title: string,
    assignedTo: string,
    options?: {
      priority?: 'high' | 'normal' | 'low';
      scheduledFor?: number;
      actions?: Array<{ id: string; title: string; action: string }>;
    }
  ) => {
    const notification: SmartNotification = {
      id: `task_${taskId}_${Date.now()}`,
      title,
      body: `Assigned to ${assignedTo}`,
      channelId: 'familydash-tasks',
      priority: options?.priority || 'high',
      scheduledFor: options?.scheduledFor,
      deepLink: deepLinkService.generateDeepLink('/tasks', { taskId }),
      actions: options?.actions || [
        { id: 'view_task', title: 'View Task', action: 'VIEW_TASK' },
        { id: 'complete_task', title: 'Complete', action: 'COMPLETE_TASK' },
      ],
      analyticsData: {
        category: 'tasks',
        source: 'task_assignment',
        userId: assignedTo,
      },
    };

    const success = await notificationService.sendNotification(notification);
    if (success && showToasts) {
      console.log('📱 Task notification sent successfully');
    }
    return success;
  }, [showToasts]);

  const sendGoalNotification = useCallback(async (
    goalId: string,
    title: string,
    progress: number,
    options?: {
      priority?: 'high' | 'normal' | 'low';
      milestone?: string;
    }
  ) => {
    const notification: SmartNotification = {
      id: `goal_${goalId}_${Date.now()}`,
      title,
      body: `${progress}% complete${options?.milestone ? ` - ${options.milestone}` : ''}`,
      channelId: 'familydash-goals',
      priority: options?.priority || 'medium',
      deepLink: deepLinkService.generateDeepLink('/goals', { goalId }),
      actions: [
        { id: 'view_goal', title: 'View Goal', action: 'VIEW_GOAL' },
        { id: 'update_progress', title: 'Update Progress', action: 'UPDATE_PROGRESS' },
      ],
      analyticsData: {
        category: 'goals',
        source: 'goal_promo',
      },
    };

    const success = await notificationService.sendNotification(notification);
    if (success && showToasts) {
      console.log('🏆 Goal notification sent successfully');
    }
    return success;
  }, [showToasts]);

  const sendPenaltyNotification = useCallback(async (
    penaltyId: string,
    title: string,
    duration: number,
    options?: {
      priority?: 'high' | 'normal' | 'low';
      severity?: 'yellow' | 'red';
    }
  ) => {
    const notification: SmartNotification = {
      id: `penalty_${penaltyId}_${Date.now()}`,
      title,
      body: `Duration: ${duration} minutes`,
      channelId: 'familydash-penalties',
      priority: options?.priority || 'high',
      deepLink: deepLinkService.generateDeepLink('/penalties', { penaltyId }),
      actions: [
        { id: 'acknowledge', title: 'Acknowledge', action: 'ACKNOWLEDGE_PENALTY' },
        { id: 'appeal', title: 'Appeal', action: 'APPEAL_PENALTY' },
      ],
      analyticsData: {
        category: 'penalties',
        source: 'penalty_assignment',
      },
    };

    const success = await notificationService.sendNotification(notification);
    if (success && showToasts) {
      console.log('⚠️ Penalty notification sent successfully');
    }
    return success;
  }, [showToasts]);

  const sendSafeRoomNotification = useCallback(async (
    messageId: string,
    from: string,
    message: string,
    options?: {
      priority?: 'high' | 'normal' | 'low';
      urgent?: boolean;
    }
  ) => {
    const notification: SmartNotification = {
      id: `saferoom_${messageId}_${Date.now()}`,
      title: `SafeRoom message from ${from}`,
      body: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      channelId: 'familydash-saferoom',
      priority: options?.urgent ? 'high' : (options?.priority || 'medium'),
      deepLink: deepLinkService.generateDeepLink('/saferoom', { messageId }),
      actions: [
        { id: 'view_message', title: 'View Message', action: 'VIEW_MESSAGE' },
        { id: 'reply', title: 'Quick Reply', action: 'REPLY_MESSAGE' },
      ],
      analyticsData: {
        category: 'saferoom',
        source: 'family_message',
      },
    };

    const success = await notificationService.sendNotification(notification);
    if (success && showToasts) {
      console.log('💬 SafeRoom notification sent successfully');
    }
    return success;
  }, [showToasts]);

  const sendCalendarNotification = useCallback(async (
    eventId: string,
    title: string,
    timeRemaining: number,
    options?: {
      priority?: 'high' | 'normal' | 'low';
      reminderType?: 'upcoming' | 'starting_now' | 'overdue';
    }
  ) => {
    const typeMessages = {
      upcoming: 'starts in',
      starting_now: 'starting now',
      overdue: 'was supposed to start',
    };

    const notification: SmartNotification = {
      id: `calendar_${eventId}_${Date.now()}`,
      title,
      body: `${typeMessages[options?.reminderType || 'upcoming']} ${timeRemaining} minutes`,
      channelId: 'familydash-calendar',
      priority: options?.priority || 'medium',
      deepLink: deepLinkService.generateDeepLink('/calendar', { eventId }),
      actions: [
        { id: 'view_event', title: 'View Event', action: 'VIEW_EVENT' },
        { id: 'join_now', title: 'Join Now', action: 'JOIN_EVENT' },
      ],
      analyticsData: {
        category: 'calendar',
        source: 'event_reminder',
      },
    };

    const success = await notificationService.sendNotification(notification);
    if (success && showToasts) {
      console.log('📅 Calendar notification sent successfully');
    }
    return success;
  }, [showToasts]);

  // Advanced notification functions
  const sendBatchNotifications = useCallback(async (
    notifications: SmartNotification[]
  ) => {
    try {
      const promises = notifications.map(notification => 
        notificationService.sendNotification(notification)
      );
      
      const results = await Promise.all(promises);
      const successCount = results.filter(Boolean).length;
      
      if (showToasts) {
        console.log(`📱 Batch notifications: ${successCount}/${notifications.length} sent successfully`);
      }
      
      return results;
    } catch (error) {
      console.error('Error sending batch notifications:', error);
      return notifications.map(() => false);
    }
  }, [showToasts]);

  const scheduleNotification = useCallback(async (
    notification: SmartNotification,
    scheduledFor: Date
  ) => {
    const scheduledNotification = {
      ...notification,
      scheduledFor: scheduledFor.getTime(),
    };

    const success = await notificationService.sendNotification(scheduledNotification);
    if (success && showToasts) {
      console.log(`⏰ Notification scheduled for ${scheduledFor.toLocaleString()}`);
    }
    return success;
  }, [showToasts]);

  const cancelNotification = useCallback(async (notificationId: string) => {
    const success = await notificationService.cancelNotification(notificationId);
    if (success && showToasts) {
      console.log(`❌ Notification ${notificationId} canceled`);
    }
    return success;
  }, [showToasts]);

  // User preferences
  const updateNotificationPreferences = useCallback(async (
    updates: Partial<UserNotificationPreferences>
  ) => {
    try {
      await notificationService.updateUserPreferences(updates);
      await loadPreferences();
      
      if (showToasts) {
        console.log('⚙️ Notification preferences updated');
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }, [showToasts]);

  const toggleChannel = useCallback(async (
    channelId: string,
    enabled: boolean
  ) => {
    if (preferences) {
      await updateNotificationPreferences({
        channels: {
          ...preferences.channels,
          [channelId]: enabled,
        },
      });
    }
  }, [preferences, updateNotificationPreferences]);

  // Analytics and statistics
  const getNotificationStats = useCallback((): NotificationStats => {
    const analytics = notificationService.getAnalytics();
    
    const stats: NotificationStats = {
      totalNotifications: 0,
      unreadCount,
      byCategory: {},
      responseRate: 0,
      avgResponseTime: 0,
    };

    analytics.forEach((analyticsData) => {
      stats.totalNotifications += analyticsData.sentCount;
      stats.responseRate += analyticsData.conversionRate;
      
      // Category counting would be based on notification data
      // This is simplified for demo purposes
    });

    stats.responseRate = stats.responseRate / analytics.size;
    
    return stats;
  }, [unreadCount]);

  // Permission management
  const requestNotificationPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      const hasPermission = await notificationService.requestPermissions();
      setPermissionStatus(hasPermission ? 'granted' : 'denied');
      return hasPermission;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Return hook interface
  return {
    // State
    permissionStatus,
    unreadCount,
    channels,
    preferences,
    isLoading,
    
    // Core notification functions
    sendTaskNotification,
    sendGoalNotification,
    sendPenaltyNotification,
    sendSafeRoomNotification,
    sendCalendarNotification,
    
    // Advanced functions
    sendBatchNotifications,
    scheduleNotification,
    cancelNotification,
    
    // Preferences
    updateNotificationPreferences,
    toggleChannel,
    
    // Analytics
    getNotificationStats,
    
    // Permissions
    requestNotificationPermission,
    
    // Utilities
    initializeNotifications,
    refreshChannels: loadChannels,
    refreshPreferences: loadPreferences,
  };
};

// Hook for specific notification categories
export const useTaskNotifications = () => {
  const { sendTaskNotification, sendBatchNotifications, scheduleNotification } = useNotifications();
  
  return {
    assignTask: sendTaskNotification,
    sendTaskReminder: scheduleNotification,
    sendBatchTaskUpdates: sendBatchNotifications,
  };
};

export const useSafeRoomNotifications = () => {
  const { sendSafeRoomNotification, sendBatchNotifications } = useNotifications();
  
  return {
    sendMessage: sendSafeRoomNotification,
    sendBatchMessages: sendBatchNotifications,
  };
};
