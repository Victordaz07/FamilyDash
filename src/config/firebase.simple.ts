/**
 * Simplified Firebase Configuration
 * Minimal setup to avoid initialization issues
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TEMP during Phase 0: config removed; will be loaded from env in Phase 1
// SECURITY AUDIT: Hardcoded credentials disabled
const firebaseConfig = {
  apiKey: "__PLACEHOLDER__FIREBASE_CONFIG_DISABLED__",
  authDomain: "__PLACEHOLDER__",
  projectId: "__PLACEHOLDER__",
  storageBucket: "__PLACEHOLDER__",
  messagingSenderId: "__PLACEHOLDER__",
  appId: "__PLACEHOLDER__",
  measurementId: "__PLACEHOLDER__"
};

// WARNING: This file will be replaced in Phase 1 with env-based config
export const __FIREBASE_CONFIG_DISABLED__ = true;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const storage = getStorage(app);

console.log('🔥 Firebase initialized (simplified)');

// Export Firebase instances
export { app, db, storage, firebaseConfig };
export default app;
