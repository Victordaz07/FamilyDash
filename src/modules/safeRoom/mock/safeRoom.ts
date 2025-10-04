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
    category: 'general' | 'emergency' | 'health' | 'safety' | 'communication';
    icon: string;
    color: string;
    isRead: boolean;
}

export interface LocationShare {
    id: string;
    memberName: string;
    memberAvatar: string;
    location: string;
    timestamp: string;
    isActive: boolean;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export const mockSafeRoomMessages: SafeRoomMessage[] = [
    {
        id: '1',
        author: 'Mom',
        authorAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
        message: 'Remember to lock the doors when you leave the house',
        timestamp: '2 hours ago',
        isEncrypted: true,
        type: 'text',
        isRead: true,
        priority: 'medium'
    },
    {
        id: '2',
        author: 'Dad',
        authorAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
        message: 'Emergency contact list updated. Please review.',
        timestamp: '1 day ago',
        isEncrypted: true,
        type: 'text',
        isRead: false,
        priority: 'high'
    },
    {
        id: '3',
        author: 'Emma',
        authorAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        message: 'I\'m at the library. Will be home by 6 PM.',
        timestamp: '3 hours ago',
        isEncrypted: true,
        type: 'text',
        isRead: true,
        priority: 'low'
    },
    {
        id: '4',
        author: 'Jake',
        authorAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        message: '🚨 Emergency: Need help at school parking lot',
        timestamp: '30 minutes ago',
        isEncrypted: false,
        type: 'emergency',
        isRead: false,
        priority: 'emergency'
    }
];

export const mockEmergencyContacts: EmergencyContact[] = [
    {
        id: '1',
        name: 'Dr. Sarah Johnson',
        phone: '+1 (555) 123-4567',
        relationship: 'Family Doctor',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/doctor-1.jpg',
        isPrimary: true
    },
    {
        id: '2',
        name: 'Officer Mike Davis',
        phone: '+1 (555) 987-6543',
        relationship: 'Local Police',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/officer-1.jpg',
        isPrimary: false
    },
    {
        id: '3',
        name: 'Grandma Rose',
        phone: '+1 (555) 456-7890',
        relationship: 'Grandmother',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/grandma-1.jpg',
        isPrimary: false
    },
    {
        id: '4',
        name: 'Uncle Tom',
        phone: '+1 (555) 321-0987',
        relationship: 'Uncle',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/uncle-1.jpg',
        isPrimary: false
    }
];

export const mockSafetyTips: SafetyTip[] = [
    {
        id: '1',
        title: 'Emergency Kit Checklist',
        description: 'Keep a well-stocked emergency kit with water, food, first aid supplies, and important documents.',
        category: 'emergency',
        icon: 'medical-bag',
        color: '#EF4444',
        isRead: false
    },
    {
        id: '2',
        title: 'Fire Safety Plan',
        description: 'Create and practice a fire escape plan with two ways out of every room.',
        category: 'safety',
        icon: 'flame',
        color: '#F59E0B',
        isRead: true
    },
    {
        id: '3',
        title: 'Stranger Danger',
        description: 'Teach children to never talk to strangers or accept gifts from unknown people.',
        category: 'general',
        icon: 'person-remove',
        color: '#8B5CF6',
        isRead: false
    },
    {
        id: '4',
        title: 'Digital Safety',
        description: 'Keep personal information private online and use strong passwords.',
        category: 'communication',
        icon: 'shield',
        color: '#10B981',
        isRead: true
    },
    {
        id: '5',
        title: 'First Aid Basics',
        description: 'Learn basic first aid techniques for common injuries and emergencies.',
        category: 'health',
        icon: 'heart',
        color: '#EC4899',
        isRead: false
    }
];

export const mockLocationShares: LocationShare[] = [
    {
        id: '1',
        memberName: 'Emma',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        location: 'Central Library',
        timestamp: '3 hours ago',
        isActive: true,
        coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
        }
    },
    {
        id: '2',
        memberName: 'Jake',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        location: 'Lincoln High School',
        timestamp: '5 hours ago',
        isActive: true,
        coordinates: {
            latitude: 40.7589,
            longitude: -73.9851
        }
    },
    {
        id: '3',
        memberName: 'Mom',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
        location: 'Home',
        timestamp: '1 hour ago',
        isActive: true,
        coordinates: {
            latitude: 40.7505,
            longitude: -73.9934
        }
    },
    {
        id: '4',
        memberName: 'Dad',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
        location: 'Office Building',
        timestamp: '2 hours ago',
        isActive: false,
        coordinates: {
            latitude: 40.7614,
            longitude: -73.9776
        }
    }
];

export const mockFamilyMembers = [
    {
        id: 'mom',
        name: 'Mom',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
        isOnline: true,
        lastSeen: '1 hour ago'
    },
    {
        id: 'dad',
        name: 'Dad',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
        isOnline: false,
        lastSeen: '2 hours ago'
    },
    {
        id: 'emma',
        name: 'Emma',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        isOnline: true,
        lastSeen: '30 minutes ago'
    },
    {
        id: 'jake',
        name: 'Jake',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        isOnline: true,
        lastSeen: '5 minutes ago'
    }
];
