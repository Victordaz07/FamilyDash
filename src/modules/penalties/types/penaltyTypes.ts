export interface Penalty {
    id: string;
    memberId: string;
    memberName: string;
    memberAvatar: string;
    reason: string;
    duration: number; // in days
    remaining: number; // countdown in days
    startTime: number; // timestamp
    endTime?: number; // timestamp when completed
    isActive: boolean;
    reflection?: string;
    createdBy: string; // who assigned the penalty
    category: 'behavior' | 'chores' | 'screen_time' | 'homework' | 'other';
    penaltyType: 'yellow' | 'red'; // Yellow card (minor) or Red card (major)
    selectionMethod: 'fixed'; // How the duration was selected
}

export interface FamilyMember {
    id: string;
    name: string;
    avatar: string;
    role: 'parent' | 'child' | 'teen';
    age?: number;
}

export interface PenaltyStats {
    totalPenalties: number;
    activePenalties: number;
    completedPenalties: number;
    totalTimeServed: number; // in minutes
    averageDuration: number;
    mostCommonReason: string;
}

export interface ReflectionData {
    penaltyId: string;
    text: string;
    timestamp: number;
    mood: 'sad' | 'neutral' | 'understanding' | 'happy';
    learned: boolean;
}

export interface PenaltyTypeConfig {
    type: 'yellow' | 'red';
    name: string;
    color: string;
    icon: string;
    minDays: number;
    maxDays: number;
    durationOptions: number[];
}

export interface PenaltySelectionMethod {
    method: 'fixed';
    name: string;
    description: string;
    icon: string;
}




