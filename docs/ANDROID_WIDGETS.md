# Android Widgets - FamilyDash

## ⚠️ **Limitaciones de Expo**

Los widgets nativos de Android **NO son compatibles** con Expo Go o Expo managed workflow. Los archivos Java y XML que estaban en este proyecto han sido eliminados porque causaban errores de compilación.

## 🔧 **Alternativas para Widgets en Expo**

### 1. **Expo Development Build (Recomendado)**
Para usar widgets nativos de Android, necesitas crear un **Development Build**:

```bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Crear development build
eas build --profile development --platform android
```

### 2. **Expo Bare Workflow**
Migrar a bare workflow para tener control completo sobre el código nativo:

```bash
npx expo eject
```

### 3. **Widgets Simulados (Actual)**
Por ahora, el módulo "Android Widgets" muestra widgets simulados en la UI de la app, que es funcional para demostración pero no son widgets reales del home screen.

## 📱 **Widgets Planificados**

1. **Tasks Widget** - Lista de tareas pendientes
2. **Penalty Timer Widget** - Timer de penalidades activas  
3. **Activities Widget** - Próximas actividades familiares
4. **Goals Progress Widget** - Progreso de metas familiares
5. **Safe Room Alert Widget** - Acceso rápido al Safe Room

## 🚀 **Próximos Pasos**

1. **Para desarrollo actual**: Los widgets simulados funcionan perfectamente
2. **Para producción**: Considerar migrar a Development Build o Bare Workflow
3. **Para testing**: Usar la pantalla "Android Widgets" en la app

## 📝 **Nota Técnica**

Los widgets nativos requieren:
- Android SDK completo
- Código Java/Kotlin nativo
- Configuración de AndroidManifest.xml
- Recursos XML para layouts

Esto no es compatible con Expo Go, pero sí con Development Builds.
