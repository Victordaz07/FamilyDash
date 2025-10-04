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
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../store/profileStore';
import { ImageService } from '../services/imageService';

interface CompleteProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
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

  const getDisplayImage = () => {
    if (currentUser?.profileImage) {
      return { uri: currentUser.profileImage };
    }
    return undefined;
  };

  const handleImagePicker = async (source: 'gallery' | 'camera') => {
    try {
      let imageResult: any = null;

      if (source === 'gallery') {
        imageResult = await ImageService.pickImage();
      } else if (source === 'camera') {
        imageResult = await ImageService.takePhoto();
      }

      if (imageResult && !imageResult.cancelled) {
        const simulatedImageUrl = imageResult.uri;
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

  const handleAvatarSelect = async (avatar: string) => {
    try {
      await updateCompleteProfile({ avatar, profileImage: undefined });
      Alert.alert('Success', 'Avatar updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update avatar');
    }
  };

  const validateForm = () => {
    if (!profileData.name.trim()) {
      Alert.alert('Error', 'Full name is required');
      return false;
    }
    return true;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Profile</Text>
          <TouchableOpacity onPress={handleSaveChanges} style={styles.headerButton} disabled={isLoading}>
            {isLoading ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* PROMINENTE Profile Picture Section */}
          <View style={styles.mainPictureSection}>
            <View style={styles.pictureHeader}>
              <Text style={styles.mainSectionTitle}>📸 Add Your Photo</Text>
              <Text style={styles.mainSectionSubtitle}>Upload from Gallery or Camera</Text>
            </View>

            <TouchableOpacity style={styles.mainImageContainer} onPress={() => Alert.alert('Select Photo Source', 'Choose how you want to add your photo:', [
              { text: '📱 Gallery', onPress: () => handleImagePicker('gallery') },
              { text: '📷 Camera', onPress: () => handleImagePicker('camera') },
              { text: 'Cancel', style: 'cancel' },
            ])}>
              {getDisplayImage() ? (
                <Image source={getDisplayImage()!} style={styles.mainProfileImage} />
              ) : (
                <View style={styles.noPhotoPlaceholder}>
                  <Ionicons name="add-circle-outline" size={48} color="#8B5CF6" />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                  <Text style={styles.addPhotoSubtext}>Tap to upload</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.mainImageActions}>
              <TouchableOpacity
                style={styles.mainActionButton}
                onPress={() => handleImagePicker('gallery')}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="folder-outline" size={18} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Gallery</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mainActionButton}
                onPress={() => handleImagePicker('camera')}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="camera-outline" size={18} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Camera</Text>
                </LinearGradient>
              </TouchableOpacity>

              {currentUser?.profileImage && (
                <TouchableOpacity
                  style={styles.removeActionButton}
                  onPress={handleRemoveImage}
                >
                  <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    style={styles.actionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Remove</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick Emoji Avatars - ALTERNATIVA RÁPIDA */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎭 Quick Emoji Avatars</Text>
            <Text style={styles.sectionDescription}>Or choose a quick emoji if you prefer:</Text>

            <View style={styles.avatarQuickSection}>
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
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nickname (How you want to be called)</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.nickname}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, nickname: text }))}
                placeholder="e.g., 'Mom', 'Dad', 'Buddy'"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.email}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
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
                placeholder="Enter your phone number"
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
                placeholder="A short description about you..."
                multiline
                numberOfLines={3}
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Privacy Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
            <Text style={styles.sectionDescription}>Control what information is visible to other family members.</Text>

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
      </KeyboardAvoidingView>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingVertical: 20,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },

  // New prominent photo section styles
  mainPictureSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pictureHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  mainSectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  mainImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
  },
  mainProfileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    resizeMode: 'cover',
  },
  noPhotoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginTop: 8,
  },
  addPhotoSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  mainImageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 10,
  },
  mainActionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: 120,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  removeActionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: 120,
  },
  avatarQuickSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  quickAvatarTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
    textAlignVertical: 'top',
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
  privacySwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
});