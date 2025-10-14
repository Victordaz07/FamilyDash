/**
 * Complete Register Screen - 2 Steps with Admin Options
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
import { useSafeNavigation } from '../hooks/useSafeNavigation';

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

export const RegisterScreenComplete: React.FC<RegisterScreenProps> = ({ navigation, onSuccess }) => {
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
                const message = regData.wantsAdmin 
                    ? 'Account created successfully! You will be prompted to pay $2 to activate admin privileges.'
                    : 'Account created successfully!';
                    
                Alert.alert('Success', message, [
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

    const renderStep1 = () => (
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

            {/* Next Button */}
            <TouchableOpacity
                style={[styles.nextButton, loading && styles.nextButtonDisabled]}
                onPress={handleNextStep}
                disabled={loading}
            >
                <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.nextButtonGradient}
                >
                    <Text style={styles.nextButtonText}>Next Step</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.formCard}>
            {/* Family Option */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Family Setup</Text>
                <View style={styles.optionContainer}>
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            regData.familyOption === 'create' && styles.optionButtonSelected
                        ]}
                        onPress={() => updateField('familyOption', 'create')}
                    >
                        <Ionicons 
                            name={regData.familyOption === 'create' ? 'radio-button-on' : 'radio-button-off'} 
                            size={20} 
                            color={regData.familyOption === 'create' ? '#10B981' : theme.colors.textSecondary} 
                        />
                        <Text style={[
                            styles.optionText,
                            regData.familyOption === 'create' && styles.optionTextSelected
                        ]}>
                            Create New Family
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            regData.familyOption === 'join' && styles.optionButtonSelected
                        ]}
                        onPress={() => updateField('familyOption', 'join')}
                    >
                        <Ionicons 
                            name={regData.familyOption === 'join' ? 'radio-button-on' : 'radio-button-off'} 
                            size={20} 
                            color={regData.familyOption === 'join' ? '#10B981' : theme.colors.textSecondary} 
                        />
                        <Text style={[
                            styles.optionText,
                            regData.familyOption === 'join' && styles.optionTextSelected
                        ]}>
                            Join Existing Family
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Family Name or House Code */}
            {regData.familyOption === 'create' ? (
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Family Name</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your family name"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={regData.familyName || ''}
                            onChangeText={(value) => updateField('familyName', value)}
                            autoCapitalize="words"
                        />
                        <Ionicons name="home-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    </View>
                </View>
            ) : (
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Family Code</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter family code"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={regData.houseCode || ''}
                            onChangeText={(value) => updateField('houseCode', value)}
                            autoCapitalize="characters"
                        />
                        <Ionicons name="key-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    </View>
                </View>
            )}

            {/* Admin Option */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Admin Privileges</Text>
                <TouchableOpacity
                    style={[
                        styles.optionButton,
                        regData.wantsAdmin && styles.optionButtonSelected
                    ]}
                    onPress={() => updateField('wantsAdmin', !regData.wantsAdmin)}
                >
                    <Ionicons 
                        name={regData.wantsAdmin ? 'checkbox' : 'square-outline'} 
                        size={20} 
                        color={regData.wantsAdmin ? '#10B981' : theme.colors.textSecondary} 
                    />
                    <View style={styles.adminOptionContent}>
                        <Text style={[
                            styles.optionText,
                            regData.wantsAdmin && styles.optionTextSelected
                        ]}>
                            I want to be Family Administrator
                        </Text>
                        <Text style={styles.adminPrice}>$2.00 one-time fee</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Admin Reason */}
            {regData.wantsAdmin && (
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Why do you want to be an admin?</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Explain why you want admin privileges..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={regData.adminReason || ''}
                        onChangeText={(value) => updateField('adminReason', value)}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>
            )}

            {/* Avatar Selection */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Profile Photo (Optional)</Text>
                <TouchableOpacity style={styles.avatarButton} onPress={handleImageSelection}>
                    {regData.avatarUrl ? (
                        <Image source={{ uri: regData.avatarUrl }} style={styles.avatarPreview} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="camera-outline" size={30} color={theme.colors.textSecondary} />
                            <Text style={styles.avatarText}>Add Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        if (currentStep > 1) {
                            setCurrentStep(currentStep - 1);
                        }
                    }}
                >
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

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
            </View>
        </View>
    );

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
                        <Text style={styles.subtitle}>
                            {currentStep === 1 ? 'Step 1: Basic Information' : 'Step 2: Family Setup & Admin Options'}
                        </Text>
                        
                        {/* Progress Indicator */}
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressStep, currentStep >= 1 && styles.progressStepActive]}>
                                <Text style={[styles.progressStepText, currentStep >= 1 && styles.progressStepTextActive]}>1</Text>
                            </View>
                            <View style={[styles.progressLine, currentStep >= 2 && styles.progressLineActive]} />
                            <View style={[styles.progressStep, currentStep >= 2 && styles.progressStepActive]}>
                                <Text style={[styles.progressStepText, currentStep >= 2 && styles.progressStepTextActive]}>2</Text>
                            </View>
                        </View>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        {currentStep === 1 ? renderStep1() : renderStep2()}
                    </View>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={safeGoBack}>
                            <Text style={styles.loginLink}>Login</Text>
                        </TouchableOpacity>
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
        marginBottom: 20,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    progressStep: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressStepActive: {
        backgroundColor: '#10B981',
    },
    progressStepText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#9CA3AF',
    },
    progressStepTextActive: {
        color: 'white',
    },
    progressLine: {
        width: 40,
        height: 2,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 10,
    },
    progressLineActive: {
        backgroundColor: '#10B981',
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
    passwordInput: {
        paddingRight: 50,
    },
    textArea: {
        height: 80,
        paddingTop: 16,
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
    optionContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    optionButtonSelected: {
        backgroundColor: '#F0FDF4',
        borderColor: '#10B981',
    },
    optionText: {
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginLeft: 12,
    },
    optionTextSelected: {
        color: '#10B981',
        fontWeight: '600',
    },
    adminOptionContent: {
        marginLeft: 12,
        flex: 1,
    },
    adminPrice: {
        fontSize: 14,
        color: '#059669',
        fontWeight: '600',
        marginTop: 2,
    },
    avatarButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    avatarPlaceholder: {
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 8,
    },
    avatarPreview: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    backButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    finishButton: {
        flex: 2,
        borderRadius: 16,
        overflow: 'hidden',
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
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 24,
    },
    nextButtonDisabled: {
        opacity: 0.6,
    },
    nextButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    nextButtonText: {
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
});

export default RegisterScreenComplete;
