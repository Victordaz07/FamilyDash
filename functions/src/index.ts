/**
 * FamilyDash Cloud Functions
 * Server-side validation, rate limiting, and security enforcement
 * 
 * Phase 4: Cloud Functions + Rate Limit + Email Verification
 * Phase 9: Admin Dashboard Functions
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Import admin functions
import * as adminFunctions from './admin';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Require user authentication
 * Throws unauthenticated error if not authenticated
 */
function requireAuth(context: functions.https.CallableContext): string {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Usuario no autenticado. Por favor inicia sesión.'
    );
  }
  return context.auth.uid;
}

/**
 * Rate limiting per (uid + action) in a 15-minute window
 * Uses Firestore transactions for atomic counter
 */
async function checkRateLimit(
  uid: string,
  action: string,
  max = 20,
  windowMs = 15 * 60 * 1000
): Promise<void> {
  const now = Date.now();
  const docRef = db.collection('rate_limits').doc(`${uid}_${action}`);
  
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    const resetAt = now + windowMs;
    
    if (!snap.exists) {
      // First request - create document
      tx.set(docRef, { count: 1, resetAt });
      return;
    }
    
    const data = snap.data() as { count: number; resetAt: number };
    
    // Window expired - reset counter
    if (now > data.resetAt) {
      tx.set(docRef, { count: 1, resetAt });
      return;
    }
    
    // Check if limit exceeded
    if (data.count >= max) {
      const remainingMin = Math.ceil((data.resetAt - now) / 60000);
      throw new functions.https.HttpsError(
        'resource-exhausted',
        `Demasiadas solicitudes. Intenta de nuevo en ~${remainingMin} minuto(s).`
      );
    }
    
    // Increment counter
    tx.update(docRef, { count: admin.firestore.FieldValue.increment(1) });
  });
}

/**
 * Verify if user is a member of the family
 * Checks /families/{familyId}/members/{uid}
 */
async function isMember(familyId: string, uid: string): Promise<boolean> {
  const ref = db.doc(`families/${familyId}/members/${uid}`);
  const doc = await ref.get();
  return doc.exists;
}

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
function sanitizeString(input: string): string {
  return input
    .trim()
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe tags and content
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '');
}

// ============================================
// CALLABLE FUNCTIONS
// ============================================

/**
 * Create Task (Callable Function)
 * Server-side validation with rate limiting and membership check
 * 
 * @param data - { title: string, description?: string, familyId: string }
 * @param context - Firebase callable context with auth
 * @returns { taskId: string }
 */
export const createTask = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    // 1. Require authentication
    const uid = requireAuth(context);
    
    // 2. Rate limiting: max 30 task creations per 15 minutes
    await checkRateLimit(uid, 'createTask', 30, 15 * 60 * 1000);
    
    // 3. Validate input
    const { title, description = '', familyId } = data || {};
    
    if (!familyId || typeof familyId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'familyId es requerido y debe ser un string.'
      );
    }
    
    if (!title || typeof title !== 'string' || title.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'El título es requerido.'
      );
    }
    
    if (title.length > 100) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'El título no puede exceder 100 caracteres.'
      );
    }
    
    // 4. Verify family membership
    const member = await isMember(familyId, uid);
    if (!member) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'No eres miembro de esta familia.'
      );
    }
    
    // 5. Sanitize input and create task
    const taskData = {
      title: sanitizeString(title),
      description: sanitizeString(description),
      createdBy: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      familyId,
      status: 'open',
      priority: 'medium',
    };
    
    // 6. Write to Firestore
    const ref = await db
      .collection('families')
      .doc(familyId)
      .collection('tasks')
      .add(taskData);
    
    console.log(`Task created: ${ref.id} by user: ${uid} in family: ${familyId}`);
    
    return { taskId: ref.id };
  });

/**
 * Email Verified Guard (Callable Function)
 * Checks if user has verified their email
 * Use this to gate premium or sensitive features
 * 
 * @param _data - unused
 * @param context - Firebase callable context with auth
 * @returns { ok: true }
 * @throws failed-precondition if email not verified
 */
export const emailVerifiedGuard = functions
  .region('us-central1')
  .https.onCall(async (_data, context) => {
    // 1. Require authentication
    const uid = requireAuth(context);
    
    // 2. Rate limiting: max 50 checks per 15 minutes
    await checkRateLimit(uid, 'emailVerifiedGuard', 50, 15 * 60 * 1000);
    
    // 3. Get user from Firebase Auth
    const user = await admin.auth().getUser(uid);
    
    // 4. Check email verification
    if (!user.emailVerified) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Por favor verifica tu correo electrónico para continuar. Revisa tu bandeja de entrada.'
      );
    }
    
    console.log(`Email verified check passed for user: ${uid}`);
    
    return { ok: true, emailVerified: true };
  });

/**
 * Update User Profile (Callable Function)
 * Server-side profile update with validation
 * 
 * @param data - { displayName?: string, photoURL?: string }
 * @param context - Firebase callable context with auth
 * @returns { success: true }
 */
export const updateUserProfile = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    // 1. Require authentication
    const uid = requireAuth(context);
    
    // 2. Rate limiting: max 10 profile updates per 15 minutes
    await checkRateLimit(uid, 'updateUserProfile', 10, 15 * 60 * 1000);
    
    // 3. Validate and sanitize input
    const updates: { displayName?: string; photoURL?: string } = {};
    
    if (data.displayName !== undefined) {
      if (typeof data.displayName !== 'string') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'displayName debe ser un string.'
        );
      }
      
      const sanitized = sanitizeString(data.displayName);
      if (sanitized.length === 0 || sanitized.length > 50) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'El nombre debe tener entre 1 y 50 caracteres.'
        );
      }
      
      updates.displayName = sanitized;
    }
    
    if (data.photoURL !== undefined) {
      if (typeof data.photoURL !== 'string') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'photoURL debe ser un string.'
        );
      }
      
      // Basic URL validation
      if (data.photoURL.length > 0 && !/^https?:\/\/.+/.test(data.photoURL)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'photoURL debe ser una URL válida.'
        );
      }
      
      updates.photoURL = data.photoURL;
    }
    
    // 4. Update Firebase Auth profile
    if (Object.keys(updates).length > 0) {
      await admin.auth().updateUser(uid, updates);
      
      // 5. Also update Firestore user document if exists
      const userDocRef = db.collection('users').doc(uid);
      const userDoc = await userDocRef.get();
      
      if (userDoc.exists) {
        await userDocRef.update({
          ...updates,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      
      console.log(`Profile updated for user: ${uid}`, updates);
    }
    
    return { success: true };
  });

// ============================================
// EXPORTS
// ============================================

// Export existing functions
export { createTask, emailVerifiedGuard, updateUserProfile };

// Export admin functions
export {
  deleteUserAccount,
  promoteToSuperAdmin,
  getAllFamiliesStats,
  sendGlobalNotification,
  exportUserData,
  bulkUserOperation,
  moderateContent,
} from './admin';

