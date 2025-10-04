/**
 * Notification Services Index
 * Central export for all notification functionality
 */

// Core services
export { AdvancedNotificationService } from './AdvancedNotificationService';
export { DeepLinkService } from './DeepLinkService';

// Components
export { NotificationCenter } from '../../components/notifications/NotificationCenter';

// Types
export type {
  NotificationChannel,
  NotificationAction,
  SmartNotification,
  NotificationAnalytics,
  UserNotificationPreferences,
} from './AdvancedNotificationService';

export type {
  DeepLinkResult,
  RouteConfig,
  DeepLinkRoute,
} from './DeepLinkService';

export type {
  NotificationCenterProps,
  NotificationItem,
} from '../../components/notifications/NotificationCenter';
