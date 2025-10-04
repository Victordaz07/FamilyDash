/**
 * SIMPLE Firebase Services Index
 * Only essential Firebase services for authentication and database
 */

// Core Firebase Services ONLY
export { default as FirebaseApp } from '../config/firebase';
export { default as RealAuthService } from './auth/RealAuthService';
export { default as RealDatabaseService } from './database/RealDatabaseService';
export { default as RealStorageService } from './storage/RealStorageService';

// Firebase config exports
export * from './firebase';

console.log('🚀 Essential Firebase services loaded');
