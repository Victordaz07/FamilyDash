# FamilyDash 📱

Una aplicación móvil de dashboard familiar desarrollada con React Native y Expo, diseñada para gestionar tareas, actividades, metas y comunicación familiar.

## 🚀 Características

- ✅ **6 Módulos Principales** - Tasks, Penalties, Activities, Goals, Safe Room, Device Tools
- ✅ **Navegación por Tabs** - Interfaz intuitiva con React Navigation
- ✅ **Estado Global** - Gestión de estado con Zustand
- ✅ **Firebase Integration** - Autenticación y base de datos (modo demo)
- ✅ **Widgets Android** - Soporte para widgets de pantalla de inicio
- ✅ **TypeScript** - Tipado estático para mejor desarrollo
- ✅ **Diseño Moderno** - UI/UX con gradientes y componentes nativos

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd FamilyDash
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Firebase** (opcional)
   - Copia `env.example` a `.env`
   - Configura tus credenciales de Firebase

4. **Iniciar el proyecto**
   ```bash
   npx expo start
   ```

## 🎯 Comandos de Ejecución

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npx expo start

# Para Android
npx expo start --android

# Para iOS
npx expo start --ios

# Para web
npx expo start --web
```

## 🏗️ Estructura del Proyecto

```
FamilyDash/
├── src/
│   ├── modules/           # Módulos principales
│   │   ├── tasks/         # Tareas y responsabilidades
│   │   ├── penalties/     # Sistema de penalizaciones
│   │   ├── activities/    # Actividades familiares
│   │   ├── goals/         # Metas familiares
│   │   ├── safeRoom/      # Cuarto seguro (mensajes de amor)
│   │   └── deviceTools/   # Herramientas de dispositivos
│   ├── components/        # Componentes reutilizables
│   ├── navigation/        # Configuración de navegación
│   ├── state/            # Estado global (Zustand)
│   ├── services/         # Servicios (Firebase, API)
│   ├── widgets/          # Widgets de Android
│   └── utils/            # Utilidades y helpers
├── docs/                 # Documentación
├── App.tsx              # Archivo principal
└── package.json
```

## 🧩 Módulos

### 1. 📋 Tasks & Responsibilities (Verde)
- Gestión de tareas familiares
- Asignación de responsabilidades
- Seguimiento de progreso
- Widget: "Today's Tasks" checklist

### 2. ⚠️ Penalties (Rojo)
- Sistema de penalizaciones
- Timer de penalizaciones activas
- Historial de penalizaciones
- Widget: "Active Penalty" con timer

### 3. 📅 Family Activities (Azul)
- Planificación de actividades familiares
- Calendario de eventos
- Seguimiento de participación
- Widget: "Weekly Activities"

### 4. 🏆 Goals (Dorado)
- Metas familiares e individuales
- Seguimiento de progreso
- Visualización de avances
- Widget: "Goals Progress"

### 5. ❤️ Safe Room (Rosa)
- Mensajes de amor y apoyo
- Comunicación familiar privada
- Notificaciones de mensajes nuevos
- Widget: "New Safe Room Message"

### 6. 📱 Device Tools (Púrpura)
- Control de dispositivos familiares
- Llamadas a todos los dispositivos
- Localización de dispositivos
- Widget: "Ring All Devices"

## 🔧 Tecnologías Utilizadas

- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **TypeScript** - Tipado estático
- **React Navigation** - Navegación
- **Zustand** - Gestión de estado
- **Firebase** - Backend y autenticación
- **Expo Linear Gradient** - Gradientes
- **React Native Android Widget** - Widgets nativos

## 📱 Widgets de Android

La aplicación incluye soporte completo para widgets de Android:

- **Tasks Widget** - Lista de tareas del día
- **Penalty Widget** - Timer de penalización activa
- **Activities Widget** - Próximas actividades
- **Goals Widget** - Progreso de metas
- **Safe Room Widget** - Nuevos mensajes
- **Device Tools Widget** - Llamar dispositivos

## 🔐 Autenticación

- **Firebase Auth** con Google Sign-In
- **Modo Demo** para desarrollo
- **Gestión de usuarios** familiares
- **Sincronización** en la nube

## 📊 Estado Global

El estado se gestiona con Zustand y incluye:

- **Tasks** - Lista de tareas y responsabilidades
- **Penalties** - Sistema de penalizaciones
- **Activities** - Actividades familiares
- **Goals** - Metas y progreso
- **Safe Room** - Mensajes de amor
- **User** - Información del usuario

## 🎨 Diseño

- **Colores por módulo** - Cada módulo tiene su color distintivo
- **Gradientes modernos** - Diseño atractivo y profesional
- **Iconos Ionicons** - Iconografía consistente
- **Responsive** - Adaptable a diferentes tamaños de pantalla

## 🚀 Próximas Características

- [ ] Sincronización en tiempo real
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Reportes y estadísticas
- [ ] Integración con calendario
- [ ] Chat familiar
- [ ] Geolocalización
- [ ] Backup automático

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

---

¡Desarrollado con ❤️ para familias!
