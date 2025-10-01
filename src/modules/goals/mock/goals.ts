export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'family' | 'personal' | 'health' | 'education' | 'financial' | 'recreation';
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  progress: number; // 0-100
  targetDate: string;
  createdDate: string;
  completedDate?: string;
  assignedTo: string[];
  milestones: Milestone[];
  rewards: Reward[];
  createdBy: string;
  createdByAvatar: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedDate?: string;
  progress: number; // 0-100
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  unlocked: boolean;
  unlockedDate?: string;
  icon: string;
  color: string;
}

export interface GoalCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Family Reading Challenge',
    description: 'Read 50 books together as a family this year',
    category: 'family',
    priority: 'high',
    status: 'in_progress',
    progress: 68,
    targetDate: '2024-12-31',
    createdDate: '2024-01-01',
    assignedTo: ['Mom', 'Dad', 'Emma', 'Jake'],
    milestones: [
      {
        id: 'm1',
        title: 'First 10 books',
        description: 'Complete first 10 books',
        targetDate: '2024-03-31',
        completed: true,
        completedDate: '2024-03-15',
        progress: 100
      },
      {
        id: 'm2',
        title: '25 books milestone',
        description: 'Reach halfway point',
        targetDate: '2024-06-30',
        completed: true,
        completedDate: '2024-06-20',
        progress: 100
      },
      {
        id: 'm3',
        title: '40 books milestone',
        description: 'Almost there!',
        targetDate: '2024-09-30',
        completed: false,
        progress: 85
      },
      {
        id: 'm4',
        title: '50 books completed',
        description: 'Final milestone',
        targetDate: '2024-12-31',
        completed: false,
        progress: 0
      }
    ],
    rewards: [
      {
        id: 'r1',
        title: 'Bookworm Badge',
        description: 'Complete 10 books',
        points: 100,
        unlocked: true,
        unlockedDate: '2024-03-15',
        icon: 'book',
        color: '#10B981'
      },
      {
        id: 'r2',
        title: 'Reading Champion',
        description: 'Complete 25 books',
        points: 250,
        unlocked: true,
        unlockedDate: '2024-06-20',
        icon: 'trophy',
        color: '#F59E0B'
      },
      {
        id: 'r3',
        title: 'Literary Master',
        description: 'Complete 50 books',
        points: 500,
        unlocked: false,
        icon: 'star',
        color: '#8B5CF6'
      }
    ],
    createdBy: 'Mom',
    createdByAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
  },
  {
    id: '2',
    title: 'Family Fitness Challenge',
    description: 'Exercise together 3 times per week for 6 months',
    category: 'health',
    priority: 'medium',
    status: 'in_progress',
    progress: 45,
    targetDate: '2024-08-31',
    createdDate: '2024-02-01',
    assignedTo: ['Mom', 'Dad', 'Emma', 'Jake'],
    milestones: [
      {
        id: 'm5',
        title: 'First month',
        description: 'Complete first month',
        targetDate: '2024-03-01',
        completed: true,
        completedDate: '2024-03-01',
        progress: 100
      },
      {
        id: 'm6',
        title: 'Three months',
        description: 'Halfway point',
        targetDate: '2024-05-01',
        completed: false,
        progress: 60
      },
      {
        id: 'm7',
        title: 'Six months',
        description: 'Complete the challenge',
        targetDate: '2024-08-01',
        completed: false,
        progress: 0
      }
    ],
    rewards: [
      {
        id: 'r4',
        title: 'Fitness Starter',
        description: 'Complete first month',
        points: 150,
        unlocked: true,
        unlockedDate: '2024-03-01',
        icon: 'fitness',
        color: '#10B981'
      },
      {
        id: 'r5',
        title: 'Health Hero',
        description: 'Complete 6 months',
        points: 400,
        unlocked: false,
        icon: 'medal',
        color: '#3B82F6'
      }
    ],
    createdBy: 'Dad',
    createdByAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'
  },
  {
    id: '3',
    title: 'Save for Family Vacation',
    description: 'Save $5,000 for a family vacation to Disney World',
    category: 'financial',
    priority: 'high',
    status: 'in_progress',
    progress: 72,
    targetDate: '2024-12-31',
    createdDate: '2024-01-15',
    assignedTo: ['Mom', 'Dad'],
    milestones: [
      {
        id: 'm8',
        title: '$1,000 saved',
        description: 'First milestone',
        targetDate: '2024-03-31',
        completed: true,
        completedDate: '2024-03-20',
        progress: 100
      },
      {
        id: 'm9',
        title: '$2,500 saved',
        description: 'Halfway point',
        targetDate: '2024-06-30',
        completed: true,
        completedDate: '2024-06-15',
        progress: 100
      },
      {
        id: 'm10',
        title: '$5,000 saved',
        description: 'Goal achieved!',
        targetDate: '2024-12-31',
        completed: false,
        progress: 72
      }
    ],
    rewards: [
      {
        id: 'r6',
        title: 'Saver Badge',
        description: 'Save first $1,000',
        points: 200,
        unlocked: true,
        unlockedDate: '2024-03-20',
        icon: 'wallet',
        color: '#10B981'
      },
      {
        id: 'r7',
        title: 'Vacation Ready',
        description: 'Save $5,000',
        points: 1000,
        unlocked: false,
        icon: 'airplane',
        color: '#EC4899'
      }
    ],
    createdBy: 'Mom',
    createdByAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
  },
  {
    id: '4',
    title: 'Learn Spanish Together',
    description: 'Complete Spanish language course as a family',
    category: 'education',
    priority: 'medium',
    status: 'not_started',
    progress: 0,
    targetDate: '2024-11-30',
    createdDate: '2024-03-01',
    assignedTo: ['Mom', 'Dad', 'Emma', 'Jake'],
    milestones: [
      {
        id: 'm11',
        title: 'Basic vocabulary',
        description: 'Learn 100 basic words',
        targetDate: '2024-05-31',
        completed: false,
        progress: 0
      },
      {
        id: 'm12',
        title: 'Simple conversations',
        description: 'Hold basic conversations',
        targetDate: '2024-08-31',
        completed: false,
        progress: 0
      },
      {
        id: 'm13',
        title: 'Course completion',
        description: 'Complete full course',
        targetDate: '2024-11-30',
        completed: false,
        progress: 0
      }
    ],
    rewards: [
      {
        id: 'r8',
        title: 'Language Learner',
        description: 'Start the course',
        points: 50,
        unlocked: false,
        icon: 'school',
        color: '#3B82F6'
      },
      {
        id: 'r9',
        title: 'Bilingual Family',
        description: 'Complete the course',
        points: 600,
        unlocked: false,
        icon: 'globe',
        color: '#8B5CF6'
      }
    ],
    createdBy: 'Emma',
    createdByAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg'
  }
];

export const mockCategories: GoalCategory[] = [
  {
    id: 'family',
    name: 'Family',
    icon: 'people',
    color: '#3B82F6',
    count: 1
  },
  {
    id: 'health',
    name: 'Health',
    icon: 'fitness',
    color: '#10B981',
    count: 1
  },
  {
    id: 'financial',
    name: 'Financial',
    icon: 'wallet',
    color: '#F59E0B',
    count: 1
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'school',
    color: '#8B5CF6',
    count: 1
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: 'person',
    color: '#EC4899',
    count: 0
  },
  {
    id: 'recreation',
    name: 'Recreation',
    icon: 'game-controller',
    color: '#EF4444',
    count: 0
  }
];

export const mockFamilyMembers = [
  {
    id: 'mom',
    name: 'Mom',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
    points: 1250,
    level: 5
  },
  {
    id: 'dad',
    name: 'Dad',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
    points: 980,
    level: 4
  },
  {
    id: 'emma',
    name: 'Emma',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
    points: 750,
    level: 3
  },
  {
    id: 'jake',
    name: 'Jake',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    points: 620,
    level: 3
  }
];
