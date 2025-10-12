/**
 * 🔥 Firebase Authentication para Web Platform
 * 
 * Sistema de autenticación funcional que sincroniza con la app móvil
 */

// Configuración de Firebase (misma que la app móvil)
const firebaseConfig = {
  apiKey: "AIzaSyBqZSqW2ZU1EZldEuc0rktxMuSYi1hleq8",
  authDomain: "family-dash-15944.firebaseapp.com",
  projectId: "family-dash-15944",
  storageBucket: "family-dash-15944.firebasestorage.app",
  messagingSenderId: "3950658017",
  appId: "1:3950658017:web:9d4d2ddea39f8a785e12a0",
  measurementId: "G-ENM2KQWEPX"
};

// Inicializar Firebase
let app, auth, db;

function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK no cargado');
    return false;
  }

  try {
    // Inicializar app
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    
    console.log('✅ Firebase inicializado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    return false;
  }
}

/**
 * Registrar usuario con email y contraseña
 */
async function registerWithEmail(email, password, displayName = '') {
  try {
    console.log('📝 Registrando usuario:', email);

    // Crear usuario en Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Actualizar perfil si hay displayName
    if (displayName) {
      await user.updateProfile({
        displayName: displayName
      });
    }

    // NOTA: Email de verificación personalizado se envía automáticamente 
    // via Cloud Function sendCustomVerification (onUserCreated trigger)
    console.log('📧 Email de verificación personalizado será enviado automáticamente');

    // Crear documento de usuario en Firestore
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: email,
      displayName: displayName || email.split('@')[0],
      emailVerified: false,
      role: 'member', // Default role
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      registeredFrom: 'web',
    });

    console.log('✅ Usuario registrado exitosamente');

    // Track signup complete
    if (window.FamilyDashAnalytics) {
      window.FamilyDashAnalytics.trackSignupComplete('email', false);
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      }
    };
  } catch (error) {
    console.error('❌ Error en registro:', error);
    
    // Track error
    if (window.FamilyDashAnalytics) {
      window.FamilyDashAnalytics.trackFormError('signup', error.code);
    }

    return {
      success: false,
      error: getErrorMessage(error.code),
      code: error.code,
    };
  }
}

/**
 * Login con email y contraseña
 */
async function loginWithEmail(email, password) {
  try {
    console.log('🔐 Iniciando sesión:', email);

    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Verificar si el email está verificado
    if (!user.emailVerified) {
      // Reenviar email de verificación
      const actionCodeSettings = {
        url: 'https://family-dash-15944.web.app/verified',
        handleCodeInApp: false,
      };
      
      // NOTA: Email de verificación personalizado se maneja via Cloud Function
      // await user.sendEmailVerification(actionCodeSettings);
      
      // Cerrar sesión y mostrar error
      await auth.signOut();
      
      return {
        success: false,
        error: 'EMAIL_NOT_VERIFIED',
        code: 'EMAIL_NOT_VERIFIED',
      };
    }

    // Actualizar último login en Firestore
    await db.collection('users').doc(user.uid).update({
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      lastLoginFrom: 'web',
    });

    console.log('✅ Login exitoso');

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
      }
    };
  } catch (error) {
    console.error('❌ Error en login:', error);

    return {
      success: false,
      error: getErrorMessage(error.code),
      code: error.code,
    };
  }
}

/**
 * Login con Google
 */
async function loginWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const userCredential = await auth.signInWithPopup(provider);
    const user = userCredential.user;

    // Crear o actualizar documento de usuario
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        role: 'member',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        registeredFrom: 'web',
        provider: 'google',
      });

      // Track signup
      if (window.FamilyDashAnalytics) {
        window.FamilyDashAnalytics.trackSignupComplete('google', true);
      }
    } else {
      await userRef.update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginFrom: 'web',
      });
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
      }
    };
  } catch (error) {
    console.error('❌ Error en login con Google:', error);
    return {
      success: false,
      error: getErrorMessage(error.code),
      code: error.code,
    };
  }
}

/**
 * Logout
 */
async function logout() {
  try {
    await auth.signOut();
    console.log('✅ Logout exitoso');
    return { success: true };
  } catch (error) {
    console.error('❌ Error en logout:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener usuario actual
 */
function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * Verificar si el usuario es super admin
 */
async function isSuperAdmin(uid) {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return false;
    
    const userData = userDoc.data();
    return userData.role === 'superadmin';
  } catch (error) {
    console.error('❌ Error verificando super admin:', error);
    return false;
  }
}

/**
 * Verificar si el usuario es admin de familia
 */
async function isFamilyAdmin(uid) {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return false;
    
    const userData = userDoc.data();
    return userData.role === 'admin' || userData.role === 'superadmin';
  } catch (error) {
    console.error('❌ Error verificando family admin:', error);
    return false;
  }
}

/**
 * Obtener datos del usuario desde Firestore
 */
async function getUserData(uid) {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return null;
    
    return userDoc.data();
  } catch (error) {
    console.error('❌ Error obteniendo datos de usuario:', error);
    return null;
  }
}

/**
 * Mensajes de error traducidos
 */
function getErrorMessage(code) {
  const errorMessages = {
    'auth/email-already-in-use': 'Este email ya está registrado. Intenta iniciar sesión.',
    'auth/invalid-email': 'El formato del email no es válido.',
    'auth/operation-not-allowed': 'Operación no permitida.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
    'auth/user-not-found': 'No existe una cuenta con este email.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
    'EMAIL_NOT_VERIFIED': 'Debes verificar tu email antes de continuar. Revisa tu bandeja de entrada.',
  };

  return errorMessages[code] || 'Ha ocurrido un error. Por favor intenta de nuevo.';
}

/**
 * Resend email verification
 */
async function resendVerificationEmail() {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // Llamar a nuestra Cloud Function personalizada
    const resendVerification = firebase.functions().httpsCallable('resendVerificationEmail');
    const result = await resendVerification();
    
    if (result.data.success) {
      console.log('📧 Email de verificación personalizado reenviado');
      return { success: true };
    } else {
      return { success: false, error: result.data.message };
    }
  } catch (error) {
    console.error('❌ Error reenviando email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reload user and check verification
 */
async function reloadAndCheckVerification() {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await user.reload();
    
    // Actualizar en Firestore
    if (user.emailVerified) {
      await db.collection('users').doc(user.uid).update({
        emailVerified: true,
        verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      success: true,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    console.error('❌ Error recargando usuario:', error);
    return { success: false, error: error.message };
  }
}

// Exportar funciones globalmente
window.FamilyDashAuth = {
  initFirebase,
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  getCurrentUser,
  isSuperAdmin,
  isFamilyAdmin,
  getUserData,
  resendVerificationEmail,
  reloadAndCheckVerification,
  getErrorMessage,
};

// Auto-inicializar cuando Firebase SDK esté disponible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initFirebase, 100);
  });
} else {
  setTimeout(initFirebase, 100);
}

