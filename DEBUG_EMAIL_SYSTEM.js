// Script de debug para el sistema de emails
// Ejecutar en la consola del navegador

async function debugEmailSystem() {
  try {
    console.log('🔍 Debugging email system...');
    
    // 1. Verificar usuario actual
    const user = firebase.auth().currentUser;
    if (!user) {
      console.log('❌ No hay usuario logueado');
      return;
    }
    
    console.log('👤 Usuario actual:', {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName
    });
    
    // 2. Verificar si Firebase Functions está disponible
    if (!firebase.functions) {
      console.log('❌ Firebase Functions no está disponible');
      return;
    }
    
    console.log('✅ Firebase Functions disponible');
    
    // 3. Intentar llamar a la función
    console.log('📞 Llamando a resendVerificationEmail...');
    const resendVerification = firebase.functions().httpsCallable('resendVerificationEmail');
    const result = await resendVerification();
    
    console.log('📧 Resultado:', result.data);
    
    if (result.data.success) {
      console.log('✅ Email premium enviado exitosamente!');
      alert('¡Email premium enviado! Revisa tu bandeja de entrada.');
    } else {
      console.error('❌ Error:', result.data.message);
      alert('Error: ' + result.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error completo:', error);
    console.log('🔍 Detalles del error:', {
      code: error.code,
      message: error.message,
      details: error.details
    });
    alert('Error: ' + error.message);
  }
}

// Ejecutar debug
debugEmailSystem();
