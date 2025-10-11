/**
 * Simplified Firebase Configuration
 * Minimal setup to avoid initialization issues
 * SECURITY: All credentials loaded from environment variables
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    '🔥 Firebase configuration missing! Please ensure all EXPO_PUBLIC_FIREBASE_* environment variables are set in your .env file.'
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const storage = getStorage(app);

console.log(`🔥 Firebase initialized (simplified) with project: ${firebaseConfig.projectId}`);

// Export Firebase instances
export { app, db, storage, firebaseConfig };
export default app;
