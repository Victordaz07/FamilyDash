// Script de prueba para diagnosticar el registro
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js';

const firebaseConfig = {
  apiKey: "AIzaSyBqZSqW2ZU1EZldEuc0rktxMuSYi1hleq8",
  authDomain: "family-dash-15944.firebaseapp.com",
  projectId: "family-dash-15944",
  storageBucket: "family-dash-15944.firebasestorage.app",
  messagingSenderId: "3950658017",
  appId: "1:3950658017:web:9d4d2ddea39f8a785e12a0",
  measurementId: "G-ENM2KQWEPX"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Datos de prueba
const testData = {
  fullName: "Test User",
  email: `test${Date.now()}@example.com`,
  password: "test123456",
  dob: "1990-01-01",
  wantsAdmin: true,
  captchaToken: "simulated-captcha-token-" + Date.now()
};

console.log("Probando registro con datos:", testData);

try {
  const registerUser = httpsCallable(functions, 'registerUser');
  const result = await registerUser(testData);
  console.log("✅ Registro exitoso:", result.data);
} catch (error) {
  console.error("❌ Error en registro:", error);
  console.log("Detalles del error:", {
    code: error.code,
    message: error.message,
    details: error.details
  });
}

