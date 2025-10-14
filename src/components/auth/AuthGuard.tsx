/**
 * Authentication Guard Component
 * Protects modules from initializing without authenticated user
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/store';

interface AuthGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    fallback = <DefaultFallback />
}) => {
    const { user, loading } = useAuth();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Wait for auth state to be determined
        if (!loading) {
            setIsReady(true);
        }
    }, [loading]);

    if (!isReady) {
        return <DefaultFallback />;
    }

    if (!user) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

const DefaultFallback: React.FC = () => (
    <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.text}>Checking authentication...</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
});
