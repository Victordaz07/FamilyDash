# 🚀 ROBUST REGISTRATION SYSTEM - SETUP GUIDE

## 📋 **VARIABLES DE ENTORNO REQUERIDAS**

### **1. Cloudflare Turnstile (CAPTCHA)**

#### **Obtener Site Key y Secret Key:**
1. Ve a [Cloudflare Turnstile](https://dash.cloudflare.com/profile/api-tokens)
2. Crea un nuevo sitio con tu dominio
3. Copia el **Site Key** y **Secret Key**

#### **Configurar en Firebase Functions:**
```bash
firebase functions:secrets:set TURNSTILE_SITE_KEY
firebase functions:secrets:set TURNSTILE_SECRET_KEY
```

#### **Actualizar en el código:**
- **Web:** `web/public/robust-signup.html` - línea 245
- **Mobile:** `src/screens/RobustSignupScreen.tsx` - línea 180

### **2. Stripe (Pagos)**

#### **Obtener API Keys:**
1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copia **Publishable Key** y **Secret Key**

#### **Configurar en Firebase Functions:**
```bash
firebase functions:secrets:set STRIPE_PUBLISHABLE_KEY
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

#### **Configurar Webhook:**
1. En Stripe Dashboard → Webhooks
2. Endpoint: `https://us-central1-family-dash-15944.cloudfunctions.net/stripeWebhook`
3. Eventos: `checkout.session.completed`
4. Copia el **Webhook Secret**

### **3. Resend (Email Premium)**

#### **Obtener API Key:**
1. Ve a [Resend Dashboard](https://resend.com/api-keys)
2. Crea una nueva API Key

#### **Configurar en Firebase Functions:**
```bash
firebase functions:secrets:set RESEND_API_KEY
```

### **4. Variables del Sistema**

#### **Configurar en Firebase Functions:**
```bash
firebase functions:secrets:set ADMIN_MIN_AGE=18
firebase functions:secrets:set ADMIN_ACTIVATION_FEE_USD=200
```

## 🔧 **CONFIGURACIÓN DE FIREBASE**

### **1. Actualizar Firebase Config en el código:**

#### **Web (robust-signup.html):**
```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "family-dash-15944.firebaseapp.com",
  projectId: "family-dash-15944",
  storageBucket: "family-dash-15944.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

#### **Mobile (RobustSignupScreen.tsx):**
```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "family-dash-15944.firebaseapp.com",
  projectId: "family-dash-15944",
  storageBucket: "family-dash-15944.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

### **2. Configurar Firebase Auth:**
1. Ve a Firebase Console → Authentication → Sign-in method
2. Habilita **Email/Password** y **Google**
3. Configura dominios autorizados

### **3. Configurar Firebase Firestore:**
1. Despliega las nuevas reglas:
```bash
firebase deploy --only firestore:rules
```

## 📱 **CONFIGURACIÓN MÓVIL**

### **1. Instalar dependencias:**
```bash
npm install react-native-webview
```

### **2. Configurar Android (android/app/src/main/AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### **3. Configurar iOS (ios/FamilyDash/Info.plist):**
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

## 🌐 **CONFIGURACIÓN WEB**

### **1. Actualizar enlaces en el código:**
- Cambiar todas las URLs de `family-dash-15944` a tu dominio real
- Actualizar URLs de redirección en Stripe

### **2. Configurar CORS (si es necesario):**
```javascript
// En las Cloud Functions, agregar headers CORS si es necesario
res.set('Access-Control-Allow-Origin', '*');
res.set('Access-Control-Allow-Methods', 'GET, POST');
res.set('Access-Control-Allow-Headers', 'Content-Type');
```

## 🚀 **DEPLOYMENT**

### **1. Deployar Cloud Functions:**
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### **2. Deployar Firestore Rules:**
```bash
firebase deploy --only firestore:rules
```

### **3. Deployar Web Hosting:**
```bash
firebase deploy --only hosting
```

## 🧪 **TESTING**

### **1. Probar registro web:**
1. Ve a `/robust-signup.html`
2. Completa el formulario
3. Verifica CAPTCHA
4. Confirma que se crea la cuenta

### **2. Probar registro móvil:**
1. Navega a `RobustSignupScreen`
2. Completa el formulario
3. Completa CAPTCHA en WebView
4. Confirma que se crea la cuenta

### **3. Probar activación de admin:**
1. Regístrate como usuario regular
2. Ve al dashboard
3. Haz clic en "Activar Admin"
4. Completa el pago de $2
5. Verifica que se promociona a admin

## 🔍 **TROUBLESHOOTING**

### **Error: CAPTCHA no funciona**
- Verifica que las keys de Turnstile sean correctas
- Confirma que el dominio esté registrado en Turnstile

### **Error: Stripe webhook no funciona**
- Verifica que el webhook endpoint sea correcto
- Confirma que el webhook secret sea correcto
- Revisa los logs de Cloud Functions

### **Error: Email no se envía**
- Verifica la API key de Resend
- Confirma que el dominio esté verificado en Resend

### **Error: Firestore rules**
- Verifica que las reglas se hayan desplegado correctamente
- Revisa los logs de Firestore en Firebase Console

## 📊 **MONITOREO**

### **1. Cloud Functions Logs:**
```bash
firebase functions:log --only registerUser
firebase functions:log --only createAdminActivationCheckout
firebase functions:log --only stripeWebhook
```

### **2. Firebase Console:**
- Authentication → Users
- Firestore → Data
- Functions → Logs

### **3. Stripe Dashboard:**
- Payments → Events
- Webhooks → Logs

## 🎯 **PRÓXIMOS PASOS**

1. ✅ Configurar todas las variables de entorno
2. ✅ Actualizar Firebase config en el código
3. ✅ Desplegar Cloud Functions
4. ✅ Desplegar Firestore Rules
5. ✅ Probar registro web y móvil
6. ✅ Probar activación de admin
7. ✅ Monitorear logs y errores
8. ✅ Optimizar y mejorar UX

---

**¡Sistema de Registro Robusto listo para producción! 🚀**
