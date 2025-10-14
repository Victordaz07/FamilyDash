// Development authentication helper
import { signInAnonymously, User } from 'firebase/auth';
import { auth } from './firebase';

let devUser: User | null = null;

/**
 * Sign in anonymously for development
 * This bypasses the need for full authentication setup
 */
export const signInDev = async (): Promise<User> => {
  try {
    if (devUser) {
      return devUser;
    }

    console.log('🔐 Signing in anonymously for development...');
    const userCredential = await signInAnonymously(auth);
    devUser = userCredential.user;
    
    console.log('✅ Development user signed in:', devUser.uid);
    return devUser;
  } catch (error) {
    console.error('❌ Failed to sign in anonymously:', error);
    throw error;
  }
};

/**
 * Get current development user
 */
export const getDevUser = (): User | null => {
  return devUser || auth.currentUser;
};

/**
 * Check if user is signed in
 */
export const isDevSignedIn = (): boolean => {
  return !!getDevUser();
};
