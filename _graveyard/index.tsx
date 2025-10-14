/**
 * 🏪 SIMPLE CONTEXT STORE - Sin Zustand para evitar bucles infinitos
 * Usando React Context en lugar de Zustand
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'member' | 'child';
  createdAt: string;
  updatedAt: string;
}

// State interface
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Actions interface
interface AppActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message?: string }>;
}

// Combined type
type AppStore = AppState & AppActions;

// Create context
const AppContext = createContext<AppStore | null>(null);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  const handleSetUser = useCallback((newUser: User | null) => {
    console.log('Setting user:', newUser?.email || 'null');
    setUser(newUser);
  }, []);

  const handleSetLoading = useCallback((loading: boolean) => {
    console.log('Setting loading:', loading);
    setIsLoading(loading);
  }, []);

  const handleSetError = useCallback((errorMessage: string | null) => {
    console.log('Setting error:', errorMessage);
    setError(errorMessage);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    console.log('Login attempt for:', email);
    setIsLoading(true);
    setError(null);

    try {
      // Import Firebase auth dynamically
      const { auth } = await import('@/config/firebase');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Check email verification
      if (!firebaseUser.emailVerified) {
        setIsLoading(false);
        return { success: false, message: 'Please verify your email first' };
      }

      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        role: 'member',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(userData);
      setIsLoading(false);

      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message);
      setIsLoading(false);
      return { success: false, message: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('Logout called');
    try {
      const { auth } = await import('@/config/firebase');
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      
      setUser(null);
      setIsLoading(false);
      setError(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message);
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    console.log('Password reset for:', email);
    try {
      const { auth } = await import('@/config/firebase');
      const { sendPasswordResetEmail } = await import('firebase/auth');
      
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { success: false, message: error.message };
    }
  }, []);

  const value: AppStore = {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser: handleSetUser,
    setLoading: handleSetLoading,
    setError: handleSetError,
    login,
    logout,
    sendPasswordReset,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the store
export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};

// Simplified selectors
export const useAuth = () => {
  const store = useAppStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    logout: store.logout,
    sendPasswordReset: store.sendPasswordReset,
    setUser: store.setUser,
  };
};

// Dummy selectors for compatibility
export const useFamily = () => ({
  family: null,
  familyMembers: [],
  setFamily: () => {},
  addFamilyMember: () => {},
  removeFamilyMember: () => {},
});

export const useTasks = () => ({
  tasks: [],
  activeTasks: [],
  completedTasks: [],
  addTask: () => {},
  updateTask: () => {},
  deleteTask: () => {},
  completeTask: () => {},
});

export const useAchievements = () => ({
  achievements: [],
  userAchievements: [],
  addAchievement: () => {},
  updateAchievement: () => {},
  completeAchievement: () => {},
  checkAchievements: () => {},
});

export const useUI = () => ({
  theme: 'light' as const,
  language: 'en' as const,
  notifications: true,
  setTheme: () => {},
  setLanguage: () => {},
  setNotifications: () => {},
});