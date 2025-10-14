/**
 * Family Dashboard Service for FamilyDash
 * Advanced family management and insights coordination
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FamilyMemberActivity {
    memberId: string;
    name: string;
    role: 'admin' | 'sub-admin' | 'child';
    status: 'online' | 'offline' | 'away' | 'busy';
    lastSeen: number;
    currentActivity: string;
    location?: string;
    batteryLevel?: number;
    timeSpentToday: number; // minutes
}

export interface FamilyGoal {
    id: string;
    title: string;
    description: string;
    category: 'health' | 'education' | 'home' | 'finance' | 'relationship' | 'leisure';
    createdBy: string;
    createdAt: number;
    dueDate?: number;
    targetValue: number;
    currentValue: number;
    progress: number; // percentage
    contributors: string[];
    milestones: FamilyMilestone[];
    rewards: FamilyReward[];
    status: 'active' | 'completed' | 'paused' | 'cancelled';
}

export interface FamilyMilestone {
    id: string;
    goalId: string;
    title: string;
    description: string;
    targetValue: number;
    achievedAt?: number;
    contributors: string[];
    rewards: FamilyReward[];
}

export interface FamilyReward {
    id: string;
    title: string;
    description: string;
    type: 'praise' | 'privilege' | 'gift' | 'activity' | 'screen_time';
    value: string | number;
    Icon?: string;
    achieved: boolean;
    achievedAt?: number;
    achievedBy?: string[];
}

export interface FamilyChallenge {
    id: string;
    title: string;
    description: string;
    challengeType: 'daily' | 'weekly' | 'monthly' | 'seasonal';
    duration: number; // days
    startDate: number;
    endDate: number;
    participants: string[];
    rules: string[];
    rewards: FamilyReward[];
    leaderboard: Array<{
        memberId: string;
        score: number;
        progress: number;
        achievements: string[];
    }>;
    activities: Array<{
        id: string;
        title: string;
        points: number;
        completed: boolean;
        completedBy: string[];
    }>;
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface FamilySchedule {
    id: string;
    title: string;
    description: string;
    type: 'family_meal' | 'family_game' | 'tamily_talk' | 'family_outing' | 'study_time' | 'screen_time' | 'bedtime' | 'other';
    startTime: number;
    endTime: number;
    days: string[]; // ['monday', 'tuesday', ...]
    participants: string[];
    location?: string;
    reminderMinutes: number[];
    recurringType: 'none' | 'daily' | 'weekly' | 'monthly';
    priority: 'low' | 'medium' | 'high';
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
    createdBy: string;
    notes?: string;
}

export interface FamilyDashboardData {
    familyId: string;
    lastUpdated: number;

    // Member overview
    members: Array<{
        id: string;
        name: string;
        role: string;
        status: string;
        activity: string;
        timeSpent: number;
    }>;

    // Activity summary
    activity: {
        totalTasksCompleted: number;
        totalGoalsProgress: number;
        totalSafeRoomMessages: number;
        totalCalendarEvents: number;
        totalTimeSpent: number; // minutes
    };

    // Active elements
    activeGoals: FamilyGoal[];
    activeChallenges: FamilyChallenge[];
    upcomingSchedules: FamilySchedule[];

    // Metrics
    metrics: {
        collaborationScore: number; // 0-100
        productivityScore: number; // 0-100
        communicationScore: number; // 0-100
        consistencyScore: number; // 0-100
        overallFamilyScore: number; // 0-100
    };

    // Leaderboard
    leaderboard: Array<{
        rank: number;
        memberId: string;
        name: string;
        score: number;
        points: number;
        achievements: number;
        streakDays: number;
    }>;
}

export class FamilyDashboardService {
    private static instance: FamilyDashboardService;
    private cachedData: Map<string, FamilyDashboardData> = new Map();

    private constructor() {
        this.initializeService();
    }

    static getInstance(): FamilyDashboardService {
        if (!FamilyDashboardService.instance) {
            FamilyDashboardService.instance = new FamilyDashboardService();
        }
        return FamilyDashboardService.instance;
    }

    /**
     * Initialize service
     */
    private async initializeService(): Promise<void> {
        console.log('🏠 Family Dashboard Service initialized');
    }

    /**
     * Get family dashboard data
     */
    async getFamilyDashboard(familyId: string): Promise<FamilyDashboardData> {
        try {
            // Check cache first
            const cached = this.cachedData.get(familyId);
            if (cached && this.isCacheValid(cached)) {
                return cached;
            }

            // Generate fresh data
            const data = await this.generateFamilyDashboard(familyId);

            // Cache the data
            this.cachedData.set(familyId, data);

            return data;
        } catch (error) {
            console.error('Error getting family dashboard:', error);
            throw error;
        }
    }

    /**
     * Generate family dashboard data
     */
    private async generateFamilyDashboard(familyId: string): Promise<FamilyDashboardData> {
        const mockMembers = [
            { id: 'mom_001', name: 'Maria Garcia', role: 'admin', status: 'online', activity: 'Managing family calendar', timeSpent: 45 },
            { id: 'dad_001', name: 'Carlos Garcia', role: 'admin', status: 'online', activity: 'Reviewing tasks', timeSpent: 32 },
            { id: 'kid_001', name: 'Sofia Garcia', role: 'child', status: 'online', activity: 'Completing homework', timeSpent: 28 },
            { id: 'kid_002', name: 'Miguel Garcia', role: 'child', status: 'offline', activity: 'Last seen 2h ago', timeSpent: 15 },
        ];

        const dashboardData: FamilyDashboardData = {
            familyId,
            lastUpdated: Date.now(),

            members: mockMembers,

            activity: {
                totalTasksCompleted: 48,
                totalGoalsProgress: 78,
                totalSafeRoomMessages: 23,
                totalCalendarEvents: 12,
                totalTimeSpent: 120,
            },

            activeGoals: [],
            activeChallenges: [],
            upcomingSchedules: [],

            metrics: {
                collaborationScore: 85,
                productivityScore: 78,
                communicationScore: 92,
                consistencyScore: 73,
                overallFamilyScore: 82,
            },

            leaderboard: [
                { rank: 1, memberId: 'mom_001', name: 'Maria Garcia', score: 92, points: 1250, achievements: 8, streakDays: 12 },
                { rank: 2, memberId: 'kid_001', name: 'Sofia Garcia', score: 88, points: 980, achievements: 6, streakDays: 8 },
                { rank: 3, memberId: 'dad_001', name: 'Carlos Garcia', score: 79, points: 720, achievements: 5, streakDays: 5 },
                { rank: 4, memberId: 'kid_002', name: 'Miguel Garcia', score: 65, points: 450, achievements: 3, streakDays: 2 },
            ],
        };

        return dashboardData;
    }

    /**
     * Check if cache is valid
     */
    private isCacheValid(data: FamilyDashboardData): boolean {
        const cacheValidity = 5 * 60 * 1000; // 5 minutes
        return Date.now() - data.lastUpdated < cacheValidity;
    }
}




