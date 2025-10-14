/**
 * 👥 Role Store - FamilyDash
 * Gestión de roles y permisos de usuarios
 */

import { create } from 'zustand';
import { Role, hasPermission, rolePermissions, isParentalRole, isChildRole } from '../types/roles';
import Logger from '../services/Logger';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: Role;
  familyId?: string;
  avatar?: string;
  joinedAt?: string;
}

interface RoleState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  updateUserRole: (newRole: Role) => void;
  can: (action: string) => boolean;
  canManage: (targetRole: Role) => boolean;
  isParent: () => boolean;
  isChild: () => boolean;
  hasRole: (role: Role) => boolean;
  getPermissions: () => string[];
  resetUser: () => void;
}

export const useRoleStore = create<RoleState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  /**
   * Establecer usuario actual con su rol
   */
  setUser: (user) => {
    Logger.info('Setting user role', { userId: user?.id, role: user?.role });
    set({ user, error: null });
  },

  /**
   * Actualizar rol del usuario actual
   */
  updateUserRole: (newRole) => {
    const currentUser = get().user;
    if (!currentUser) {
      Logger.warn('Cannot update role: No user set');
      return;
    }

    Logger.info('Updating user role', { userId: currentUser.id, newRole });
    set({
      user: {
        ...currentUser,
        role: newRole,
      },
    });
  },

  /**
   * Verificar si el usuario puede realizar una acción
   */
  can: (action) => {
    const user = get().user;
    if (!user) {
      Logger.debug('Permission check failed: No user');
      return false;
    }

    const hasPerm = hasPermission(user.role, action);
    Logger.debug('Permission check', { action, role: user.role, result: hasPerm });
    return hasPerm;
  },

  /**
   * Verificar si puede gestionar otro rol
   */
  canManage: (targetRole) => {
    const user = get().user;
    if (!user) return false;

    // Solo admin puede gestionar a todos
    if (user.role === 'admin') return true;

    // co_admin puede gestionar member y viewer
    if (user.role === 'co_admin') {
      return targetRole === 'member' || targetRole === 'viewer';
    }

    return false;
  },

  /**
   * Verificar si es un rol parental
   */
  isParent: () => {
    const user = get().user;
    return user ? isParentalRole(user.role) : false;
  },

  /**
   * Verificar si es un hijo
   */
  isChild: () => {
    const user = get().user;
    return user ? isChildRole(user.role) : false;
  },

  /**
   * Verificar si tiene un rol específico
   */
  hasRole: (role) => {
    const user = get().user;
    return user?.role === role;
  },

  /**
   * Obtener todos los permisos del usuario
   */
  getPermissions: () => {
    const user = get().user;
    if (!user) return [];
    return rolePermissions[user.role] || [];
  },

  /**
   * Resetear usuario (logout)
   */
  resetUser: () => {
    Logger.info('Resetting user role');
    set({ user: null, error: null });
  },
}));

