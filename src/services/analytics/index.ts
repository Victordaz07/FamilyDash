/**
 * Analytics Services Index
 * Central export for all analytics functionality
 */

// Core services
export { DataAnalyticsService } from './DataAnalyticsService';

// Hooks
export { useAnalytics, useTaskAnalytics, useGoalAnalytics, usePenaltyAnalytics, useSafeRoomAnalytics, useNavigationAnalytics } from '../../hooks/useAnalytics';

// Components
export { AnalyticsDashboard } from '../../components/analytics/AnalyticsDashboard';

// Types
export type {
  UserEvent,
  UserSession,
  UserBehaviorMetrics,
  FamilyAnalytics,
  AnalyticsInsight,
  SmartReport,
} from './DataAnalyticsService';

export type {
  AnalyticsConfig,
  UseAnalyticsReturn,
} from '../../hooks/useAnalytics';

export type {
  AnalyticsDashboardProps,
} from '../../components/analytics/AnalyticsDashboard';
