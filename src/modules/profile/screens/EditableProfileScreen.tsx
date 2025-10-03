import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView, 
] from "react-native";

import {
    TouchableOpacity,
    TextInput,
    Alert,
    Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../store/profileStore';

interface EditableProfileScreenProps {
    navigation: any;
}

export const EditableProfileScreen: React.FC<EditableProfileScreenProps> = ({ navigation }) => {
    const { currentUser, familyHouse, updateProfile, updateAvatar } = useProfileStore();

    const [isEditing, setIsEditing] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [editedData, setEditedData] = useState({
        name: '',
        email: '',
        age: '',
        bio: '',
    });

    const avatarOptions = ['👤', '👩', '👨', '👧', '👦', '🧑', '👵', '👴', '🦸', '🦹', '🎭', '🎨', '🎪', '🎯', '🏆'];

    useEffect(() => {
        if (currentUser) {
            setEditedData({
                name: currentUser.name,
                email: currentUser.email || '',
                age: currentUser.age?.toString() || '',
                bio: '', // Will be added to profile data later
            });
        }
    }, [currentUser]);

    const handleSaveProfile = async () => {
        try {
            const profileUpdates: any = {
                name: editedData.name.trim(),
            };

            if (editedData.email.trim()) {
                profileUpdates.email = editedData.email.trim();
            }

            if (editedData.age.trim()) {
                const age = parseInt(editedData.age);
                if (!isNaN(age)) {
                    profileUpdates.age = age;
                }
            }

            await updateProfile(profileUpdates);
            setIsEditing(false);

            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const handleCancelEdit = () => {
        if (currentUser) {
            setEditedData({
                name: currentUser.name,
                email: currentUser.email || '',
                age: currentUser.age?.toString() || '',
                bio: '',
            });
        }
        setIsEditing(false);
    };

    const handleChangeAvatar = async (avatar: string) => {
        try {
            await updateAvatar(avatar);
            setShowAvatarModal(false);
            Alert.alert('Success', 'Avatar updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update avatar');
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin':
                return ['#8B5CF6', '#7C3AED'];
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
                return 'Family Member';
            default:
                return 'Member';
        }
    };

    if (!currentUser) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No user data available</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={getRoleColor(currentUser.role)}
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
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <Text style={styles.headerSubtitle}>
                        Manage your personal information
                    </Text>
                </View>
            </LinearGradient>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                <TouchableOpacity
                    style={styles.avatarSection}
                    onPress={() => setShowAvatarModal(true)}
                >
                    <Text style={styles.currentAvatar}>{currentUser.avatar}</Text>
                    <View style={styles.avatarBadge}>
                        <Ionicons name="camera" size={16} color="#ffffff" />
                    </View>
                </TouchableOpacity>

                {isEditing ? (
                    <View style={styles.editingForm}>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person" size={20} color="#6B7280" />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Your name"
                                value={editedData.name}
                                onChangeText={(text) => setEditedData({ ...editedData, name: text })}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="mail" size={20} color="#6B7280" />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Email (optional)"
                                value={editedData.email}
                                onChangeText={(text) => setEditedData({ ...editedData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="calendar" size={20} color="#6B7280" />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Age (optional)"
                                value={editedData.age}
                                onChangeText={(text) => setEditedData({ ...editedData, age: text })}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.editButtons}>
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
                                    colors={editedData.name.trim() ? ['#10B981', '#059669'] : ['#9CA3AF', '#6B7280']}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{currentUser.name}</Text>
                        <Text style={styles.profileCode}>Code: {currentUser.code}</Text>
                        {currentUser.email && (
                            <Text style={styles.profileEmail}>{currentUser.email}</Text>
                        )}
                        {currentUser.age && (
                            <Text style={styles.profileAge}>{currentUser.age} years old</Text>
                        )}

                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => setIsEditing(true)}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#7C3AED']}
                                style={styles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="pencil" size={20} color="#ffffff" />
                                <Text style={styles.editButtonText}>Edit Profile</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Family House Information */}
            {familyHouse && (
                <View style={styles.familySection}>
                    <Text style={styles.sectionTitle}>Family House</Text>
                    <View style={styles.familyCard}>
                        <View style={styles.familyInfo}>
                            <Text style={styles.familyName}>{familyHouse.houseName}</Text>
                            <Text style={styles.familyDetails}>
                                Joined: {new Date(familyHouse.createdAt).toLocaleDateString()}
                            </Text>
                            <Text style={styles.familyMemberCount}>
                                {familyHouse.members.filter(m => m.isActive).length} active members
                            </Text>
                        </View>

                        <View style={styles.roleInfo}>
                            <LinearGradient
                                colors={getRoleColor(currentUser.role)}
                                style={styles.roleBadge}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name={getRoleIcon(currentUser.role) as any} size={16} color="#ffffff" />
                                <Text style={styles.roleText}>{getRoleLabel(currentUser.role)}</Text>
                            </LinearGradient>

                            {currentUser.isOnline !== undefined && (
                                <View style={styles.onlineStatus}>
                                    <View style={[
                                        styles.statusIndicator,
                                        { backgroundColor: currentUser.isOnline ? '#10B981' : '#6B7280' }
                                    ]} />
                                    <Text style={styles.statusText}>
                                        {currentUser.isOnline ? 'Online' : 'Offline'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            )}

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('HomeManagement')}
                >
                    <View style={styles.actionContent}>
                        <Ionicons name="people" size={24} color="#3B82F6" />
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>Manage Family</Text>
                            <Text style={styles.actionSubtitle}>Invite members, manage roles</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert('Settings', 'Settings coming soon!')}
                >
                    <View style={styles.actionContent}>
                        <Ionicons name="settings" size={24} color="#8B5CF6" />
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>App Settings</Text>
                            <Text style={styles.actionSubtitle}>Notifications, privacy, etc.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Avatar Selection Modal */}
            <Modal
                visible={showAvatarModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowAvatarModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Avatar</Text>

                        <View style={styles.avatarGrid}>
                            {avatarOptions.map((avatar, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.avatarOption,
                                        currentUser.avatar === avatar && styles.selectedAvatar
                                    ]}
                                    onPress={() => handleChangeAvatar(avatar)}
                                >
                                    <Text style={styles.avatarText}>{avatar}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowAvatarModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    backButton: {
        marginBottom: 16,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#E5E7EB',
        textAlign: 'center',
    },
    profileCard: {
        backgroundColor: '#ffffff',
        margin: 20,
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center',
    },
    avatarSection: {
        position: 'relative',
        marginBottom: 20,
    },
    currentAvatar: {
        fontSize: 64,
    },
    avatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editingForm: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        marginLeft: 12,
    },
    editButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 8,
    },
    cancelButtonText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        borderRadius: 8,
        overflow: 'hidden',
        marginLeft: 8,
    },
    buttonGradient: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    profileInfo: {
        alignItems: 'center',
        width: '100%',
    },
    profileName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    profileCode: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    profileAge: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    editButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    editButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    familySection: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    familyCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    familyInfo: {
        marginBottom: 12,
    },
    familyName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    familyDetails: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    familyMemberCount: {
        fontSize: 14,
        color: '#6B7280',
    },
    roleInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    roleText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    onlineStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: '#6B7280',
    },
    actionsSection: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    actionButton: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 20,
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    avatarOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedAvatar: {
        borderColor: '#8B5CF6',
        backgroundColor: '#EDE9FE',
    },
    avatarText: {
        fontSize: 24,
    },
    closeButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        textAlign: 'center',
        marginTop: 50,
    },
});
