export interface Activity {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    organizer: string;
    organizerAvatar: string;
    type: 'movie' | 'birthday' | 'doctor' | 'shopping' | 'reading' | 'picnic' | 'bowling' | 'library';
    participants: string[];
    status: 'confirmed' | 'voting' | 'planning' | 'completed';
    description?: string;
    votingOptions?: VotingOption[];
    responsibilities?: Responsibility[];
    chatMessages?: ChatMessage[];
}

export interface VotingOption {
    id: string;
    title: string;
    description: string;
    votes: number;
    voters: string[];
    poster?: string;
    rating?: number;
    duration?: string;
    genre?: string;
    tags?: string[];
}

export interface Responsibility {
    id: string;
    title: string;
    assignedTo: string;
    assignedToAvatar: string;
    dueDate?: string;
    dueTime?: string;
    completed: boolean;
}

export interface ChatMessage {
    id: string;
    author: string;
    authorAvatar: string;
    message: string;
    timestamp: string;
}

export interface FamilyMember {
    id: string;
    name: string;
    avatar: string;
    hasVoted?: boolean;
}

// CLEAN DATA - Empty activities ready for real connections
export const mockActivities: Activity[] = [];
/* Original mock data - commented out for clean state
    {
        id: '1',
        title: 'Movie Night',
        date: 'Friday',
        time: '7:00 PM',
        location: 'Living Room',
        organizer: 'Mom',
        organizerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
        type: 'movie',
        participants: ['Mom', 'Dad', 'Emma', 'Jake'],
        status: 'voting',
        description: 'Family movie night with popcorn and snacks',
        votingOptions: [
            {
                id: 'movie1',
                title: 'Spider-Man: Into the Spider-Verse',
                description: 'Animation • 1h 57m • PG',
                votes: 3,
                voters: ['Mom', 'Emma', 'Jake'],
                poster: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
                rating: 8.4,
                duration: '1h 57m',
                genre: 'Animation',
                tags: ['Family Friendly']
            },
            {
                id: 'movie2',
                title: 'Frozen II',
                description: 'Animation • 1h 43m • PG',
                votes: 1,
                voters: ['Dad'],
                poster: 'https://image.tmdb.org/t/p/w500/qdfARI2pg13WAD2b1SnNcna1i2q.jpg',
                rating: 6.8,
                duration: '1h 43m',
                genre: 'Animation',
                tags: ['Family Friendly']
            }
        ],
        responsibilities: [
            {
                id: 'resp1',
                title: 'Set up living room',
                assignedTo: 'Mom',
                assignedToAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
                completed: true
            },
            {
                id: 'resp2',
                title: 'Get snacks & drinks',
                assignedTo: 'Dad',
                assignedToAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
                dueDate: 'Friday',
                dueTime: '5:00 PM',
                completed: false
            },
            {
                id: 'resp3',
                title: 'Clean up after movie',
                assignedTo: 'Emma',
                assignedToAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
                dueDate: 'Friday',
                dueTime: '10:00 PM',
                completed: false
            },
            {
                id: 'resp4',
                title: 'Choose seat cushions',
                assignedTo: 'Jake',
                assignedToAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
                dueDate: 'Friday',
                dueTime: '6:30 PM',
                completed: false
            }
        ],
        chatMessages: [
            {
                id: 'msg1',
                author: 'Emma',
                authorAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
                message: 'Can we have extra butter popcorn? 🍿',
                timestamp: '2h ago'
            },
            {
                id: 'msg2',
                author: 'Dad',
                authorAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
                message: 'Sure! I\'ll get the good stuff 😊',
                timestamp: '1h ago'
            },
            {
                id: 'msg3',
                author: 'Jake',
                authorAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
                message: 'I vote Spider-Man! 🕷️',
                timestamp: '30m ago'
            }
        ]
    },
    {
        id: '2',
        title: 'Emma\'s Piano Lesson',
        date: 'Monday',
        time: '4:00 PM',
        location: 'Music Academy',
        organizer: 'Mom',
        organizerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
        type: 'doctor',
        participants: ['Emma', 'Mom'],
        status: 'confirmed',
        description: 'Weekly piano lesson with Mrs. Johnson'
    },
    {
        id: '3',
        title: 'Grocery Shopping',
        date: 'Monday',
        time: '6:30 PM',
        location: 'Whole Foods',
        organizer: 'Dad',
        organizerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
        type: 'shopping',
        participants: ['Dad', 'Mom', 'Emma', 'Jake'],
        status: 'confirmed',
        description: 'Weekly family grocery shopping'
    },
    {
        id: '4',
        title: 'Family Reading Time',
        date: 'Monday',
        time: '8:00 PM',
        location: 'Living room',
        organizer: 'Mom',
        organizerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
        type: 'reading',
        participants: ['Mom', 'Dad', 'Emma', 'Jake'],
        status: 'planning',
        description: '30 minutes of family reading time'
    },
    {
        id: '5',
        title: 'Emma\'s Birthday Party',
        date: 'Saturday',
        time: '2:00 PM',
        location: 'Backyard',
        organizer: 'Mom',
        organizerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
        type: 'birthday',
        participants: ['Mom', 'Dad', 'Emma', 'Jake'],
        status: 'confirmed',
        description: 'Backyard celebration with cake and games'
    },
    {
        id: '6',
        title: 'Jake\'s Doctor Visit',
        date: 'Wednesday',
        time: '10:00 AM',
        location: 'Pediatric Clinic',
        organizer: 'Mom',
        organizerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
        type: 'doctor',
        participants: ['Jake', 'Mom'],
        status: 'confirmed',
        description: 'Regular checkup appointment'
    }
]; */

// CLEAN DATA - Empty members ready for real connections
export const mockFamilyMembers: FamilyMember[] = [];

export const mockRecentDecisions = [
    {
        id: '1',
        title: 'Pizza Night',
        icon: 'pizza',
        iconColor: '#10B981',
        result: 'Won with 4/4 votes',
        date: 'Last Friday',
        winner: true
    },
    {
        id: '2',
        title: 'Bowling',
        icon: 'bowling-ball',
        iconColor: '#3B82F6',
        result: 'Won with 3/4 votes',
        date: 'Last Weekend',
        winner: true
    },
    {
        id: '3',
        title: 'Library Visit',
        icon: 'book',
        iconColor: '#8B5CF6',
        result: 'Won with 3/4 votes',
        date: '2 weeks ago',
        winner: true
    }
];
