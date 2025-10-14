/**
 * 👥 Role Context - FamilyDash
 * Contexto global para gestión de roles y permisos
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useRoleStore, User } from '@/store/useRoleStore';
import { useAuth } from './AuthContext';
import RealDatabaseService from '@/services/database/RealDatabaseService';
import Logger from '@/services/Logger';
import { Role } from '@/types/roles';

interface RoleContextType {
  user: User | null;
  can: (action: string) => boolean;
  canManage: (targetRole: Role) => boolean;
  isParent: () => boolean;
  isChild: () => boolean;
  hasRole: (role: Role) => boolean;
  getPermissions: () => string[];
  updateRole: (newRole: Role) => Promise<void>;
}

const RoleContext = createContext<RoleContextType | null>(null);

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const { user: authUser } = useAuth();
  const roleStore = useRoleStore();

  useEffect(() => {
    const loadUserRole = async () => {
      if (authUser?.uid) {
        try {
          Logger.debug('Loading user role from Firebase', { uid: authUser.uid });

          // Cargar datos del usuario desde Firebase
          const userData = await RealDatabaseService.getDocument('users', authUser.uid);

          if (userData) {
            const user: User = {
              id: authUser.uid,
              name: userData.displayName || authUser.displayName || 'User',
              email: userData.email || authUser.email || undefined,
              role: userData.role || 'viewer', // Default a viewer si no tiene rol
              familyId: userData.familyId || undefined,
              avatar: userData.avatar || userData.photoURL || undefined,
              joinedAt: userData.joinedAt || new Date().toISOString(),
            };

            // Solo actualizar si el usuario cambió
            if (!roleStore.user || roleStore.user.id !== user.id || roleStore.user.role !== user.role) {
              roleStore.setUser(user);
              Logger.info('User role loaded successfully', { role: user.role });
            }
          } else {
            // Usuario no tiene documento en Firestore, crear uno por defecto
            Logger.warn('User not found in Firestore, creating default viewer role');
            
            const defaultUser: User = {
              id: authUser.uid,
              name: authUser.displayName || 'User',
              email: authUser.email || undefined,
              role: 'member',
            };

            // Crear documento de usuario en Firebase
            await RealDatabaseService.setDocument('users', authUser.uid, {
              displayName: defaultUser.name,
              email: defaultUser.email,
              role: 'member',
              joinedAt: new Date().toISOString(),
              lastActive: new Date().toISOString(),
            });

            // Solo actualizar si el usuario cambió
            if (!roleStore.user || roleStore.user.id !== defaultUser.id) {
              roleStore.setUser(defaultUser);
            }
          }
        } catch (error) {
          Logger.error('Failed to load user role', error);
          
          // Fallback: crear usuario temporal con rol viewer
          const fallbackUser: User = {
            id: authUser.uid,
            name: authUser.displayName || 'User',
            email: authUser.email || undefined,
            role: 'viewer',
          };

          // Solo actualizar si el usuario cambió
          if (!roleStore.user || roleStore.user.id !== fallbackUser.id) {
            roleStore.setUser(fallbackUser);
          }
        }
      } else {
        // Usuario no autenticado
        if (roleStore.user) {
          roleStore.resetUser();
        }
      }
    };

    loadUserRole();
  }, [authUser?.uid]); // Solo depender del UID, no del objeto completo

  /**
   * Actualizar rol del usuario en Firebase
   */
  const updateRole = async (newRole: Role): Promise<void> => {
    if (!roleStore.user) {
      throw new Error('No user to update');
    }

    try {
      Logger.info('Updating user role in Firebase', { userId: roleStore.user.id, newRole });

      await RealDatabaseService.updateDocument('users', roleStore.user.id, {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });

      roleStore.updateUserRole(newRole);
      Logger.info('User role updated successfully', { newRole });
    } catch (error) {
      Logger.error('Failed to update user role', error);
      throw error;
    }
  };

  const contextValue: RoleContextType = {
    user: roleStore.user,
    can: roleStore.can,
    canManage: roleStore.canManage,
    isParent: roleStore.isParent,
    isChild: roleStore.isChild,
    hasRole: roleStore.hasRole,
    getPermissions: roleStore.getPermissions,
    updateRole,
  };

  return <RoleContext.Provider value={contextValue}>{children}</RoleContext.Provider>;
};

/**
 * Hook para usar el contexto de roles
 */
export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

/**
 * HOC para proteger componentes por permiso
 */
export const withPermission = (
  Component: React.ComponentType<any>,
  requiredPermission: string
) => {
  return (props: any) => {
    const { can } = useRole();

    if (!can(requiredPermission)) {
      return null; // o un componente de "No tienes permiso"
    }

    return <Component {...props} />;
  };
};

/**
 * HOC para proteger componentes por rol
 */
export const withRole = (
  Component: React.ComponentType<any>,
  requiredRoles: Role[]
) => {
  return (props: any) => {
    const { user } = useRole();

    if (!user || !requiredRoles.includes(user.role)) {
      return null;
    }

    return <Component {...props} />;
  };
};

