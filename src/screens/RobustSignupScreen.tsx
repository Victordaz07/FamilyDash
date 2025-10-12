import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, sendEmailVerification } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6KqV2FmWgKqV2FmWgKqV2FmWgKqV2F",
  authDomain: "family-dash-15944.firebaseapp.com",
  projectId: "family-dash-15944",
  storageBucket: "family-dash-15944.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

interface RobustSignupScreenProps {
  navigation: any;
}

export default function RobustSignupScreen({ navigation }: RobustSignupScreenProps) {
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [wantsAdmin, setWantsAdmin] = useState(true);
  
  // UI state
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const webViewRef = useRef<WebView>(null);

  const handleCaptchaSuccess = (token: string) => {
    setCaptchaToken(token);
    setShowCaptcha(false);
    setMessage('✅ Verificación completada');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCaptchaError = () => {
    setCaptchaToken(null);
    setShowCaptcha(false);
    setMessage('❌ Error en la verificación. Inténtalo de nuevo.');
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubmit = async () => {
    if (!captchaToken) {
      setMessage('Por favor, completa la verificación de seguridad.');
      return;
    }

    if (!fullName || !email || !password || !dob) {
      setMessage('Por favor, completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Call the registerUser Cloud Function
      const registerUser = httpsCallable(functions, 'registerUser');
      const result = await registerUser({
        fullName,
        email,
        password,
        dob,
        wantsAdmin,
        captchaToken
      });

      const data = result.data as any;

      // Sign in with custom token
      const userCredential = await signInWithCustomToken(auth, data.customToken);
      
      // Send email verification
      await sendEmailVerification(userCredential.user, {
        url: 'https://family-dash-15944.web.app/verified.html'
      });

      // Show success message
      if (data.role === 'parent-admin') {
        Alert.alert(
          '¡Cuenta creada exitosamente! 🎉',
          'Has sido asignado como Administrador de familia.\n\nRevisa tu correo para verificar tu cuenta.',
          [
            {
              text: 'Continuar',
              onPress: () => navigation.navigate('EmailVerification')
            }
          ]
        );
      } else {
        Alert.alert(
          '¡Cuenta creada exitosamente! 🎉',
          'Revisa tu correo para verificar tu cuenta.\n\nPuedes activar privilegios de Administrador más tarde.',
          [
            {
              text: 'Continuar',
              onPress: () => navigation.navigate('EmailVerification')
            }
          ]
        );
      }

      // Clear form
      setFullName('');
      setEmail('');
      setPassword('');
      setDob('');
      setWantsAdmin(true);
      setCaptchaToken(null);
      setMessage('');

    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.';
      
      if (error.code === 'functions/failed-precondition') {
        if (error.message === 'UNDERAGE_ADMIN') {
          errorMessage = 'Debes ser mayor de edad para ser Administrador. Puedes registrarte como miembro regular.';
          setWantsAdmin(false);
        } else if (error.message === 'CAPTCHA verification failed') {
          errorMessage = 'Error en la verificación de seguridad. Inténtalo de nuevo.';
        }
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está registrado. Ve a inicio de sesión.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderCaptchaModal = () => (
    <Modal
      visible={showCaptcha}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Verificación de Seguridad</Text>
          <TouchableOpacity
            onPress={() => setShowCaptcha(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <WebView
          ref={webViewRef}
          source={{
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verificación de Seguridad</title>
                <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #0f172a;
                    color: #e5e7eb;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    padding: 20px;
                  }
                  .container {
                    text-align: center;
                    max-width: 400px;
                  }
                  h1 {
                    font-size: 24px;
                    margin-bottom: 16px;
                    color: #10b981;
                  }
                  p {
                    font-size: 16px;
                    margin-bottom: 32px;
                    color: #94a3b8;
                    line-height: 1.5;
                  }
                  .turnstile-container {
                    display: flex;
                    justify-content: center;
                    margin: 20px 0;
                  }
                  .error {
                    color: #ef4444;
                    font-size: 14px;
                    margin-top: 16px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>🔒 Verificación de Seguridad</h1>
                  <p>Completa la verificación para proteger tu cuenta y la de tu familia.</p>
                  <div class="turnstile-container">
                    <div class="cf-turnstile" 
                         data-sitekey="0x4AAAAAAAbXqV2FmWgKqV2F" 
                         data-callback="onSolved"
                         data-expired-callback="onExpired"
                         data-error-callback="onError">
                    </div>
                  </div>
                  <div id="error" class="error" style="display: none;">
                    Error en la verificación. Inténtalo de nuevo.
                  </div>
                </div>
                
                <script>
                  function onSolved(token) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({type: 'success', token: token}));
                  }
                  
                  function onExpired() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({type: 'expired'}));
                  }
                  
                  function onError(error) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({type: 'error', error: error}));
                  }
                </script>
              </body>
              </html>
            `
          }}
          style={styles.webView}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              switch (data.type) {
                case 'success':
                  handleCaptchaSuccess(data.token);
                  break;
                case 'expired':
                case 'error':
                  handleCaptchaError();
                  break;
              }
            } catch (error) {
              console.error('Error parsing WebView message:', error);
              handleCaptchaError();
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Registro con seguridad avanzada</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Tu nombre completo"
              placeholderTextColor="#6b7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#6b7280"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de nacimiento</Text>
            <TextInput
              style={styles.input}
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#6b7280"
            />
            <Text style={styles.helpText}>
              Se usa solo para validar si puedes ser Administrador
            </Text>
          </View>

          <View style={styles.checkboxGroup}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setWantsAdmin(!wantsAdmin)}
            >
              <Text style={[styles.checkboxIcon, wantsAdmin && styles.checkboxChecked]}>
                {wantsAdmin ? '☑️' : '☐'}
              </Text>
              <Text style={styles.checkboxLabel}>
                Quiero ser Administrador de mi familia (si soy adulto)
              </Text>
            </TouchableOpacity>
          </View>

          {wantsAdmin && (
            <View style={styles.adminInfo}>
              <Text style={styles.adminInfoTitle}>¿Qué significa ser Administrador?</Text>
              <Text style={styles.adminInfoText}>
                • Crear y gestionar tu familia{'\n'}
                • Invitar miembros con códigos{'\n'}
                • Configurar permisos y roles{'\n'}
                • Acceso al panel web administrativo{'\n'}
                • Gestionar planes y facturación
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.captchaButton, captchaToken && styles.captchaButtonSuccess]}
            onPress={() => setShowCaptcha(true)}
          >
            <Text style={styles.captchaButtonText}>
              {captchaToken ? '✅ Verificación completada' : '🔒 Completar verificación de seguridad'}
            </Text>
          </TouchableOpacity>

          {message ? (
            <View style={[styles.messageContainer, message.includes('✅') ? styles.messageSuccess : styles.messageError]}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.submitButton, (!captchaToken || loading) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!captchaToken || loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.submitButtonText}>Creando cuenta...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              ¿Ya tienes cuenta? <Text style={styles.loginLinkBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderCaptchaModal()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  checkboxGroup: {
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  checkboxChecked: {
    color: '#10b981',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
    lineHeight: 20,
  },
  adminInfo: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  adminInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 8,
  },
  adminInfoText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  captchaButton: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  captchaButtonSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
  },
  captchaButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  messageSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  messageError: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  messageText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLinkBold: {
    color: '#10b981',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  },
});
