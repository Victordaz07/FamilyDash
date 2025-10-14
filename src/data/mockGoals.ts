import { Goal } from '@/types/goals';

export const mockGoals: Goal[] = [
  {
    id: '1',
    familyId: 'family-1',
    ownerId: 'user-1',
    title: 'Learn Spanish Together',
    description: 'Practice Spanish for 30 minutes daily as a family',
    category: 'education',
    status: 'active',
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
    updatedAt: Date.now() - 86400000 * 2, // 2 days ago
    deadlineAt: Date.now() + 86400000 * 30, // 30 days from now
    milestonesCount: 5,
    milestonesDone: 2,
    visibility: 'family',
    reflectionCount: 3,
    lastActivityAt: Date.now() - 86400000 * 1, // 1 day ago
  },
  {
    id: '2',
    familyId: 'family-1',
    ownerId: 'user-2',
    title: 'Weekly Family Exercise',
    description: 'Go for a family walk or bike ride every weekend',
    category: 'health',
    status: 'active',
    createdAt: Date.now() - 86400000 * 14, // 14 days ago
    updatedAt: Date.now() - 86400000 * 1, // 1 day ago
    deadlineAt: Date.now() + 86400000 * 14, // 14 days from now
    milestonesCount: 8,
    milestonesDone: 6,
    visibility: 'family',
    reflectionCount: 5,
    lastActivityAt: Date.now() - 86400000 * 1, // 1 day ago
  },
  {
    id: '3',
    familyId: 'family-1',
    ownerId: 'user-1',
    title: 'Save for Family Vacation',
    description: 'Save $2000 for our summer vacation to the beach',
    category: 'financial',
    status: 'active',
    createdAt: Date.now() - 86400000 * 30, // 30 days ago
    updatedAt: Date.now() - 86400000 * 3, // 3 days ago
    deadlineAt: Date.now() + 86400000 * 60, // 60 days from now
    milestonesCount: 10,
    milestonesDone: 4,
    visibility: 'family',
    reflectionCount: 2,
    lastActivityAt: Date.now() - 86400000 * 3, // 3 days ago
  },
  {
    id: '4',
    familyId: 'family-1',
    ownerId: 'user-3',
    title: 'Morning Meditation Practice',
    description: 'Start each day with 10 minutes of family meditation',
    category: 'spiritual',
    status: 'completed',
    createdAt: Date.now() - 86400000 * 45, // 45 days ago
    updatedAt: Date.now() - 86400000 * 5, // 5 days ago
    deadlineAt: Date.now() - 86400000 * 5, // 5 days ago (completed)
    milestonesCount: 7,
    milestonesDone: 7,
    visibility: 'family',
    reflectionCount: 8,
    lastActivityAt: Date.now() - 86400000 * 5, // 5 days ago
  },
  {
    id: '5',
    familyId: 'family-1',
    ownerId: 'user-2',
    title: 'Family Game Night',
    description: 'Play board games together every Friday evening',
    category: 'family',
    status: 'paused',
    createdAt: Date.now() - 86400000 * 20, // 20 days ago
    updatedAt: Date.now() - 86400000 * 7, // 7 days ago
    deadlineAt: Date.now() + 86400000 * 20, // 20 days from now
    milestonesCount: 6,
    milestonesDone: 3,
    visibility: 'family',
    reflectionCount: 1,
    lastActivityAt: Date.now() - 86400000 * 7, // 7 days ago
  },
  {
    id: '6',
    familyId: 'family-1',
    ownerId: 'user-1',
    title: 'Learn to Cook New Recipes',
    description: 'Try cooking one new recipe together each week',
    category: 'personal',
    status: 'active',
    createdAt: Date.now() - 86400000 * 10, // 10 days ago
    updatedAt: Date.now() - 86400000 * 2, // 2 days ago
    deadlineAt: Date.now() + 86400000 * 40, // 40 days from now
    milestonesCount: 8,
    milestonesDone: 2,
    visibility: 'family',
    reflectionCount: 0,
    lastActivityAt: Date.now() - 86400000 * 2, // 2 days ago
  },
  {
    id: '7',
    familyId: 'family-1',
    ownerId: 'user-3',
    title: 'Improve Communication',
    description: 'Have weekly family meetings to discuss goals and feelings',
    category: 'relationship',
    status: 'active',
    createdAt: Date.now() - 86400000 * 25, // 25 days ago
    updatedAt: Date.now() - 86400000 * 1, // 1 day ago
    deadlineAt: Date.now() + 86400000 * 35, // 35 days from now
    milestonesCount: 12,
    milestonesDone: 8,
    visibility: 'family',
    reflectionCount: 4,
    lastActivityAt: Date.now() - 86400000 * 1, // 1 day ago
  },
  {
    id: '8',
    familyId: 'family-1',
    ownerId: 'user-2',
    title: 'Personal Reading Goal',
    description: 'Read 2 books per month for personal development',
    category: 'personal',
    status: 'active',
    createdAt: Date.now() - 86400000 * 5, // 5 days ago
    updatedAt: Date.now() - 86400000 * 1, // 1 day ago
    deadlineAt: Date.now() + 86400000 * 25, // 25 days from now
    milestonesCount: 4,
    milestonesDone: 1,
    visibility: 'private',
    reflectionCount: 0,
    lastActivityAt: Date.now() - 86400000 * 1, // 1 day ago
  },
  {
    id: '9',
    familyId: 'family-1',
    ownerId: 'user-1',
    title: 'Daily Meditation Practice',
    description: 'Practice 10 minutes of family meditation each morning',
    category: 'health',
    status: 'active',
    createdAt: Date.now() - 86400000 * 60, // 60 days ago
    updatedAt: Date.now() - 86400000 * 10, // 10 days ago
    deadlineAt: Date.now() - 86400000 * 5, // 5 days ago (overdue)
    milestonesCount: 6,
    milestonesDone: 2,
    visibility: 'family',
    reflectionCount: 1,
    lastActivityAt: Date.now() - 86400000 * 10, // 10 days ago
  },
  {
    id: '10',
    familyId: 'family-1',
    ownerId: 'user-3',
    title: 'Family Garden Project',
    description: 'Plant and maintain a vegetable garden in our backyard',
    category: 'family',
    status: 'cancelled',
    createdAt: Date.now() - 86400000 * 40, // 40 days ago
    updatedAt: Date.now() - 86400000 * 15, // 15 days ago
    deadlineAt: Date.now() + 86400000 * 20, // 20 days from now
    milestonesCount: 5,
    milestonesDone: 1,
    visibility: 'family',
    reflectionCount: 0,
    lastActivityAt: Date.now() - 86400000 * 15, // 15 days ago
  },
];




