/**
 * Advanced Register Screen - 2 Steps with Admin Options
 * Step 1: Basic Info (Name, Email, Password)
 * Step 2: Family Setup + Admin Options (Join/Create Family, Admin Role, Photo)
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
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/store';
import { theme } from '@/styles/simpleTheme';
import * as ImagePicker from 'expo-image-picker';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';

interface RegisterScreenProps {
    navigation: any;
    onSuccess?: () => void;
}

interface RegistrationData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    avatarUrl?: string;
    
    // Family options
    familyOption: 'join' | 'create';
    houseCode?: string;
    familyName?: string;
    
    // Admin options
    wantsAdmin: boolean;
    adminReason?: string;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation, onSuccess }) => {
    const { register } = useAuth();
    const { safeGoBack } = useSafeNavigation();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Registration data with admin options
    const [regData, setRegData] = useState<RegistrationData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        avatarUrl: '',
        
        // Family options
        familyOption: 'create',
        houseCode: '',
        familyName: '',
        
        // Admin options
        wantsAdmin: false,
        adminReason: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Photo picker
    const [showImagePicker, setShowImagePicker] = useState(false);

    const validateStep1 = () => {
        if (!regData.fullName.trim()) {
            Alert.alert('Error', 'Please enter your full name');
            return false;
        }
        if (!regData.email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return false;
        }
        if (regData.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return false;
        }
        if (regData.password !== regData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (regData.familyOption === 'create' && !regData.familyName?.trim()) {
            Alert.alert('Error', 'Please enter your family name');
            return false;
        }
        if (regData.familyOption === 'join' && !regData.houseCode?.trim()) {
            Alert.alert('Error', 'Please enter the family code');
            return false;
        }
        if (regData.wantsAdmin && !regData.adminReason?.trim()) {
            Alert.alert('Error', 'Please explain why you want to be an admin');
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        } else if (currentStep === 2 && validateStep2()) {
            handleFinishRegistration();
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinishRegistration = async () => {
        setLoading(true);
        try {
            const result = await register({
                email: regData.email.trim(),
                password: regData.password,
                displayName: regData.fullName.trim(),
                familyName: regData.familyName,
                houseCode: regData.houseCode,
                wantsAdmin: regData.wantsAdmin,
                adminReason: regData.adminReason,
                avatarUrl: regData.avatarUrl,
            });

            if (result.success) {
                Alert.alert('Success', 'Account created successfully!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (onSuccess) {
                                onSuccess();
                            }
                        }
                    }
                ]);
            } else {
                // Manejar errores específicos
                if (result.code === 'auth/email-already-in-use') {
                    Alert.alert(
                        'Email Already Registered',
                        'An account with this email already exists. Would you like to:',
                        [
                            {
                                text: 'Try Login',
                                onPress: () => navigation.goBack(),
                                style: 'default'
                            },
                            {
                                text: 'Reset Password',
                                onPress: () => {
                                    navigation.navigate('ForgotPassword', { email: regData.email });
                                },
                                style: 'default'
                            },
                            {
                                text: 'Use Different Email',
                                onPress: () => {
                                    setRegData(prev => ({ ...prev, email: '' }));
                                },
                                style: 'cancel'
                            }
                        ],
                        { cancelable: true }
                    );
                } else {
                    Alert.alert('Registration Failed', result.error || 'Please try again');
                }
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: string, value: string | boolean) => {
        setRegData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageSelection = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant permission to access your photo library');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets[0]) {
                updateField('avatarUrl', result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to select image');
        }
    };

    // Email availability check removed - not available in React Native
    // Firebase will handle duplicate emails during registration

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={[theme.colors.background, theme.colors.gradientEnd]}
                style={styles.gradient}
            >
                {/* Custom Header with Back Button */}
                <View style={styles.customHeader}>
                    <TouchableOpacity 
                        style={styles.headerBackButton}
                        onPress={safeGoBack}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Account</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Image
                                source={require('../../assets/brand/logo-256.png')}
                                style={styles.logoImage}
                                contentFit="contain"
                            />
                        </View>
                        <Text style={styles.title}>Create Family Account 🏡</Text>
                        <Text style={styles.subtitle}>Start organizing your family today</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        <View style={styles.formCard}>
                            {/* Full Name Field */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Full Name</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Your full name"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        value={regData.fullName}
                                        onChangeText={(value) => updateField('fullName', value)}
                                        autoCapitalize="words"
                                    />
                                    <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                                </View>
                            </View>

                            {/* Email Field */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Email Address</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        value={regData.email}
                                        onChangeText={(value) => updateField('email', value)}
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
                                        placeholder="Create password"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        value={regData.password}
                                        onChangeText={(value) => updateField('password', value)}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color={theme.colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Confirm Password Field */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Confirm Password</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={[styles.input, styles.passwordInput]}
                                        placeholder="Confirm password"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        value={regData.confirmPassword}
                                        onChangeText={(value) => updateField('confirmPassword', value)}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.passwordToggle}>
                                        <Ionicons
                                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color={theme.colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Action Button */}
                            <TouchableOpacity
                                style={[styles.finishButton, loading && styles.finishButtonDisabled]}
                                onPress={handleFinishRegistration}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#059669']}
                                    style={styles.finishButtonGradient}
                                >
                                    <Text style={styles.finishButtonText}>
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Login Link */}
                            <View style={styles.loginContainer}>
                                <Text style={styles.loginText}>Already have an account? </Text>
                                <TouchableOpacity onPress={safeGoBack}>
                                    <Text style={styles.loginLink}>Login</Text>
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
    container: { flex: 1 },
    
    // Custom Header Styles
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: 'transparent',
    },
    headerBackButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    headerSpacer: {
        width: 40, // Same width as back button to center title
    },
    gradient: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: { alignItems: 'center', marginBottom: 32 },
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
        color: theme.colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 32,
        lineHeight: 22,
    },
    formContainer: { flex: 1, justifyContent: 'center' },
    formCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 8,
    },
    inputWrapper: {
        position: 'relative',
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: theme.colors.textPrimary,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    passwordInput: {
        paddingRight: 50,
    },
    inputIcon: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
    passwordToggle: {
        position: 'absolute',
        right: 16,
        top: 16,
        padding: 4,
    },
    finishButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 24,
    },
    finishButtonDisabled: {
        opacity: 0.6,
    },
    finishButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    finishButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    loginText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    loginLink: {
        fontSize: 16,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginTop: 4,
        marginLeft: 4,
    },
});




