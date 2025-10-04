# 🔥 CONFIGURACIÓN FIREBASE - GUÍA PASO A PASO

## 📋 INSTRUCCIONES COMPLETAS PARA CONFIGURAR FIREBASE REAL

### PASO 1: Crear Proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click **"Crear un proyecto"**
3. **Nombre del proyecto**: `family-dash` (o tu nombre preferido)
4. **Localización**: Selecciona tu región más cercana (ej: us-central1)
5. **Google Analytics**: ✅ Habilitar Google Analytics
6. Click **"Crear proyecto"**
7. Espera a que se termine de crear (puede tomar 1-2 minutos)

### PASO 2: Configurar Authentication
1. En el panel izquierdo, click **"Authentication"**
2. Click **"Get started"**
3. Ve a la pestaña **"Sign-in method"**
4. **Email/Password**:
   - Click en **"Email/Password"**
   - Click **"Enable"** en la primera opción
   - Click **"Save"**
5. **Google**:
   - Click en **"Google"** 
   - Click **"Enable"**
   - Completa:
     - Project support email: tu email
     - Project public-facing name: FamilyDash
   - Click **"Save"**

### PASO 3: Configurar Firestore Database
1. En el panel izquierdo, click **"Firestore Database"**
2. Click **"Create database"**
3. Selecciona **"Start in test mode"** ⚠️
4. **Ubicación**: Selecciona la misma región que tu proyecto
5. Click **"Done"**

### PASO 4: Configurar Storage
1. En el panel izquierdo, click **"Storage"**
2. Click **"Get started"**
3. **Reglas de seguridad**: Mantener por defecto (**"Start in test mode"**)
4. **Ubicación**: Misma región que el proyecto
5. Click **"Done"**

### PASO 5: Obtener Configuración de Firebase
1. Click en el icono ⚙️ **"Project settings"** (arriba a la izquierda)
2. Ve a la pestaña **"General"**
3. Scroll hasta la sección **"Tus apps"**
4. Click en el icono **Web `</>`** 
5. **App nickname**: `FamilyDash Web App`
6. **¿También configurar Firebase Hosting?**: ❌ NO marcar
7. Click **"Register app"**
8. **📋 COPIA COMPLETA de la configuración** que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXxxx",
  authDomain: "tu-proyecto-abc123.firebaseapp.com",
  projectId: "tu-proyecto-abc123",
  storageBucket: "tu-proyecto-abc123.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:fedcba987654321",
  measurementId: "G-ABCDEF123456"
};
```

### PASO 6: Configurar Variables de Entorno
1. Crea un archivo `.env` en la raíz del proyecto FamilyDash:

```bash
# En el terminal, ve a la carpeta del proyecto
cd "Z:\Dashboard Familiar\FamilyDash"

# Crea el archivo .env
touch .env
```

2. **Edita el archivo `.env`** y pega TU configuración:

```env
# Pega aquí TU configuración de Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXxxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto-abc123.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-abc123
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto-abc123.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321098
EXPO_PUBLIC_FIREBASE_APP_ID=1:987654321098:web:fedcba987654321
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF123456
```

### PASO 7: Crear Estructura de Datos en Firestore
Ejecuta estos comandos en la consola de Firebase (Tools → Cloud Shell):

```javascript
// Crear colección de familias
db.collection("families").doc("demo-family").set({
  name: "Family Demo",
  created: new Date(),
  members: [],
  settings: { notifications: true }
});

// Crear usuario demo
db.collection("families").doc("demo-family").collection("members").doc("demo-user").set({
  name: "Usuario Demo",
  email: "demo@family.com", 
  role: "admin",
  joined: new Date()
});
```

### PASO 8: Configurar Reglas de Seguridad (Básicas)

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura para usuarios autenticados de su propia familia
    match /families/{familyId} {
      allow read, write: if request.auth != null && request.auth.uid == familyId;
      
      match /{subcollection=**} {
        allow read, write: if request.auth != null && request.auth.uid == familyId;
      }
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir usuarios autenticados para subir archivos
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /families/{familyId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == familyId;
    }
  }
}
```

### PASO 9: Verificar Configuración
1. Reinicia el servidor de desarrollo:
```bash
npm start
```

2. Ve a la app y prueba crear una cuenta/ingresar

3. Ve a Firebase Console → Authentication → Users
   - Deberías ver tu usuario creado

4. Ve a Firestore Database
   - Deberías ver tus datos guardándose en tiempo real

## ✅ CHECKLIST FINAL

- [ ] Proyecto Firebase creado
- [ ] Authentication configurado (Email + Google)
- [ ] Firestore Database creado
- [ ] Storage configurado  
- [ ] Variables de entorno configuradas en `.env`
- [ ] Reglas de seguridad aplicadas
- [ ] Usuario de prueba creado
- [ ] App conectada y funcionando

## 🔧 SOLUCIÓN DE PROBLEMAS

**Error: "Firebase not initialized"**
→ Verifica que las variables de entorno estén correctas

**Error: "Permission denied"**
→ Aplica las reglas de seguridad en Firestore y Storage

**Error: "Project not found"**
→ Verifica el projectId en las variables de entorno

---

## 📞 SI NECESITAS AYUDA

Si tienes algún problema, comparte:
1. Los errores exactos que ves
2. Tu configuración Firebase (sin credenciales sensibles)
3. El paso donde te quedaste

¡Y listo! Tu app FamilyDash estará conectada a Firebase real 🚀
