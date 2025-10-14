/**
 * 🔥 FIREBASE CENTRAL CONFIGURATION
 * Single source of truth for all Firebase services
 * Prevents multiple initializations and configuration conflicts
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqZSqW2ZU1EZldEuc0rktxMuSYi1hleq8",
  authDomain: "family-dash-15944.firebaseapp.com",
  projectId: "family-dash-15944",
  storageBucket: "family-dash-15944.firebasestorage.app",
  messagingSenderId: "3950658017",
  appId: "1:3950658017:web:9d4d2ddea39f8a785e12a0",
  measurementId: "G-ENM2KQWEPX"
};

// Initialize Firebase App (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Development emulator connections (only in development)
if (__DEV__) {
  try {
    // Connect to emulators only if not already connected
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, "http://localhost:9099");
    }
    if (!db._delegate._databaseId.projectId.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    if (!functions.customDomain) {
      connectFunctionsEmulator(functions, "localhost", 5001);
    }
    if (!storage.app.options.storageBucket.includes('localhost')) {
      connectStorageEmulator(storage, "localhost", 9199);
    }
  } catch (error) {
    console.log('Emulators already connected or not available');
  }
}

// Export app instance
export default app;

// Utility functions for safe Firebase operations
export const safeFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage || 'Firebase operation failed:', error);
    return fallback;
  }
};

// Database helpers
export const dbHelpers = {
  // Safe document operations
  getDocument: async (collection: string, docId: string) => {
    return safeFirebaseOperation(
      () => import('firebase/firestore').then(({ doc, getDoc }) => 
        getDoc(doc(db, collection, docId)).then(docSnap => 
          docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
        )
      ),
      null,
      `Failed to get document ${docId} from ${collection}`
    );
  },

  setDocument: async (collection: string, docId: string, data: any) => {
    return safeFirebaseOperation(
      () => import('firebase/firestore').then(({ doc, setDoc }) => 
        setDoc(doc(db, collection, docId), { ...data, updatedAt: new Date().toISOString() })
      ),
      false,
      `Failed to set document ${docId} in ${collection}`
    );
  },

  getCollection: async (collection: string, limit?: number) => {
    return safeFirebaseOperation(
      () => import('firebase/firestore').then(({ collection: col, getDocs, query, limitToLast }) => {
        const q = limit ? query(col(db, collection), limitToLast(limit)) : col(db, collection);
        return getDocs(q).then(snapshot => 
          snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        );
      }),
      [],
      `Failed to get collection ${collection}`
    );
  }
};

// Auth helpers
export const authHelpers = {
  getCurrentUser: () => auth.currentUser,
  isAuthenticated: () => !!auth.currentUser,
  signOut: () => safeFirebaseOperation(
    () => auth.signOut(),
    null,
    'Failed to sign out'
  )
};