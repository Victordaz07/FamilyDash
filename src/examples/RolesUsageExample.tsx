/**
 * 📚 Ejemplo de Uso - Sistema de Roles
 * Ejemplos prácticos de cómo usar el sistema de roles en FamilyDash
 */

import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useRole } from '@/contexts/RoleContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// ============================================
// EJEMPLO 1: Verificar Permisos Básicos
// ============================================

export const Example1_BasicPermissions = () => {
  const { can } = useRole();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ejemplo 1: Permisos Básicos</Text>

      {/* Solo padres pueden crear tareas */}
      {can('create') && (
        <Button title="➕ Crear Tarea" onPress={() => console.log('Creating task')} />
      )}

      {/* Solo padres pueden aprobar */}
      {can('approve') && (
        <Button title="✅ Aprobar Tarea" onPress={() => console.log('Approving')} />
      )}

      {/* Todos pueden ver */}
      {can('view') && <Text>📋 Ver mis tareas</Text>}

      {/* Solo hijos pueden completar (padres también) */}
      {can('complete') && (
        <Button title="✔️ Completar Tarea" onPress={() => console.log('Completing')} />
      )}
    </View>
  );
};

// ============================================
// EJEMPLO 2: Verificar Roles
// ============================================

export const Example2_CheckRoles = () => {
  const { user, isParent, isChild, hasRole } = useRole();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ejemplo 2: Verificar Roles</Text>

      <Text>Usuario: {user?.name}</Text>
      <Text>Rol: {user?.role}</Text>

      {isParent() && (
        <View style={styles.section}>
          <Text style={styles.badge}>👑 Eres Padre/Administrador</Text>
          <Text>Tienes control total de la familia</Text>
        </View>
      )}

      {isChild() && (
        <View style={styles.section}>
          <Text style={styles.badge}>🧒 Eres Hijo/Miembro</Text>
          <Text>Completa tareas y gana recompensas</Text>
        </View>
      )}

      {hasRole('viewer') && (
        <View style={styles.section}>
          <Text style={styles.badge}>👁️ Eres Visitante</Text>
          <Text>Puedes ver el progreso familiar</Text>
        </View>
      )}
    </View>
  );
};

// ============================================
// EJEMPLO 3: Componente Protegido
// ============================================

const AdminOnlyContent = () => (
  <View style={styles.section}>
    <Text style={styles.title}>🔐 Contenido Solo para Administradores</Text>
    <Button title="Gestionar Familia" onPress={() => {}} />
    <Button title="Ver Reportes Completos" onPress={() => {}} />
    <Button title="Configurar App" onPress={() => {}} />
  </View>
);

export const Example3_ProtectedComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ejemplo 3: Componente Protegido</Text>

      {/* Solo admin verá esto */}
      <ProtectedRoute requiredRole="admin">
        <AdminOnlyContent />
      </ProtectedRoute>

      {/* Si no es admin, verá el fallback automático */}
    </View>
  );
};

// ============================================
// EJEMPLO 4: Múltiples Roles Permitidos
// ============================================

export const Example4_MultipleRoles = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ejemplo 4: Múltiples Roles</Text>

      {/* Admin o Co-Admin */}
      <ProtectedRoute requiredRole={['admin', 'co_admin']}>
        <View style={styles.section}>
          <Text>🔧 Panel de Control Parental</Text>
          <Button title="Gestionar Tareas" onPress={() => {}} />
          <Button title="Gestionar Penalizaciones" onPress={() => {}} />
        </View>
      </ProtectedRoute>

      {/* Member o Admin */}
      <ProtectedRoute requiredRole={['admin', 'co_admin', 'member']}>
        <View style={styles.section}>
          <Text>✅ Completar Tareas</Text>
          <Button title="Marcar como completada" onPress={() => {}} />
        </View>
      </ProtectedRoute>
    </View>
  );
};

// ============================================
// EJEMPLO 5: Proteger por Permiso
// ============================================

export const Example5_ProtectByPermission = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ejemplo 5: Proteger por Permiso</Text>

      {/* Solo usuarios con permiso 'delete' */}
      <ProtectedRoute requiredPermission="delete">
        <Button title="🗑️ Eliminar Elemento" onPress={() => {}} />
      </ProtectedRoute>

      {/* Solo usuarios con permiso 'manage_family' */}
      <ProtectedRoute requiredPermission="manage_family">
        <Button title="👥 Gestionar Familia" onPress={() => {}} />
      </ProtectedRoute>

      {/* Solo usuarios con permiso 'view_reports' */}
      <ProtectedRoute requiredPermission="view_reports">
        <Button title="📊 Ver Reportes" onPress={() => {}} />
      </ProtectedRoute>
    </View>
  );
};

// ============================================
// EJEMPLO 6: Interfaz Adaptativa
// ============================================

export const Example6_AdaptiveUI = () => {
  const { user, isParent, isChild } = useRole();

  if (isParent()) {
    return (
      <View style={[styles.container, styles.adminUI]}>
        <Text style={styles.title}>📊 Vista de Administrador</Text>
        <Button title="➕ Crear Tarea" onPress={() => {}} />
        <Button title="✅ Aprobar Tareas" onPress={() => {}} />
        <Button title="📊 Ver Reportes" onPress={() => {}} />
        <Button title="⚙️ Configuración" onPress={() => {}} />
      </View>
    );
  }

  if (isChild()) {
    return (
      <View style={[styles.container, styles.childUI]}>
        <Text style={styles.title}>🎮 Vista de Hijo</Text>
        <Text style={styles.gamified}>⭐ Puntos: 125</Text>
        <Text style={styles.gamified}>🔥 Racha: 5 días</Text>
        <Button title="✔️ Completar Mis Tareas" onPress={() => {}} />
        <Button title="🎁 Ver Recompensas" onPress={() => {}} />
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.viewerUI]}>
      <Text style={styles.title}>👁️ Vista de Visitante</Text>
      <Text>Calendario familiar</Text>
      <Text>Progreso general</Text>
      <Text>(Solo lectura)</Text>
    </View>
  );
};

// ============================================
// EJEMPLO 7: Gestión de Permisos en Acciones
// ============================================

export const Example7_ActionGuard = () => {
  const { can } = useRole();

  const handleDeleteTask = () => {
    if (!can('delete')) {
      Alert.alert('Error', 'No tienes permisos para eliminar tareas');
      return;
    }

    // Proceder con eliminación
    console.log('Deleting task...');
  };

  const handleApproveTask = () => {
    if (!can('approve')) {
      Alert.alert('Error', 'Solo los padres pueden aprobar tareas');
      return;
    }

    // Proceder con aprobación
    console.log('Approving task...');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ejemplo 7: Guard en Acciones</Text>
      <Button title="🗑️ Eliminar Tarea" onPress={handleDeleteTask} />
      <Button title="✅ Aprobar Tarea" onPress={handleApproveTask} />
    </View>
  );
};

// ============================================
// EJEMPLO 8: Obtener Todos los Permisos
// ============================================

export const Example8_ListPermissions = () => {
  const { user, getPermissions } = useRole();
  const permissions = getPermissions();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ejemplo 8: Mis Permisos</Text>
      <Text>Usuario: {user?.name}</Text>
      <Text>Rol: {user?.role}</Text>
      <Text>Permisos:</Text>
      {permissions.map((perm, index) => (
        <Text key={index}>✅ {perm}</Text>
      ))}
    </View>
  );
};

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  section: {
    marginVertical: 12,
  },
  badge: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  adminUI: {
    backgroundColor: '#F3E8FF',
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },
  childUI: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  viewerUI: {
    backgroundColor: '#F3F4F6',
    borderColor: '#6B7280',
    borderWidth: 2,
  },
  gamified: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginVertical: 4,
  },
});

// ============================================
// EXPORTAR TODOS LOS EJEMPLOS
// ============================================

export const AllExamples = () => (
  <>
    <Example1_BasicPermissions />
    <Example2_CheckRoles />
    <Example3_ProtectedComponent />
    <Example4_MultipleRoles />
    <Example5_ProtectByPermission />
    <Example6_AdaptiveUI />
    <Example7_ActionGuard />
    <Example8_ListPermissions />
  </>
);

