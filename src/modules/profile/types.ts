export interface FamilyMember {
    id: string;              // UUID único
    code: string;            // Código de invitación/identificación
    name: string;            // Nombre visible
    role: 'admin' | 'sub-admin' | 'child';
    age?: number;
    email?: string;
    avatar: string;          // Imagen de perfil o avatar emoji
    permissions: string[];   // Ej: ["tasks:view", "penalties:assign"]
    isActive: boolean;       // Usuario activo en la casa
    joinedAt: Date;
    leftAt?: Date;           // Si salió de la casa
    isOnline?: boolean;      // Estado en tiempo real
}

export interface FamilyHouse {
    houseId: string;
    houseName: string;        // Ej: "Casa de los Ruiz"
    adminId: string;          // Usuario Admin
    subAdminId?: string;      // Usuario Sub-Admin
    members: FamilyMember[];
    createdAt: Date;
    invitationCodes: HouseInvitationCode[];
}

export interface HouseInvitationCode {
    code: string;
    createdBy: string;       // Quien creó la invitación
    createdAt: Date;
    expiresAt: Date;
    isUsed: boolean;
    usedBy?: string;          // Quien usó el código
    usedAt?: Date;
}

export interface ProfileData {
    id: string;
    name: string;
    email?: string;
    avatar: string;
    age?: number;
    bio?: string;
    preferences: {
        theme: 'light' | 'dark';
        language: 'en' | 'es';
        notifications: boolean;
        privacy: 'private' | 'family-only' | 'public';
    };
}

export interface Permission {
    scope: string;           // Ej: "tasks", "penalties", "calendar"
    action: string;          // Ej: "view", "create", "assign", "delete"
    role: 'admin' | 'sub-admin' | 'child';
}

// Permisos definidos por rol
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
    admin: [
        { scope: 'tasks', action: 'manage', role: 'admin' },
        { scope: 'penalties', action: 'manage', role: 'admin' },
        { scope: 'calendar', action: 'manage', role: 'admin' },
        { scope: 'family', action: 'manage', role: 'admin' },
        { scope: 'members', action: 'invite', role: 'admin' },
        { scope: 'members', action: 'remove', role: 'admin' },
        { scope: 'settings', action: 'manage', role: 'admin' },
    ],
    'sub-admin': [
        { scope: 'tasks', action: 'assign', role: 'sub-admin' },
        { scope: 'penalties', action: 'assign', role: 'sub-admin' },
        { scope: 'calendar', action: 'create', role: 'sub-admin' },
        { scope: 'family', action: 'view', role: 'sub-admin' },
        { scope: 'members', action: 'invite', role: 'sub-admin' },
        { scope: 'settings', action: 'view', role: 'sub-admin' },
    ],
    child: [
        { scope: 'tasks', action: 'view', role: 'child' },
        { scope: 'penalties', action: 'view', role: 'child' },
        { scope: 'calendar', action: 'view', role: 'child' },
        { scope: 'family', action: 'view', role: 'child' },
        { scope: 'profile', action: 'edit', role: 'child' },
    ],
};
