import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/store';
import { VerifyEmailBlock } from '../../../components/verify/VerifyEmailBlock';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();

    const [name, setName] = useState(user?.displayName || 'Family Member');
    const [email, setEmail] = useState(user?.email || 'user@family.com');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [photo, setPhoto] = useState<string | null>(user?.photoURL || null);
    const [isEditing, setIsEditing] = useState(false);

    const handlePickPhoto = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Permission to access camera roll is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled) {
                setPhoto(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleTakePhoto = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Permission to access camera is required!');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled) {
                setPhoto(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const handleSave = () => {
        // Aquí puedes actualizar en Firebase Auth o AsyncStorage
        console.log('Profile saved', { name, email, phone, bio, photo });

        // Simular guardado exitoso
        Alert.alert(
            'Success',
            'Your profile has been updated successfully!',
            [
                {
                    text: 'OK',
                    onPress: () => setIsEditing(false)
                }
            ]
        );
    };

    const showPhotoOptions = () => {
        Alert.alert(
            'Change Profile Photo',
            'Choose an option',
            [
                { text: 'Camera', onPress: handleTakePhoto },
                { text: 'Photo Library', onPress: handlePickPhoto },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Profile Settings</Text>
                        <Text style={styles.headerSubtitle}>Manage your personal information</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setIsEditing(!isEditing)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isEditing ? "checkmark" : "create-outline"}
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Profile Photo Section */}
                    <View style={styles.photoSection}>
                        <TouchableOpacity
                            onPress={isEditing ? showPhotoOptions : undefined}
                            style={styles.photoContainer}
                            disabled={!isEditing}
                        >
                            <View style={styles.avatarContainer}>
                                {photo ? (
                                    <Image source={{ uri: photo }} style={styles.avatar} />
                                ) : (
                                    <LinearGradient
                                        colors={['#667eea', '#764ba2']}
                                        style={styles.avatarPlaceholder}
                                    >
                                        <Text style={styles.avatarText}>
                                            {name.charAt(0).toUpperCase()}
                                        </Text>
                                    </LinearGradient>
                                )}
                                {isEditing && (
                                    <View style={styles.editPhotoOverlay}>
                                        <Ionicons name="camera" size={20} color="white" />
                                    </View>
                                )}
                            </View>
                            {isEditing && (
                                <Text style={styles.changePhotoText}>Tap to change photo</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.inputDisabled]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your full name"
                                editable={isEditing}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.inputDisabled]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={isEditing}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.inputDisabled]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Enter your phone number"
                                keyboardType="phone-pad"
                                editable={isEditing}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bio</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about yourself..."
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                editable={isEditing}
                            />
                        </View>

                        {/* Save Button */}
                        {isEditing && (
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <LinearGradient
                                    colors={['#4ade80', '#22c55e']}
                                    style={styles.saveButtonGradient}
                                >
                                    <Ionicons name="checkmark" size={20} color="white" />
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Account Info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoTitle}>Account Information</Text>
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={20} color="#667eea" />
                            <Text style={styles.infoText}>
                                Member since {user?.metadata?.creationTime ?
                                    new Date(user.metadata.creationTime).toLocaleDateString() :
                                    'Recently'
                                }
                            </Text>
                        </View>
                        {/* Email Verification Block */}
                        <VerifyEmailBlock />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    editButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    photoSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    photoContainer: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#667eea',
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#667eea',
    },
    avatarText: {
        fontSize: 48,
        fontWeight: '700',
        color: 'white',
    },
    editPhotoOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#667eea',
        borderRadius: 20,
        padding: 8,
        borderWidth: 3,
        borderColor: 'white',
    },
    changePhotoText: {
        marginTop: 12,
        fontSize: 14,
        color: '#667eea',
        fontWeight: '500',
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f8fafc',
        color: '#1e293b',
    },
    inputDisabled: {
        backgroundColor: '#f1f5f9',
        color: '#64748b',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        marginTop: 10,
    },
    saveButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    infoContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 12,
        flex: 1,
    },
});
