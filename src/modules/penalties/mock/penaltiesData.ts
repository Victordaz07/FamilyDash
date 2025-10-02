import { Penalty, FamilyMember } from '../types/penaltyTypes';

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

export const mockPenalties: Penalty[] = [
    {
        id: 'p1',
        memberId: 'noah',
        memberName: 'Noah',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        reason: 'Did not clean his room',
        duration: 30,
        remaining: 25,
        startTime: Date.now() - (5 * 60 * 1000), // Started 5 minutes ago
        isActive: true,
        createdBy: 'mom',
        category: 'chores'
    },
    {
        id: 'p2',
        memberId: 'ariella',
        memberName: 'Ariella',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        reason: 'Used phone too late at night',
        duration: 20,
        remaining: 12,
        startTime: Date.now() - (8 * 60 * 1000), // Started 8 minutes ago
        isActive: true,
        createdBy: 'dad',
        category: 'screen_time'
    },
    {
        id: 'p3',
        memberId: 'noah',
        memberName: 'Noah',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        reason: 'Did not do homework',
        duration: 15,
        remaining: 0,
        startTime: Date.now() - (2 * 60 * 60 * 1000), // Started 2 hours ago
        endTime: Date.now() - (1 * 60 * 60 * 1000), // Ended 1 hour ago
        isActive: false,
        reflection: 'I learned that I need to do my homework right after school so I don\'t forget.',
        createdBy: 'mom',
        category: 'homework'
    },
    {
        id: 'p4',
        memberId: 'ariella',
        memberName: 'Ariella',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        reason: 'Was rude to her brother',
        duration: 25,
        remaining: 0,
        startTime: Date.now() - (3 * 60 * 60 * 1000), // Started 3 hours ago
        endTime: Date.now() - (2 * 60 * 60 * 1000), // Ended 2 hours ago
        isActive: false,
        reflection: 'I understand that being mean to Noah hurts his feelings. I should be a better big sister.',
        createdBy: 'dad',
        category: 'behavior'
    },
    {
        id: 'p5',
        memberId: 'noah',
        memberName: 'Noah',
        memberAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        reason: 'Broke a toy on purpose',
        duration: 10,
        remaining: 0,
        startTime: Date.now() - (24 * 60 * 60 * 1000), // Started yesterday
        endTime: Date.now() - (23 * 60 * 60 * 1000), // Ended yesterday
        isActive: false,
        reflection: 'I was angry but breaking things is not okay. I will count to 10 next time.',
        createdBy: 'mom',
        category: 'behavior'
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
