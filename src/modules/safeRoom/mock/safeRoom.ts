export interface SafeRoomMessage {
    id: string;
    author: string;
    authorAvatar: string;
    message: string;
    timestamp: string;
    isEncrypted: boolean;
    type: 'text' | 'image' | 'voice' | 'emergency';
    isRead: boolean;
    priority: 'low' | 'medium' | 'high' | 'emergency';
}

export interface EmergencyContact {
    id: string;
    name: string;
    phone: string;
    relationship: string;
    avatar?: string;
    isPrimary: boolean;
}

export interface SafetyTip {
    id: string;
    title: string;
    description: string;
    category: 'emotional' | 'physical' | 'digital' | 'family';
    icon: string;
    color: string;
}

export interface LocationShare {
    id: string;
    memberId: string;
    memberName: string;
    memberAvatar: string;
    location: string;
    timestamp: string;
    isActive: boolean;
}

export interface FamilyMember {
    id: string;
    memberName: string;
    memberAvatar: string;
    role: 'parent' | 'child' | 'guardian';
    isOnline: boolean;
    lastSeen: string;
}

// Empty arrays for new users
export const mockSafeRoomMessages: SafeRoomMessage[] = [];
export const mockEmergencyContacts: EmergencyContact[] = [];
export const mockSafetyTips: SafetyTip[] = [];
export const mockLocationShares: LocationShare[] = [];
export const mockFamilyMembers: FamilyMember[] = [];



