/**
 * Android Wear Integration Index
 * Exports all Android Wear related components and services
 */

export { default as AndroidWearManager } from './AndroidWearManager';
export { AndroidWearApp } from './AndroidWearApp';

// Re-export types for external use
export type {
  WearTile,
  WearComplication,
  WearNotification,
  WearVoiceCommand,
  WearHealthData,
  WearWatchFace,
  WearSyncData,
} from './AndroidWearManager';
