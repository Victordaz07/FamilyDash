/**
 * Login Screen
 * Modern login interface with FamilyDash branding
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../styles/simpleTheme';

interface LoginScreenProps {
    navigation: any;
    onSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, onSuccess }) => {
    const { login, sendPasswordReset } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const result = await login(email.trim(), password);

            if (result.success) {
                Alert.alert('Success', 'Welcome back!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (onSuccess) {
                                onSuccess();
                            }
                            // Navigation is handled automatically by AuthContext
                        }
                    }
                ]);
            } else if (result.code === 'EMAIL_NOT_VERIFIED') {
                // Redirigir a pantalla de verificación
                navigation.navigate('VerifyEmail');
            } else {
                Alert.alert('Login Failed', result.error || 'Please try again');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Email Required', 'Please enter your email address first');
            return;
        }

        try {
            const result = await sendPasswordReset(email.trim());

            if (result.success) {
                Alert.alert('Password Reset Sent', 'Check your email for reset instructions');
            } else {
                Alert.alert('Error', result.error || 'Failed to send reset email');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to send password reset');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        {/* FamilyDash Official Icon */}
                        <View style={styles.iconContainer}>
                            <Image
                                source={require('../../assets/icon.png')}
                                style={styles.logoImage}
                                contentFit="contain"
                            />
                        </View>

                        <Text style={styles.title}>Welcome Back 👋</Text>
                        <Text style={styles.subtitle}>Sign in to your family dashboard</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        <View style={styles.formCard}>
                            {/* Email Field */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Email Address</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                                </View>
                            </View>

                            {/* Password Field */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={[styles.input, styles.passwordInput]}
                                        placeholder="Enter your password"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.passwordToggle}>
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color={theme.colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Forgot Password */}
                            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
                                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <TouchableOpacity
                                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                                onPress={handleLogin}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={['#8B5CF6', '#3B82F6']}
                                    style={styles.loginButtonGradient}
                                >
                                    <Text style={styles.loginButtonText}>
                                        {loading ? 'Signing in...' : 'Login'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Register Link */}
                            <View style={styles.registerContainer}>
                                <Text style={styles.registerText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
                                    <Text style={styles.registerLink}>Register</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
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
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        paddingHorizontal: 32,
        lineHeight: 22,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 28,
        padding: 36,
        marginHorizontal: 4,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },
    inputWrapper: {
        position: 'relative',
    },
    input: {
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 18,
        paddingHorizontal: 20,
        paddingVertical: 18,
        fontSize: 16,
        color: theme.colors.textPrimary,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    passwordInput: {
        paddingRight: 48,
    },
    inputIcon: {
        position: 'absolute',
        right: 20,
        top: 16,
        color: theme.colors.textSecondary,
    },
    passwordToggle: {
        position: 'absolute',
        right: 20,
        top: 16,
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 32,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    loginButton: {
        width: '100%',
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 24,
        elevation: 10,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonGradient: {
        paddingVertical: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    registerLink: {
        fontSize: 16,
        color: theme.colors.primary,
        fontWeight: '600',
    },
});
