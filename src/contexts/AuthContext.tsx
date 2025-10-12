/**
 * Authentication Context
 * Global authentication state management with Firebase
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RealAuthService, EmailNotVerifiedError } from '../services';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { SecureStorage, STORAGE_KEYS } from '../utils/secureStorage';
import { secureLog, secureError, logAuthEvent } from '../utils/secureLog';

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
        secureLog('🔐 AuthContext: Setting up Firebase auth listener with persistence...');

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            logAuthEvent('auth_state_changed', firebaseUser?.uid);

            try {
                if (firebaseUser) {
                    secureLog('🔐 AuthContext: User found, setting user state and saving to secure storage');
                    const userData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        displayName: firebaseUser.displayName || '',
                    };

                    setUser(userData);

                    // Save user data to SecureStorage for encrypted persistence
                    try {
                        await SecureStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
                        secureLog('🔐 AuthContext: User data saved to SecureStorage');
                    } catch (error) {
                        secureError('🔐 AuthContext: Failed to save user to SecureStorage', error);
                    }
                } else {
                    secureLog('🔐 AuthContext: No authenticated user found, clearing storage');
                    setUser(null);

                    // Clear user data from SecureStorage
                    try {
                        await SecureStorage.deleteItem(STORAGE_KEYS.USER_DATA);
                        secureLog('🔐 AuthContext: User data cleared from SecureStorage');
                    } catch (error) {
                        secureError('🔐 AuthContext: Failed to clear user from SecureStorage', error);
                    }
                }
            } catch (error) {
                secureError('🔐 AuthContext: Error in auth state change handler', error);
            } finally {
                setLoading(false);
            }
        }, (error) => {
            secureError('🔐 AuthContext: Firebase auth error', error);
            setLoading(false);
        });

        // Cleanup function
        return () => {
            secureLog('🔐 AuthContext: Cleaning up auth listener');
            unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        try {
            logAuthEvent('login_attempt');
            const result = await RealAuthService.signInWithEmail({ email, password });

            logAuthEvent('login_result', result.success ? 'success' : 'failed');

            // Note: We don't need to manually set user state here because
            // the Firebase auth listener will automatically update it
            if (result.success) {
                console.log('AuthContext: Login successful, Firebase listener will update user state');
            }

            return result;
        } catch (error: any) {
            console.log('AuthContext: Login error:', error.message);
            
            // Manejar error de verificación de email
            if (error instanceof EmailNotVerifiedError || error?.code === 'EMAIL_NOT_VERIFIED') {
                return { success: false, error: 'EMAIL_NOT_VERIFIED', code: 'EMAIL_NOT_VERIFIED' };
            }
            
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

