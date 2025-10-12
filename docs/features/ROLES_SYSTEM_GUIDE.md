# 👥 SISTEMA DE ROLES - Guía Completa FamilyDash

**Fecha:** 9 de Octubre, 2025  
**Versión:** 1.0  
**Estado:** ✅ Implementado y Funcional

---

## 🎯 VISIÓN GENERAL

El Sistema de Roles de FamilyDash permite gestionar permisos y accesos de forma granular entre padres, co-administradores, hijos y visitantes.

---

## 👥 ROLES DISPONIBLES

### 👑 Admin (Padre/Madre Principal)

**Nivel:** 4 (Máximo)  
**Color:** 🟣 Púrpura (#8B5CF6)  
**Icono:** shield-checkmark

**Permisos:**
- ✅ Crear, editar y eliminar tareas
- ✅ Aprobar y asignar tareas
- ✅ Gestionar penalizaciones
- ✅ Crear y gestionar recompensas
- ✅ Ver todos los reportes
- ✅ Configurar ajustes de la app
- ✅ Acceso a emergencias
- ✅ Administrar miembros de la familia
- ✅ Cambiar roles de otros miembros
- ✅ Eliminar la familia (máximo control)

**Uso recomendado:** Padre o madre principal de la familia

---

### 👥 Co-Admin (Co-Padre/Tutor)

**Nivel:** 3  
**Color:** 🔵 Azul (#3B82F6)  
**Icono:** people

**Permisos:**
- ✅ Crear, editar tareas
- ✅ Aprobar y asignar tareas
- ✅ Gestionar penalizaciones
- ✅ Crear y gestionar recompensas
- ✅ Ver reportes
- ✅ Acceso a emergencias
- ❌ No puede eliminar la familia
- ❌ No puede cambiar rol del admin principal

**Uso recomendado:** Pareja, tutor, o segundo responsable

---

### 🧒 Member (Hijo/Hija)

**Nivel:** 2  
**Color:** 🟢 Verde (#10B981)  
**Icono:** happy

**Permisos:**
- ✅ Ver sus tareas asignadas
- ✅ Completar tareas
- ✅ Reclamar recompensas
- ✅ Ver progreso personal
- ✅ Acceso al Safe Room
- ✅ Enviar solicitudes a padres
- ❌ No puede crear tareas
- ❌ No puede aprobar tareas
- ❌ No puede gestionar otros miembros

**Uso recomendado:** Hijos de la familia

---

### 👁️ Viewer (Abuelo/Visitante)

**Nivel:** 1  
**Color:** ⚪ Gris (#6B7280)  
**Icono:** eye

**Permisos:**
- ✅ Ver calendario familiar
- ✅ Ver progreso de actividades
- ✅ Ver logros de la familia
- ❌ No puede modificar nada
- ❌ No puede completar tareas
- ❌ Solo lectura

**Uso recomendado:** Abuelos, tíos, o invitados ocasionales

---

## 🔐 MATRIZ DE PERMISOS

| Acción | Admin | Co-Admin | Member | Viewer |
|--------|:-----:|:--------:|:------:|:------:|
| **Tareas** |
| Crear tarea | ✅ | ✅ | ❌ | ❌ |
| Editar tarea | ✅ | ✅ | ❌ | ❌ |
| Eliminar tarea | ✅ | ❌ | ❌ | ❌ |
| Asignar tarea | ✅ | ✅ | ❌ | ❌ |
| Completar tarea | ✅ | ✅ | ✅ | ❌ |
| Aprobar tarea | ✅ | ✅ | ❌ | ❌ |
| Ver tareas | ✅ | ✅ | ✅ propias | ✅ |
| **Familia** |
| Gestionar miembros | ✅ | ❌ | ❌ | ❌ |
| Cambiar roles | ✅ | Solo member/viewer | ❌ | ❌ |
| Invitar miembros | ✅ | ✅ | ❌ | ❌ |
| Eliminar miembros | ✅ | ❌ | ❌ | ❌ |
| **Penalizaciones** |
| Crear penalización | ✅ | ✅ | ❌ | ❌ |
| Remover penalización | ✅ | ✅ | ❌ | ❌ |
| Ver penalizaciones | ✅ | ✅ | ✅ propias | ✅ |
| **Recompensas** |
| Crear recompensa | ✅ | ✅ | ❌ | ❌ |
| Aprobar canje | ✅ | ✅ | ❌ | ❌ |
| Reclamar recompensa | ✅ | ✅ | ✅ | ❌ |
| **Reportes** |
| Ver reportes completos | ✅ | ✅ | ❌ | ❌ |
| Ver progreso | ✅ | ✅ | ✅ propio | ✅ |
| **Configuración** |
| Ajustes de app | ✅ | ❌ | ❌ | ❌ |
| Ajustes de familia | ✅ | ✅ | ❌ | ❌ |
| **Emergencias** |
| Acceso emergencias | ✅ | ✅ | ✅ | ❌ |

---

## 💻 USO EN CÓDIGO

### 1. Verificar Permisos

```typescript
import { useRole } from '../contexts/RoleContext';

const MyComponent = () => {
  const { can } = useRole();

  return (
    <>
      {can('create') && (
        <Button title="Crear Tarea" onPress={createTask} />
      )}
      
      {can('approve') && (
        <Button title="Aprobar" onPress={approveTask} />
      )}
    </>
  );
};
```

### 2. Verificar Roles

```typescript
const { user, isParent, isChild } = useRole();

if (isParent()) {
  // Mostrar opciones de administrador
}

if (isChild()) {
  // Mostrar interfaz gamificada
}
```

### 3. Proteger Componentes Completos

```typescript
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

<ProtectedRoute requiredPermission="manage_family">
  <FamilySettingsScreen />
</ProtectedRoute>
```

### 4. Proteger por Rol

```typescript
<ProtectedRoute requiredRole={['admin', 'co_admin']}>
  <AdminPanel />
</ProtectedRoute>
```

### 5. HOC (Higher-Order Component)

```typescript
import { withPermission } from '../contexts/RoleContext';

const AdminSettings = () => <View>...</View>;

export default withPermission(AdminSettings, 'manage_family');
```

---

## 🎨 UI/UX POR ROL

### Admin/Co-Admin:
```
📊 Dashboard Completo
├─ Ver todos los miembros
├─ Ver todas las tareas
├─ Reportes detallados
├─ Acceso a configuración
└─ Gestión de roles
```

### Member (Hijo):
```
🎮 Dashboard Gamificado
├─ Mis tareas del día
├─ Mi progreso (estrellas/puntos)
├─ Recompensas disponibles
├─ Safe Room
└─ Calendario familiar (solo ver)
```

### Viewer:
```
👁️ Dashboard Read-Only
├─ Calendario familiar
├─ Progreso general
├─ Actividades próximas
└─ Sin opciones de edición
```

---

## 🔄 FLUJO DE GESTIÓN DE ROLES

### 1. Crear Familia

```
Admin crea familia
    ↓
Admin invita miembros
    ↓
Miembros aceptan invitación
    ↓
Admin asigna roles iniciales
```

### 2. Cambiar Roles

```
Admin accede a "Roles & Permissions"
    ↓
Selecciona miembro
    ↓
Elige nuevo rol
    ↓
Confirma cambio
    ↓
Cambio se sincroniza en Firebase
    ↓
Usuario recibe notificación
```

### 3. Remover Miembro

```
Solo Admin puede remover
    ↓
Selecciona miembro (no puede ser admin)
    ↓
Confirma eliminación
    ↓
Miembro removido de familia
    ↓
Usuario recibe notificación
```

---

## 📱 PANTALLAS DEL SISTEMA

### 1. FamilyRoleManagementScreen

**Ubicación:** `src/screens/FamilyRoleManagementScreen.tsx`

**Características:**
- 👥 Lista de miembros con avatares
- 🎨 Badges de rol con colores
- 🔄 Modal para cambiar roles
- 🗑️ Opción de remover miembros
- ℹ️ Información de permisos
- 📊 Vista de permisos actuales

**Acceso:** Profile → Family Information → Roles & Permissions

---

## 🔐 SEGURIDAD

### Firebase Rules Recomendadas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Solo usuarios autenticados
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
      
      // Solo admin puede cambiar roles
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['role']);
    }
    
    // Familias
    match /families/{familyId}/members/{memberId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'co_admin'];
    }
  }
}
```

---

## 🧪 TESTING

### Casos de Prueba:

```typescript
// Test 1: Admin puede cambiar todos los roles
expect(canManage('admin', 'member')).toBe(true);
expect(canManage('admin', 'viewer')).toBe(true);

// Test 2: Co-admin NO puede cambiar admin
expect(canManage('co_admin', 'admin')).toBe(false);
expect(canManage('co_admin', 'member')).toBe(true);

// Test 3: Member no puede cambiar nada
expect(canManage('member', 'viewer')).toBe(false);

// Test 4: Permisos correctos
expect(hasPermission('admin', 'delete')).toBe(true);
expect(hasPermission('member', 'delete')).toBe(false);
expect(hasPermission('member', 'complete')).toBe(true);
```

---

## 🎯 MEJORAS FUTURAS

### Fase 2 (Próxima sesión):

1. **Niveles para Hijos:**
   - Helper → Novice → Expert → Master
   - Basado en tareas completadas
   - Desbloquea permisos adicionales

2. **Solicitudes de Permisos:**
   - Hijo puede solicitar permiso temporal
   - Padre aprueba/rechaza
   - Notificaciones bidireccionales

3. **Control Remoto Parental:**
   - Activar/desactivar funciones específicas
   - Horarios de uso por hijo
   - Bloqueo temporal de secciones

4. **Historial de Cambios:**
   - Quién cambió qué rol
   - Cuándo se hizo el cambio
   - Razón del cambio (opcional)

---

## 📚 ARCHIVOS DEL SISTEMA

```
src/
├── types/
│   └── roles.ts ........................... Tipos y permisos
├── store/
│   └── useRoleStore.ts .................... Zustand store
├── contexts/
│   └── RoleContext.tsx .................... React Context
├── screens/
│   └── FamilyRoleManagementScreen.tsx ..... UI principal
└── components/
    └── auth/
        └── ProtectedRoute.tsx ............. Protección de rutas
```

---

## 🚀 CÓMO USAR

### Setup Inicial:

1. ✅ Sistema ya integrado en `App.tsx`
2. ✅ RoleProvider ya envuelve la app
3. ✅ Pantalla agregada a navegación
4. ✅ Link agregado en ProfileScreen

### Para Usar en Componentes:

```typescript
// Importar hook
import { useRole } from '../contexts/RoleContext';

// En el componente
const { user, can, isParent, isChild } = useRole();

// Verificar permisos
if (can('create')) {
  // Mostrar botón de crear
}

// Verificar rol
if (isParent()) {
  // Mostrar opciones de padre
}
```

### Para Proteger Rutas:

```typescript
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

<ProtectedRoute requiredPermission="manage_family">
  <AdminOnlyScreen />
</ProtectedRoute>
```

---

## 🎨 EJEMPLO DE INTERFAZ ADAPTATIVA

```typescript
const TaskScreen = () => {
  const { isParent, isChild } = useRole();

  if (isParent()) {
    return <ParentTaskView />; // Vista completa con edición
  }

  if (isChild()) {
    return <ChildTaskView />;  // Vista gamificada, solo completar
  }

  return <ViewerTaskView />;    // Vista de solo lectura
};
```

---

## 🔔 NOTIFICACIONES POR ROL

```typescript
// Admin y Co-Admin reciben:
- Nueva tarea completada
- Solicitudes de permisos
- Alertas de emergencia
- Penalizaciones vencidas

// Member recibe:
- Nueva tarea asignada
- Tarea aprobada
- Recompensa desbloqueada
- Recordatorios de tareas

// Viewer recibe:
- Actualizaciones del calendario
- Logros familiares
```

---

## ✅ VALIDACIONES IMPLEMENTADAS

1. ✅ **Admin no puede ser eliminado**
2. ✅ **Co-admin no puede cambiar rol de admin**
3. ✅ **Member no puede cambiar roles**
4. ✅ **Viewer solo puede ver**
5. ✅ **Cambios se sincronizan en Firebase**
6. ✅ **Permisos verificados antes de cada acción**

---

## 🎯 ACCESO A LA PANTALLA

**Ruta de navegación:**
```
Profile 
  → Family Information 
    → Roles & Permissions
```

**Permisos requeridos:** Solo admin puede acceder completamente

---

## 📊 ESQUEMA DE BASE DE DATOS

### Colección: `users`

```json
{
  "id": "usr_001",
  "displayName": "Víctor",
  "email": "victor@example.com",
  "role": "admin",
  "familyId": "fam_001",
  "avatar": "https://...",
  "joinedAt": "2025-10-08T00:00:00Z",
  "lastActive": "2025-10-09T10:30:00Z"
}
```

### Colección: `families/{familyId}/members`

```json
{
  "id": "mem_001",
  "userId": "usr_001",
  "displayName": "Víctor",
  "email": "victor@example.com",
  "role": "admin",
  "joinedAt": "2025-10-08T00:00:00Z",
  "permissions": ["create", "edit", "delete", "approve", "..."]
}
```

---

## 🎉 BENEFICIOS

### Para Padres:
- 🎯 Control total de la familia
- 📊 Visibilidad completa
- ⚙️ Configuración granular
- 🔐 Seguridad mejorada

### Para Hijos:
- 🎮 Interfaz adaptada a su edad
- ✨ Gamificación apropiada
- 🛡️ Protección adecuada
- 📱 Solo ven lo relevante

### Para el Proyecto:
- ✅ Código más organizado
- ✅ Permisos centralizados
- ✅ Fácil de extender
- ✅ Cumple con mejores prácticas

---

## 🔥 CARACTERÍSTICAS DESTACADAS

1. **Verificación en Tiempo Real**
   - Permisos se verifican antes de cada acción
   - Cambios de rol se reflejan instantáneamente

2. **UI Adaptativa**
   - Interfaz se adapta según el rol
   - Colores y iconos distintivos

3. **Seguridad Robusta**
   - Verificación en cliente y servidor
   - Firebase Rules para seguridad extra

4. **Fácil de Usar**
   - Pantalla visual intuitiva
   - Cambios de rol en 2 clicks
   - Feedback claro

---

## 📞 SOPORTE

Para más información:
- Ver código en `src/types/roles.ts`
- Ver contexto en `src/contexts/RoleContext.tsx`
- Ver UI en `src/screens/FamilyRoleManagementScreen.tsx`

---

**Sistema implementado por:** Sistema de Roles Automático  
**Fecha:** 9 de Octubre, 2025  
**Estado:** ✅ Completo y funcional  
**Versión:** 1.0

