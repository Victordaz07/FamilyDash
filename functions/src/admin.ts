/**
 * 🎛️ Admin Cloud Functions - FamilyDash
 * 
 * Funciones serverless para operaciones de administración
 * que requieren privilegios elevados
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Si admin no está inicializado, inicializarlo
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

/**
 * Verificar si el caller es super admin
 */
async function verifySuperAdmin(uid: string): Promise<boolean> {
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) return false;
  
  const userData = userDoc.data();
  return userData?.role === 'superadmin';
}

/**
 * DELETE USER ACCOUNT
 * Elimina completamente un usuario de Firebase Auth y Firestore
 */
export const deleteUserAccount = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Verificar que el caller es super admin
  const isSuperAdmin = await verifySuperAdmin(context.auth.uid);
  if (!isSuperAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Only super admins can delete users');
  }

  const { userId } = data;

  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'userId is required');
  }

  try {
    // 1. Delete from Firebase Auth
    await auth.deleteUser(userId);

    // 2. Delete user document from Firestore
    await db.collection('users').doc(userId).delete();

    // 3. Delete user's related data (tasks, events, etc.)
    // TODO: Implement cascade delete

    functions.logger.info(`User ${userId} deleted by ${context.auth.uid}`);

    return { success: true, message: 'User deleted successfully' };
  } catch (error: any) {
    functions.logger.error('Error deleting user:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * PROMOTE TO SUPER ADMIN
 * Promueve un usuario a super admin
 */
export const promoteToSuperAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const isSuperAdmin = await verifySuperAdmin(context.auth.uid);
  if (!isSuperAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Only super admins can promote users');
  }

  const { userId } = data;

  try {
    await db.collection('users').doc(userId).update({
      role: 'superadmin',
      promotedAt: admin.firestore.FieldValue.serverTimestamp(),
      promotedBy: context.auth.uid,
    });

    // Set custom claims (opcional, para verificación más rápida)
    await auth.setCustomUserClaims(userId, { superadmin: true });

    functions.logger.info(`User ${userId} promoted to superadmin by ${context.auth.uid}`);

    return { success: true, message: 'User promoted to super admin' };
  } catch (error: any) {
    functions.logger.error('Error promoting user:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * GET ALL FAMILIES STATS
 * Obtiene estadísticas globales de todas las familias
 */
export const getAllFamiliesStats = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const isSuperAdmin = await verifySuperAdmin(context.auth.uid);
  if (!isSuperAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Only super admins can view global stats');
  }

  try {
    const familiesSnapshot = await db.collection('families').get();
    const usersSnapshot = await db.collection('users').get();
    const tasksSnapshot = await db.collection('tasks').get();

    const stats = {
      totalFamilies: familiesSnapshot.size,
      totalUsers: usersSnapshot.size,
      totalTasks: tasksSnapshot.size,
      averageMembersPerFamily: usersSnapshot.size / familiesSnapshot.size,
      timestamp: new Date().toISOString(),
    };

    return { success: true, stats };
  } catch (error: any) {
    functions.logger.error('Error getting stats:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * SEND GLOBAL NOTIFICATION
 * Envía una notificación a todos los usuarios
 */
export const sendGlobalNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const isSuperAdmin = await verifySuperAdmin(context.auth.uid);
  if (!isSuperAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Only super admins can send global notifications');
  }

  const { title, message, type } = data;

  try {
    // Create announcement in Firestore
    await db.collection('announcements').add({
      title,
      message,
      type,
      global: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid,
      active: true,
    });

    // TODO: Enviar push notification a todos los usuarios con FCM

    functions.logger.info(`Global notification sent by ${context.auth.uid}`);

    return { success: true, message: 'Notification sent to all users' };
  } catch (error: any) {
    functions.logger.error('Error sending notification:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * EXPORT USER DATA
 * Exporta todos los datos de un usuario (GDPR compliance)
 */
export const exportUserData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId } = data;

  // Users can export their own data, or super admins can export anyone's
  const isSuperAdmin = await verifySuperAdmin(context.auth.uid);
  if (userId !== context.auth.uid && !isSuperAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized to export this user data');
  }

  try {
    const userData: any = {};

    // Get user document
    const userDoc = await db.collection('users').doc(userId).get();
    userData.profile = userDoc.data();

    // Get user's tasks
    const tasksSnapshot = await db.collection('tasks').where('assignedTo', '==', userId).get();
    userData.tasks = tasksSnapshot.docs.map(doc => doc.data());

    // Get user's events
    const eventsSnapshot = await db.collection('events').where('createdBy', '==', userId).get();
    userData.events = eventsSnapshot.docs.map(doc => doc.data());

    // Get user's safe room entries
    const safeRoomSnapshot = await db.collection('safeRoomEntries').where('userId', '==', userId).get();
    userData.safeRoomEntries = safeRoomSnapshot.docs.map(doc => doc.data());

    functions.logger.info(`User data exported for ${userId} by ${context.auth.uid}`);

    return {
      success: true,
      data: userData,
      exportedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    functions.logger.error('Error exporting data:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * BULK USER OPERATION
 * Operaciones en lote sobre múltiples usuarios
 */
export const bulkUserOperation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const isSuperAdmin = await verifySuperAdmin(context.auth.uid);
  if (!isSuperAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Only super admins can perform bulk operations');
  }

  const { operation, userIds } = data;

  if (!operation || !userIds || !Array.isArray(userIds)) {
    throw new functions.https.HttpsError('invalid-argument', 'operation and userIds array are required');
  }

  try {
    const batch = db.batch();
    // const results: any[] = []; // Not used yet

    switch (operation) {
      case 'verify':
        // Mark users as verified
        userIds.forEach((userId) => {
          const userRef = db.collection('users').doc(userId);
          batch.update(userRef, {
            emailVerified: true,
            verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        break;

      case 'delete':
        // Delete users (Firestore only, Auth requires individual calls)
        userIds.forEach((userId) => {
          const userRef = db.collection('users').doc(userId);
          batch.delete(userRef);
        });
        break;

      case 'changeRole':
        // Change role for multiple users
        const newRole = data.newRole;
        userIds.forEach((userId) => {
          const userRef = db.collection('users').doc(userId);
          batch.update(userRef, {
            role: newRole,
            roleUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            roleUpdatedBy: context.auth?.uid,
          });
        });
        break;

      default:
        throw new functions.https.HttpsError('invalid-argument', 'Invalid operation');
    }

    await batch.commit();

    functions.logger.info(`Bulk operation ${operation} performed on ${userIds.length} users by ${context.auth.uid}`);

    return {
      success: true,
      message: `Operation ${operation} completed on ${userIds.length} users`,
    };
  } catch (error: any) {
    functions.logger.error('Error in bulk operation:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * MODERATE CONTENT
 * Aprobar o rechazar contenido reportado
 */
export const moderateContent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const isSuperAdmin = await verifySuperAdmin(context.auth.uid);
  if (!isSuperAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Only super admins can moderate content');
  }

  const { contentId, action, reason } = data; // action: 'approve' | 'reject' | 'delete'

  try {
    // Get content document (could be from any collection: tasks, events, safeRoomEntries)
    const contentRef = db.collection('moderationQueue').doc(contentId);
    const contentDoc = await contentRef.get();

    if (!contentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Content not found');
    }

    // Update moderation status
    await contentRef.update({
      moderationStatus: action,
      moderatedBy: context.auth.uid,
      moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
      moderationReason: reason || null,
    });

    functions.logger.info(`Content ${contentId} ${action}ed by ${context.auth.uid}`);

    return { success: true, message: `Content ${action}ed` };
  } catch (error: any) {
    functions.logger.error('Error moderating content:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

