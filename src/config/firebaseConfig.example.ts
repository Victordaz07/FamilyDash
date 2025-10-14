/**
 * Firebase Configuration Example
 * Copy this file to firebaseConfig.ts and replace with your actual Firebase credentials
 */

// Paso 1: Ve a Firebase Console → Project Settings → General → Web App Config
// Paso 2: Copia tu configuración aquí:

export const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com", 
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789",
  measurementId: "G-XXXXXXXXXX" // Opcional para analytics
};

// Ejemplo de lo debería verse realmente:
/*
export const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXxxx",
  authDomain: "family-dash-abc123.firebaseapp.com",
  projectId: "family-dash-abc123",
  storageBucket: "family-dash-abc123.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:fedcba987654321",
  measurementId: "G-ABCDEF123456"
};
*/

// Instrucciones:
// 1. Ve a https://console.firebase.google.com/
// 2. Selecciona tu proyecto
// 3. Ve a Project Settings (⚙️)
// 4. Scroll hasta "Tus apps"
// 5. Click en el icono </> para crear app web
// 6. Copia la configuración y reemplaza arriba
// 7. Renombra este archivo a 'firebaseConfig.ts'
// 8. ¡Listo! Tu app estará conectada a Firebase real




