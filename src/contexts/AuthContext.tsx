/**
 * Authentication Context
 * Global authentication state management with Firebase
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RealAuthService } from '../services';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    uid: string;
    email: string;
    displayName?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<{ success: boolean; error?: string }>;
    sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Start with loading = check auth state

    // Listen to Firebase auth state changes with persistence
    useEffect(() => {
        console.log('🔐 AuthContext: Setting up Firebase auth listener with persistence...');

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('🔐 AuthContext: Firebase auth state changed:', firebaseUser ? `User logged in: ${firebaseUser.email}` : 'User logged out');

            if (firebaseUser) {
                console.log('🔐 AuthContext: User found, setting user state and saving to storage');
                const userData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || '',
                };

                setUser(userData);

                // Save user data to AsyncStorage for persistence
                try {
                    await AsyncStorage.setItem('user', JSON.stringify(userData));
                    console.log('🔐 AuthContext: User data saved to AsyncStorage');
                } catch (error) {
                    console.error('🔐 AuthContext: Failed to save user to AsyncStorage:', error);
                }
            } else {
                console.log('🔐 AuthContext: No authenticated user found, clearing storage');
                setUser(null);

                // Clear user data from AsyncStorage
                try {
                    await AsyncStorage.removeItem('user');
                    console.log('🔐 AuthContext: User data cleared from AsyncStorage');
                } catch (error) {
                    console.error('🔐 AuthContext: Failed to clear user from AsyncStorage:', error);
                }
            }

            setLoading(false);
        });

        // Cleanup function
        return () => {
            console.log('🔐 AuthContext: Cleaning up auth listener');
            unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        try {
            console.log('AuthContext: Attempting login for:', email);
            const result = await RealAuthService.signInWithEmail({ email, password });

            console.log('AuthContext: Login result:', result.success ? 'SUCCESS' : 'FAILED');

            // Note: We don't need to manually set user state here because
            // the Firebase auth listener will automatically update it
            if (result.success) {
                console.log('AuthContext: Login successful, Firebase listener will update user state');
            }

            return result;
        } catch (error: any) {
            console.log('AuthContext: Login error:', error.message);
            return { success: false, error: error.message };
        }
    };

    const register = async (email: string, password: string, displayName?: string) => {
        try {
            const result = await RealAuthService.registerWithEmail({ email, password, displayName });

            // Update local state if registration was successful
            if (result.success && result.user) {
                setUser({
                    uid: result.user.uid,
                    email: result.user.email || '',
                    displayName: result.user.displayName || displayName || '',
                });
            }

            return result;
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            console.log('🔐 AuthContext: Attempting logout...');
            const result = await RealAuthService.signOut();

            // Clear user state and storage
            setUser(null);
            await AsyncStorage.removeItem('user');
            console.log('🔐 AuthContext: Logout successful, user state and storage cleared');

            return result;
        } catch (error: any) {
            console.error('🔐 AuthContext: Logout error:', error);
            return { success: false, error: error.message };
        }
    };

    const sendPasswordReset = async (email: string) => {
        try {
            const result = await RealAuthService.sendPasswordResetEmail(email);
            return result;
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        sendPasswordReset,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

