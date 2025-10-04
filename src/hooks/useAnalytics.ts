/**
 * Analytics Hook for FamilyDash
 * Easy integration of analytics tracking in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    DataAnalyticsService,
    UserBehaviorMetrics,
    FamilyAnalytics,
    AnalyticsInsight,
    SmartReport,
    UserSession,
} from '../services/analytics/DataAnalyticsService';

export interface AnalyticsConfig {
    enableAutomaticTracking?: boolean;
    enableNavigationTracking?: boolean;
    enableInteractionTracking?: boolean;
    batchInterval?: number; // milliseconds
    debugMode?: boolean;
}

export interface UseAnalyticsReturn {
    // State
    isLoading: boolean;
    currentSession: UserSession | null;
    hasPermission: boolean;

    // Basic tracking methods
    trackEvent: (
        eventType: 'navigation' | 'interaction' | 'task_execution' | 'goal_progress' | 'penalty_assignment' | 'saferoom_message',
        eventName: string,
        module: 'dashboard' | 'tasks' | 'goals' | 'penalties' | 'calendar' | 'saferoom' | 'profile' | 'settings',
        properties?: Record<string, any>
    ) => Promise<void>;

    trackNavigation: (fromScreen: string, toScreen: string, timeOnPreviousScreen?: number) => Promise<void>;
    trackInteraction: (interactionType: string, element: string, module: any) => Promise<void>;
    trackTaskExecution: (taskId: string, action: string, module?: any) => Promise<void>;
    trackGoalProgress: (goalId: string, progress: number, module?: any) => Promise<void>;
    trackPenaltyAssignment: (penaltyId: string, penaltyType: string, module?: any) => Promise<void>;
    trackSafeRoomMessage: (messageId: string, messageType: 'sent' | 'received', module?: any) => Promise<void>;

    // Analytics generation
    generateUserMetrics: (
        userId: string,
        period: 'daily' | 'weekly' | 'monthly',
        startDate?: number,
        endDate?: number
    ) => Promise<UserBehaviorMetrics>;

    generateFamilyMetrics: (
        familyId: string,
        period: 'weekly' | 'monthly' | 'quarterly',
        startDate?: number,
        endDate?: number
    ) => Promise<FamilyAnalytics>;

    generateInsights: (userId?: string, familyId?: string) => Promise<AnalyticsInsight[]>;

    generateReport: (
        reportType: 'individual' | 'family' | 'parental' | 'productivity',
        userId?: string,
        familyId?: string,
        period?: 'daily' | 'weekly' | 'monthly'
    ) => Promise<SmartReport>;

    // Session management
    endCurrentSession: () => Promise<void>;

    // Data management
    clearAllData: () => Promise<void>;
    exportData: (userId: string, format?: 'json' | 'csv') => Promise<string>;
}

export const useAnalytics = (config: AnalyticsConfig = {}): UseAnalyticsReturn => {
    const {
        enableAutomaticTracking = true,
        enableNavigationTracking = true,
        enableInteractionTracking = true,
        batchInterval = 30000,
        debugMode = false,
    } = config;

    const analyticsService = DataAnalyticsService.getInstance();
    const previousScreen = useRef<string | null>(null);
    const screenStartTime = useRef<number>(0);

    const [isLoading, setIsLoading] = useState(false);
    const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
    const [hasPermission] = useState(true); // In real app, check actual permissions

    // Initialize analytics tracking
    useEffect(() => {
        if (enableAutomaticTracking) {
            initializeTracking();
        }

        return () => {
            // Cleanup on unmount
            if (enableAutomaticTracking) {
                analyticsService.endCurrentSession();
            }
        };
    }, [enableAutomaticTracking]);

    // Update current session state
    useEffect(() => {
        const interval = setInterval(() => {
            const session = analyticsService.getCurrentSession();
            setCurrentSession(session);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const initializeTracking = async () => {
        try {
            setIsLoading(true);

            // Initialize analytics service
            // The service is already initialized in its constructor

            if (debugMode) {
                console.log('📊 Analytics tracking initialized');
            }
        } catch (error) {
            console.error('Error initializing analytics tracking:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Basic tracking methods
    const trackEvent = useCallback(async (
        eventType: 'navigation' | 'interaction' | 'task_execution' | 'goal_progress' | 'penalty_assignment' | 'saferoom_message',
        eventName: string,
        module: 'dashboard' | 'tasks' | 'goals' | 'penalties' | 'calendar' | 'saferoom' | 'profile' | 'settings',
        properties?: Record<string, any>
    ) => {
        if (debugMode) {
            console.log(`📊 Tracking event: ${eventName} in ${module}`);
        }

        await analyticsService.trackEvent(eventType, eventName, module, properties);
    }, [debugMode]);

    const trackNavigation = useCallback(async (
        fromScreen: string,
        toScreen: string,
        timeOnPreviousScreen?: number
    ) => {
        if (!enableNavigationTracking) return;

        const timeSpent = timeOnPreviousScreen || (Date.now() - screenStartTime.current);
        screenStartTime.current = Date.now();
        previousScreen.current = toScreen;

        if (debugMode) {
            console.log(`📊 Navigation: ${fromScreen} → ${toScreen} (${timeSpent}ms)`);
        }

        await analyticsService.trackNavigation(fromScreen, toScreen, timeSpent);
    }, [enableNavigationTracking, debugMode]);

    const trackInteraction = useCallback(async (
        interactionType: string,
        element: string,
        module: any
    ) => {
        if (!enableInteractionTracking) return;

        if (debugMode) {
            console.log(`📊 Interaction: ${interactionType} on ${element}`);
        }

        await analyticsService.trackInteraction(interactionType, element, module);
    }, [enableInteractionTracking, debugMode]);

    const trackTaskExecution = useCallback(async (
        taskId: string,
        action: string,
        module: any = 'tasks'
    ) => {
        if (debugMode) {
            console.log(`📊 Task execution: ${action} on task ${taskId}`);
        }

        await analyticsService.trackTaskExecution(taskId, action, module);
    }, [debugMode]);

    const trackGoalProgress = useCallback(async (
        goalId: string,
        progress: number,
        module: any = 'goals'
    ) => {
        if (debugMode) {
            console.log(`📊 Goal progress: ${progress}% for goal ${goalId}`);
        }

        await analyticsService.trackGoalProgress(goalId, progress, module);
    }, [debugMode]);

    const trackPenaltyAssignment = useCallback(async (
        penaltyId: string,
        penaltyType: string,
        module: any = 'penalties'
    ) => {
        if (debugMode) {
            console.log(`📊 Penalty assignment: ${penaltyType} penalty ${penaltyId}`);
        }

        await analyticsService.trackPenaltyAssignment(penaltyId, penaltyType, module);
    }, [debugMode]);

    const trackSafeRoomMessage = useCallback(async (
        messageId: string,
        messageType: 'sent' | 'received',
        module: any = 'saferoom'
    ) => {
        if (debugMode) {
            console.log(`📊 SafeRoom message: ${messageType} message ${messageId}`);
        }

        await analyticsService.trackSafeRoomMessage(messageId, messageType, module);
    }, [debugMode]);

    // Analytics generation methods
    const generateUserMetrics = useCallback(async (
        userId: string,
        period: 'daily' | 'weekly' | 'monthly',
        startDate?: number,
        endDate?: number
    ): Promise<UserBehaviorMetrics> => {
        try {
            setIsLoading(true);

            const start = startDate || (period === 'daily' ? Date.now() - 24 * 60 * 60 * 1000 :
                period === 'weekly' ? Date.now() - 7 * 24 * 60 * 60 * 1000 :
                    Date.now() - 30 * 24 * 60 * 60 * 1000);

            const end = endDate || Date.now();

            if (debugMode) {
                console.log(`📊 Generating user metrics for ${userId} (${period})`);
            }

            const metrics = await analyticsService.generateUserBehaviorMetrics(userId, period, start, end);

            return metrics;
        } finally {
            setIsLoading(false);
        }
    }, [debugMode]);

    const generateFamilyMetrics = useCallback(async (
        familyId: string,
        period: 'weekly' | 'monthly' | 'quarterly',
        startDate?: number,
        endDate?: number
    ): Promise<FamilyAnalytics> => {
        try {
            setIsLoading(true);

            const start = startDate || (period === 'weekly' ? Date.now() - 7 * 24 * 60 * 60 * 1000 :
                period === 'monthly' ? Date.now() - 30 * 24 * 60 * 60 * 1000 :
                    Date.now() - 90 * 24 * 60 * 60 * 1000);

            const end = endDate || Date.now();

            if (debugMode) {
                console.log(`📊 Generating family metrics for ${familyId} (${period})`);
            }

            const metrics = await analyticsService.generateFamilyAnalytics(familyId, period, start, end);

            return metrics;
        } finally {
            setIsLoading(false);
        }
    }, [debugMode]);

    const generateInsights = useCallback(async (
        userId?: string,
        familyId?: string
    ): Promise<AnalyticsInsight[]> => {
        try {
            setIsLoading(true);

            if (debugMode) {
                console.log(`📊 Generating insights for ${userId || 'unknown'} - ${familyId || 'unknown'}`);
            }

            const insights = await analyticsService.generateInsights(userId, familyId);

            return insights;
        } finally {
            setIsLoading(false);
        }
    }, [debugMode]);

    const generateReport = useCallback(async (
        reportType: 'individual' | 'family' | 'parental' | 'productivity',
        userId?: string,
        familyId?: string,
        period: 'daily' | 'weekly' | 'monthly' = 'weekly'
    ): Promise<SmartReport> => {
        try {
            setIsLoading(true);

            if (debugMode) {
                console.log(`📊 Generating ${reportType} report`);
            }

            const report = await analyticsService.generateSmartReport(reportType, userId, familyId, period);

            return report;
        } finally {
            setIsLoading(false);
        }
    }, [debugMode]);

    // Session management
    const endCurrentSession = useCallback(async () => {
        try {
            if (debugMode) {
                console.log('📊 Ending current session');
            }

            await analyticsService.endCurrentSession();
            setCurrentSession(null);
        } catch (error) {
            console.error('Error ending session:', error);
        }
    }, [debugMode]);

    // Data management
    const clearAllData = useCallback(async () => {
        try {
            setIsLoading(true);

            if (debugMode) {
                console.log('📊 Clearing all analytics data');
            }

            await analyticsService.clearAllData();
            setCurrentSession(null);
        } catch (error) {
            console.error('Error clearing analytics data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [debugMode]);

    const exportData = useCallback(async (
        userId: string,
        format: 'json' | 'csv' = 'json'
    ): Promise<string> => {
        try {
            if (debugMode) {
                console.log(`📊 Exporting analytics data for ${userId} (${format})`);
            }

            const data = await analyticsService.exportAnalyticsData(userId, format);

            return data;
        } catch (error) {
            console.error('Error exporting analytics data:', error);
            return '';
        }
    }, [debugMode]);

    return {
        // State
        isLoading,
        currentSession,
        hasPermission,

        // Basic tracking methods
        trackEvent,
        trackNavigation,
        trackInteraction,
        trackTaskExecution,
        trackGoalProgress,
        trackPenaltyAssignment,
        trackSafeRoomMessage,

        // Analytics generation
        generateUserMetrics,
        generateFamilyMetrics,
        generateInsights,
        generateReport,

        // Session management
        endCurrentSession,

        // Data management
        clearAllData,
        exportData,
    };
};

// Specialized hooks for different modules
export const useTaskAnalytics = () => {
    const { trackEvent, trackTaskExecution } = useAnalytics();

    const trackTaskCreated = useCallback((taskId: string) => {
        return trackTaskExecution(taskId, 'create');
    }, [trackTaskExecution]);

    const trackTaskCompleted = useCallback((taskId: string) => {
        return trackTaskExecution(taskId, 'complete');
    }, [trackTaskExecution]);

    const trackTaskUpdated = useCallback((taskId: string, updates: Record<string, any>) => {
        return trackTaskExecution(taskId, 'update', 'tasks');
    }, [trackTaskExecution]);

    const trackTaskAssigned = useCallback((taskId: string, assignedTo: string) => {
        return trackTaskExecution(taskId, 'assign', 'tasks');
    }, [trackTaskExecution]);

    return {
        trackTaskCreated,
        trackTaskCompleted,
        trackTaskUpdated,
        trackTaskAssigned,
    };
};

export const useGoalAnalytics = () => {
    const { trackEvent, trackGoalProgress } = useAnalytics();

    const trackGoalCreated = useCallback((goalId: string, category: string) => {
        return trackEvent('goal_progress', 'goal_created', 'goals', { category });
    }, [trackEvent]);

    const trackGoalMilestone = useCallback((goalId: string, milestone: string, progress: number) => {
        return trackGoalProgress(goalId, progress);
    }, [trackGoalProgress]);

    const trackGoalCompleted = useCallback((goalId: string) => {
        return trackGoalProgress(goalId, 100);
    }, [trackGoalProgress]);

    const trackGoalAbandoned = useCallback((goalId: string, reason: string) => {
        return trackEvent('goal_progress', 'goal_abandoned', 'goals', { reason });
    }, [trackEvent]);

    return {
        trackGoalCreated,
        trackGoalMilestone,
        trackGoalCompleted,
        trackGoalAbandoned,
    };
};

export const usePenaltyAnalytics = () => {
    const { trackEvent, trackPenaltyAssignment } = useAnalytics();

    const trackPenaltyGiven = useCallback((penaltyId: string, type: 'yellow' | 'red', duration: number) => {
        return trackPenaltyAssignment(penaltyId, type, 'penalties');
    }, [trackPenaltyAssignment]);

    const trackPenaltyCompleted = useCallback((penaltyId: string) => {
        return trackEvent('penalty_assignment', 'penalty_completed', 'penalties');
    }, [trackEvent]);

    const trackPenaltyAppealed = useCallback((penaltyId: string, reason: string) => {
        return trackEvent('penalty_assignment', 'penalty_appealed', 'penalties', { reason });
    }, [trackEvent]);

    const trackPenaltyExpired = useCallback((penaltyId: string) => {
        return trackEvent('penalty_assignment', 'penalty_expired', 'penalties');
    }, [trackEvent]);

    return {
        trackPenaltyGiven,
        trackPenaltyCompleted,
        trackPenaltyExpired,
    };
};

export const useSafeRoomAnalytics = () => {
    const { trackEvent, trackSafeRoomMessage } = useAnalytics();

    const trackMessageSent = useCallback((messageId: string, messageType: 'text' | 'voice' | 'video') => {
        return trackSafeRoomMessage(messageId, 'sent', 'saferoom');
    }, [trackSafeRoomMessage]);

    const trackMessageReceived = useCallback((messageId: string, messageType: 'text' | 'voice' | 'video') => {
        return trackSafeRoomMessage(messageId, 'received', 'saferoom');
    }, [trackSafeRoomMessage]);

    const trackMessageReacted = useCallback((messageId: string, reaction: string) => {
        return trackEvent('saferoom_message', 'message_reaction', 'saferoom', { reaction });
    }, [trackEvent]);

    return {
        trackMessageSent,
        trackMessageReceived,
        trackMessageReacted,
    };
};

export const useNavigationAnalytics = () => {
    const { trackNavigation } = useAnalytics();

    const trackScreenEnter = useCallback((screenName: string) => {
        // In real app, get previous screen from navigation state
        return Promise.resolve();
    }, []);

    const trackScreenExit = useCallback((screenName: string) => {
        // Track when leaving a screen
        return Promise.resolve();
    }, []);

    return {
        trackScreenEnter,
        trackScreenExit,
    };
};
