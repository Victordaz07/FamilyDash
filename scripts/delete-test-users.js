/**
 * Script para eliminar usuarios de prueba específicos
 * Elimina los usuarios: viruizbc@gmail.com y daz.graphic1306@gmail.com
 */

const admin = require('firebase-admin');

// Configurar Firebase Admin SDK
// Asegúrate de tener las credenciales de servicio configuradas
const serviceAccount = require('./firebase-service-account.json'); // Necesitarás este archivo

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Tu project ID
  projectId: 'familydash-15944' // Tu project ID real
});

const auth = admin.auth();
const firestore = admin.firestore();

// Emails de usuarios a eliminar
const usersToDelete = [
  'viruizbc@gmail.com',
  'daz.graphic1306@gmail.com'
];

async function deleteUserByEmail(email) {
  try {
    console.log(`🔍 Buscando usuario con email: ${email}`);
    
    // Buscar usuario por email
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Usuario encontrado: ${userRecord.uid}`);
    
    // Eliminar documentos relacionados en Firestore
    console.log(`🗑️ Eliminando documentos de Firestore para ${userRecord.uid}...`);
    const userDocRef = firestore.collection('users').doc(userRecord.uid);
    await userDocRef.delete();
    console.log(`✅ Documento de usuario eliminado de Firestore`);
    
    // Eliminar otros documentos relacionados (ajusta según tu estructura)
    const userGoalsRef = firestore.collection('userGoals').doc(userRecord.uid);
    await userGoalsRef.delete();
    console.log(`✅ Documentos de metas eliminados`);
    
    // Eliminar usuario de Firebase Auth
    await auth.deleteUser(userRecord.uid);
    console.log(`✅ Usuario ${email} eliminado exitosamente`);
    
    return true;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`⚠️ Usuario ${email} no encontrado (ya eliminado o no existe)`);
      return false;
    } else {
      console.error(`❌ Error eliminando usuario ${email}:`, error.message);
      return false;
    }
  }
}

async function deleteAllTestUsers() {
  console.log('🚀 Iniciando eliminación de usuarios de prueba...\n');
  
  let successCount = 0;
  let totalCount = usersToDelete.length;
  
  for (const email of usersToDelete) {
    const success = await deleteUserByEmail(email);
    if (success) successCount++;
    console.log(''); // Línea en blanco para separar
  }
  
  console.log('📊 Resumen:');
  console.log(`   ✅ Usuarios eliminados: ${successCount}/${totalCount}`);
  console.log(`   📧 Emails procesados: ${usersToDelete.join(', ')}`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 ¡Todos los usuarios de prueba han sido eliminados exitosamente!');
  } else {
    console.log('\n⚠️ Algunos usuarios no pudieron ser eliminados. Revisa los errores arriba.');
  }
  
  // Cerrar conexiones
  process.exit(0);
}

// Ejecutar el script
deleteAllTestUsers().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
