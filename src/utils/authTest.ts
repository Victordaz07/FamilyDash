/**
 * Auth Persistence Test
 * Run this to test if authentication persistence is working
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';

export const testAuthPersistence = async () => {
    console.log('🧪 Testing Auth Persistence...');

    try {
        // Check current auth state
        const currentUser = auth.currentUser;
        console.log('🧪 Current Firebase user:', currentUser ? currentUser.email : 'None');

        // Check AsyncStorage
        const storedUser = await AsyncStorage.getItem('user');
        console.log('🧪 Stored user in AsyncStorage:', storedUser ? 'Found' : 'None');

        if (storedUser) {
            const userData = JSON.parse(storedUser);
            console.log('🧪 Stored user email:', userData.email);
        }

        // Check if auth persistence is enabled
        console.log('🧪 Auth persistence enabled:', auth.app.options.persistence !== undefined);

        return {
            firebaseUser: currentUser ? currentUser.email : null,
            storedUser: storedUser ? JSON.parse(storedUser).email : null,
            persistenceEnabled: auth.app.options.persistence !== undefined
        };
    } catch (error) {
        console.error('🧪 Auth persistence test failed:', error);
        return null;
    }
};

export const clearAuthData = async () => {
    console.log('🧪 Clearing all auth data...');

    try {
        await AsyncStorage.removeItem('user');
        console.log('🧪 AsyncStorage cleared');

        // Note: We can't manually sign out here as it requires user context
        console.log('🧪 To complete cleanup, user should sign out manually');

        return true;
    } catch (error) {
        console.error('🧪 Failed to clear auth data:', error);
        return false;
    }
};
