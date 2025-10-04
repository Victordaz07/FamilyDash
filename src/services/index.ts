/**
 * Services Index - Real Firebase Services
 * Exports all production-ready Firebase services
 */

// Core Firebase Services
export { default as FirebaseApp } from '../config/firebase';

// Authentication Services
export { default as RealAuthService } from './auth/RealAuthService';
export type {
  AuthUser,
  AuthResult,
  LoginCredentials,
  RegisterCredentials,
  ProfileUpdate,
} from './auth/RealAuthService';

// Database Services
export { default as RealDatabaseService } from './database/RealDatabaseService';
export type {
  DatabaseDocument,
  CollectionReference,
  QueryOptions,
  DatabaseResult,
} from './database/RealDatabaseService';

// Storage Services
export { default as RealStorageService } from './storage/RealStorageService';
export type {
  StorageFile,
  UploadProgress,
  StorageResult,
  StorageOptions,
} from './storage/RealStorageService';

// Legacy Firebase exports (maintaining compatibility)
export * from './firebase';

// Advanced Services
export { default as AdvancedNotificationService } from './notifications/AdvancedNotificationService';
export { default as RealTimeSync } from './realtime/RealTimeSync';
export { default as WebSocketManager } from './realtime/WebSocketManager';

// Analytics Services
export { default as DataAnalyticsService } from './analytics/DataAnalyticsService';

// AI Services
export { default as SmartFamilyAssistant } from './ai/SmartFamilyAssistant';
export { default as NaturalLanguageProcessor } from './ai/NaturalLanguageProcessor';
export { default as PredictiveAnalytics } from './ai/PredictiveAnalytics';

// Cloud Services
export { default as FirebaseMigrationService } from './cloud/FirebaseMigrationService';
export { default as MultiDeviceSyncService } from './cloud/MultiDeviceSyncService';
export { default as ProductionDeploymentService } from './cloud/ProductionDeploymentService';
export { default as EnterpriseSecurityService } from './cloud/EnterpriseSecurityService';

// Security Services
export { default as SecurityService } from './security/SecurityService';

console.log('🚀 Real Firebase services loaded successfully');
