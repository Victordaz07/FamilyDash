/**
 * Conditional Navigator
 * Shows Login screen when not authenticated, main app when authenticated
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { createStackNavigator } from '@react-navigation/stack';
import SimpleAppNavigator from './SimpleAppNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import { useAuth } from '../contexts/AuthContext';
import { useEmailVerificationGate } from '../hooks/useEmailVerificationGate';
import { theme } from '../styles/simpleTheme';

const AuthStack = createStackNavigator();

const ConditionalNavigator: React.FC = () => {
    const { user, loading } = useAuth();
    const { loading: verificationLoading, verified } = useEmailVerificationGate();

    // Show loading screen while checking auth state
    if (loading || verificationLoading) {
        return (
            <LinearGradient
                colors={[theme.colors.background, theme.colors.gradientEnd]}
                style={styles.loadingContainer}
            >
                <View style={styles.loadingContent}>
                    {/* FamilyDash Official Icon */}
                    <View style={styles.iconContainer}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.logoImage}
                            contentFit="contain"
                        />
                    </View>

                    <Text style={styles.loadingText}>FamilyDash</Text>
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.primary}
                        style={styles.spinner}
                    />
                    <Text style={styles.loadingSubtext}>
                        {loading ? 'Loading...' : 'Verifying email...'}
                    </Text>
                </View>
            </LinearGradient>
        );
    }

    // Show Auth screens (Login/Register) when not authenticated  
    if (!user) {
        return (
            <AuthStack.Navigator
                id={undefined}
                screenOptions={{ headerShown: false }}
            >
                <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
                <AuthStack.Screen name="RegisterScreen" component={RegisterScreen} />
                <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            </AuthStack.Navigator>
        );
    }

    // Show email verification screen when authenticated but not verified
    if (!verified) {
        return <VerifyEmailScreen />;
    }

    // Show main app when authenticated and verified
    return <SimpleAppNavigator />;
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContent: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        marginBottom: 32,
        elevation: 15,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    loadingText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 16,
    },
    spinner: {
        marginBottom: 16,
    },
    loadingSubtext: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
});

export default ConditionalNavigator;
