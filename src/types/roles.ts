/**
 * 👥 Roles System - FamilyDash
 * Sistema de roles y permisos para gestión familiar
 */

export type Role = 'admin' | 'co_admin' | 'member' | 'viewer';

export interface PermissionMap {
  [key: string]: string[];
}

export const rolePermissions: PermissionMap = {
  admin: [
    'create',
    'edit',
    'delete',
    'approve',
    'assign',
    'view',
    'manage_family',
    'manage_penalties',
    'view_reports',
    'manage_rewards',
    'configure_settings',
    'emergency_access',
    'delete_family',
  ],
  co_admin: [
    'create',
    'edit',
    'approve',
    'assign',
    'view',
    'manage_penalties',
    'view_reports',
    'manage_rewards',
    'emergency_access',
  ],
  member: [
    'complete',
    'view',
    'request',
    'view_own_tasks',
    'claim_rewards',
    'safe_room_access',
  ],
  viewer: ['view', 'view_calendar', 'view_progress'],
};

export interface RoleConfig {
  role: Role;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  level: number;
}

export const roleConfigs: Record<Role, RoleConfig> = {
  admin: {
    role: 'admin',
    displayName: 'Parent (Admin)',
    description: 'Full control - Manage family, tasks, penalties, and settings',
    icon: 'shield-checkmark',
    color: '#8B5CF6',
    level: 4,
  },
  co_admin: {
    role: 'co_admin',
    displayName: 'Co-Parent',
    description: 'Shared control - Manage tasks and family activities',
    icon: 'people',
    color: '#3B82F6',
    level: 3,
  },
  member: {
    role: 'member',
    displayName: 'Child',
    description: 'Complete tasks, earn rewards, and track progress',
    icon: 'happy',
    color: '#10B981',
    level: 2,
  },
  viewer: {
    role: 'viewer',
    displayName: 'Viewer (Grandparent/Guest)',
    description: 'View-only access to family progress and calendar',
    icon: 'eye',
    color: '#6B7280',
    level: 1,
  },
};

export interface FamilyMemberWithRole {
  id: string;
  userId: string;
  displayName: string;
  email?: string;
  role: Role;
  avatar?: string;
  joinedAt: string;
  lastActive?: string;
  permissions?: string[];
}

export interface RoleChangeRequest {
  id: string;
  targetUserId: string;
  currentRole: Role;
  requestedRole: Role;
  requestedBy: string;
  requestedByName: string;
  timestamp: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Verificar si un rol tiene un permiso específico
 */
export const hasPermission = (role: Role, permission: string): boolean => {
  return rolePermissions[role]?.includes(permission) || false;
};

/**
 * Verificar si un rol puede realizar una acción sobre otro rol
 */
export const canManageRole = (managerRole: Role, targetRole: Role): boolean => {
  const managerLevel = roleConfigs[managerRole].level;
  const targetLevel = roleConfigs[targetRole].level;
  
  // Solo admin puede gestionar a todos
  // co_admin puede gestionar member y viewer
  return managerLevel > targetLevel;
};

/**
 * Obtener permisos de un rol
 */
export const getRolePermissions = (role: Role): string[] => {
  return rolePermissions[role] || [];
};

/**
 * Obtener configuración de un rol
 */
export const getRoleConfig = (role: Role): RoleConfig => {
  return roleConfigs[role];
};

/**
 * Verificar si es un rol parental (admin o co_admin)
 */
export const isParentalRole = (role: Role): boolean => {
  return role === 'admin' || role === 'co_admin';
};

/**
 * Verificar si es un rol de hijo (member)
 */
export const isChildRole = (role: Role): boolean => {
  return role === 'member';
};

