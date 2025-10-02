import { create } from 'zustand';

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role: 'parent' | 'child' | 'teen';
  age?: number;
  email?: string;
  phone?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface FamilySettings {
  familyName: string;
  timezone: string;
  language: string;
  notifications: {
    tasks: boolean;
    penalties: boolean;
    goals: boolean;
    calendar: boolean;
    safeRoom: boolean;
  };
  privacy: {
    shareLocation: boolean;
    shareStatus: boolean;
    allowEmergencyAccess: boolean;
  };
}

interface FamilyStore {
  // State
  familyMembers: FamilyMember[];
  settings: FamilySettings;
  currentUser: FamilyMember | null;
  isInitialized: boolean;

  // Actions
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  removeFamilyMember: (id: string) => void;
  setCurrentUser: (user: FamilyMember | null) => void;
  updateSettings: (settings: Partial<FamilySettings>) => void;

  // Getters
  getFamilyMemberById: (id: string) => FamilyMember | undefined;
  getParents: () => FamilyMember[];
  getChildren: () => FamilyMember[];
  getTeens: () => FamilyMember[];
  getOnlineMembers: () => FamilyMember[];
  getFamilyStats: () => {
    totalMembers: number;
    parents: number;
    children: number;
    teens: number;
    onlineMembers: number;
  };

  // Initialization
  initializeWithMockData: () => void;
}

const mockFamilyMembers: FamilyMember[] = [
  {
    id: 'dad',
    name: 'Dad',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
    role: 'parent',
    email: 'dad@family.com',
    phone: '+1234567890',
    isOnline: true,
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'mom',
    name: 'Mom',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
    role: 'parent',
    email: 'mom@family.com',
    phone: '+1234567891',
    isOnline: true,
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'ariella',
    name: 'Ariella',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
    role: 'teen',
    age: 12,
    email: 'ariella@family.com',
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'noah',
    name: 'Noah',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    role: 'child',
    age: 8,
    isOnline: true,
    lastSeen: new Date().toISOString(),
  },
];

const defaultSettings: FamilySettings = {
  familyName: 'The Smith Family',
  timezone: 'America/New_York',
  language: 'en',
  notifications: {
    tasks: true,
    penalties: true,
    goals: true,
    calendar: true,
    safeRoom: true,
  },
  privacy: {
    shareLocation: true,
    shareStatus: true,
    allowEmergencyAccess: true,
  },
};

export const useFamilyStore = create<FamilyStore>((set, get) => ({
  // State
  familyMembers: [],
  settings: defaultSettings,
  currentUser: null,
  isInitialized: false,

  // Actions
  addFamilyMember: (memberData) => {
    const newMember: FamilyMember = {
      ...memberData,
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      currentUser: state.currentUser?.id === id ? null : state.currentUser,
    }));
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  // Getters
  getFamilyMemberById: (id) => {
    return get().familyMembers.find((member) => member.id === id);
  },

  getParents: () => {
    return get().familyMembers.filter((member) => member.role === 'parent');
  },

  getChildren: () => {
    return get().familyMembers.filter((member) => member.role === 'child');
  },

  getTeens: () => {
    return get().familyMembers.filter((member) => member.role === 'teen');
  },

  getOnlineMembers: () => {
    return get().familyMembers.filter((member) => member.isOnline);
  },

  getFamilyStats: () => {
    const members = get().familyMembers;
    return {
      totalMembers: members.length,
      parents: members.filter((m) => m.role === 'parent').length,
      children: members.filter((m) => m.role === 'child').length,
      teens: members.filter((m) => m.role === 'teen').length,
      onlineMembers: members.filter((m) => m.isOnline).length,
    };
  },

  // Initialization
  initializeWithMockData: () => {
    const { isInitialized } = get();
    if (!isInitialized) {
      set({
        familyMembers: mockFamilyMembers,
        currentUser: mockFamilyMembers[0], // Set dad as current user
        isInitialized: true,
      });
    }
  },
}));
