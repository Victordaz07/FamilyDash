import { Penalty, FamilyMember, PenaltyTypeConfig, PenaltySelectionMethod } from '../types/penaltyTypes';

export const mockFamilyMembers: FamilyMember[] = [
    {
        id: 'dad',
        name: 'Dad',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
        role: 'parent'
    },
    {
        id: 'mom',
        name: 'Mom',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
        role: 'parent'
    },
    {
        id: 'ariella',
        name: 'Ariella',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        role: 'teen',
        age: 12
    },
    {
        id: 'noah',
        name: 'Noah',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        role: 'child',
        age: 8
    }
];

export const penaltyTypeConfigs: PenaltyTypeConfig[] = [
    {
        type: 'yellow',
        name: 'Tarjeta Amarilla',
        color: '#F59E0B', // Amber
        icon: 'warning',
        minDays: 3,
        maxDays: 10,
        durationOptions: [3, 4, 5, 6, 7, 8, 9, 10], // 8 options
    },
    {
        type: 'red',
        name: 'Tarjeta Roja',
        color: '#EF4444', // Red
        icon: 'close-circle',
        minDays: 7,
        maxDays: 30,
        durationOptions: [7, 10, 15, 20, 25, 30], // 6 options
    },
];

export const penaltySelectionMethods: PenaltySelectionMethod[] = [
    {
        method: 'fixed',
        name: 'Selección Fija',
        description: 'Elige manualmente la duración',
        icon: 'hand-left',
    },
    {
        method: 'random',
        name: 'Ruleta Aleatoria',
        description: 'Deja que la suerte decida',
        icon: 'refresh',
    },
];

export const mockPenalties: Penalty[] = [
    {
        id: 'p1',
        memberId: 'noah',
        memberName: 'Noah',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        reason: 'Did not clean his room',
        duration: 5, // 5 days
        remaining: 4, // 4 days remaining
        startTime: Date.now() - (24 * 60 * 60 * 1000), // Started 1 day ago
        isActive: true,
        createdBy: 'mom',
        category: 'chores',
        penaltyType: 'yellow',
        selectionMethod: 'fixed'
    },
    {
        id: 'p2',
        memberId: 'ariella',
        memberName: 'Ariella',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        reason: 'Used phone too late at night',
        duration: 15, // 15 days
        remaining: 12, // 12 days remaining
        startTime: Date.now() - (3 * 24 * 60 * 60 * 1000), // Started 3 days ago
        isActive: true,
        createdBy: 'dad',
        category: 'screen_time',
        penaltyType: 'red',
        selectionMethod: 'random'
    },
    {
        id: 'p3',
        memberId: 'noah',
        memberName: 'Noah',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        reason: 'Did not do homework',
        duration: 3, // 3 days
        remaining: 0, // Completed
        startTime: Date.now() - (5 * 24 * 60 * 60 * 1000), // Started 5 days ago
        endTime: Date.now() - (2 * 24 * 60 * 60 * 1000), // Ended 2 days ago
        isActive: false,
        reflection: 'I learned that I need to do my homework right after school so I don\'t forget.',
        createdBy: 'mom',
        category: 'homework',
        penaltyType: 'yellow',
        selectionMethod: 'fixed'
    },
    {
        id: 'p4',
        memberId: 'ariella',
        memberName: 'Ariella',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        reason: 'Was rude to her brother',
        duration: 20, // 20 days
        remaining: 0, // Completed
        startTime: Date.now() - (25 * 24 * 60 * 60 * 1000), // Started 25 days ago
        endTime: Date.now() - (5 * 24 * 60 * 60 * 1000), // Ended 5 days ago
        isActive: false,
        reflection: 'I understand that being mean to Noah hurts his feelings. I should be a better big sister.',
        createdBy: 'dad',
        category: 'behavior',
        penaltyType: 'red',
        selectionMethod: 'random'
    },
    {
        id: 'p5',
        memberId: 'noah',
        memberName: 'Noah',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        reason: 'Broke a toy on purpose',
        duration: 7, // 7 days
        remaining: 0, // Completed
        startTime: Date.now() - (10 * 24 * 60 * 60 * 1000), // Started 10 days ago
        endTime: Date.now() - (3 * 24 * 60 * 60 * 1000), // Ended 3 days ago
        isActive: false,
        reflection: 'I was angry but breaking things is not okay. I will count to 10 next time.',
        createdBy: 'mom',
        category: 'behavior',
        penaltyType: 'red',
        selectionMethod: 'fixed'
    }
];

export const penaltyCategories = [
    { id: 'behavior', name: 'Behavior', icon: 'person', color: '#EF4444' },
    { id: 'chores', name: 'Chores', icon: 'home', color: '#F59E0B' },
    { id: 'screen_time', name: 'Screen Time', icon: 'phone-portrait', color: '#8B5CF6' },
    { id: 'homework', name: 'Homework', icon: 'book', color: '#3B82F6' },
    { id: 'other', name: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280' }
];

export const penaltyReasons = [
    'Did not clean room',
    'Did not do homework',
    'Used device too late',
    'Was disrespectful',
    'Did not follow instructions',
    'Fighting with sibling',
    'Did not complete chores',
    'Broke house rules',
    'Was dishonest',
    'Did not listen'
];
