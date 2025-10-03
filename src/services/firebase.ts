// Mock Firebase Service - Replaces Firebase with mock implementations

// Mock Firebase configuration
const firebaseConfig = {
    apiKey: "mock-api-key",
    authDomain: "mock-project.firebaseapp.com",
    projectId: "mock-project-id",
    storageBucket: "mock-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
};

// Mock Firebase services
const auth = {
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

const db = {
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

const storage = {
    ref: (path: string) => ({
        put: (file: any) => Promise.resolve({
            ref: {
                getDownloadURL: () => Promise.resolve("mock-storage-url")
            }
        })
    })
};

const messaging = {
    getToken: () => Promise.resolve("mock-fcm-token"),
    onMessage: () => { },
    requestPermission: () => Promise.resolve("granted")
};

const googleProvider = {
    providerId: "google.com",
    addScope: () => {},
    setCustomParameters: () => {}
};

console.log('🔥 Firebase running in MOCK mode - using placeholder data');

export { auth, db, storage, messaging, googleProvider };
export default { config: firebaseConfig };