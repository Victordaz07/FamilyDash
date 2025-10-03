import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import { Alert } from 'react-native';

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type?: string;
}

export class ImageService {
  static async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  static async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  }

  static async pickImageFromGallery(): Promise<ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'We need access to your photo library to select a profile picture.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type,
        };
      }

      return null;
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to select image from gallery.');
      return null;
    }
  }

  static async takePhotoWithCamera(): Promise<ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'We need access to your camera to take a profile picture.');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type,
        };
      }

      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo.');
      return null;
    }
  }

  static async showImagePickerOptions(): Promise<ImagePickerResult | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Choose Profile Picture',
        'Select how you want to add your profile picture',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const result = await this.takePhotoWithCamera();
              resolve(result);
            }
          },
          {
            text: 'Gallery',
            onPress: async () => {
              const result = await this.pickImageFromGallery();
              resolve(result);
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null)
          }
        ]
      );
    });
  }

  static async compressImage(imageUri: string, quality: number = 0.8): Promise<string> {
    // For now, return the same URI
    // In a real app, you would compress the image here
    return imageUri;
  }

  static validateImageSize(width: number, height: number): boolean {
    const minSize = 100; // Minimum 100x100 pixels
    const maxSize = 4096; // Maximum 4096x4096 pixels

    return width >= minSize && height >= minSize && width <= maxSize && height <= maxSize;
  }

  static validateImageFileSize(fileSizeInBytes?: number): boolean {
    if (!fileSizeInBytes) return true;
    
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    return fileSizeInBytes <= maxSizeInBytes;
  }
}
