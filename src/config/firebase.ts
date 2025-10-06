/**
 * Firebase Real Configuration for FamilyDash
 * Production-ready Firebase services integration
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, getDoc, doc, collection } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
// import { getMessaging } from 'firebase/messaging'; // Removed - causes issues in React Native

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyBqZSqW2ZU1EZldEuc0rktxMuSYi1hleq8",
  authDomain: "family-dash-15944.firebaseapp.com",
  projectId: "family-dash-15944",
  storageBucket: "family-dash-15944.firebasestorage.app",
  messagingSenderId: "3950658017",
  appId: "1:3950658017:web:9d4d2ddea39f8a785e12a0",
  measurementId: "G-ENM2KQWEPX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Enable Analytics and Performance
console.log('🔥 Firebase initialized with project: family-dash-15944');

// Initialize Analytics (optional for React Native)
// const analytics = getAnalytics(app);

// Initialize Performance Monitoring
// const perf = getPerformance(app);

// Initialize Cloud Messaging
// const messaging = getMessaging(app);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Configure providers
googleProvider.addScope('email');
googleProvider.addScope('profile');

facebookProvider.addScope('email');

// Initialize analytics (only in production)
let analytics = null;
let performance = null;
let messaging = null;

if (process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
  performance = getPerformance(app);

  // Initialize messaging (only in production and web)
  // Temporarily disabled - causes issues in React Native
  // if (typeof global !== 'undefined' && global.window) {
  //   messaging = getMessaging(app);
  // }
}

// Development emulator configuration
if (__DEV__) {
  console.log('🔧 Firebase running in development mode with emulators');

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

// Analytics helpers
export const trackEvent = (eventName: string, parameters?: any) => {
  try {
    if (analytics && typeof analytics.logEvent === 'function') {
      analytics.logEvent(eventName, parameters);
    } else {
      // Fallback: log to console in development
      console.log(`📊 Analytics Event: ${eventName}`, parameters);
    }
  } catch (error) {
    console.warn(`⚠️ Analytics tracking failed for event: ${eventName}`, error);
  }
};

export const trackScreen = (screenName: string) => {
  try {
    if (analytics && typeof analytics.logEvent === 'function') {
      analytics.logEvent('screen_view', { screen_name: screenName });
    } else {
      // Fallback: log to console in development
      console.log(`📊 Screen View: ${screenName}`);
    }
  } catch (error) {
    console.warn(`⚠️ Analytics tracking failed for screen: ${screenName}`, error);
  }
};

// Performance helpers
export const startTrace = (traceName: string) => {
  if (performance) {
    const trace = performance.trace(traceName);
    trace.start();
    return trace;
  }
  return null;
};

export const stopTrace = (trace: any) => {
  if (trace) {
    trace.stop();
  }
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
  analytics,
  performance,
  messaging,
  firebaseConfig,
};

// Export app instance
export default app;

