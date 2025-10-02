import { Goal, GoalTemplate, FamilyMember, GoalStats } from '../types/goalTypes';

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

export const goalTemplates: GoalTemplate[] = [
    {
        id: 'template_fhe',
        title: 'Weekly Family Home Evening',
        description: 'Hold weekly family home evening every Monday',
        category: 'family',
        milestones: 4,
        defaultReward: 'Family treat 🍦',
        icon: 'home',
        emoji: '🕯️'
    },
    {
        id: 'template_scripture',
        title: 'Daily Scripture Reading',
        description: 'Read scriptures together as a family',
        category: 'spiritual',
        milestones: 30,
        defaultReward: 'Choose next family book 📚',
        icon: 'book',
        emoji: '📖'
    },
    {
        id: 'template_temple',
        title: 'Attend Temple Twice',
        description: 'Visit the temple twice this month',
        category: 'spiritual',
        milestones: 2,
        defaultReward: 'Special family dinner 🍽️',
        icon: 'location',
        emoji: '⛪'
    },
    {
        id: 'template_service',
        title: 'Acts of Service',
        description: 'Perform weekly acts of service',
        category: 'family',
        milestones: 3,
        defaultReward: 'Family game night 🎮',
        icon: 'heart',
        emoji: '❤️'
    }
];

export const mockGoals: Goal[] = [
    {
        id: 'g1',
        title: 'Weekly Family Home Evening',
        description: 'Hold weekly family home evening every Monday to strengthen family bonds',
        category: 'family',
        assignedTo: ['all'],
        dueDate: '2025-10-31',
        reward: 'Family treat 🍦',
        milestones: 4,
        completedMilestones: 3,
        progress: 75,
        status: 'active',
        priority: 'high',
        createdAt: '2025-09-01',
        notes: ['Week 1: Lesson on gratitude', 'Week 2: Family game night', 'Week 3: Service project'],
        history: [
            {
                id: 'h1',
                date: '2025-09-08',
                action: 'milestone_completed',
                description: 'Completed Week 1',
                userId: 'mom'
            },
            {
                id: 'h2',
                date: '2025-09-15',
                action: 'milestone_completed',
                description: 'Completed Week 2',
                userId: 'dad'
            },
            {
                id: 'h3',
                date: '2025-09-22',
                action: 'milestone_completed',
                description: 'Completed Week 3',
                userId: 'mom'
            }
        ]
    },
    {
        id: 'g2',
        title: 'Daily Scripture Reading',
        description: 'Read scriptures together as a family for 30 days',
        category: 'spiritual',
        assignedTo: ['all'],
        dueDate: '2025-12-31',
        reward: 'Choose next family book 📚',
        milestones: 30,
        completedMilestones: 15,
        progress: 50,
        status: 'active',
        priority: 'high',
        createdAt: '2025-09-01',
        notes: ['Reading 1 Nephi together', 'Discussing verses daily'],
        history: [
            {
                id: 'h4',
                date: '2025-09-01',
                action: 'milestone_completed',
                description: 'Started daily reading',
                userId: 'dad'
            }
        ]
    },
    {
        id: 'g3',
        title: 'Family Reading Challenge',
        description: 'Read 50 books together as a family by end of year',
        category: 'education',
        assignedTo: ['all'],
        dueDate: '2025-12-31',
        reward: 'New book shopping trip 📚',
        milestones: 50,
        completedMilestones: 18,
        progress: 36,
        status: 'active',
        priority: 'medium',
        createdAt: '2025-01-01',
        notes: ['Current book: Harry Potter', 'Next: Chronicles of Narnia']
    },
    {
        id: 'g4',
        title: 'Attend Temple Twice',
        description: 'Visit the temple twice this month',
        category: 'spiritual',
        assignedTo: ['dad', 'mom'],
        dueDate: '2025-10-31',
        reward: 'Special family dinner 🍽️',
        milestones: 2,
        completedMilestones: 1,
        progress: 50,
        status: 'active',
        priority: 'high',
        createdAt: '2025-10-01',
        notes: ['First visit completed', 'Second visit planned for next week']
    },
    {
        id: 'g5',
        title: 'Acts of Service',
        description: 'Perform weekly acts of service in the community',
        category: 'family',
        assignedTo: ['all'],
        dueDate: '2025-11-30',
        reward: 'Family game night 🎮',
        milestones: 3,
        completedMilestones: 2,
        progress: 67,
        status: 'active',
        priority: 'medium',
        createdAt: '2025-10-01',
        notes: ['Week 1: Helped elderly neighbor', 'Week 2: Volunteered at food bank']
    },
    {
        id: 'g6',
        title: 'Learn Piano',
        description: 'Ariella learns to play 5 songs on piano',
        category: 'personal',
        assignedTo: ['ariella'],
        dueDate: '2025-12-31',
        reward: 'New piano books 🎹',
        milestones: 5,
        completedMilestones: 5,
        progress: 100,
        status: 'completed',
        priority: 'medium',
        createdAt: '2025-06-01',
        completedAt: '2025-09-15',
        notes: ['Song 1: Twinkle Twinkle', 'Song 2: Mary Had a Little Lamb', 'Song 3: Happy Birthday', 'Song 4: Jingle Bells', 'Song 5: Amazing Grace']
    },
    {
        id: 'g7',
        title: 'Family Exercise Routine',
        description: 'Exercise together 3 times per week',
        category: 'health',
        assignedTo: ['all'],
        dueDate: '2025-11-30',
        reward: 'Family hike 🥾',
        milestones: 12,
        completedMilestones: 8,
        progress: 67,
        status: 'active',
        priority: 'medium',
        createdAt: '2025-09-01',
        notes: ['Monday: Family walk', 'Wednesday: Yoga', 'Friday: Bike ride']
    },
    {
        id: 'g8',
        title: 'Noah\'s Math Practice',
        description: 'Noah practices math 15 minutes daily',
        category: 'education',
        assignedTo: ['noah'],
        dueDate: '2025-10-31',
        reward: 'Extra screen time 🎮',
        milestones: 30,
        completedMilestones: 30,
        progress: 100,
        status: 'completed',
        priority: 'high',
        createdAt: '2025-09-01',
        completedAt: '2025-09-30',
        notes: ['Completed all 30 days of practice!']
    }
];

export const goalCategories = [
    {
        id: 'spiritual',
        name: 'Spiritual',
        icon: 'heart',
        color: '#7C3AED',
        emoji: '🙏',
        gradient: ['#7C3AED', '#A855F7']
    },
    {
        id: 'family',
        name: 'Family',
        icon: 'home',
        color: '#0D9488',
        emoji: '👨‍👩‍👧‍👦',
        gradient: ['#0D9488', '#14B8A6']
    },
    {
        id: 'personal',
        name: 'Personal',
        icon: 'person',
        color: '#EC4899',
        emoji: '💁‍♂️',
        gradient: ['#EC4899', '#F472B6']
    },
    {
        id: 'health',
        name: 'Health',
        icon: 'fitness',
        color: '#10B981',
        emoji: '🏃',
        gradient: ['#10B981', '#34D399']
    },
    {
        id: 'education',
        name: 'Education',
        icon: 'school',
        color: '#3B82F6',
        emoji: '📚',
        gradient: ['#3B82F6', '#60A5FA']
    },
    {
        id: 'recreation',
        name: 'Recreation',
        icon: 'game-controller',
        color: '#F59E0B',
        emoji: '🎮',
        gradient: ['#F59E0B', '#FBBF24']
    }
];

export const getGoalStats = (goals: Goal[]): GoalStats => {
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const overdueGoals = goals.filter(g => g.status === 'overdue').length;

    const averageProgress = goals.length > 0
        ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
        : 0;

    const goalsByCategory = goals.reduce((acc, goal) => {
        acc[goal.category] = (acc[goal.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const spiritualGoals = goals.filter(g => g.category === 'spiritual').length;
    const familyGoals = goals.filter(g => g.category === 'family').length;

    return {
        totalGoals,
        activeGoals,
        completedGoals,
        overdueGoals,
        averageProgress: Math.round(averageProgress),
        goalsByCategory: goalsByCategory as Record<string, number>,
        spiritualGoals,
        familyGoals
    };
};
