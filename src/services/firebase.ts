// Real Firebase Service - Production-ready Firebase integration
export { 
  auth, 
  db, 
  storage, 
  messaging, 
  googleProvider,
  analytics,
  performance,
  firebaseConfig,
  isUserAuthenticated,
  getCurrentUser,
  waitForAuth,
  createCollection,
  createDocument,
  getFileReference,
  uploadFile,
  callFunction,
  trackEvent,
  trackScreen,
  startTrace,
  stopTrace,
  isDevelopment,
  isProduction,
  getEnvironment,
  checkConnectionStatus
} from '@/config/firebase';

// Re-export the app instance
export { default } from '@/config/firebase';

console.log('🔥 Firebase running in REAL mode - connected to Firebase services');