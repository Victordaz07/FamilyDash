import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY!;
const ADMIN_MIN_AGE = parseInt(process.env.ADMIN_MIN_AGE || '18', 10);

export const registerUser = functions.https.onCall(async (data, _context) => {
  const { fullName, email, password, dob, wantsAdmin, captchaToken } = data || {};
  
  if (!email || !password || !fullName || !dob || typeof wantsAdmin !== 'boolean' || !captchaToken) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  // 1) Verify CAPTCHA (Cloudflare Turnstile or simulated for testing)
  if (captchaToken && captchaToken.startsWith('simulated-captcha-token-')) {
    // Allow simulated CAPTCHA for testing
    console.log('Using simulated CAPTCHA for testing');
  } else {
    // Real Turnstile verification
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 
        secret: TURNSTILE_SECRET, 
        response: String(captchaToken) 
      }),
    }).then((r: any) => r.json() as any);
    
    if (!verifyRes.success) {
      throw new functions.https.HttpsError('failed-precondition', 'CAPTCHA verification failed');
    }
  }

  // 2) Age validation
  const birth = new Date(String(dob));
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  
  const isAdult = age >= ADMIN_MIN_AGE;
  
  if (wantsAdmin && !isAdult) {
    throw new functions.https.HttpsError('failed-precondition', 'UNDERAGE_ADMIN');
  }

  // 3) Create user
  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName: fullName,
    emailVerified: false
  });

  // 4) Determine role and create family if needed
  let familyId: string | null = null;
  let role: 'parent-admin'|'parent'|'teen'|'child' = 'parent';

  if (wantsAdmin && isAdult) {
    familyId = admin.firestore().collection('families').doc().id;
    await admin.firestore().doc(`families/${familyId}`).set({
      name: `${fullName.split(' ')[0]} Family`,
      ownerUid: userRecord.uid,
      plan: 'FREE',
      storageQuotaMB: 1024,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    role = 'parent-admin';
    await admin.firestore().doc(`families/${familyId}/members/${userRecord.uid}`).set({
      role,
      email,
      displayName: fullName,
      emailVerified: false,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // 5) Create user document
  await admin.firestore().doc(`users/${userRecord.uid}`).set({
    uid: userRecord.uid,
    familyId,
    role,
    isAdult,
    adminDeferral: !wantsAdmin,
    emailVerified: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  // 6) Set custom claims
  await admin.auth().setCustomUserClaims(userRecord.uid, { familyId, role });

  // 7) Generate custom token
  const customToken = await admin.auth().createCustomToken(userRecord.uid);
  
  return { 
    uid: userRecord.uid, 
    familyId, 
    role, 
    isAdult,
    customToken 
  };
});
