export type GoalCategory =
  | "personal"
  | "recreation"
  | "spiritual"
  | "health"
  | "education"
  | "family";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  assignedTo: string[];
  dueDate: string;
  reward?: string;
  milestones: number;
  completedMilestones: number;
  progress: number;
  status: "active" | "completed" | "overdue";
  priority?: "low" | "medium" | "high";
  createdAt: string;
  completedAt?: string;
  notes?: string[];
  history?: GoalHistoryEntry[];
}

export interface GoalHistoryEntry {
  id: string;
  date: string;
  action: "milestone_completed" | "goal_completed" | "note_added" | "due_date_extended";
  description: string;
  userId: string;
}

export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  milestones: number;
  defaultReward: string;
  icon: string;
  emoji: string;
}

export interface GoalStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  overdueGoals: number;
  averageProgress: number;
  goalsByCategory: Record<GoalCategory, number>;
  spiritualGoals: number;
  familyGoals: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role: 'parent' | 'child' | 'teen';
  age?: number;
}
