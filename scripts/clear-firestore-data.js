/**
 * Script para limpiar datos de Firestore relacionados con usuarios de prueba
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  // Reemplaza con tu configuración real
  apiKey: "tu-api-key",
  authDomain: "familydash-15944.firebaseapp.com",
  projectId: "familydash-15944",
  storageBucket: "familydash-15944.appspot.com",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Emails de usuarios a limpiar
const emailsToClean = ['viruizbc@gmail.com', 'daz.graphic1306@gmail.com'];

async function clearFirestoreData() {
  console.log('🧹 Limpiando datos de Firestore...\n');
  
  try {
    for (const email of emailsToClean) {
      console.log(`🔍 Limpiando datos para: ${email}`);
      
      // Buscar en colección 'users'
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, where('email', '==', email));
      const usersSnapshot = await getDocs(usersQuery);
      
      for (const userDoc of usersSnapshot.docs) {
        await deleteDoc(userDoc.ref);
        console.log(`✅ Usuario eliminado de Firestore: ${userDoc.id}`);
      }
      
      // Buscar en colección 'userGoals'
      const goalsRef = collection(db, 'userGoals');
      const goalsQuery = query(goalsRef, where('userEmail', '==', email));
      const goalsSnapshot = await getDocs(goalsQuery);
      
      for (const goalDoc of goalsSnapshot.docs) {
        await deleteDoc(goalDoc.ref);
        console.log(`✅ Meta eliminada: ${goalDoc.id}`);
      }
      
      console.log(`✅ Datos limpiados para ${email}\n`);
    }
    
    console.log('🎉 Limpieza de Firestore completada');
  } catch (error) {
    console.error('❌ Error limpiando Firestore:', error);
  }
}

clearFirestoreData();
