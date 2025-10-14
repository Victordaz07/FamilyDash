/**
 * EventBus - Central event system for cross-store communication
 * Connects Tasks, Goals, Penalties, and Achievements
 */

import mitt from 'mitt';

// Event types with their payloads
type Events = {
  'task.completed': { userId: string; taskId: string; completedAt: number };
  'goal.completed': { userId: string; goalId: string; completedAt: number };
  'penalty.added': { userId: string; penaltyId: string; createdAt: number };
  'event.participated': { userId: string; eventType: 'familyNight' | 'other'; at: number };
};

// Create event bus instance
export const eventBus = mitt<Events>();

// Convenience methods for type-safe event publishing
export const publish = <K extends keyof Events>(type: K, payload: Events[K]) => {
  eventBus.emit(type, payload);
};

// Convenience methods for type-safe event subscription
export const subscribe = <K extends keyof Events>(
  type: K,
  cb: (e: Events[K]) => void
): (() => void) => {
  eventBus.on(type, cb);
  // Return unsubscribe function
  return () => eventBus.off(type, cb);
};

// Unsubscribe helper
export const unsubscribe = <K extends keyof Events>(
  type: K,
  cb: (e: Events[K]) => void
) => {
  eventBus.off(type, cb);
};

// Clear all event listeners (useful for cleanup)
export const clearAll = () => {
  eventBus.all.clear();
};

