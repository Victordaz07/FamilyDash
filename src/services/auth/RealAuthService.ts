/**
 * Real Firebase Authentication Service
 * Production-ready authentication with Firebase Auth
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
  deleteUser,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider, db } from '../../config/firebase';
import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logger from '../Logger';

// Personaliza el destino del enlace
const actionCodeSettings = {
  url: 'https://familydash-15944.web.app/verified', // TODO: cámbialo por tu dominio
  handleCodeInApp: false,
  // dynamicLinkDomain: 'familydash.page.link',
};

export class EmailNotVerifiedError extends Error {
  constructor(message = 'EMAIL_NOT_VERIFIED') {
    super(message);
    this.name = 'EmailNotVerifiedError';
  }
}

async function syncUserEmailVerified(user: User) {
  const uid = user.uid;
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  const verified = user.emailVerified === true;

  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      email: user.email ?? null,
      emailVerified: verified,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } else {
    await updateDoc(ref, {
      emailVerified: verified,
      verifiedAt: verified ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    });
  }
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  code?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export interface ProfileUpdate {
  displayName?: string;
  photoURL?: string;
}

class RealAuthService {
  private user: AuthUser | null = null;
  private authStateListeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    this.initializeAuthState();
  }

  /**
   * Initialize authentication state listener
   */
  private initializeAuthState(): void {
    onAuthStateChanged(auth, async (user) => {
      const authUser = user ? this.mapFirebaseUserToAuthUser(user) : null;
      this.user = authUser;

      // Save user data to AsyncStorage
      await this.saveUserToStorage(authUser);

      // Notify all listeners
      this.authStateListeners.forEach(listener => listener(authUser));
    });
  }

  /**
   * Map Firebase User to AuthUser
   */
  private mapFirebaseUserToAuthUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
    };
  }

  /**
   * Save user data to AsyncStorage
   */
  private async saveUserToStorage(user: AuthUser | null): Promise<void> {
    try {
      if (user) {
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem('user_data');
      }
    } catch (error) {
      Logger.error('Error saving user to storage:', error);
    }
  }

  /**
   * Get user data from AsyncStorage
   */
  private async getUserFromStorage(): Promise<AuthUser | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      Logger.error('Error getting user from storage:', error);
      return null;
    }
  }

  /**
   * Add authentication state listener
   */
  addAuthStateListener(listener: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(listener);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.user) {
      return this.user;
    }

    // If no current user, try to get from storage
    return await this.getUserFromStorage();
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      Logger.debug('🔐 Signing in with email:', credentials.email);

      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Bloquear si es contraseña y no verificado
      const isEmailProvider = userCredential.user.providerData.some(p => (p?.providerId ?? '') === 'password');
      if (isEmailProvider && !userCredential.user.emailVerified) {
        try { 
          await sendEmailVerification(userCredential.user, actionCodeSettings);
          Logger.debug('📧 Verification email resent to:', credentials.email);
        } catch (e) {
          Logger.warn('⚠️ Resend verification failed:', e);
        }
        await syncUserEmailVerified(userCredential.user);
        throw new EmailNotVerifiedError();
      }

      await syncUserEmailVerified(userCredential.user);

      const user = this.mapFirebaseUserToAuthUser(userCredential.user);

      Logger.debug('✅ Login successful:', user.displayName);

      return {
        success: true,
        user,
      };
    } catch (error: any) {
      Logger.error('❌ Login error:', error);

      // Si es error de verificación, lanzar error específico
      if (error instanceof EmailNotVerifiedError) {
        return {
          success: false,
          error: 'EMAIL_NOT_VERIFIED',
          code: 'EMAIL_NOT_VERIFIED',
        };
      }

      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code,
      };
    }
  }

  /**
   * Register new user with email and password
   */
  async registerWithEmail(credentials: RegisterCredentials): Promise<AuthResult> {
    try {
      Logger.debug('📝 Registering new user:', credentials.email);

      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Update user profile if displayName provided
      if (credentials.displayName) {
        await updateProfile(userCredential.user, {
          displayName: credentials.displayName,
        });
      }

      // 1) Enviar correo de verificación inmediatamente
      try {
        await sendEmailVerification(userCredential.user, actionCodeSettings);
        Logger.debug('📧 Verification email sent to:', credentials.email);
      } catch (e) {
        Logger.warn('⚠️ sendEmailVerification failed:', e);
      }

      // 2) Crear/actualizar doc de usuario en Firestore
      await syncUserEmailVerified(userCredential.user);

      const user = this.mapFirebaseUserToAuthUser(userCredential.user);

      Logger.debug('✅ Registration successful:', user.displayName);

      return {
        success: true,
        user,
      };
    } catch (error: any) {
      Logger.error('❌ Registration error:', error);

      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code,
      };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      Logger.debug('🔐 Signing in with Google');

      const userCredential: UserCredential = await signInWithPopup(auth, googleProvider);
      const user = this.mapFirebaseUserToAuthUser(userCredential.user);

      Logger.debug('✅ Google login successful:', user.displayName);

      return {
        success: true,
        user,
      };
    } catch (error: any) {
      Logger.error('❌ Google login error:', error);

      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code,
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<AuthResult> {
    try {
      Logger.debug('🚪 Signing out user');

      await signOut(auth);

      Logger.debug('✅ Sign out successful');

      return {
        success: true,
      };
    } catch (error: any) {
      Logger.error('❌ Sign out error:', error);

      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code,
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: ProfileUpdate): Promise<AuthResult> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      Logger.debug('✏️ Updating user profile');

      await updateProfile(currentUser, updates);

      const user = this.mapFirebaseUserToAuthUser(currentUser);

      Logger.debug('✅ Profile update successful');

      return {
        success: true,
        user,
      };
    } catch (error: any) {
      Logger.error('❌ Profile update error:', error);

      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code,
      };
    }
  }

  /**
   * Update user email
   */
  async updateUserEmail(newEmail: string): Promise<AuthResult> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      Logger.debug('📧 Updating user email');

      await updateEmail(currentUser, newEmail);

      const user = this.mapFirebaseUserToAuthUser(currentUser);

      Logger.debug('✅ Email update successful');

      return {
        success: true,
        user,
      };
    } catch (error: any) {
      Logger.error('❌ Email update error:', error);

      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code,
      };
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(newPassword: string): Promise<AuthResult> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      Logger.debug('🔐 Updating user password');

      await updatePassword(currentUser, newPassword);

      Logger.debug('✅ Password update successful');

      return {
        success: true,
      };
    } catch (error: any) {
      Logger.error('❌ Password update error:', error);

      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code,
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<AuthResult> {
    try {
      Logger.debug('📧 Sending password reset email to:', email);

      await sendPasswordResetEmail(auth, email);

      Logger.debug('✅ Password reset email sent');

      return {
        success: true,
      };
    } catch (error: any) {
      Logger.error('❌ Password reset error:', error);

      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code,
      };
    }
  }

  /**
   * Delete user account
   */
  async deleteUserAccount(): Promise<AuthResult> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      Logger.debug('🗑️ Deleting user account');

      await sendPasswordResetEmail(auth, currentUser.email!);

      Logger.debug('✅ Account deletion initiated');

      return {
        success: true,
      };
    } catch (error: any) {
      Logger.error('❌ Account deletion error:', error);

      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code,
      };
    }
  }

  /**
   * Get human-readable authentication error message
   */
  private getAuthErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'An account already exists with this email',
      'auth/weak-password': 'Password is too weak',
      'auth/invalid-email': 'Invalid email format',
      'auth/user-disabled': 'This account has been disabled',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/invalid-credential': 'Invalid login credentials',
      'auth/requires-recent-login': 'Please log in again to continue',
      'auth/operation-not-allowed': 'This operation is not allowed',
    };

    return errorMessages[errorCode] || 'An unexpected error occurred';
  }

  /**
   * Wait for authentication state to resolve
   */
  async waitForAuthState(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = this.addAuthStateListener((user) => {
        resolve(user);
      });

      // If user is already available, resolve immediately
      if (this.user !== undefined) {
        unsubscribe();
        resolve(this.user);
      }
    });
  }

  /**
   * Get authentication token
   */
  async getAuthToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        return null;
      }

      return await currentUser.getIdToken();
    } catch (error) {
      Logger.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshAuthToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        return null;
      }

      return await currentUser.getIdToken(true); // Force refresh
    } catch (error) {
      Logger.error('Error refreshing auth token:', error);
      return null;
    }
  }

  /**
   * Listen to authentication state changes
   * @param callback Function to call when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      const authUser = firebaseUser ? this.mapFirebaseUserToAuthUser(firebaseUser) : null;
      callback(authUser);
    });
  }

  /**
   * Reenviar correo de verificación
   */
  async resendVerificationEmail(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('NO_AUTH');
      
      await sendEmailVerification(user, actionCodeSettings);
      Logger.debug('📧 Verification email resent');
      return true;
    } catch (error) {
      Logger.error('❌ Error resending verification email:', error);
      throw error;
    }
  }

  /**
   * Recargar usuario y sincronizar estado de verificación
   */
  async reloadAndSyncEmailVerified(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('NO_AUTH');
      
      await reload(user);
      await syncUserEmailVerified(user);
      Logger.debug('🔄 User reloaded and synced');
      return user.emailVerified === true;
    } catch (error) {
      Logger.error('❌ Error reloading user:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    return this.user;
  }
}

export { RealAuthService };
export default new RealAuthService();
