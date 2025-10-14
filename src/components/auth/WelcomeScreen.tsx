/**
 * Welcome Screen for Unauthenticated Users
 * Shows when user is not logged in
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface WelcomeScreenProps {
    onLoginPress?: () => void;
    onRegisterPress?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
    onLoginPress,
    onRegisterPress
}) => {
    return (
        <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="home" size={80} color="white" />
                </View>

                <Text style={styles.title}>Welcome to FamilyDash</Text>
                <Text style={styles.subtitle}>
                    Your family's digital dashboard for managing tasks, goals, and activities together.
                </Text>

                <View style={styles.features}>
                    <View style={styles.feature}>
                        <Ionicons name="calendar" size={24} color="white" />
                        <Text style={styles.featureText}>Family Calendar</Text>
                    </View>
                    <View style={styles.feature}>
                        <Ionicons name="checkmark-circle" size={24} color="white" />
                        <Text style={styles.featureText}>Task Management</Text>
                    </View>
                    <View style={styles.feature}>
                        <Ionicons name="trophy" size={24} color="white" />
                        <Text style={styles.featureText}>Goals & Rewards</Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    {onLoginPress && (
                        <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        </TouchableOpacity>
                    )}

                    {onRegisterPress && (
                        <TouchableOpacity style={styles.registerButton} onPress={onRegisterPress}>
                            <Text style={styles.registerButtonText}>Create Account</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 48,
    },
    features: {
        width: '100%',
        marginBottom: 48,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureText: {
        fontSize: 16,
        color: 'white',
        marginLeft: 16,
        fontWeight: '500',
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    loginButton: {
        backgroundColor: 'white',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3B82F6',
    },
    registerButton: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    registerButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
});




