import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../store/profileStore';
import { CompleteProfileEditModal } from '../components/CompleteProfileEditModal';

interface EditableProfileScreenProps {
    navigation: any;
}

export const EditableProfileScreen: React.FC<EditableProfileScreenProps> = ({ navigation }) => {
    const { currentUser, updateProfile } = useProfileStore();
    
    const [isEditing, setIsEditing] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [editedData, setEditedData] = useState({
        name: '',
        email: '',
        age: '',
    });

    useEffect(() => {
        if (currentUser) {
            setEditedData({
                name: currentUser.name || '',
                email: currentUser.email || '',
                age: currentUser.age?.toString() || '',
            });
        }
    }, [currentUser]);

    const handleSaveProfile = async () => {
        if (!editedData.name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        try {
            await updateProfile({
                name: editedData.name.trim(),
                email: editedData.email.trim() || undefined,
                age: editedData.age ? parseInt(editedData.age) : undefined,
            });

            Alert.alert('Success', 'Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedData({
            name: currentUser?.name || '',
            email: currentUser?.email || '',
            age: currentUser?.age?.toString() || '',
        });
    };

    if (!currentUser) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="person-outline" size={64} color="#9CA3AF" />
                <Text style={styles.errorText}>No user data found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Modern Header */}
            <LinearGradient
                colors={getRoleColors(currentUser.role)}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Ionicons name="person-circle" size={32} color="#ffffff" />
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <Text style={styles.headerSubtitle}>Personal Information & Settings</Text>
                </View>

                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => setShowCompleteModal(true)}
                >
                    <Ionicons name="add-circle" size={24} color="#ffffff" />
                </TouchableOpacity>
            </LinearGradient>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        {currentUser.profileImage ? (
                            <Image source={{ uri: currentUser.profileImage }} style={styles.profileImage} />
                        ) : (
                            <Text style={styles.avatarText}>{currentUser.avatar}</Text>
                        )}
                        <TouchableOpacity
                            style={styles.cameraButton}
                            onPress={() => setShowCompleteModal(true)}
                        >
                            <Ionicons name="camera" size={16} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>
                            {currentUser.preferences?.showNickname && currentUser.nickname 
                                ? currentUser.nickname 
                                : currentUser.name
                            }
                        </Text>
                        <Text style={styles.userCode}>Code: {currentUser.code}</Text>
                        
                        {/* Status and Role */}
                        <View style={styles.statusRow}>
                            <View style={styles.roleBadge}>
                                <LinearGradient
                                    colors={getRoleColors(currentUser.role)}
                                    style={styles.roleGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Ionicons name={getRoleIcon(currentUser.role) as any} size={14} color="#ffffff" />
                                    <Text style={styles.roleText}>{getRoleLabel(currentUser.role)}</Text>
                                </LinearGradient>
                            </View>
                            
                            <View style={styles.onlineStatus}>
                                <View style={[
                                    styles.statusDot,
                                    { backgroundColor: currentUser.isOnline ? '#10B981' : '#6B7280' }
                                ]} />
                                <Text style={styles.statusText}>
                                    {currentUser.isOnline ? 'Online' : 'Offline'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Basic Info Display */}
                {!isEditing ? (
                    <View style={styles.infoDisplay}>
                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={20} color="#6B7280" />
                            <Text style={styles.infoText}>{currentUser.email || 'No email'}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                            <Text style={styles.infoText}>
                                {currentUser.age ? `${currentUser.age} years old` : 'Age not set'}
                            </Text>
                        </View>

                        {currentUser.bio && (
                            <View style={styles.bioSection}>
                                <Ionicons name="document-text-outline" size={20} color="#6B7280" />
                                <Text style={styles.bioText}>{currentUser.bio}</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.editForm}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editedData.name}
                                onChangeText={(text) => setEditedData({ ...editedData, name: text })}
                                placeholder="Enter your full name"
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editedData.email}
                                onChangeText={(text) => setEditedData({ ...editedData, email: text })}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Age</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editedData.age}
                                onChangeText={(text) => setEditedData({ ...editedData, age: text })}
                                placeholder="Enter your age"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    {!isEditing ? (
                        <>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => setIsEditing(true)}
                            >
                                <Ionicons name="pencil-outline" size={18} color="#6366F1" />
                                <Text style={styles.secondaryButtonText}>Edit Basic Info</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => setShowCompleteModal(true)}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#059669']}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
                                    <Text style={styles.primaryButtonText}>Complete Profile</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.editActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleCancelEdit}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveProfile}
                                disabled={!editedData.name.trim()}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#059669']}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Family House Info */}
                <View style={styles.familySection}>
                    <Text style={styles.sectionTitle}>Family House</Text>
                    <View style={styles.familyCard}>
                        <View style={styles.familyInfo}>
                            <Ionicons name="home-outline" size={24} color="#8B5CF6" />
                            <View style={styles.familyDetails}>
                                <Text style={styles.familyName}>Casa de los Ruiz</Text>
                                <Text style={styles.familyDate}>Joined: Jan 1, 2024</Text>
                                <Text style={styles.memberCount}>4 active members</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Tips */}
                <View style={styles.tipsSection}>
                    <Ionicons name="lightbulb-outline" size={20} color="#F59E0B" />
                    <Text style={styles.tipsText}>
                        Use "Complete Profile" to add photos, bio, nickname, and privacy settings
                    </Text>
                </View>
            </View>

            {/* Complete Profile Modal */}
            <CompleteProfileEditModal
                visible={showCompleteModal}
                onClose={() => setShowCompleteModal(false)}
                navigation={navigation}
            />
        </ScrollView>
    );
};

// Helper functions
const getRoleColors = (role: string) => {
    switch (role) {
        case 'admin':
            return ['#EF4444', '#DC2626'];
        case 'sub-admin':
            return ['#3B82F6', '#2563EB'];
        case 'child':
            return ['#10B981', '#059669'];
        default:
            return ['#6B7280', '#4B5563'];
    }
};

const getRoleIcon = (role: string) => {
    switch (role) {
        case 'admin':
            return 'crown';
        case 'sub-admin':
            return 'person-circle';
        case 'child':
            return 'happy-circle';
        default:
            return 'person';
    }
};

const getRoleLabel = (role: string) => {
    switch (role) {
        case 'admin':
            return 'Administrator';
        case 'sub-admin':
            return 'Sub-Administrator';
        case 'child':
            return 'Child';
        default:
            return 'Member';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    errorText: {
        fontSize: 18,
        color: '#6B7280',
        marginTop: 16,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerContent: {
        alignItems: 'center',
        paddingTop: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#ffffff',
        marginTop: 8,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#E5E7EB',
        textAlign: 'center',
    },
    headerButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    profileCard: {
        backgroundColor: '#ffffff',
        margin: 20,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 80,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        resizeMode: 'cover',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#8B5CF6',
        borderRadius: 14,
        padding: 6,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    userInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    userCode: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 12,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    roleBadge: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    roleGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 4,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
    },
    onlineStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    infoDisplay: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 12,
    },
    infoText: {
        fontSize: 16,
        color: '#374151',
        flex: 1,
    },
    bioSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        marginTop: 8,
        paddingTop: 12,
    },
    bioText: {
        fontSize: 16,
        color: '#374151',
        flex: 1,
        lineHeight: 22,
    },
    editForm: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    actionsContainer: {
        gap: 12,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 8,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6366F1',
    },
    primaryButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 8,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    editActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    saveButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    familySection: {
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    familyCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
    },
    familyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    familyDetails: {
        flex: 1,
    },
    familyName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    familyDate: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    memberCount: {
        fontSize: 14,
        color: '#6B7280',
    },
    tipsSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        gap: 12,
    },
    tipsText: {
        flex: 1,
        fontSize: 14,
        color: '#92400E',
        lineHeight: 20,
    },
});