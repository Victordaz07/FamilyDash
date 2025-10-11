/**
 * Secure Storage Utility
 * Uses expo-secure-store for native platforms (encrypted)
 * Falls back to AsyncStorage for web
 * 
 * SECURITY: All sensitive user data should use this instead of AsyncStorage
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const canUseSecure = Platform.OS !== 'web';

export const SecureStorage = {
  /**
   * Store a value securely
   * @param key - Storage key
   * @param value - Value to store (will be encrypted on native platforms)
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (canUseSecure) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`SecureStorage.setItem failed for key: ${key}`, error);
      throw error;
    }
  },

  /**
   * Retrieve a value securely
   * @param key - Storage key
   * @returns The stored value or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (canUseSecure) {
        return await SecureStore.getItemAsync(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`SecureStorage.getItem failed for key: ${key}`, error);
      return null;
    }
  },

  /**
   * Delete a value securely
   * @param key - Storage key to delete
   */
  async deleteItem(key: string): Promise<void> {
    try {
      if (canUseSecure) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`SecureStorage.deleteItem failed for key: ${key}`, error);
      throw error;
    }
  },

  /**
   * Check if SecureStore is available (true on native, false on web)
   */
  isSecure(): boolean {
    return canUseSecure;
  },
};

// Common storage keys (for consistency across the app)
export const STORAGE_KEYS = {
  USER_DATA: 'secure_user_data',
  AUTH_TOKEN: 'secure_auth_token',
  REFRESH_TOKEN: 'secure_refresh_token',
  USER_CREDENTIALS: 'secure_user_credentials',
  FAMILY_ID: 'secure_family_id',
} as const;

