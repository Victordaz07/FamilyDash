/**
 * Firebase Real Configuration for FamilyDash
 * Production-ready Firebase services integration
 * SECURITY: All credentials loaded from environment variables
 */

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, connectFirestoreEmulator, getDoc, doc, collection, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
// NOTE: In React Native, DO NOT use firebase/analytics or firebase/performance from web SDK
// These will be migrated to react-native-firebase in Phase 8

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID, // empty in RN (ok)
};

// Validate required config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    '🔥 Firebase configuration missing! Please ensure all EXPO_PUBLIC_FIREBASE_* environment variables are set in your .env file.'
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

console.log(`🔥 Firebase initialized with project: ${firebaseConfig.projectId}`);

// Initialize Firebase services with React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);

// Enable offline persistence (web only)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.log('⚠️ The current browser does not support all features required for persistence');
    } else {
      console.log('❌ Persistence error:', err);
    }
  });
}

const storage = getStorage(app);
const functions = getFunctions(app);

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Configure providers
googleProvider.addScope('email');
googleProvider.addScope('profile');
facebookProvider.addScope('email');

// Development emulator configuration
if (__DEV__) {
  console.log('🔧 Firebase running in development mode');
  // Connect to Firestore emulator (uncomment if using emulators)
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // Connect to Functions emulator (uncomment if using emulators)
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}

// Authentication helpers
export const isUserAuthenticated = () => {
  return auth.currentUser !== null;
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const waitForAuth = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, (error) => {
      reject(error);
    });
  });
};

// Firestore helpers
export const createCollection = (collectionName: string) => {
  return collection(db, collectionName);
};

export const createDocument = (collectionName: string, docId?: string) => {
  if (docId) {
    return doc(db, collectionName, docId);
  }
  return doc(collection(db, collectionName));
};

// Storage helpers
import { ref as storageRef, uploadBytes } from 'firebase/storage';

export const getFileReference = (path: string) => {
  return storageRef(storage, path);
};

export const uploadFile = async (path: string, file: File | Blob, metadata?: any) => {
  const ref = storageRef(storage, path);
  return await uploadBytes(ref, file, metadata);
};

// Cloud Functions helpers
import { httpsCallable } from 'firebase/functions';

export const callFunction = async (functionName: string, data?: any) => {
  const functionRef = httpsCallable(functions, functionName);
  return await functionRef(data);
};

// Analytics helpers (placeholder for future react-native-firebase integration)
export const trackEvent = (eventName: string, parameters?: any) => {
  if (__DEV__) {
    console.log(`📊 Analytics Event: ${eventName}`, parameters);
  }
  // Will be replaced with react-native-firebase in Phase 8
};

export const trackScreen = (screenName: string) => {
  if (__DEV__) {
    console.log(`📊 Screen View: ${screenName}`);
  }
  // Will be replaced with react-native-firebase in Phase 8
};

// Performance helpers (placeholder for future react-native-firebase integration)
export const startTrace = (traceName: string) => {
  if (__DEV__) {
    console.log(`⚡ Performance Trace Started: ${traceName}`);
  }
  return null;
  // Will be replaced with react-native-firebase in Phase 8
};

export const stopTrace = (trace: any) => {
  // Will be replaced with react-native-firebase in Phase 8
};

// Environment utilities
export const isDevelopment = () => __DEV__;
export const isProduction = () => process.env.NODE_ENV === 'production';
export const getEnvironment = () => process.env.NODE_ENV || 'development';

// Connection status
export const checkConnectionStatus = async (): Promise<'connected' | 'offline' | 'error'> => {
  try {
    const testDoc = await getDoc(doc(db, '_test_connection', 'status'));
    return testDoc.exists() ? 'connected' : 'connected';
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return 'offline';
  }
};

// Export Firebase instances
export {
  auth,
  db,
  storage,
  functions,
  googleProvider,
  facebookProvider,
  firebaseConfig,
};

// Export app instance
export default app;
