/**
 * Advanced Register Screen - 2 Steps with Improved Flow
 * Step 1: Basic Info + Email Check (Name, Email, Password)
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
import { checkEmailExists } from '../services/auth/RealAuthService';
import * as ImagePicker from 'expo-image-picker';

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
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Registration data
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

    // Step 1: Password visibility and strength
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Email verification
    const [emailChecked, setEmailChecked] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);
    
    // Photo picker
    const [showImagePicker, setShowImagePicker] = useState(false);

    // Handle image selection
    const handleImageSelection = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant permission to access your photo library');
                return;
            }

            // Show image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets[0]) {
                const selectedImage = result.assets[0];
                updateField('avatarUrl', selectedImage.uri);
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            Alert.alert('Error', 'Failed to select image. Please try again.');
        }
    };

    const calculatePasswordStrength = (password: string) => {
        let strength = 0;

        if (password.length >= 6) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        return strength;
    };

    const getPasswordStrengthColor = (strength: number) => {
        if (strength === 0 || strength === 1) return '#EF4444'; // Red
        if (strength === 2) return '#F59E0B'; // Yellow
        if (strength === 3) return '#3B82F6'; // Blue
        return '#10B981'; // Green
    };

    const getPasswordStrengthText = (strength: number) => {
        if (strength === 0) return 'Very Weak';
        if (strength === 1) return 'Weak';
        if (strength === 2) return 'Fair';
        if (strength === 3) return 'Good';
        return 'Strong';
    };

    // Check if email already exists
    const handleEmailCheck = async () => {
        if (!regData.email.trim()) {
            Alert.alert('Error', 'Please enter your email address first');
            return;
        }

        setCheckingEmail(true);
        try {
            const exists = await checkEmailExists(regData.email);
            setEmailExists(exists);
            setEmailChecked(true);
            
            if (exists) {
                Alert.alert(
                    'Email Already Registered',
                    'This email is already registered with a family. Would you like to sign in instead?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                            text: 'Sign In', 
                            onPress: () => navigation.navigate('Login') 
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Error checking email:', error);
            Alert.alert('Error', 'Failed to check email. Please try again.');
        } finally {
            setCheckingEmail(false);
        }
    };

    const validateStep1 = () => {
        if (!regData.fullName.trim()) {
            Alert.alert('Error', 'Please enter your full name');
            return false;
        }

        if (!regData.email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return false;
        }

        // Check if email has been verified
        if (!emailChecked) {
            Alert.alert('Error', 'Please check if your email is available');
            return false;
        }

        if (emailExists) {
            Alert.alert('Error', 'This email is already registered. Please sign in instead.');
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
        // Validate family options
        if (regData.familyOption === 'create' && !regData.familyName?.trim()) {
            Alert.alert('Error', 'Please enter your family name');
            return false;
        }

        if (regData.familyOption === 'join' && !regData.houseCode?.trim()) {
            Alert.alert('Error', 'Please enter the family invitation code');
            return false;
        }

        // Validate admin options
        if (regData.wantsAdmin && !regData.adminReason?.trim()) {
            Alert.alert('Error', 'Please explain why you need admin privileges');
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
        if (!validateStep1() || !validateStep2()) return;

        setLoading(true);
        try {
            const result = await register({
                email: regData.email.trim(),
                password: regData.password,
                displayName: regData.fullName.trim(),
                familyName: regData.familyOption === 'create' ? regData.familyName : undefined,
                houseCode: regData.familyOption === 'join' ? regData.houseCode : undefined,
                wantsAdmin: regData.wantsAdmin,
                adminReason: regData.adminReason,
                avatarUrl: regData.avatarUrl,
            });

            if (result.success) {
                const adminMessage = regData.wantsAdmin 
                    ? '\n\nAdmin privileges request submitted. You will be notified once approved.'
                    : '\n\nYou can request admin privileges later in your profile settings.';
                
                Alert.alert(
                    'Success! 🎉',
                    `Account created successfully! Welcome to FamilyDash!${adminMessage}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                if (onSuccess) {
                                    onSuccess();
                                }
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Registration Failed', result.error || 'Please try again');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        Alert.alert('Google Registration', 'Google registration will be implemented soon!');
    };

    const handleAppleRegister = async () => {
        Alert.alert('Apple Registration', 'Apple registration will be implemented soon!');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const updateField = (field: keyof RegistrationData, value: string) => {
        setRegData(prev => ({ ...prev, [field]: value }));
    };

    const passwordStrength = calculatePasswordStrength(regData.password);

    const renderStep1 = () => (
        <>
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
                        onChangeText={(value) => {
                            updateField('email', value);
                            setEmailChecked(false); // Reset email check when email changes
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!emailChecked || !emailExists}
                    />
                    {emailChecked && !emailExists && (
                        <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} style={styles.inputIcon} />
                    )}
                    {emailChecked && emailExists && (
                        <Ionicons name="close-circle" size={20} color={theme.colors.error} style={styles.inputIcon} />
                    )}
                    {!emailChecked && (
                        <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    )}
                </View>
                
                {/* Email Check Button */}
                {regData.email.trim() && !emailChecked && (
                    <TouchableOpacity 
                        style={styles.checkEmailButton} 
                        onPress={handleEmailCheck}
                        disabled={checkingEmail}
                    >
                        <Text style={styles.checkEmailButtonText}>
                            {checkingEmail ? 'Checking...' : 'Check Email Availability'}
                        </Text>
                    </TouchableOpacity>
                )}
                
                {/* Email Status Message */}
                {emailChecked && emailExists && (
                    <Text style={styles.errorText}>
                        This email is already registered. Please sign in instead.
                    </Text>
                )}
                {emailChecked && !emailExists && (
                    <Text style={styles.successText}>
                        ✅ Email is available!
                    </Text>
                )}
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
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.passwordToggle}>
                        <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={theme.colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>

                {/* Password Strength Indicator */}
                {regData.password.length > 0 && (
                    <View style={styles.passwordStrengthContainer}>
                        <View style={styles.strengthBars}>
                            {[1, 2, 3, 4].map((index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.strengthBar,
                                        {
                                            backgroundColor: index <= passwordStrength
                                                ? getPasswordStrengthColor(passwordStrength)
                                                : '#E5E7EB',
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                        <Text style={[styles.strengthText, { color: getPasswordStrengthColor(passwordStrength) }]}>
                            {getPasswordStrengthText(passwordStrength)}
                        </Text>
                    </View>
                )}
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
                    <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={styles.passwordToggle}>
                        <Ionicons
                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={theme.colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );

    const renderStep2 = () => (
        <>
            {/* Family Options */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Family Setup</Text>
                <Text style={styles.inputDescription}>
                    Choose how you want to join FamilyDash
                </Text>
                
                {/* Family Option Buttons */}
                <View style={styles.optionButtons}>
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            regData.familyOption === 'create' && styles.optionButtonActive
                        ]}
                        onPress={() => updateField('familyOption', 'create')}
                    >
                        <Ionicons 
                            name="add-circle-outline" 
                            size={24} 
                            color={regData.familyOption === 'create' ? 'white' : theme.colors.primary} 
                        />
                        <Text style={[
                            styles.optionButtonText,
                            regData.familyOption === 'create' && styles.optionButtonTextActive
                        ]}>
                            Create New Family
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[
                            styles.optionButton,
                            regData.familyOption === 'join' && styles.optionButtonActive
                        ]}
                        onPress={() => updateField('familyOption', 'join')}
                    >
                        <Ionicons 
                            name="people-outline" 
                            size={24} 
                            color={regData.familyOption === 'join' ? 'white' : theme.colors.primary} 
                        />
                        <Text style={[
                            styles.optionButtonText,
                            regData.familyOption === 'join' && styles.optionButtonTextActive
                        ]}>
                            Join Existing Family
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Family Name Field - Show when creating */}
                {regData.familyOption === 'create' && (
                    <View style={styles.conditionalInputContainer}>
                        <Text style={styles.conditionalInputLabel}>Family Name</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Your family name"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={regData.familyName || ''}
                                onChangeText={(value) => updateField('familyName', value)}
                                autoCapitalize="words"
                            />
                            <Ionicons name="home-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                        </View>
                    </View>
                )}

                {/* House Code Field - Show when joining */}
                {regData.familyOption === 'join' && (
                    <View style={styles.conditionalInputContainer}>
                        <Text style={styles.conditionalInputLabel}>Invitation Code</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter family invitation code"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={regData.houseCode || ''}
                                onChangeText={(value) => updateField('houseCode', value)}
                                autoCapitalize="characters"
                            />
                            <Ionicons name="key-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                        </View>
                    </View>
                )}
            </View>

            {/* Admin Options */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Administrator Privileges</Text>
                <Text style={styles.inputDescription}>
                    Admin privileges allow you to manage family settings and invite members
                </Text>
                
                {/* Admin Toggle */}
                <View style={styles.adminToggleContainer}>
                    <View style={styles.adminToggleText}>
                        <Text style={styles.adminToggleLabel}>Request Admin Access</Text>
                        <Text style={styles.adminToggleSubtext}>
                            {regData.wantsAdmin 
                                ? 'You will be able to manage family settings'
                                : 'You can request admin access later in settings'
                            }
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.adminToggle,
                            regData.wantsAdmin && styles.adminToggleActive
                        ]}
                        onPress={() => updateField('wantsAdmin', !regData.wantsAdmin)}
                    >
                        <View style={[
                            styles.adminToggleThumb,
                            regData.wantsAdmin && styles.adminToggleThumbActive
                        ]} />
                    </TouchableOpacity>
                </View>

                {/* Admin Reason - Show when admin is requested */}
                {regData.wantsAdmin && (
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder="Why do you need admin privileges? (e.g., I'm the parent, I want to manage family settings)"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={regData.adminReason || ''}
                            onChangeText={(value) => updateField('adminReason', value)}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                )}

                {/* Admin Info */}
                <View style={styles.adminInfoContainer}>
                    <Ionicons name="information-circle-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.adminInfoText}>
                        Admin access requires approval from existing family admins or a $2 fee for instant activation.
                    </Text>
                </View>
            </View>

            {/* Profile Picture */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Profile Picture</Text>
                <Text style={styles.inputDescription}>
                    Add a photo to personalize your profile (optional)
                </Text>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarPlaceholder}>
                        {regData.avatarUrl ? (
                            <Image source={{ uri: regData.avatarUrl }} style={styles.avatarImage} />
                        ) : (
                            <Ionicons name="person" size={40} color={theme.colors.textSecondary} />
                        )}
                    </View>
                    <TouchableOpacity 
                        style={styles.selectPhotoButton}
                        onPress={handleImageSelection}
                    >
                        <Ionicons name="camera" size={16} color="white" />
                        <Text style={styles.selectPhotoText}>Choose Photo</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );


    const getStepTitle = () => {
        switch (currentStep) {
            case 1:
                return 'Create Family Account 🏡';
            case 2:
                return 'Family & Profile Setup 👤';
            default:
                return 'Create Family Account 🏡';
        }
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderStep1();
            case 2:
                return renderStep2();
            default:
                return renderStep1();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={[theme.colors.background, theme.colors.gradientEnd]}
                style={styles.gradient}
            >
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

                        <Text style={styles.title}>{getStepTitle()}</Text>
                        <Text style={styles.subtitle}>
                            {currentStep === 1
                                ? 'Start organizing your family today'
                                : 'Set up your family and profile preferences'
                            }
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        <View style={styles.formCard}>
                            {renderCurrentStep()}

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                {currentStep > 1 && (
                                    <TouchableOpacity style={styles.previousButton} onPress={handlePreviousStep}>
                                        <Text style={styles.previousButtonText}>Previous</Text>
                                    </TouchableOpacity>
                                )}

                                {currentStep < 2 ? (
                                    <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
                                        <LinearGradient
                                            colors={['#10B981', '#8B5CF6']}
                                            style={styles.nextButtonGradient}
                                        >
                                            <Text style={styles.nextButtonText}>Next Step</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ) : (
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
                                )}
                            </View>

                            {/* Login Link - Only show on Step 1 */}
                            {currentStep === 1 && (
                                <View style={styles.loginContainer}>
                                    <Text style={styles.loginText}>Already have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.goBack()}>
                                        <Text style={styles.loginLink}>Login</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Progress Indicator */}
                    <View style={styles.progressIndicator}>
                        <View style={styles.progressCard}>
                            <View style={styles.progressDots}>
                                <View style={[styles.progressDot, { backgroundColor: theme.colors.success }]} />
                                <View style={[styles.progressDot, { backgroundColor: currentStep >= 2 ? theme.colors.success : '#E5E7EB' }]} />
                            </View>
                            <Text style={styles.progressText}>Step {currentStep} of 2</Text>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    iconGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
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
        padding: 32,
        marginHorizontal: 8,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    inputContainer: { marginBottom: 24 },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    inputWrapper: { position: 'relative' },
    input: {
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 16,
        color: theme.colors.textPrimary,
        backgroundColor: 'white',
    },
    passwordInput: { paddingRight: 56 },
    inputIcon: {
        position: 'absolute',
        right: 20,
        top: 16,
    },
    passwordToggle: {
        position: 'absolute',
        right: 20,
        top: 16,
    },
    passwordStrengthContainer: { marginTop: 12 },
    strengthBars: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    strengthBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    strengthText: { fontSize: 12, fontWeight: '600' },
    avatarContainer: { alignItems: 'center', marginTop: 8 },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    selectPhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    selectPhotoText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    inputDescription: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 8,
        lineHeight: 16,
    },
    checkEmailButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    checkEmailButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 4,
    },
    successText: {
        color: theme.colors.success,
        fontSize: 12,
        marginTop: 4,
    },
    optionButtons: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
        marginTop: 16,
    },
    optionButton: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        backgroundColor: 'white',
        gap: 12,
        minHeight: 80,
    },
    optionButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    optionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
        textAlign: 'center',
    },
    optionButtonTextActive: {
        color: 'white',
    },
    adminToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    adminToggleText: {
        flex: 1,
        marginRight: 16,
    },
    adminToggleLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    adminToggleSubtext: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        lineHeight: 16,
    },
    adminToggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    adminToggleActive: {
        backgroundColor: theme.colors.primary,
    },
    adminToggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    adminToggleThumbActive: {
        alignSelf: 'flex-end',
    },
    adminInfoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        gap: 8,
    },
    adminInfoText: {
        flex: 1,
        fontSize: 12,
        color: theme.colors.textSecondary,
        lineHeight: 16,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    conditionalInputContainer: {
        marginTop: 20,
        marginBottom: 8,
    },
    conditionalInputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
    },
    previousButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    previousButtonText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    nextButton: { flex: 1, marginLeft: 16 },
    nextButtonGradient: { borderRadius: 16, paddingVertical: 16 },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
    },
    finishButton: { flex: 1, marginLeft: 16 },
    finishButtonDisabled: { opacity: 0.6 },
    finishButtonGradient: { borderRadius: 16, paddingVertical: 16 },
    finishButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
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
    progressIndicator: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    progressCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    progressDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginHorizontal: 4,
    },

    // FAMILYDASH LOGO STYLES
    shieldOuter: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    shieldBody: {
        width: 65,
        height: 50,
        backgroundColor: 'white',
        borderRadius: 8,
        position: 'relative',
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    shieldTop: {
        position: 'absolute',
        top: 0,
        left: 25,
        width: 0,
        height: 0,
        borderLeftWidth: 7,
        borderRightWidth: 7,
        borderBottomWidth: 12,
        borderStyle: 'solid',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'white',
    },
    familyGroup: {
        position: 'relative',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    adult1: {
        position: 'absolute',
        top: 8,
        left: 8,
        alignItems: 'center',
    },
    head1: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
        marginBottom: 2,
    },
    body1: {
        width: 12,
        height: 16,
        backgroundColor: 'white',
        borderRadius: 2,
    },
    adult2: {
        position: 'absolute',
        top: 8,
        right: 8,
        alignItems: 'center',
    },
    head2: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
        marginBottom: 2,
    },
    body2: {
        width: 12,
        height: 16,
        backgroundColor: 'white',
        borderRadius: 2,
    },
    childFigure: {
        position: 'absolute',
        top: 15,
        left: 25,
        alignItems: 'center',
    },
    childHead: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'white',
        marginBottom: 2,
    },
    childBody: {
        width: 10,
        height: 12,
        backgroundColor: 'white',
        borderRadius: 2,
    },
    familyDashText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginTop: 8,
        letterSpacing: 0.5,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});

export default RegisterScreen;