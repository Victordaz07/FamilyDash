export interface FamilyMember {
    id: string;
    name: string;
    avatar: string;
    role: 'parent' | 'child';
    age?: number;
}

export interface Feeling {
    id: string;
    memberId: string;
    memberName: string;
    memberAvatar: string;
    type: 'text' | 'audio' | 'video';
    content: string;
    mood: 'happy' | 'neutral' | 'sad' | 'angry' | 'worried' | 'excited';
    createdAt: string;
    reactions: Reaction[];
    supportCount: number;
}

export interface Reaction {
    id: string;
    memberId: string;
    memberName: string;
    type: 'heart' | 'clap' | 'star' | 'support';
}

export interface GuidedResource {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'audio' | 'exercise';
    duration: string;
    category: 'communication' | 'frustration' | 'breathing' | 'mindfulness';
    thumbnail?: string;
    url?: string;
}

export interface SolutionNote {
    id: string;
    memberId: string;
    memberName: string;
    memberAvatar: string;
    text: string;
    color: string;
    createdAt: string;
    completedAt?: string;
    isCompleted: boolean;
}

export const mockFamilyMembers: FamilyMember[] = [
    {
        id: 'mom',
        name: 'Mom',
        avatar: '👩',
        role: 'parent',
        age: 35
    },
    {
        id: 'dad',
        name: 'Dad',
        avatar: '👨',
        role: 'parent',
        age: 37
    },
    {
        id: 'emma',
        name: 'Emma',
        avatar: '👧',
        role: 'child',
        age: 12
    },
    {
        id: 'jake',
        name: 'Jake',
        avatar: '👦',
        role: 'child',
        age: 8
    }
];

export const mockFeelings: Feeling[] = [
    {
        id: '1',
        memberId: 'emma',
        memberName: 'Emma',
        memberAvatar: '👧',
        type: 'text',
        content: "I'm really nervous about my math test tomorrow. I studied but I still feel like I might forget everything. What if I fail? 😟",
        mood: 'worried',
        createdAt: '2 hours ago',
        reactions: [
            { id: 'r1', memberId: 'mom', memberName: 'Mom', type: 'heart' },
            { id: 'r2', memberId: 'dad', memberName: 'Dad', type: 'support' },
            { id: 'r3', memberId: 'jake', memberName: 'Jake', type: 'star' }
        ],
        supportCount: 3
    },
    {
        id: '2',
        memberId: 'jake',
        memberName: 'Jake',
        memberAvatar: '👦',
        type: 'audio',
        content: 'Voice message • 0:47',
        mood: 'sad',
        createdAt: '4 hours ago',
        reactions: [
            { id: 'r4', memberId: 'mom', memberName: 'Mom', type: 'heart' },
            { id: 'r5', memberId: 'dad', memberName: 'Dad', type: 'heart' },
            { id: 'r6', memberId: 'emma', memberName: 'Emma', type: 'clap' }
        ],
        supportCount: 5
    },
    {
        id: '3',
        memberId: 'dad',
        memberName: 'Dad',
        memberAvatar: '👨',
        type: 'video',
        content: 'I wanted to share something that\'s been on my mind about work stress...',
        mood: 'sad',
        createdAt: '1 day ago',
        reactions: [
            { id: 'r7', memberId: 'mom', memberName: 'Mom', type: 'heart' },
            { id: 'r8', memberId: 'emma', memberName: 'Emma', type: 'support' },
            { id: 'r9', memberId: 'jake', memberName: 'Jake', type: 'star' }
        ],
        supportCount: 4
    },
    {
        id: '4',
        memberId: 'mom',
        memberName: 'Mom',
        memberAvatar: '👩',
        type: 'text',
        content: 'I love how we\'re all supporting each other in this family. Everyone is doing such a great job with their responsibilities! ❤️',
        mood: 'happy',
        createdAt: '2 days ago',
        reactions: [
            { id: 'r10', memberId: 'dad', memberName: 'Dad', type: 'heart' },
            { id: 'r11', memberId: 'emma', memberName: 'Emma', type: 'heart' },
            { id: 'r12', memberId: 'jake', memberName: 'Jake', type: 'clap' }
        ],
        supportCount: 7
    }
];

export const mockGuidedResources: GuidedResource[] = [
    {
        id: '1',
        title: 'How to Handle Frustration',
        description: 'Learn simple techniques to manage anger and frustration in healthy ways.',
        type: 'video',
        duration: '5 min',
        category: 'frustration',
        thumbnail: '🎯'
    },
    {
        id: '2',
        title: 'Steps to Communicate Better',
        description: 'Practice active listening and expressing feelings clearly.',
        type: 'video',
        duration: '8 min',
        category: 'communication',
        thumbnail: '💬'
    },
    {
        id: '3',
        title: 'Breathing Exercise',
        description: 'A simple 2-minute breathing exercise to help you feel calm.',
        type: 'audio',
        duration: '2 min',
        category: 'breathing',
        thumbnail: '🌬️'
    },
    {
        id: '4',
        title: 'Mindfulness for Kids',
        description: 'Fun mindfulness activities designed especially for children.',
        type: 'video',
        duration: '6 min',
        category: 'mindfulness',
        thumbnail: '🧘'
    },
    {
        id: '5',
        title: 'Family Communication Tips',
        description: 'How to talk about difficult topics as a family.',
        type: 'audio',
        duration: '10 min',
        category: 'communication',
        thumbnail: '👨‍👩‍👧‍👦'
    },
    {
        id: '6',
        title: 'Calm Down Strategies',
        description: 'Quick techniques to help you feel better when upset.',
        type: 'video',
        duration: '4 min',
        category: 'frustration',
        thumbnail: '😌'
    }
];

export const mockSolutionNotes: SolutionNote[] = [
    {
        id: '1',
        memberId: 'mom',
        memberName: 'Mom',
        memberAvatar: '👩',
        text: 'We agree to listen first before responding',
        color: '#FFB6C1',
        createdAt: '3 days ago',
        completedAt: '2 days ago',
        isCompleted: true
    },
    {
        id: '2',
        memberId: 'dad',
        memberName: 'Dad',
        memberAvatar: '👨',
        text: 'No phones during family dinner',
        color: '#87CEEB',
        createdAt: '1 week ago',
        completedAt: '6 days ago',
        isCompleted: true
    },
    {
        id: '3',
        memberId: 'emma',
        memberName: 'Emma',
        memberAvatar: '👧',
        text: 'Ask for help when homework is too hard',
        color: '#98FB98',
        createdAt: '2 days ago',
        isCompleted: false
    },
    {
        id: '4',
        memberId: 'jake',
        memberName: 'Jake',
        memberAvatar: '👦',
        text: 'Use words instead of throwing things',
        color: '#FFD700',
        createdAt: '1 day ago',
        isCompleted: false
    },
    {
        id: '5',
        memberId: 'mom',
        memberName: 'Mom',
        memberAvatar: '👩',
        text: 'Take deep breaths when feeling angry',
        color: '#DDA0DD',
        createdAt: '4 days ago',
        completedAt: '3 days ago',
        isCompleted: true
    },
    {
        id: '6',
        memberId: 'dad',
        memberName: 'Dad',
        memberAvatar: '👨',
        text: 'Share one good thing about our day',
        color: '#F0E68C',
        createdAt: '5 days ago',
        isCompleted: false
    }
];

export const moodEmojis = {
    happy: '😃',
    neutral: '😐',
    sad: '😢',
    angry: '😡',
    worried: '😟',
    excited: '🤩'
};

export const moodColors = {
    happy: '#4CAF50',
    neutral: '#FFC107',
    sad: '#2196F3',
    angry: '#F44336',
    worried: '#FF9800',
    excited: '#9C27B0'
};
