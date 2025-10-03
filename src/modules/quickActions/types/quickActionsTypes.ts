export interface FamilyMember {
    id: string;
    name: string;
    age?: number;
    role: "admin" | "moderator" | "child" | "guest";
    avatar: string;
    deviceId?: string;
    isOnline: boolean;
    permissions: {
        tasks: boolean;
        goals: boolean;
        penalties: boolean;
        safeRoom: boolean;
        settings: boolean;
    };
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    points: number;
    achieved: boolean;
    assignedTo: string[];
    category: "tasksCompleted" | "goalsReached" | "noPenalties" | "specialEvents";
    progress?: number;
    maxProgress?: number;
}

export interface ActivityLog {
    id: string;
    type: "task" | "goal" | "penalty" | "safeRoom";
    description: string;
    memberId: string;
    memberName: string;
    timestamp: string;
    details?: string;
}

export interface FamilyStats {
    totalTasks: number;
    completedTasks: number;
    activeGoals: number;
    penalties: number;
    safeRoomInteractions: number;
    lastUpdated: string;
    memberStats: {
        [memberId: string]: {
            tasksCompleted: number;
            goalsReached: number;
            penaltiesReceived: number;
            safeRoomEntries: number;
        };
    };
}

export interface QuickActionsState {
    familyMembers: FamilyMember[];
    achievements: Achievement[];
    activityLogs: ActivityLog[];
    familyStats: FamilyStats;
    loading: boolean;
    error: string | null;
}
