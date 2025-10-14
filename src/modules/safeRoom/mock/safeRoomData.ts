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
    author: string;
    authorId?: string;
    type: 'text' | 'audio' | 'video';
    content: string;
    mood: 'happy' | 'neutral' | 'sad' | 'angry' | 'worried' | 'excited';
    createdAt: string;
    timestamp: Date;
    reactions: Reaction[];
    supportCount: number;
    attachments?: Array<{
        type: 'video' | 'image' | 'audio' | 'voice';
        title: string;
        url: string;
        duration?: string;
        thumbnailUrl?: string;
        metadata?: {
            size?: number;
            format?: string;
            resolution?: string;
            codec?: string;
        };
    }>;
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
    category: 'breathing' | 'meditation' | 'communication' | 'conflict-resolution';
    duration: string;
    icon: string;
    color: string;
    steps: string[];
}

export interface SolutionNote {
    id: string;
    memberId: string;
    memberName: string;
    memberAvatar: string;
    text: string;
    color: string;
    createdAt: string;
    isCompleted: boolean;
    completedAt?: string;
}

// Empty arrays for new users
export const mockFamilyMembers: FamilyMember[] = [];
export const mockFeelings: Feeling[] = [];
export const mockGuidedResources: GuidedResource[] = [];
export const mockSolutionNotes: SolutionNote[] = [];

// Mood configurations
export const moodEmojis = {
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    angry: '😠',
    worried: '😟',
    excited: '🤩'
};

export const moodColors = {
    happy: '#10B981',
    neutral: '#6B7280',
    sad: '#3B82F6',
    angry: '#EF4444',
    worried: '#F59E0B',
    excited: '#8B5CF6'
};

// Sample feelings with multimedia attachments
export const feelings: Feeling[] = [
    {
        id: '1',
        memberId: '1',
        memberName: 'Emma',
        memberAvatar: '👧',
        author: 'Emma',
        authorId: '1',
        type: 'text',
        content: 'I had a great day at school today! Made new friends and learned about planets.',
        mood: 'happy',
        createdAt: '2024-01-15T10:30:00Z',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        reactions: [
            { id: 'r1', memberId: '2', memberName: 'Mom', type: 'heart' },
            { id: 'r2', memberId: '3', memberName: 'Dad', type: 'clap' }
        ],
        supportCount: 2
    },
    {
        id: '2',
        memberId: '2',
        memberName: 'Mom',
        memberAvatar: '👩',
        author: 'Mom',
        authorId: '2',
        type: 'video',
        content: 'Here\'s a quick video of our family dinner tonight. Everyone is so happy!',
        mood: 'happy',
        createdAt: '2024-01-15T18:00:00Z',
        timestamp: new Date('2024-01-15T18:00:00Z'),
        reactions: [
            { id: 'r3', memberId: '1', memberName: 'Emma', type: 'heart' },
            { id: 'r4', memberId: '3', memberName: 'Dad', type: 'heart' }
        ],
        supportCount: 2,
        attachments: [
            {
                type: 'video',
                title: 'Family Dinner Video',
                url: 'https://firebasestorage.googleapis.com/v0/b/family-dash-15944.firebasestorage.app/o/tasks%2Fvideos%2F1759985898105_47td4q.mp4?alt=media&token=f5dc40a6-649c-4c59-8564-a4e99a2b11f4',
                duration: '2:15',
                thumbnailUrl: 'https://via.placeholder.com/300x200/FF6B9D/FFFFFF?text=Family+Dinner',
                metadata: {
                    resolution: '1920x1080',
                    format: 'mp4',
                    codec: 'h264'
                }
            }
        ]
    },
    {
        id: '3',
        memberId: '1',
        memberName: 'Emma',
        memberAvatar: '👧',
        author: 'Emma',
        authorId: '1',
        type: 'audio',
        content: 'I recorded a voice message about my day at school.',
        mood: 'excited',
        createdAt: '2024-01-15T15:45:00Z',
        timestamp: new Date('2024-01-15T15:45:00Z'),
        reactions: [
            { id: 'r5', memberId: '2', memberName: 'Mom', type: 'heart' }
        ],
        supportCount: 1,
        attachments: [
            {
                type: 'voice',
                title: 'Emma\'s Voice Message',
                url: 'https://firebasestorage.googleapis.com/v0/b/family-dash-15944.firebasestorage.app/o/audio%2Femma_voice_message.m4a',
                duration: '1:30',
                metadata: {
                    format: 'm4a',
                    codec: 'aac'
                }
            }
        ]
    },
    {
        id: '4',
        memberId: '3',
        memberName: 'Dad',
        memberAvatar: '👨',
        author: 'Dad',
        authorId: '3',
        type: 'text',
        content: 'Proud of Emma for sharing her feelings today. Great communication!',
        mood: 'happy',
        createdAt: '2024-01-15T19:30:00Z',
        timestamp: new Date('2024-01-15T19:30:00Z'),
        reactions: [
            { id: 'r6', memberId: '2', memberName: 'Mom', type: 'heart' }
        ],
        supportCount: 1
    }
];



