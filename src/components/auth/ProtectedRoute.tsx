/**
 * 🔒 Protected Route - FamilyDash
 * Componente para proteger rutas basadas en roles y permisos
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRole } from '../../contexts/RoleContext';
import { Role } from '../../types/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: Role | Role[];
  fallback?: React.ReactNode;
}

/**
 * Componente que protege rutas por permiso o rol
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback,
}) => {
  const { user, can, hasRole } = useRole();

  // Verificar permiso si se requiere
  if (requiredPermission && !can(requiredPermission)) {
    return fallback || <NoPermissionScreen permission={requiredPermission} />;
  }

  // Verificar rol si se requiere
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = roles.some((role) => hasRole(role));

    if (!hasRequiredRole) {
      return fallback || <NoPermissionScreen requiredRole={roles} />;
    }
  }

  // Usuario tiene permisos, mostrar contenido
  return <>{children}</>;
};

/**
 * Pantalla de "Sin Permisos"
 */
interface NoPermissionScreenProps {
  permission?: string;
  requiredRole?: Role[];
}

const NoPermissionScreen: React.FC<NoPermissionScreenProps> = ({
  permission,
  requiredRole,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FEE2E2', '#FEF2F2']}
        style={styles.content}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={64} color="#EF4444" />
        </View>

        <Text style={styles.title}>Acceso Restringido</Text>
        <Text style={styles.subtitle}>
          {permission
            ? `Esta función requiere el permiso: "${permission}"`
            : requiredRole
            ? `Esta función solo está disponible para: ${requiredRole.join(', ')}`
            : 'No tienes permisos para acceder a esta sección'}
        </Text>

        <Text style={styles.helpText}>
          Contacta al administrador de la familia si crees que deberías tener acceso.
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  helpText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

/**
 * Hook para verificar permisos en componentes funcionales
 */
export const useProtectedAction = (requiredPermission: string) => {
  const { can } = useRole();

  return {
    canPerform: can(requiredPermission),
    performOrAlert: (action: () => void, alertMessage?: string) => {
      if (can(requiredPermission)) {
        action();
      } else {
        Alert.alert(
          'Sin Permisos',
          alertMessage || `Esta acción requiere el permiso: ${requiredPermission}`
        );
      }
    },
  };
};

export default ProtectedRoute;

