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
    const [loading, setLoading] = useState(false); // Start as false = no loading

    // Simplified - no Firebase auto-detection for now
    // User will be null = not authenticated = show LoginScreen

    const login = async (email: string, password: string) => {
        try {
            const result = await RealAuthService.signInWithEmail({ email, password });

            // Update local state if login was successful
            if (result.success && result.user) {
                setUser({
                    uid: result.user.uid,
                    email: result.user.email || '',
                    displayName: result.user.displayName || '',
                });
            }

            return result;
        } catch (error: any) {
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

    const registerWithDisplayName = async (email: string, password: string, displayName: string) => {
        try {
            const result = await RealAuthService.registerWithEmail({ email, password, displayName });

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

