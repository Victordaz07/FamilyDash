import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

// Firebase configuration placeholders
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "your-api-key-here",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

// Initialize Firebase
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let messaging: any = null;

const hasRealConfig = process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY !== "your-api-key-here";

try {
    if (hasRealConfig) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        messaging = getMessaging(app);
    } else {
        // Mock services for development
        console.log('🔥 Firebase running in MOCK mode - using placeholder data');

        auth = {
            currentUser: null,
            signInWithPopup: () => Promise.resolve({
                user: {
                    uid: "demo-user-123",
                    email: "demo@family.com",
                    displayName: "Demo Family Member",
                    photoURL: null
                }
            }),
            signOut: () => Promise.resolve(),
            onAuthStateChanged: (callback: any) => {
                // Simulate user login after 1 second
                setTimeout(() => callback({
                    uid: "demo-user-123",
                    email: "demo@family.com",
                    displayName: "Demo Family Member",
                    photoURL: null
                }), 1000);
                return () => { };
            }
        };

        db = {
            collection: (name: string) => ({
                doc: (id: string) => ({
                    get: () => Promise.resolve({ exists: () => false, data: () => ({}) }),
                    set: (data: any) => Promise.resolve(),
                    update: (data: any) => Promise.resolve(),
                    delete: () => Promise.resolve()
                }),
                add: (data: any) => Promise.resolve({ id: 'mock-doc-id' }),
                where: () => ({
                    get: () => Promise.resolve({ docs: [] })
                }),
                orderBy: () => ({
                    get: () => Promise.resolve({ docs: [] })
                }),
                get: () => Promise.resolve({ docs: [] })
            })
        };

        storage = {
            ref: (path: string) => ({
                put: (file: any) => Promise.resolve({
                    ref: {
                        getDownloadURL: () => Promise.resolve("mock-storage-url")
                    }
                })
            })
        };

        messaging = {
            getToken: () => Promise.resolve("mock-fcm-token"),
            onMessage: () => { },
            requestPermission: () => Promise.resolve("granted")
        };
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { auth, db, storage, messaging, googleProvider };
export default app;
