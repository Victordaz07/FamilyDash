import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
//   apiVersion: '2025-09-30.clover' 
// });

export const createAdminActivationCheckout = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }
  
  const uid = context.auth.uid;
  const userDoc = await admin.firestore().doc(`users/${uid}`).get();
  const userData = userDoc.data();
  
  if (!userData) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }
  
  if (userData.role === 'parent-admin' || userData.role === 'superadmin') {
    throw new functions.https.HttpsError('failed-precondition', 'User is already admin');
  }
  
  if (!userData.isAdult) {
    throw new functions.https.HttpsError('failed-precondition', 'Must be adult to become admin');
  }

  // Create or get family
  let familyId = userData.familyId;
  if (!familyId) {
    familyId = admin.firestore().collection('families').doc().id;
    await admin.firestore().doc(`families/${familyId}`).set({
      name: `${userData.displayName || 'User'} Family`,
      ownerUid: uid,
      plan: 'FREE',
      storageQuotaMB: 1024,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Create admin activation request
  await admin.firestore().doc(`adminRequests/${uid}`).set({
    uid,
    familyId,
    requestedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'pending'
  });

  // For now, return a mock URL - will be replaced with real Stripe integration
  return { 
    url: 'https://stripe.com/checkout/mock-session',
    message: 'Stripe integration pending - admin activation will be available soon'
  };
});

export const stripeWebhook = functions.https.onRequest(async (_req, res) => {
  // Stripe webhook handler - will be implemented when Stripe is configured
  console.log('Stripe webhook received (not yet implemented)');
  res.json({ received: true, message: 'Stripe webhook handler pending' });
});
