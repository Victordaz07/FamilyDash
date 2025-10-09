# ✅ CHECKLIST DE ARREGLOS - FamilyDash

Use este checklist para marcar los problemas que vaya arreglando.  
Formato: `- [ ]` = Pendiente | `- [x]` = Completado

---

## 🔴 CRÍTICO - Arreglar INMEDIATAMENTE

### Sistema de Emergencias

- [ ] Implementar Emergency Alert funcional
  - Archivo: `src/screens/SafeRoom/SafeRoomScreen.tsx:51`
  - Crear servicio real de alertas
- [ ] Implementar Emergency Mode funcional
  - Archivo: `src/screens/SafeRoom/SafeRoomScreen.tsx:67`
  - Integrar con sistema de notificaciones

### Detección de Internet

- [ ] Reemplazar mock network state con NetInfo real
  - Archivo: `src/services/offline/OfflineManager.ts:60-68`
  - Instalar y configurar @react-native-community/netinfo
  - Eliminar mock state

### Quick Actions

- [ ] Descomentar FamilyMembersScreen
  - Archivo: `src/navigation/SimpleAppNavigator.tsx:79`
- [ ] Descomentar AchievementsScreen
  - Archivo: `src/navigation/SimpleAppNavigator.tsx:80`
- [ ] Descomentar RecentActivityScreen
  - Archivo: `src/navigation/SimpleAppNavigator.tsx:81`
- [ ] Descomentar StatisticsScreen
  - Archivo: `src/navigation/SimpleAppNavigator.tsx:82`
- [ ] Registrar rutas en ProfileStack
  - Archivo: `src/navigation/SimpleAppNavigator.tsx:186-190`

### Device Ring

- [ ] Crear servicio real de Ring Device
  - Nuevo archivo: `src/services/DeviceRingService.ts`
- [ ] Implementar handleRingDevice con servicio real
  - Archivo: `src/screens/DashboardScreen.tsx:169-171`
- [ ] Implementar handleRingAllDevices con servicio real
  - Archivo: `src/screens/DashboardScreen.tsx:173-176`

---

## 🟡 ALTA PRIORIDAD - Arreglar esta Semana

### Analytics Dashboard

- [ ] Habilitar servicio de analytics
  - Archivo: `src/components/analytics/AnalyticsDashboard.tsx:67-84`
  - Descomentar código de analytics
- [ ] Implementar loadAnalyticsData real
  - Conectar con Firebase Analytics o similar
- [ ] Habilitar exportación de datos
  - Archivo: `src/components/analytics/AnalyticsDashboard.tsx:98-107`

### Video Recording

- [ ] Instalar expo-camera
  ```bash
  npx expo install expo-camera
  ```
- [ ] Implementar startVideoRecording
  - Archivo: `src/modules/safeRoom/services/mediaService.ts:228`
- [ ] Implementar stopVideoRecording
  - Archivo: `src/modules/safeRoom/services/mediaService.ts:234`
- [ ] Habilitar botón de video en NewEmotionalEntry
  - Archivo: `src/modules/safeRoom/screens/NewEmotionalEntry.tsx:414`

### Social Authentication

- [ ] Configurar Google OAuth
  - Instalar dependencias necesarias
  - Configurar Firebase Authentication
- [ ] Implementar Google Login
  - Archivo: `src/screens/RegisterScreen.tsx:170`
- [ ] Configurar Apple Sign In
  - Configurar Apple Developer Account
- [ ] Implementar Apple Login
  - Archivo: `src/screens/RegisterScreen.tsx:174`

### Language Selection

- [ ] Implementar selector de idioma funcional
  - Archivo: `src/screens/SettingsScreen.tsx:269`
- [ ] Configurar i18n correctamente
  - Revisar `src/locales/i18n.ts`
- [ ] Agregar traducciones faltantes
  - Completar `src/locales/es/*.json`

### Connection Features

- [ ] Implementar Connect Phone Contacts
  - Archivo: `src/screens/ProfileScreen.tsx:238`
  - Integrar expo-contacts
- [ ] Implementar Connect Email Apps
  - Archivo: `src/screens/ProfileScreen.tsx:244`
- [ ] Implementar Connect Cloud Storage
  - Archivo: `src/screens/ProfileScreen.tsx:250`

### Settings Features

- [ ] Implementar Reminders configuration
  - Archivo: `src/screens/SettingsScreen.tsx:335`
- [ ] Implementar Sounds configuration
  - Archivo: `src/screens/SettingsScreen.tsx:341`
- [ ] Implementar Connected Devices list
  - Archivo: `src/screens/SettingsScreen.tsx:365`
- [ ] Implementar Family Location sharing
  - Archivo: `src/screens/SettingsScreen.tsx:371`

### Profile Features

- [ ] Implementar handleAchievements con navegación real
  - Archivo: `src/screens/ProfileScreen.tsx:67`
- [ ] Implementar handleRecentActivity con navegación real
  - Archivo: `src/screens/ProfileScreen.tsx:71`
- [ ] Implementar handleStatistics con navegación real
  - Archivo: `src/screens/ProfileScreen.tsx:74`

### Widget Handlers

- [ ] Implementar onPress para TasksWidget
  - Archivo: `src/screens/AndroidWidgetsScreen.tsx:70`
- [ ] Implementar onPress para CalendarWidget
  - Archivo: `src/screens/AndroidWidgetsScreen.tsx:72`
- [ ] Implementar onPress para WeatherWidget
  - Archivo: `src/screens/AndroidWidgetsScreen.tsx:74`
- [ ] Implementar onPress para FamilyStatsWidget
  - Archivo: `src/screens/AndroidWidgetsScreen.tsx:76`

### Data Export

- [ ] Crear servicio de exportación real
  - Nuevo archivo: `src/services/DataExportService.ts`
- [ ] Implementar export en múltiples formatos
  - JSON, CSV, PDF

---

## 🟢 MEDIA PRIORIDAD - Refactoring

### Eliminar Archivos Backup

- [ ] Eliminar tasksStore.ts.backup
  - Archivo: `src/modules/tasks/store/tasksStore.ts.backup`
- [ ] Eliminar penaltiesStore.ts.backup
  - Archivo: `src/modules/penalties/store/penaltiesStore.ts.backup`

### Consolidar Stores

- [ ] Consolidar tasksStore y tasksStoreWithFirebase
  - Decidir implementación final
  - Eliminar duplicado
- [ ] Consolidar penaltiesStore y penaltiesStoreWithFirebase
  - Decidir implementación final
  - Eliminar duplicado

### Crear Hooks Reutilizables

- [ ] Crear `useConnectionStatus()` hook
  - Reemplazar código duplicado en:
    - DashboardScreen.tsx
    - SettingsScreen.tsx
    - Otros...
- [ ] Crear `useTaskValidation()` hook
  - Consolidar validación en:
    - AddTaskScreen
    - EditTaskScreen
    - AddPhotoTaskScreen
    - VideoInstructionsScreen
    - AddRewardScreen
- [ ] Crear `useAsync()` hook
  - Para manejar loading/error states
- [ ] Crear `useFormValidation()` genérico
  - Mejorar el existente en `src/hooks/useFormValidation.ts`

### Crear Componentes Compartidos

- [ ] Crear `<ListItem />` component
  - Consolidar ProfileItem y SettingItem
- [ ] Crear `<GradientHeader />` component
  - Reemplazar headers duplicados en 15+ screens
- [ ] Crear `<ModalHeader />` component
  - Consolidar headers de modales
- [ ] Mejorar uso de `<EmptyState />` existente
  - Reemplazar lógica duplicada en múltiples screens

### Reemplazar Datos Mock

- [ ] Reemplazar mock Weather Service
  - Archivo: `src/services/weatherService.ts`
  - Integrar API de clima real
- [ ] Reemplazar mock Family Members
  - Archivo: `src/store/familyStore.ts:65-201`
  - Cargar desde Firebase
- [ ] Reemplazar mock Home Data
  - Archivo: `src/screens/MainHomeScreen.tsx:81-103`
- [ ] Reemplazar mock Schedules
  - Archivo: `src/screens/FamilySchedulesScreen.tsx:95`
- [ ] Reemplazar mock Locations
  - Archivo: `src/screens/SavedLocationsScreen.tsx:81`
- [ ] Reemplazar mock Notifications
  - Archivo: `src/components/notifications/NotificationCenter.tsx:67-124`
- [ ] Reemplazar mock Android Wear
  - Archivo: `src/native/androidWear/AndroidWearManager.ts`
- [ ] Reemplazar mock Apple Watch
  - Archivo: `src/native/appleWatch/AppleWatchManager.ts`

---

## 🔵 BAJA PRIORIDAD - Mejoras de Código

### TypeScript Types

- [ ] Reemplazar `navigation: any` con tipos correctos
  - Crear tipos de navegación adecuados
- [ ] Reemplazar `event: any` con tipos específicos
- [ ] Reemplazar `data: any` con interfaces/types

### Constantes

- [ ] Crear constantes para timeouts
  - 30000, 60000, 120000 → TIMEOUT_30S, etc.
- [ ] Crear constantes para sizes
  - 40, 80, 150 → AVATAR_SIZE_SMALL, etc.
- [ ] Crear constantes para colores
  - Usar theme colors en lugar de hardcoded
- [ ] Centralizar URLs
  - Crear `src/constants/urls.ts`

### Console.logs

- [ ] Eliminar console.logs de DashboardScreen (2)
- [ ] Eliminar console.logs de DebugDashboard (5)
- [ ] Eliminar console.logs de SafeRoom screens (7)
- [ ] Eliminar console.logs de FamilyChatScreen (1)
- [ ] Eliminar console.logs de SettingsScreen (6)
- [ ] Eliminar console.logs de TestingReports (1)
- [ ] Eliminar console.logs de FirebaseTestLive (1)
- [ ] Eliminar console.logs de SyncTestingScreen (3)
- [ ] Eliminar console.logs de Tasks screens (19)
- [ ] Eliminar console.logs de Settings screens (7)
- [ ] Eliminar console.logs de otros screens (34)

### Error Handling

- [ ] Mejorar try-catch en DashboardScreen
  - Agregar manejo real de errores
- [ ] Mejorar try-catch en SettingsScreen
- [ ] Mejorar try-catch en ProfileScreen
- [ ] Crear ErrorBoundary global
- [ ] Implementar error reporting service
  - Considerar Sentry o similar

### Documentación

- [ ] Documentar `useConnectionStatus` hook (cuando se cree)
- [ ] Documentar `useTaskValidation` hook (cuando se cree)
- [ ] Documentar servicios principales
- [ ] Crear README por módulo
- [ ] Mantener CHANGELOG.md actualizado

### Testing

- [ ] Crear tests para hooks críticos
- [ ] Crear tests para servicios importantes
- [ ] Crear tests de integración para navegación
- [ ] Crear E2E tests para flujos críticos
- [ ] Configurar CI/CD con tests

---

## 📝 TODOs a Resolver (Top 20)

- [ ] calendarStore.ts:292 - Get from family store
- [ ] tasks.ts:121 - Get from auth context
- [ ] EmotionalSafeRoom.tsx:71 - Implement actual audio playback
- [ ] AdvancedSafeRoom.tsx:364 - Text input modal
- [ ] HomeManagementScreen.tsx:178 - Show modal with sub-admin selection
- [ ] RealCalendarService.ts:202 - Get member name from family store
- [ ] ScheduleService.ts:48 - Implement function body
- [ ] Multiple files - Replace placeholder images
- [ ] Multiple files - Add proper error messages
- [ ] Multiple files - Implement proper loading states

---

## 📊 Progreso General

```
Total de items: 122
Completados: 0
Pendientes: 122

Progreso: [░░░░░░░░░░] 0%
```

### Por Prioridad

```
🔴 Crítico:    10 items  [░░░░░░░░░░] 0%
🟡 Alta:       35 items  [░░░░░░░░░░] 0%
🟢 Media:      38 items  [░░░░░░░░░░] 0%
🔵 Baja:       39 items  [░░░░░░░░░░] 0%
```

---

## 💡 Tips para usar este Checklist

1. **Marca items completados** cambiando `- [ ]` a `- [x]`
2. **Comienza por lo CRÍTICO** (🔴)
3. **Haz commits frecuentes** después de cada fix
4. **Actualiza el progreso** regularmente
5. **Crea branches** para cada categoría de fixes
6. **Haz PRs pequeños** para facilitar review
7. **Testea cada fix** antes de marcar como completo

---

## 🎯 Metas Semanales Sugeridas

### Semana 1

- [ ] Completar todos los items CRÍTICOS (🔴)
- [ ] Completar 50% de items ALTA prioridad (🟡)

### Semana 2

- [ ] Completar resto de ALTA prioridad (🟡)
- [ ] Completar 30% de MEDIA prioridad (🟢)

### Semana 3

- [ ] Completar resto de MEDIA prioridad (🟢)
- [ ] Comenzar BAJA prioridad (🔵)

### Semana 4

- [ ] Completar BAJA prioridad (🔵)
- [ ] Testing y polish final

---

**Última actualización:** 9 Octubre 2025  
**Próxima revisión:** Actualizar después de cada sesión de fixes
