export interface Penalty {
    id: string;
    memberId: string;
    memberName: string;
    memberAvatar: string;
    memberAge: number;
    penaltyType: string;
    description: string;
    reason: string;
    startedAt: string;
    duration: number; // in minutes
    remainingTime: number; // in minutes
    progress: number; // percentage (0-100)
    status: 'active' | 'completed' | 'paused' | 'ended_early';
    completedAt?: string;
    endedEarly?: boolean;
    color: string;
    icon: string;
}

export interface Reflection {
    id: string;
    penaltyId: string;
    memberId: string;
    memberName: string;
    memberAvatar: string;
    penaltyTitle: string;
    reflectionText: string;
    learnedItems: string[];
    createdAt: string;
    reactions: {
        heart: number;
        clap: number;
        muscle: number;
        star: number;
    };
}

export interface PenaltyStats {
    active: number;
    thisWeek: number;
    completed: number;
    averageTime: number; // in minutes
}

export const mockPenalties: Penalty[] = [
    {
        id: '1',
        memberId: 'jake',
        memberName: 'Jake',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        memberAge: 8,
        penaltyType: 'No Tablet Time',
        description: 'Jake cannot use his tablet or any screen devices during this penalty period.',
        reason: 'Didn\'t complete homework on time',
        startedAt: 'Today 3:15 PM',
        duration: 20,
        remainingTime: 15,
        progress: 25,
        status: 'active',
        color: '#EF4444',
        icon: 'tablet-portrait'
    },
    {
        id: '2',
        memberId: 'emma',
        memberName: 'Emma',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        memberAge: 12,
        penaltyType: 'No Phone for Evening',
        description: 'Emma cannot use her phone during evening hours.',
        reason: 'Used phone during family dinner',
        startedAt: 'Today 6:45 PM',
        duration: 180, // 3 hours
        remainingTime: 138, // 2h 18m
        progress: 23,
        status: 'active',
        color: '#F59E0B',
        icon: 'phone-portrait'
    },
    {
        id: '3',
        memberId: 'jake',
        memberName: 'Jake',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        memberAge: 8,
        penaltyType: '30 min Timeout',
        description: 'Jake must sit quietly in timeout corner.',
        reason: 'Threw toys in anger',
        startedAt: 'Yesterday 2:00 PM',
        duration: 30,
        remainingTime: 0,
        progress: 100,
        status: 'completed',
        completedAt: 'Yesterday 2:30 PM',
        endedEarly: false,
        color: '#10B981',
        icon: 'time'
    },
    {
        id: '4',
        memberId: 'emma',
        memberName: 'Emma',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        memberAge: 12,
        penaltyType: 'No TV before Homework',
        description: 'Emma cannot watch TV until homework is completed.',
        reason: 'Watched TV instead of doing homework',
        startedAt: 'Yesterday 4:00 PM',
        duration: 45,
        remainingTime: 0,
        progress: 100,
        status: 'completed',
        completedAt: 'Yesterday 4:45 PM',
        endedEarly: false,
        color: '#10B981',
        icon: 'tv'
    },
    {
        id: '5',
        memberId: 'jake',
        memberName: 'Jake',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        memberAge: 8,
        penaltyType: 'Early Chores Completion',
        description: 'Jake must complete all chores before playtime.',
        reason: 'Left chores half-done',
        startedAt: '2 days ago 9:00 AM',
        duration: 60,
        remainingTime: 0,
        progress: 100,
        status: 'completed',
        completedAt: '2 days ago 9:45 AM',
        endedEarly: true,
        color: '#3B82F6',
        icon: 'home'
    }
];

export const mockReflections: Reflection[] = [
    {
        id: '1',
        penaltyId: '5',
        memberId: 'jake',
        memberName: 'Jake',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        penaltyTitle: 'No video games penalty',
        reflectionText: 'I learned that I need to finish homework before playing games. It helps me focus better.',
        learnedItems: [
            'Do homework right after school',
            'Ask for help when I don\'t understand',
            'Set a timer for homework time'
        ],
        createdAt: '2 days ago',
        reactions: {
            heart: 3,
            clap: 2,
            muscle: 1,
            star: 0
        }
    },
    {
        id: '2',
        penaltyId: '4',
        memberId: 'dad',
        memberName: 'Dad',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
        penaltyTitle: 'No late coffee penalty',
        reflectionText: 'Setting a good example for the kids. Better sleep = better mood for everyone.',
        learnedItems: [
            'Limit coffee after 6 PM',
            'Set a good example',
            'Prioritize family time'
        ],
        createdAt: 'Yesterday',
        reactions: {
            heart: 2,
            clap: 1,
            muscle: 0,
            star: 1
        }
    },
    {
        id: '3',
        penaltyId: '3',
        memberId: 'jake',
        memberName: 'Jake',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        penaltyTitle: '30 min timeout',
        reflectionText: 'I learned that throwing toys doesn\'t solve problems. I should talk about my feelings instead.',
        learnedItems: [
            'Talk about feelings instead of throwing things',
            'Take deep breaths when angry',
            'Ask for help when frustrated'
        ],
        createdAt: 'Yesterday',
        reactions: {
            heart: 4,
            clap: 3,
            muscle: 2,
            star: 1
        }
    }
];

export const mockPenaltyStats: PenaltyStats = {
    active: 2,
    thisWeek: 5,
    completed: 12,
    averageTime: 45
};

export const mockFamilyMembers = [
    {
        id: 'mom',
        name: 'Mom',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
        isOnline: true
    },
    {
        id: 'dad',
        name: 'Dad',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
        isOnline: false
    },
    {
        id: 'emma',
        name: 'Emma',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        isOnline: true
    },
    {
        id: 'jake',
        name: 'Jake',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        isOnline: true
    }
];

export const penaltyTypes = [
    {
        id: 'no_tablet',
        name: 'No Tablet Time',
        icon: 'tablet-portrait',
        color: '#EF4444',
        description: 'Restrict tablet and screen device usage'
    },
    {
        id: 'no_phone',
        name: 'No Phone Time',
        icon: 'phone-portrait',
        color: '#F59E0B',
        description: 'Restrict phone usage during specific hours'
    },
    {
        id: 'timeout',
        name: 'Timeout',
        icon: 'time',
        color: '#10B981',
        description: 'Quiet time in designated area'
    },
    {
        id: 'no_tv',
        name: 'No TV',
        icon: 'tv',
        color: '#8B5CF6',
        description: 'Restrict television viewing'
    },
    {
        id: 'early_bedtime',
        name: 'Early Bedtime',
        icon: 'moon',
        color: '#3B82F6',
        description: 'Earlier bedtime than usual'
    },
    {
        id: 'extra_chores',
        name: 'Extra Chores',
        icon: 'home',
        color: '#EC4899',
        description: 'Additional household responsibilities'
    }
];

export const commonReasons = [
    'Didn\'t complete homework on time',
    'Used phone during family dinner',
    'Threw toys in anger',
    'Watched TV instead of doing homework',
    'Left chores half-done',
    'Didn\'t follow bedtime routine',
    'Interrupted family conversations',
    'Didn\'t clean up after playing',
    'Used inappropriate language',
    'Didn\'t ask permission before leaving'
];




