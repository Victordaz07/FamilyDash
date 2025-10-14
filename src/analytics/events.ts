/**
 * 📊 ANALYTICS EVENTS BUS
 * Central event dispatcher for achievements and analytics
 */

import { useAppStore } from "@/store";

export type EventType = 
  | 'task_created'
  | 'task_completed'
  | 'login_day';

export interface AnalyticsEvent {
  type: EventType;
  payload?: any;
}

/**
 * Emit an event to trigger achievement checks and analytics
 */
export const emit = (eventType: EventType, payload?: any) => {
  const event: AnalyticsEvent = { type: eventType, payload };
  
  // Trigger achievement check
  useAppStore.getState().checkAndAward(event);
  
  // Future: Send to analytics service (Firebase Analytics, Mixpanel, etc.)
  if (__DEV__) {
    console.log(`📊 Event emitted: ${eventType}`, payload);
  }
};

/**
 * Convenience helpers for common events
 */
export const analytics = {
  taskCreated: (taskId: string) => emit('task_created', { id: taskId }),
  taskCompleted: (taskId: string) => emit('task_completed', { id: taskId }),
  loginDay: () => emit('login_day'),
};
