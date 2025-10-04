/**
 * Authentication Context
 * Global authentication state management with Firebase
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RealAuthService } from '../services';

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple solution: Set loading to false after 2 seconds
        const timeoutId = setTimeout(() => {
            setLoading(false);
        }, 2000);

        const unsubscribe = RealAuthService.onAuthStateChanged((user) => {
            if (user) {
                setUser({
                    uid: user.uid,
                    email: user.email || '',
                    displayName: user.displayName || '',
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            clearTimeout(timeoutId);
            unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const result = await RealAuthService.signInWithEmailAndPassword(email, password);
            return result;
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const register = async (email: string, password: string, displayName?: string) => {
        try {
            const result = await RealAuthService.createUserWithEmailAndPassword(email, password);

            if (result.success && displayName) {
                // Update display name
                await RealAuthService.updateProfile({ displayName });
            }

            return result;
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const registerWithDisplayName = async (email: string, password: string, displayName: string) => {
        try {
            const result = await RealAuthService.createUserWithEmailAndPassword(email, password);

            if (result.success) {
                // Update display name
                await RealAuthService.updateProfile({ displayName });
            }

            return result;
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            const result = await RealAuthService.signOut();
            setUser(null);
            return result;
        } catch (error: any) {
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
        register: registerWithDisplayName,
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

