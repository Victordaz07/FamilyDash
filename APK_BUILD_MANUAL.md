# 📱 FamilyDash APK Build Manual

## 🚀 Generación Manual de APK (Sin Expo)

Este documento explica cómo generar el APK de FamilyDash manualmente usando Android Studio/Gradle.

---

## 📋 Prerrequisitos

### 1. **Herramientas Necesarias**
- ✅ Android Studio (última versión)
- ✅ Java Development Kit (JDK) 17+
- ✅ Android SDK (API 34+)
- ✅ Node.js 18+
- ✅ npm/yarn

### 2. **Variables de Entorno**
```bash
# Windows
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set JAVA_HOME=C:\Program Files\Java\jdk-17

# Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
```

---

## 🔧 Configuración Inicial

### 1. **Generar Keystore de Producción**
```bash
# Ejecutar una sola vez
keytool -genkey -v -keystore android/app/familydash-release-key.keystore -alias familydash-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. **Configurar gradle.properties**
Agregar al archivo `android/gradle.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=familydash-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=familydash-key-alias
MYAPP_RELEASE_STORE_PASSWORD=tu_password_store
MYAPP_RELEASE_KEY_PASSWORD=tu_password_key
```

---

## 🏗️ Proceso de Build

### **Opción 1: Scripts Automatizados**

#### Windows:
```bash
# Generar keystore
generate-keystore.bat

# Build completo
build-apk.bat
```

#### Linux/Mac:
```bash
# Generar keystore
./generate-keystore.sh

# Build completo
./build-apk.sh
```

### **Opción 2: Comandos Manuales**

#### 1. **Limpiar Proyecto**
```bash
cd android
./gradlew clean
```

#### 2. **Instalar Dependencias**
```bash
npm install
```

#### 3. **Generar Bundle JavaScript**
```bash
npx expo export --platform android --output-dir android/app/src/main/assets
```

#### 4. **Compilar APK Debug**
```bash
cd android
./gradlew assembleDebug
```

#### 5. **Compilar APK Release**
```bash
cd android
./gradlew assembleRelease
```

---

## 📁 Archivos Generados

### **APK Debug**
- 📍 `android/app/build/outputs/apk/debug/app-debug.apk`
- 🔧 Para testing y desarrollo
- ⚡ Compilación rápida

### **APK Release**
- 📍 `android/app/build/outputs/apk/release/app-release.apk`
- 🚀 Para distribución
- 🔒 Firmado con keystore de producción
- 📦 Optimizado y minificado

---

## 🔐 Configuración de Firma

### **Keystore Debug** (Automático)
- 📁 `android/app/debug.keystore`
- 🔑 Contraseña: `android`
- 👤 Alias: `androiddebugkey`

### **Keystore Release** (Manual)
- 📁 `android/app/familydash-release-key.keystore`
- 🔑 Contraseña personalizada
- 👤 Alias: `familydash-key-alias`

---

## 🔥 Configuración Firebase

### **Archivos Configurados**
- ✅ `android/app/google-services.json`
- ✅ `android/build.gradle` (Google Services plugin)
- ✅ `android/app/build.gradle` (Plugin aplicado)

### **Servicios Habilitados**
- 🔐 Authentication
- 🗄️ Firestore Database
- 📁 Cloud Storage
- 📊 Analytics
- ⚡ Performance Monitoring

---

## 🐛 Solución de Problemas

### **Error: "SDK location not found"**
```bash
# Crear local.properties en android/
echo "sdk.dir=C:\\Users\\%USERNAME%\\AppData\\Local\\Android\\Sdk" > android/local.properties
```

### **Error: "Keystore not found"**
- ✅ Verificar que `familydash-release-key.keystore` existe en `android/app/`
- ✅ Verificar configuración en `gradle.properties`

### **Error: "Google Services not found"**
- ✅ Verificar que `google-services.json` existe en `android/app/`
- ✅ Verificar plugin en `build.gradle`

### **Error: "Bundle not found"**
```bash
# Regenerar bundle
npx expo export --platform android --output-dir android/app/src/main/assets
```

---

## 📊 Optimizaciones Incluidas

### **Release Build**
- ✅ **Minificación**: Código optimizado
- ✅ **Shrinking**: Recursos no utilizados eliminados
- ✅ **PNG Crunching**: Imágenes comprimidas
- ✅ **ProGuard**: Ofuscación de código
- ✅ **Hermes**: Motor JavaScript optimizado

### **Configuración Gradle**
- ✅ **Multi-arch**: ARM, x86 soportados
- ✅ **New Architecture**: TurboModules habilitado
- ✅ **Edge-to-Edge**: UI moderna
- ✅ **Bundle Compression**: APK más pequeño

---

## 🎯 Comandos Útiles

### **Build Específico**
```bash
# Solo debug
./gradlew assembleDebug

# Solo release
./gradlew assembleRelease

# Bundle AAB (Google Play)
./gradlew bundleRelease
```

### **Limpieza**
```bash
# Limpiar build
./gradlew clean

# Limpiar cache
./gradlew cleanBuildCache
```

### **Verificación**
```bash
# Verificar configuración
./gradlew tasks

# Verificar dependencias
./gradlew dependencies
```

---

## ⚠️ Notas Importantes

### **Seguridad**
- 🔒 **NUNCA** subir keystore al repositorio
- 🔒 Guardar copia de seguridad del keystore
- 🔒 Usar contraseñas seguras
- 🔒 Mantener privacidad de gradle.properties

### **Distribución**
- 📱 APK Release para distribución directa
- 🏪 AAB para Google Play Store
- 🔄 Mantener versiones consistentes
- 📝 Documentar cambios en versiones

---

## 🎉 ¡Listo!

Con esta configuración puedes generar APKs de FamilyDash manualmente sin depender de Expo Build Service.

**Archivos importantes:**
- 📄 `build-apk.bat` / `build-apk.sh` - Scripts de build
- 🔑 `generate-keystore.bat` - Generador de keystore
- 📋 `keystore-setup.md` - Instrucciones de keystore
- 🔥 `google-services.json` - Configuración Firebase

**¡Happy Building! 🚀**
