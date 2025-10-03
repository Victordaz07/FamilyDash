import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// Simple date picker implementation for Expo Go compatibility
import { useProfileStore } from '../store/profileStore';
import { ImageService, ImagePickerResult } from '../services/imageService';
import { FamilyMember } from '../types';

interface CompleteProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  navigation?: any;
}

export const CompleteProfileEditModal: React.FC<CompleteProfileEditModalProps> = ({
  visible,
  onClose,
  navigation,
}) => {
  const { currentUser, updateCompleteProfile } = useProfileStore();

  const [profileData, setProfileData] = useState({
    name: '',
    nickname: '',
    email: '',
    phone: '',
    bio: '',
    age: '',
  });

  const [preferences, setPreferences] = useState({
    showName: true,
    showNickname: true,
    showAge: true,
    showEmail: false,
    showPhone: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name,
        nickname: currentUser.nickname || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
        age: currentUser.age?.toString() || '',
      });

      setPreferences({
        showName: currentUser.preferences?.showName ?? true,
        showNickname: currentUser.preferences?.showNickname ?? true,
        showAge: currentUser.preferences?.showAge ?? true,
        showEmail: currentUser.preferences?.showEmail ?? false,
        showPhone: currentUser.preferences?.showPhone ?? false,
      });
    }
  }, [currentUser]);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await updateCompleteProfile({
        name: profileData.name.trim(),
        nickname: profileData.nickname.trim() || undefined,
        email: profileData.email.trim() || undefined,
        phone: profileData.phone.trim() || undefined,
        bio: profileData.bio.trim() || undefined,
        age: profileData.age ? parseInt(profileData.age) : undefined,
        preferences,
      });

      Alert.alert('Success', 'Profile updated successfully!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      const imageResult = await ImageService.showImagePickerOptions();
      if (imageResult) {
        // In a real app, you would upload the image to a server
        // For now, we'll simulate the image URL
        const simulatedImageUrl = `file://${imageResult.uri}`;
        await updateCompleteProfile({ profileImage: simulatedImageUrl });
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const handleRemoveImage = async () => {
    try {
      await updateCompleteProfile({ profileImage: undefined });
      Alert.alert('Success', 'Profile picture removed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove profile picture');
    }
  };

  const validateForm = () => {
    if (!profileData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }

    if (profileData.email.trim() && !isValidEmail(profileData.email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getDisplayImage = () => {
    if (currentUser?.profileImage) {
      return { uri: currentUser.profileImage };
    } else if (currentUser?.avatar) {
      return null; // Will show emoji avatar
    }
    return null;
  };

  const getRandomAvatar = () => {
    const avatars = ['👤', '👩', '👨', '👧', '👦', '🧑', '👵', '👴', '🦸', '🦹', '🎭', '🎨', '🎪', '🎯', '🏆'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  };

  const handleAvatarSelect = async (avatar: string) => {
    try {
      await updateCompleteProfile({ avatar });
      Alert.alert('Success', 'Avatar updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update avatar');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Profile</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              if (validateForm()) {
                handleSaveChanges();
              }
            }}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Picture Section -->
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Picture</Text>
            <View style={styles.imageSection}>
              <TouchableOpacity style={styles.imageContainer} onPress={handleImagePicker}>
                {getDisplayImage() ? (
                  <Image source={getDisplayImage()!} style={styles.profileImage} />
                ) : (
                  <Text style={styles.emojiAvatar}>{currentUser?.avatar || '👤'}</Text>
                )}
                <View style={styles.imageOverlay}>
                  <Ionicons name="camera" size={20} color="#ffffff" />
                </View>
              </TouchableOpacity>

              <View style={styles.imageButtons}>
                <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
                  <Ionicons name="image" size={16} color="#8B5CF6" />
                  <Text style={styles.imageButtonText}>Gallery/Camera</Text>
                </TouchableOpacity>
                
                {currentUser?.profileImage && (
                  <TouchableOpacity style={styles.imageButton} onPress={handleRemoveImage}>
                    <Ionicons name="trash" size={16} color="#EF4444" />
                    <Text style={[styles.imageButtonText, { color: '#EF4444' }]}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Quick Avatar Selection */}
          <View style={styles.avatarQuickSection}>
            <Text style={styles.quickAvatarTitle}>Quick Avatars:</Text>
            <View style={styles.avatarGrid}>
              {['👤', '👩', '👨', '👧', '👦', '🧑', '👵', '👴'].map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quickAvatar,
                    currentUser?.avatar === avatar && styles.selectedQuickAvatar
                  ]}
                  onPress={() => handleAvatarSelect(avatar)}
                >
                  <Text style={styles.quickAvatarText}>{avatar}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nickname (How you want to be called)</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.nickname}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, nickname: text }))}
                placeholder="e.g., Mari, Carlitos, Anita"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.email}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.phone}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                placeholder="+52 555 123 4567"
                keyboardType="phone-pad"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <View style={styles.ageContainer}>
                <TextInput
                  style={styles.ageInput}
                  value={profileData.age || ''}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, age: text }))}
                  placeholder="Enter your age"
                  keyboardType="numeric"
                />
                <Text style={styles.ageText}>years old</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio (Tell us about yourself)</Text>
              <TextInput
                style={[styles.textInput, styles.bioInput]}
                value={profileData.bio}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
                placeholder="Write a short description about yourself..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Privacy Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
            <Text style={styles.sectionSubtitle}>Choose what information others can see</Text>

            <View style={styles.privacySwitchContainer}>
              <Text style={styles.switchLabel}>Show my full name</Text>
              <Switch
                value={preferences.showName}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, showName: value }))}
                trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.privacySwitchContainer}>
              <Text style={styles.switchLabel}>Show my nickname</Text>
              <Switch
                value={preferences.showNickname}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, showNickname: value }))}
                trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.privacySwitchContainer}>
              <Text style={styles.switchLabel}>Show my age</Text>
              <Switch
                value={preferences.showAge}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, showAge: value }))}
                trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.privacySwitchContainer}>
              <Text style={styles.switchLabel}>Show my email</Text>
              <Switch
                value={preferences.showEmail}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, showEmail: value }))}
                trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.privacySwitchContainer}>
              <Text style={styles.switchLabel}>Show my phone number</Text>
              <Switch
                value={preferences.showPhone}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, showPhone: value }))}
                trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </ScrollView>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  emojiAvatar: {
    fontSize: 48,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#ffffff',
  },
  imageButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  avatarQuickSection: {
    marginTop: 16,
  },
  quickAvatarTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  quickAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedQuickAvatar: {
    borderColor: '#8B5CF6',
    backgroundColor: '#EDE9FE',
  },
  quickAvatarText: {
    fontSize: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  bioInput: {
    height: 80,
  },
  ageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  ageInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  ageText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  privacySwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
});
