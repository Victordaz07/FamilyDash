/**
 * Script simple para limpiar usuarios de prueba
 * Usa la configuración actual de Firebase de tu proyecto
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, deleteUser } = require('firebase/auth');

// Configuración de Firebase (usa tu configuración actual)
const firebaseConfig = {
  // Reemplaza con tu configuración real de firebase-config.ts
  apiKey: "tu-api-key",
  authDomain: "familydash-15944.firebaseapp.com",
  projectId: "familydash-15944",
  storageBucket: "familydash-15944.appspot.com",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Credenciales de prueba (necesitarás las contraseñas)
const testUsers = [
  { email: 'viruizbc@gmail.com', password: 'tu-password-1' },
  { email: 'daz.graphic1306@gmail.com', password: 'tu-password-2' }
];

async function deleteTestUser(userCredentials) {
  try {
    console.log(`🔍 Intentando eliminar usuario: ${userCredentials.email}`);
    
    // Iniciar sesión con el usuario
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      userCredentials.email, 
      userCredentials.password
    );
    
    const user = userCredential.user;
    console.log(`✅ Usuario autenticado: ${user.uid}`);
    
    // Eliminar el usuario
    await deleteUser(user);
    console.log(`✅ Usuario ${userCredentials.email} eliminado exitosamente`);
    
    return true;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`⚠️ Usuario ${userCredentials.email} no encontrado`);
    } else if (error.code === 'auth/wrong-password') {
      console.log(`⚠️ Contraseña incorrecta para ${userCredentials.email}`);
    } else {
      console.error(`❌ Error eliminando ${userCredentials.email}:`, error.message);
    }
    return false;
  }
}

async function clearAllTestUsers() {
  console.log('🚀 Limpiando usuarios de prueba...\n');
  
  for (const userCredentials of testUsers) {
    await deleteTestUser(userCredentials);
    console.log(''); // Línea en blanco
  }
  
  console.log('🎉 Proceso completado');
}

// Ejecutar
clearAllTestUsers().catch(console.error);
