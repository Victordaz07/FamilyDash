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