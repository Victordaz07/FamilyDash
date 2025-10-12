// Script para enviar email premium manualmente
// Ejecutar en la consola del navegador en https://family-dash-15944.web.app/login

async function sendPremiumEmailTest() {
  try {
    console.log('🚀 Enviando email premium de prueba...');
    
    // Llamar a nuestra función personalizada
    const resendVerification = firebase.functions().httpsCallable('resendVerificationEmail');
    const result = await resendVerification();
    
    if (result.data.success) {
      console.log('✅ Email premium enviado exitosamente!');
      alert('¡Email premium enviado! Revisa tu bandeja de entrada.');
    } else {
      console.error('❌ Error:', result.data.message);
      alert('Error: ' + result.data.message);
    }
  } catch (error) {
    console.error('❌ Error enviando email premium:', error);
    alert('Error enviando email: ' + error.message);
  }
}

// Ejecutar la función
sendPremiumEmailTest();
