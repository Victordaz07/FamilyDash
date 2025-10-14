/**
 * Componente para verificar email con opciones de reenvío y verificación
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RealAuthService } from '@/services/auth/RealAuthService';
import { useAuth } from '@/store';

const authService = new RealAuthService();

export const VerifyEmailBlock: React.FC = () => {
  const { user, userDoc } = useAuth();
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState<number>(0);
  
  const isVerified = !!user?.emailVerified || !!userDoc?.emailVerified;

  if (isVerified) {
    return (
      <View style={styles.verifiedContainer}>
        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
        <Text style={styles.verifiedText}>✅ Tu correo está verificado.</Text>
      </View>
    );
  }

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setBusy(true);
    try {
      await authService.resendVerificationEmail();
      Alert.alert('Correo enviado', 'Revisa tu bandeja y Spam.');
      
      // Iniciar cooldown de 60 segundos
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((s) => {
          if (s <= 1) { 
            clearInterval(interval); 
            return 0; 
          }
          return s - 1;
        });
      }, 1000);
      
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo enviar el correo.');
    } finally {
      setBusy(false);
    }
  };

  const handleCheck = async () => {
    setBusy(true);
    try {
      const ok = await authService.reloadAndSyncEmailVerified();
      if (ok) {
        Alert.alert('¡Listo!', 'Tu correo ya aparece verificado.');
      } else {
        Alert.alert('Aún no', 'Toca el enlace del correo y vuelve a "Comprobar".');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar el estado del correo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="warning" size={20} color="#F59E0B" />
        <Text style={styles.title}>⚠️ Verifica tu correo</Text>
      </View>
      
      <Text style={styles.description}>
        Te enviamos un enlace de verificación. Abre el email y toca el link para activar tu cuenta.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          disabled={busy || cooldown > 0} 
          onPress={handleResend}
          style={[
            styles.resendButton, 
            { opacity: (busy || cooldown > 0) ? 0.6 : 1 }
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="mail" size={16} color="#fff" />
              <Text style={styles.buttonText}>
                Reenviar correo {cooldown > 0 ? `(${cooldown}s)` : ''}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          disabled={busy} 
          onPress={handleCheck}
          style={[
            styles.checkButton, 
            { opacity: busy ? 0.6 : 1 }
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.buttonText}>
                Ya verifiqué — Comprobar
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff6e5',
    marginVertical: 8,
    gap: 12,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#e8fff2',
    marginVertical: 8,
    gap: 8,
  },
  verifiedText: {
    fontWeight: '600',
    color: '#10B981',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 8,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
    gap: 8,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#059669',
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
