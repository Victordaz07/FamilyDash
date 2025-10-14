/**
 * Pantalla dedicada para verificación de email
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RealAuthService } from '@/services/auth/RealAuthService';

const authService = new RealAuthService();

export default function VerifyEmailScreen() {
  const navigation = useNavigation<any>();
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setBusy(true);
    try {
      await authService.resendVerificationEmail();
      Alert.alert('Correo enviado', 'Revisa tu bandeja (y spam).');
      
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
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el correo de verificación.');
    } finally {
      setBusy(false);
    }
  };

  const handleCheck = async () => {
    setBusy(true);
    try {
      const ok = await authService.reloadAndSyncEmailVerified();
      if (ok) {
        Alert.alert('¡Perfecto!', 'Tu correo está verificado. ¡Bienvenido a FamilyDash!', [
          { 
            text: 'Continuar', 
            onPress: () => navigation.reset({ 
              index: 0, 
              routes: [{ name: 'Main' }] 
            })
          }
        ]);
      } else {
        Alert.alert('Aún no', 'Toca el enlace del email y vuelve a comprobar.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar el estado del correo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <LinearGradient colors={["#7B6CF6", "#E96AC0"]} style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Ionicons name="mail" size={40} color="white" />
          <Text style={styles.headerTitle}>Verificación de Correo</Text>
          <Text style={styles.headerSubtitle}>
            Activa tu cuenta para acceder a todas las funciones
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.body}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-unread" size={60} color="#7B6CF6" />
        </View>

        <Text style={styles.title}>¡Revisa tu correo!</Text>
        
        <Text style={styles.description}>
          Te hemos enviado un enlace de verificación a tu dirección de correo electrónico. 
          Abre el email y toca el enlace para activar tu cuenta.
        </Text>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Consejos:</Text>
          <Text style={styles.tip}>• Revisa tu carpeta de Spam o Correo no deseado</Text>
          <Text style={styles.tip}>• El enlace puede tardar unos minutos en llegar</Text>
          <Text style={styles.tip}>• Si no lo encuentras, puedes reenviarlo</Text>
        </View>

        {/* Action Buttons */}
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
                <Ionicons name="refresh" size={20} color="#fff" />
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
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>
                  Ya verifiqué — Comprobar
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿Problemas? Contacta a soporte en help@familydash.com
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9FF',
  },
  content: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#EEE',
    textAlign: 'center',
    lineHeight: 20,
  },
  body: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  tipsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#7B6CF6',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#374151',
    borderRadius: 12,
    gap: 8,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#059669',
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
