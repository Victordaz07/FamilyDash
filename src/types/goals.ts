export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type GoalCategory = 'spiritual' | 'family' | 'personal' | 'health' | 'education' | 'financial' | 'relationship';

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
  dueAt?: number; // ms
  createdAt: number;
}

export interface Goal {
  id: string;
  familyId: string;
  ownerId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  status: GoalStatus;
  createdAt: number;
  updatedAt: number;
  deadlineAt?: number;
  milestonesCount: number; // denormalizado
  milestonesDone: number;  // denormalizado
  coverUrl?: string; // para la galería
  visibility: 'family' | 'private';
  reflectionCount?: number;
  lastActivityAt?: number;
}

export interface Reflection {
  id: string;
  familyId: string;
  goalId?: string; // opcional si es general
  authorId: string;
  content: string;
  createdAt: number;
  mood?: 'happy' | 'grateful' | 'proud' | 'thoughtful';
}

export interface Inspiration {
  id: string;
  familyId: string;
  authorId: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: number;
  category?: GoalCategory;
}

export interface GoalStats {
  total: number;
  active: number;
  completed: number;
  paused: number;
  overdue: number;
}
