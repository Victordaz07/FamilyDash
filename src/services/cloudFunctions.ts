/**
 * Cloud Functions Service
 * Client-side interface for Firebase Cloud Functions
 * 
 * Phase 4: Server-side validation, rate limiting, and email verification
 */

import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { app } from '@/config/firebase';
import { secureLog, secureError } from '@/utils/secureLog';

// Initialize Firebase Functions
const functions = getFunctions(app);

// Use emulator in development (optional)
if (__DEV__ && false) { // Change to true if using emulator
  // connectFunctionsEmulator(functions, 'localhost', 5001);
  secureLog('Functions: Connected to emulator');
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CreateTaskPayload {
  familyId: string;
  title: string;
  description?: string;
}

export interface CreateTaskResult {
  taskId: string;
}

export interface EmailVerifiedResult {
  ok: boolean;
  emailVerified: boolean;
}

export interface UpdateProfilePayload {
  displayName?: string;
  photoURL?: string;
}

export interface UpdateProfileResult {
  success: boolean;
}

// ============================================
// CLOUD FUNCTIONS CALLS
// ============================================

/**
 * Create a task via Cloud Function
 * Server-side validation, rate limiting, and membership check
 * 
 * @param payload - Task data with familyId, title, and optional description
 * @returns Promise with taskId
 * @throws HttpsError if validation fails or rate limited
 */
export async function createTaskServer(
  payload: CreateTaskPayload
): Promise<CreateTaskResult> {
  try {
    secureLog('CloudFunctions: Calling createTask');
    
    const callable = httpsCallable<CreateTaskPayload, CreateTaskResult>(
      functions,
      'createTask'
    );
    
    const result: HttpsCallableResult<CreateTaskResult> = await callable(payload);
    
    secureLog('CloudFunctions: Task created successfully', result.data.taskId);
    return result.data;
  } catch (error: any) {
    secureError('CloudFunctions: createTask failed', error);
    
    // Re-throw with user-friendly message
    throw new Error(error.message || 'Error al crear la tarea en el servidor');
  }
}

/**
 * Check if user's email is verified
 * Use this to gate premium or sensitive features
 * 
 * @returns Promise with verification status
 * @throws HttpsError if email not verified
 */
export async function checkEmailVerified(): Promise<EmailVerifiedResult> {
  try {
    secureLog('CloudFunctions: Calling emailVerifiedGuard');
    
    const callable = httpsCallable<void, EmailVerifiedResult>(
      functions,
      'emailVerifiedGuard'
    );
    
    const result: HttpsCallableResult<EmailVerifiedResult> = await callable();
    
    secureLog('CloudFunctions: Email verification check passed');
    return result.data;
  } catch (error: any) {
    secureError('CloudFunctions: emailVerifiedGuard failed', error);
    
    // Re-throw with user-friendly message
    if (error.code === 'functions/failed-precondition') {
      throw new Error('Por favor verifica tu correo electrónico para continuar');
    }
    
    throw new Error(error.message || 'Error al verificar el correo electrónico');
  }
}

/**
 * Update user profile via Cloud Function
 * Server-side validation and sanitization
 * 
 * @param payload - Profile updates (displayName and/or photoURL)
 * @returns Promise with success status
 * @throws HttpsError if validation fails or rate limited
 */
export async function updateUserProfileServer(
  payload: UpdateProfilePayload
): Promise<UpdateProfileResult> {
  try {
    secureLog('CloudFunctions: Calling updateUserProfile');
    
    const callable = httpsCallable<UpdateProfilePayload, UpdateProfileResult>(
      functions,
      'updateUserProfile'
    );
    
    const result: HttpsCallableResult<UpdateProfileResult> = await callable(payload);
    
    secureLog('CloudFunctions: Profile updated successfully');
    return result.data;
  } catch (error: any) {
    secureError('CloudFunctions: updateUserProfile failed', error);
    
    // Re-throw with user-friendly message
    throw new Error(error.message || 'Error al actualizar el perfil');
  }
}

/**
 * Handle rate limit errors with user-friendly messages
 * 
 * @param error - The error from Cloud Functions
 * @returns User-friendly error message
 */
export function getRateLimitMessage(error: any): string {
  if (error?.code === 'functions/resource-exhausted') {
    return error.message || 'Has realizado demasiadas solicitudes. Por favor espera un momento.';
  }
  
  return error.message || 'Ocurrió un error inesperado';
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
  return error?.code === 'functions/resource-exhausted';
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return error?.code === 'functions/unauthenticated';
}

/**
 * Check if error is a permission error
 */
export function isPermissionError(error: any): boolean {
  return error?.code === 'functions/permission-denied';
}

// ============================================
// EXPORTS
// ============================================

export default {
  createTaskServer,
  checkEmailVerified,
  updateUserProfileServer,
  getRateLimitMessage,
  isRateLimitError,
  isAuthError,
  isPermissionError,
};

