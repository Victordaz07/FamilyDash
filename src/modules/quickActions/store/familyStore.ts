import { create } from 'zustand';
import { FamilyMember } from '../types/quickActionsTypes';
import { mockFamilyMembers } from '../mock/mockFamily';

interface FamilyStore {
    familyMembers: FamilyMember[];
    loading: boolean;
    error: string | null;

    // Actions
    addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
    updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
    removeFamilyMember: (id: string) => void;
    updatePermissions: (id: string, permissions: Partial<FamilyMember['permissions']>) => void;
    toggleOnlineStatus: (id: string) => void;
    getMemberById: (id: string) => FamilyMember | undefined;
    getMembersByRole: (role: FamilyMember['role']) => FamilyMember[];
}

export const useFamilyStore = create<FamilyStore>((set, get) => ({
    familyMembers: mockFamilyMembers,
    loading: false,
    error: null,

    addFamilyMember: (member) => {
        const newMember: FamilyMember = {
            ...member,
            id: Date.now().toString(),
        };
        set((state) => ({
            familyMembers: [...state.familyMembers, newMember],
        }));
    },

    updateFamilyMember: (id, updates) => {
        set((state) => ({
            familyMembers: state.familyMembers.map((member) =>
                member.id === id ? { ...member, ...updates } : member
            ),
        }));
    },

    removeFamilyMember: (id) => {
        set((state) => ({
            familyMembers: state.familyMembers.filter((member) => member.id !== id),
        }));
    },

    updatePermissions: (id, permissions) => {
        set((state) => ({
            familyMembers: state.familyMembers.map((member) =>
                member.id === id
                    ? { ...member, permissions: { ...member.permissions, ...permissions } }
                    : member
            ),
        }));
    },

    toggleOnlineStatus: (id) => {
        set((state) => ({
            familyMembers: state.familyMembers.map((member) =>
                member.id === id ? { ...member, isOnline: !member.isOnline } : member
            ),
        }));
    },

    getMemberById: (id) => {
        return get().familyMembers.find((member) => member.id === id);
    },

    getMembersByRole: (role) => {
        return get().familyMembers.filter((member) => member.role === role);
    },
}));
