/**
 * Advanced Notification Service for FamilyDash
 * Intelligent push notifications with deep linking and analytics
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Alert, Platform } from 'react-native';
import Logger from '../Logger';

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: 'high' | 'medium' | 'low' | 'min';
  sound?: boolean;
  vibration?: boolean;
  badge?: boolean;
  enabled: boolean;
}

export interface NotificationAction {
  id: string;
  title: string;
  action: string;
  destructive?: boolean;
  authenticationRequired?: boolean;
}

export interface SmartNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  image?: string;
  priority: 'high' | 'normal' | 'low';
  channelId: string;
  categoryId?: string;
  
  // Deep linking
  deepLink?: string;
  screen?: string;
  params?: Record<string, any>;
  
  // Timing
  scheduledFor?: number; // timestamp
  expirationTime?: number;
  
  // Analytics
  analyticsData?: {
    category: string;
    source: string;
    userId?: string;
  };
  
  // Smart features
  smartTiming?: {
    userTimezone: string;
    quietHours: { start: number; end: number }; // in minutes from midnight
    maxFrequency: number; // max notifications per day
    lastSent?: number;
  };
}

export interface NotificationAnalytics {
  notificationId: string;
  sentCount: number;
  deliveredCount: number;
  clickedCount: number;
  dismissedCount: number;
  conversionRate: number;
  engagementScore: number;
  avgResponseTime: number; // milliseconds
  lastInteraction?: number;
}

export interface UserNotificationPreferences {
  userId: string;
  enabled: boolean;
  channels: Record<string, boolean>;
  quietHours: {
    enabled: boolean;
    start: number; // minutes from midnight
    end: number;
  };
  quietDays: string[]; // ['monday', 'tuesday', etc.]
  frequencyLimit: number; //-max notifications per day
  topics: string[]; // subscribed topics
  lastUpdated: number;
}

export class AdvancedNotificationService {
  private static instance: AdvancedNotificationService;
  private channels: Map<string, NotificationChannel> = new Map();
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  private analytics: Map<string, NotificationAnalytics> = new Map();
  private userPreferences: UserNotificationPreferences | null = null;
  
  // Deep linking handlers
  private deepLinkHandlers: Map<string, (params: any) => void> = new Map();
  
  private constructor() {
    this.initializeDefaultChannels();
    this.loadUserPreferences();
    this.loadAnalytics();
  }

  static getInstance(): AdvancedNotificationService {
    if (!AdvancedNotificationService.instance) {
      AdvancedNotificationService.instance = new AdvancedNotificationService();
    }
    return AdvancedNotificationService.instance;
  }

  /**
   * Initialize default notification channels
   */
  private initializeDefaultChannels(): void {
    const defaultChannels: NotificationChannel[] = [
      {
        id: 'familydash-tasks',
        name: 'Family Tasks',
        description: 'Task assignments, completions, and reminders',
        importance: 'high',
        sound: true,
        vibration: true,
        badge: true,
        enabled: true,
      },
      {
        id: 'familydash-goals',
        name: 'Family Goals',
        description: 'Goal progress and achievements',
        importance: 'medium',
        sound: true,
        vibration: false,
        badge: true,
        enabled: true,
      },
      {
        id: 'familydash-penalties',
        name: 'Family Penalties',
        description: 'Penalty assignments and completions',
        importance: 'high',
        sound: true,
        vibration: true,
        badge: true,
        enabled: true,
      },
      {
        id: 'familydash-calendar',
        name: 'Family Calendar',
        description: 'Events, reminders, and schedule updates',
        importance: 'medium',
        sound: true,
        vibration: false,
        badge: true,
        enabled: true,
      },
      {
        id: 'familydash-saferoom',
        name: 'SafeRoom',
        description: 'Family messages and emotional support',
        importance: 'high',
        sound: true,
        vibration: true,
        badge: true,
        enabled: true,
      },
      {
        id: 'familydash-chat',
        name: 'Family Chat',
        description: 'Quick family communications',
        importance: 'medium',
        sound: true,
        vibration: false,
        badge: true,
        enabled: true,
      },
      {
        id: 'familydash-general',
        name: 'General',
        description: 'General family notifications',
        importance: 'low',
        sound: false,
        vibration: false,
        badge: false,
        enabled: true,
      },
    ];

    defaultChannels.forEach(channel => {
      this.channels.set(channel.id, channel);
    });
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // In a real app, you would use expo-notifications
      // For now, we'll simulate permission request
      Logger.debug('Requesting notification permissions...');
      
      // Simulate permission result
      const hasPermission = Math.random() > 0.2; // 80% success rate
      
      if (hasPermission) {
        Logger.debug('Notification permissions granted');
        return true;
      } else {
        Logger.debug('Notification permissions denied');
        Alert.alert(
          'Notification Permissions',
          'To receive family updates and reminders, please enable notifications in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      Logger.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Send push notification
   */
  async sendNotification(notification: SmartNotification): Promise<boolean> {
    try {
      // Check permissions first
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        Logger.debug('Notification permission not granted');
        return false;
      }

      // Validate channel
      const channel = this.channels.get(notification.channelId);
      if (!channel || !channel.enabled) {
        Logger.debug(`Channel ${notification.channelId} not available or disabled`);
        return false;
      }

      // Check user preferences
      if (!this.isNotificationAllowed(notification)) {
        Logger.debug('Notification blocked by user preferences');
        return false;
      }

      // Schedule notification if needed
      if (notification.scheduledFor && notification.scheduledFor > Date.now()) {
        return this.scheduleNotification(notification);
      }

      // Send notification immediately
      return this.sendImmediateNotification(notification);
      
    } catch (error) {
      Logger.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Schedule notification for later
   */
  private scheduleNotification(notification: SmartNotification): boolean {
    try {
      const delay = notification.scheduledFor! - Date.now();
      
      const timer = setTimeout(async () => {
        await this.sendImmediateNotification(notification);
        this.scheduledNotifications.delete(notification.id);
      }, delay);

      this.scheduledNotifications.set(notification.id, timer);
      
      Logger.debug(`Notification scheduled for ${new Date(notification.scheduledFor!)}`);
      return true;
      
    } catch (error) {
      Logger.error('Error scheduling notification:', error);
      return false;
    }
  }

  /**
   * Send immediate notification
   */
  private async sendImmediateNotification(notification: SmartNotification): Promise<boolean> {
    try {
      // Clear channel info
      const channel = this.channels.get(notification.channelId)!;
      
      // Process smart features
      if (notification.smartTiming) {
        await this.processSmartTiming(notification);
      }

      // Send notification (simulated)
      Logger.debug(`📱 Sending notification:
        Title: ${notification.title}
        Body: ${notification.body}
        Channel: ${channel.name}
        Deep Link: ${notification.deepLink || 'None'}
        Priority: ${notification.priority}
      `);

      // Track analytics
      this.trackNotificationSent(notification);

      // Handle deep linking setup
      if (notification.deepLink) {
        this.setupDeepLink(notification);
      }

      // Update user frequency tracking
      this.updateUserFrequency(notification);

      return true;
      
    } catch (error) {
      Logger.error('Error sending immediate notification:', error);
      return false;
    }
  }

  /**
   * Process smart timing features
   */
  private async processSmartTiming(notification: SmartNotification): Promise<void> {
    const { smartTiming } = notification;
    if (!smartTiming) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const minutesFromMidnight = currentHour * 60 + currentMinute;

    // Check quiet hours
    if (smartTiming.quietHours.start <= smartTiming.quietHours.end) {
      // Normal case: quiet hours don't cross midnight
      if (minutesFromMidnight >= smartTiming.quietHours.start && 
          minutesFromMidnight <= smartTiming.quietHours.end) {
        Logger.debug('Notification delayed due to quiet hours');
        // Schedule for after quiet hours
        const nextAvailableTime = new Date(now);
        nextAvailableTime.setHours(Math.floor(smartTiming.quietHours.end / 60));
        nextAvailableTime.setMinutes(smartTiming.quietHours.end % 60);
        
        notification.scheduledFor = nextAvailableTime.getTime();
      }
    }

    // Check frequency limit
    if (smartTiming.maxFrequency > 0) {
      const todayNotifications = await this.getTodayNotificationCount();
      if (todayNotifications >= smartTiming.maxFrequency) {
        Logger.debug('Notification blocked due to frequency limit');
        throw new Error('Frequency limit exceeded');
      }
    }
  }

  /**
   * Setup deep link handler
   */
  private setupDeepLink(notification: SmartNotification): void {
    if (!notification.deepLink) return;

    const handler = async () => {
      try {
        // Track click analytics
        this.trackNotificationClicked(notification);

        // Handle deep link navigation
        if (notification.screen && notification.params) {
          // Navigate to specific screen
          Logger.debug(`🔗 Deep linking to: ${notification.screen}`, notification.params);
        } else {
          // Generic deep link
          Logger.debug(`🔗 Generic deep link: ${notification.deepLink}`);
        }
      } catch (error) {
        Logger.error('Error handling deep link:', error);
      }
    };

    // Store handler for later use
    this.deepLinkHandlers.set(notification.id, handler);
  }

  /**
   * Handle notification click/interaction
   */
  async handleNotificationInteraction(notificationId: string, action?: string): Promise<boolean> {
    try {
      const handler = this.deepLinkHandlers.get(notificationId);
      if (handler) {
        await handler({ action });
        this.deepLinkHandlers.delete(notificationId);
        
        // Track interaction analytics
        this.trackNotificationInteraction(notificationId, action);
        return true;
      }
      
      Logger.debug(`No handler found for notification: ${notificationId}`);
      return false;
      
    } catch (error) {
      Logger.error('Error handling notification interaction:', error);
      return false;
    }
  }

  /**
   * Create notification categories with actions
   */
  async createNotificationCategories(): Promise<void> {
    try {
      const categories = [
        {
          id: 'task_notification',
          name: 'Task Notification',
          actions: [
            {
              id: 'complete_task',
              title: 'Complete',
              action: 'COMPLETE_TASK',
            },
            {
              id: 'view_task',
              title: 'View Task',
              action: 'VIEW_TASK',
            },
            {
              id: 'dismiss',
              title: 'Dismiss',
              action: 'DISMISS',
              destructive: true,
            },
          ],
        },
        {
          id: 'goal_notification',
          name: 'Goal Notification',
          actions: [
            {
              id: 'update_progress',
              title: 'Update Progress',
              action: 'UPDATE_PROGRESS',
            },
            {
              id: 'view_goal',
              title: 'View Goal',
              action: 'VIEW_GOAL',
            },
          ],
        },
        {
          id: 'saferoom_notification',
          name: 'SafeRoom Message',
          actions: [
            {
              id: 'reply',
              title: 'Reply',
              action: 'REPLY_MESSAGE',
              authenticationRequired: true,
            },
            {
              id: 'react',
              title: 'React',
              action: 'REACT_MESSAGE',
            },
            {
              id: 'view_message',
              title: 'View Message',
              action: 'VIEW_MESSAGE',
            },
          ],
        },
      ];

      // Store categories (in real app, register with native notification system)
      categories.forEach(category => {
        Logger.debug(`Registered notification category: ${category.id}`);
      });
      
    } catch (error) {
      Logger.error('Error creating notification categories:', error);
    }
  }

  /**
   * Analytics tracking methods
   */
  private trackNotificationSent(notification: SmartNotification): void {
    const analytics: NotificationAnalytics = {
      notificationId: notification.id,
      sentCount: 1,
      deliveredCount: 0,
      clickedCount: 0,
      dismissedCount: 0,
      conversionRate: 0,
      engagementScore: 0,
      avgResponseTime: 0,
    };

    this.analytics.set(notification.id, analytics);
    this.saveAnalytics();
  }

  private trackNotificationClicked(notification: SmartNotification): void {
    const analytics = this.analytics.get(notification.id);
    if (analytics) {
      analytics.clickedCount++;
      analytics.lastInteraction = Date.now();
      analytics.conversionRate = (analytics.clickedCount / analytics.sentCount) * 100;
      
      // Calculate engagement score
      const engagementFactors = {
        clicks: analytics.clickedCount * 10,
        views: analytics.deliveredCount * 5,
        responses: analytics.clickedCount * 15,
      };
      
      analytics.engagementScore = Object.values(engagementFactors).reduce((sum, factor) => sum + factor, 0);
      
      this.analytics.set(notification.id, analytics);
      this.saveAnalytics();
    }
  }

  private trackNotificationInteraction(notificationId: string, action?: string): void {
    const analytics = this.analytics.get(notificationId);
    if (analytics) {
      if (action === 'DISMISS') {
        analytics.dismissedCount++;
      } else {
        analytics.clickedCount++;
      }
      
      this.analytics.set(notificationId, analytics);
      this.saveAnalytics();
    }
  }

  /**
   * Utility methods
   */
  private async checkPermissions(): Promise<boolean> {
    // In real app, check with expo-notifications
    return true; // Simulated permission granted
  }

  private isNotificationAllowed(notification: SmartNotification): boolean {
    if (!this.userPreferences) return true;

    // Check if notifications are enabled
    if (!this.userPreferences.enabled) return false;

    // Check channel preferences
    const channelEnabled = this.userPreferences.channels[notification.channelId];
    if (channelEnabled === false) return false;

    // Check quiet hours
    if (this.userPreferences.quietHours.enabled) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      if (currentMinutes >= this.userPreferences.quietHours.start &&
          currentMinutes <= this.userPreferences.quietHours.end) {
        return false;
      }
    }

    // Check quiet days
    const today = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    if (this.userPreferences.quietDays.includes(today)) {
      return false;
    }

    return true;
  }

  private async getTodayNotificationCount(): Promise<number> {
    const today = new Date().toDateString();
    
    try {
      const storedCount = await AsyncStorage.getItem(`notification_count_${today}`);
      return storedCount ? parseInt(storedCount, 10) : 0;
    } catch (error) {
      Logger.error('Error getting today notification count:', error);
      return 0;
    }
  }

  private async updateUserFrequency(notification: SmartNotification): Promise<void> {
    const today = new Date().toDateString();
    
    try {
      const currentCount = await this.getTodayNotificationCount();
      await AsyncStorage.setItem(`notification_count_${today}`, `${currentCount + 1}`);
    } catch (error) {
      Logger.error('Error updating user frequency:', error);
    }
  }

  /**
   * Data persistence
   */
  private async loadUserPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('user_notification_preferences');
      if (stored) {
        this.userPreferences = JSON.parse(stored);
      } else {
        this.userPreferences = {
          userId: 'current_user',
          enabled: true,
          channels: Object.fromEntries(
            Array.from(this.channels.values()).map(channel => [channel.id, true])
          ),
          quietHours: { enabled: false, start: 22 * 60, end: 7 * 60 }, // 10 PM to 7 AM
          quietDays: [],
          frequencyLimit: 10,
          topics: ['general'],
          lastUpdated: Date.now(),
        };
      }
    } catch (error) {
      Logger.error('Error loading user preferences:', error);
    }
  }

  private async loadAnalytics(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notification_analytics');
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([id, analytics]) => {
          this.analytics.set(id, analytics as NotificationAnalytics);
        });
      }
    } catch (error) {
      Logger.error('Error loading analytics:', error);
    }
  }

  private async saveAnalytics(): Promise<void> {
    try {
      const data = Object.fromEntries(this.analytics.entries());
      await AsyncStorage.setItem('notification_analytics', JSON.stringify(data));
    } catch (error) {
      Logger.error('Error saving analytics:', error);
    }
  }

  /**
   * Public API methods
   */
  async updateUserPreferences(preferences: Partial<UserNotificationPreferences>): Promise<void> {
    if (this.userPreferences) {
      this.userPreferences = { ...this.userPreferences, ...preferences };
      await AsyncStorage.setItem('user_notification_preferences', JSON.stringify(this.userPreferences));
    }
  }

  getUserPreferences(): UserNotificationPreferences | null {
    return this.userPreferences ? { ...this.userPreferences } : null;
  }

  getAnalytics(): Map<string, NotificationAnalytics> {
    return new Map(this.analytics);
  }

  getChannels(): NotificationChannel[] {
    return Array.from(this.channels.values());
  }

  async cancelNotification(notificationId: string): Promise<boolean> {
    try {
      const timer = this.scheduledNotifications.get(notificationId);
      if (timer) {
        clearTimeout(timer);
        this.scheduledNotifications.delete(notificationId);
      }
      return true;
    } catch (error) {
      Logger.error('Error canceling notification:', error);
      return false;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      this.scheduledNotifications.forEach(timer => clearTimeout(timer));
      this.scheduledNotifications.clear();
    } catch (error) {
      Logger.error('Error canceling all notifications:', error);
    }
  }
}




