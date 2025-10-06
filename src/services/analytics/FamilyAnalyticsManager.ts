/**
 * Family Analytics Dashboard System
 * Comprehensive analytics and insights for family management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface AnalyticsData {
    tasks: {
        total: number;
        completed: number;
        pending: number;
        overdue: number;
        completionRate: number;
        averageCompletionTime: number;
        byCategory: Record<string, number>;
        byMember: Record<string, number>;
        trends: Array<{
            date: string;
            completed: number;
            created: number;
        }>;
    };
    goals: {
        total: number;
        active: number;
        completed: number;
        paused: number;
        completionRate: number;
        averageProgress: number;
        byCategory: Record<string, number>;
        byMember: Record<string, number>;
        trends: Array<{
            date: string;
            progress: number;
            completed: number;
        }>;
    };
    penalties: {
        total: number;
        active: number;
        completed: number;
        cancelled: number;
        complianceRate: number;
        averageDuration: number;
        byType: Record<string, number>;
        byMember: Record<string, number>;
        trends: Array<{
            date: string;
            assigned: number;
            completed: number;
        }>;
    };
    calendar: {
        totalEvents: number;
        upcomingEvents: number;
        completedEvents: number;
        participationRate: number;
        byCategory: Record<string, number>;
        byMember: Record<string, number>;
        trends: Array<{
            date: string;
            events: number;
            participation: number;
        }>;
    };
    safeRoom: {
        totalMessages: number;
        messagesByType: Record<string, number>;
        byMember: Record<string, number>;
        averageResponseTime: number;
        trends: Array<{
            date: string;
            messages: number;
            responses: number;
        }>;
    };
    family: {
        totalMembers: number;
        activeMembers: number;
        engagementScore: number;
        communicationScore: number;
        productivityScore: number;
        overallScore: number;
        memberStats: Array<{
            id: string;
            name: string;
            tasksCompleted: number;
            goalsProgressed: number;
            penaltiesComplied: number;
            messagesShared: number;
            eventsParticipated: number;
            score: number;
        }>;
    };
}

export interface ChartData {
    type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
    title: string;
    data: Array<{
        label: string;
        value: number;
        color?: string;
        date?: string;
    }>;
    options?: {
        showLegend?: boolean;
        showGrid?: boolean;
        showLabels?: boolean;
        animation?: boolean;
    };
}

export interface Insight {
    id: string;
    type: 'positive' | 'negative' | 'neutral' | 'recommendation';
    category: 'tasks' | 'goals' | 'penalties' | 'calendar' | 'safeRoom' | 'family';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    actionable: boolean;
    actionText?: string;
    actionUrl?: string;
    timestamp: number;
}

export interface AnalyticsReport {
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    endDate: string;
    summary: {
        totalActivities: number;
        completionRate: number;
        engagementScore: number;
        familyScore: number;
        topPerformer: string;
        improvementAreas: string[];
    };
    insights: Insight[];
    charts: ChartData[];
    recommendations: string[];
}

// Analytics Manager
export class FamilyAnalyticsManager {
    private static instance: FamilyAnalyticsManager;
    private analyticsData: AnalyticsData | null = null;
    private insights: Insight[] = [];
    private reports: AnalyticsReport[] = [];

    // Storage keys
    private readonly STORAGE_KEYS = {
        ANALYTICS_DATA: 'family_analytics_data',
        INSIGHTS: 'family_analytics_insights',
        REPORTS: 'family_analytics_reports',
    };

    static getInstance(): FamilyAnalyticsManager {
        if (!FamilyAnalyticsManager.instance) {
            FamilyAnalyticsManager.instance = new FamilyAnalyticsManager();
        }
        return FamilyAnalyticsManager.instance;
    }

    // Initialize analytics
    async initialize(): Promise<void> {
        try {
            await this.loadAnalyticsData();
            await this.loadInsights();
            await this.loadReports();

            // Generate initial analytics if none exist
            if (!this.analyticsData) {
                await this.generateAnalytics();
            }

            console.log('FamilyAnalyticsManager initialized successfully');
        } catch (error) {
            console.error('Error initializing FamilyAnalyticsManager:', error);
        }
    }

    // Generate comprehensive analytics
    async generateAnalytics(): Promise<AnalyticsData> {
        try {
            const analyticsData: AnalyticsData = {
                tasks: await this.generateTaskAnalytics(),
                goals: await this.generateGoalAnalytics(),
                penalties: await this.generatePenaltyAnalytics(),
                calendar: await this.generateCalendarAnalytics(),
                safeRoom: await this.generateSafeRoomAnalytics(),
                family: await this.generateFamilyAnalytics(),
            };

            this.analyticsData = analyticsData;
            await this.saveAnalyticsData();

            // Generate insights based on analytics
            await this.generateInsights();

            return analyticsData;
        } catch (error) {
            console.error('Error generating analytics:', error);
            throw error;
        }
    }

    // Task analytics
    private async generateTaskAnalytics(): Promise<AnalyticsData['tasks']> {
        try {
            const tasksData = await AsyncStorage.getItem('tasks_data');
            const tasks = tasksData ? JSON.parse(tasksData) : [];

            const total = tasks.length;
            const completed = tasks.filter((task: any) => task.status === 'completed').length;
            const pending = tasks.filter((task: any) => task.status === 'pending').length;
            const overdue = tasks.filter((task: any) => task.status === 'overdue').length;
            const completionRate = total > 0 ? (completed / total) * 100 : 0;

            // Calculate average completion time
            const completedTasks = tasks.filter((task: any) => task.status === 'completed' && task.completedAt);
            const averageCompletionTime = completedTasks.length > 0
                ? completedTasks.reduce((total: number, task: any) => {
                    const created = new Date(task.createdAt).getTime();
                    const completed = new Date(task.completedAt).getTime();
                    return total + (completed - created);
                }, 0) / completedTasks.length / (1000 * 60 * 60) // Convert to hours
                : 0;

            // Group by category
            const byCategory: Record<string, number> = {};
            tasks.forEach((task: any) => {
                const category = task.category || 'uncategorized';
                byCategory[category] = (byCategory[category] || 0) + 1;
            });

            // Group by member
            const byMember: Record<string, number> = {};
            tasks.forEach((task: any) => {
                const member = task.assignedTo || 'unassigned';
                byMember[member] = (byMember[member] || 0) + 1;
            });

            // Generate trends (last 30 days)
            const trends = this.generateTaskTrends(tasks);

            return {
                total,
                completed,
                pending,
                overdue,
                completionRate,
                averageCompletionTime,
                byCategory,
                byMember,
                trends,
            };
        } catch (error) {
            console.error('Error generating task analytics:', error);
            return this.getDefaultTaskAnalytics();
        }
    }

    // Goal analytics
    private async generateGoalAnalytics(): Promise<AnalyticsData['goals']> {
        try {
            const goalsData = await AsyncStorage.getItem('goals_data');
            const goals = goalsData ? JSON.parse(goalsData) : [];

            const total = goals.length;
            const active = goals.filter((goal: any) => goal.status === 'in_progress').length;
            const completed = goals.filter((goal: any) => goal.status === 'completed').length;
            const paused = goals.filter((goal: any) => goal.status === 'paused').length;
            const completionRate = total > 0 ? (completed / total) * 100 : 0;

            // Calculate average progress
            const averageProgress = total > 0
                ? goals.reduce((total: number, goal: any) => total + (goal.progress || 0), 0) / total
                : 0;

            // Group by category
            const byCategory: Record<string, number> = {};
            goals.forEach((goal: any) => {
                const category = goal.category || 'uncategorized';
                byCategory[category] = (byCategory[category] || 0) + 1;
            });

            // Group by member
            const byMember: Record<string, number> = {};
            goals.forEach((goal: any) => {
                const member = goal.createdBy || 'unknown';
                byMember[member] = (byMember[member] || 0) + 1;
            });

            // Generate trends
            const trends = this.generateGoalTrends(goals);

            return {
                total,
                active,
                completed,
                paused,
                completionRate,
                averageProgress,
                byCategory,
                byMember,
                trends,
            };
        } catch (error) {
            console.error('Error generating goal analytics:', error);
            return this.getDefaultGoalAnalytics();
        }
    }

    // Penalty analytics
    private async generatePenaltyAnalytics(): Promise<AnalyticsData['penalties']> {
        try {
            const penaltiesData = await AsyncStorage.getItem('penalties_data');
            const penalties = penaltiesData ? JSON.parse(penaltiesData) : [];

            const total = penalties.length;
            const active = penalties.filter((penalty: any) => penalty.status === 'active').length;
            const completed = penalties.filter((penalty: any) => penalty.status === 'completed').length;
            const cancelled = penalties.filter((penalty: any) => penalty.status === 'cancelled').length;
            const complianceRate = total > 0 ? (completed / total) * 100 : 0;

            // Calculate average duration
            const completedPenalties = penalties.filter((penalty: any) =>
                penalty.status === 'completed' && penalty.completedAt && penalty.assignedAt
            );
            const averageDuration = completedPenalties.length > 0
                ? completedPenalties.reduce((total: number, penalty: any) => {
                    const assigned = new Date(penalty.assignedAt).getTime();
                    const completed = new Date(penalty.completedAt).getTime();
                    return total + (completed - assigned);
                }, 0) / completedPenalties.length / (1000 * 60 * 60 * 24) // Convert to days
                : 0;

            // Group by type
            const byType: Record<string, number> = {};
            penalties.forEach((penalty: any) => {
                const type = penalty.type || 'unknown';
                byType[type] = (byType[type] || 0) + 1;
            });

            // Group by member
            const byMember: Record<string, number> = {};
            penalties.forEach((penalty: any) => {
                const member = penalty.assignedTo || 'unknown';
                byMember[member] = (byMember[member] || 0) + 1;
            });

            // Generate trends
            const trends = this.generatePenaltyTrends(penalties);

            return {
                total,
                active,
                completed,
                cancelled,
                complianceRate,
                averageDuration,
                byType,
                byMember,
                trends,
            };
        } catch (error) {
            console.error('Error generating penalty analytics:', error);
            return this.getDefaultPenaltyAnalytics();
        }
    }

    // Calendar analytics
    private async generateCalendarAnalytics(): Promise<AnalyticsData['calendar']> {
        try {
            const calendarData = await AsyncStorage.getItem('calendar_data');
            const events = calendarData ? JSON.parse(calendarData) : [];

            const totalEvents = events.length;
            const upcomingEvents = events.filter((event: any) =>
                new Date(event.date) > new Date()
            ).length;
            const completedEvents = events.filter((event: any) =>
                new Date(event.date) <= new Date()
            ).length;
            const participationRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;

            // Group by category
            const byCategory: Record<string, number> = {};
            events.forEach((event: any) => {
                const category = event.category || 'uncategorized';
                byCategory[category] = (byCategory[category] || 0) + 1;
            });

            // Group by member
            const byMember: Record<string, number> = {};
            events.forEach((event: any) => {
                event.participants?.forEach((participant: string) => {
                    byMember[participant] = (byMember[participant] || 0) + 1;
                });
            });

            // Generate trends
            const trends = this.generateCalendarTrends(events);

            return {
                totalEvents,
                upcomingEvents,
                completedEvents,
                participationRate,
                byCategory,
                byMember,
                trends,
            };
        } catch (error) {
            console.error('Error generating calendar analytics:', error);
            return this.getDefaultCalendarAnalytics();
        }
    }

    // Safe Room analytics
    private async generateSafeRoomAnalytics(): Promise<AnalyticsData['safeRoom']> {
        try {
            const safeRoomData = await AsyncStorage.getItem('safeRoom_data');
            const messages = safeRoomData ? JSON.parse(safeRoomData) : [];

            const totalMessages = messages.length;

            // Group by type
            const messagesByType: Record<string, number> = {};
            messages.forEach((message: any) => {
                const type = message.type || 'text';
                messagesByType[type] = (messagesByType[type] || 0) + 1;
            });

            // Group by member
            const byMember: Record<string, number> = {};
            messages.forEach((message: any) => {
                const member = message.sender || 'unknown';
                byMember[member] = (byMember[member] || 0) + 1;
            });

            // Calculate average response time
            const responseTimes: number[] = [];
            messages.forEach((message: any) => {
                if (message.responseTime) {
                    responseTimes.push(message.responseTime);
                }
            });
            const averageResponseTime = responseTimes.length > 0
                ? responseTimes.reduce((total, time) => total + time, 0) / responseTimes.length
                : 0;

            // Generate trends
            const trends = this.generateSafeRoomTrends(messages);

            return {
                totalMessages,
                messagesByType,
                byMember,
                averageResponseTime,
                trends,
            };
        } catch (error) {
            console.error('Error generating safe room analytics:', error);
            return this.getDefaultSafeRoomAnalytics();
        }
    }

    // Family analytics
    private async generateFamilyAnalytics(): Promise<AnalyticsData['family']> {
        try {
            const familyData = await AsyncStorage.getItem('family_data');
            const members = familyData ? JSON.parse(familyData) : [];

            const totalMembers = members.length;
            const activeMembers = members.filter((member: any) =>
                member.lastActive && new Date(member.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length;

            // Calculate member stats
            const memberStats = await this.calculateMemberStats(members);

            // Calculate scores
            const engagementScore = this.calculateEngagementScore(memberStats);
            const communicationScore = this.calculateCommunicationScore(memberStats);
            const productivityScore = this.calculateProductivityScore(memberStats);
            const overallScore = (engagementScore + communicationScore + productivityScore) / 3;

            return {
                totalMembers,
                activeMembers,
                engagementScore,
                communicationScore,
                productivityScore,
                overallScore,
                memberStats,
            };
        } catch (error) {
            console.error('Error generating family analytics:', error);
            return this.getDefaultFamilyAnalytics();
        }
    }

    // Calculate member statistics
    private async calculateMemberStats(members: any[]): Promise<AnalyticsData['family']['memberStats']> {
        const memberStats = [];

        for (const member of members) {
            const tasksCompleted = await this.getMemberTaskCount(member.id, 'completed');
            const goalsProgressed = await this.getMemberGoalCount(member.id, 'progressed');
            const penaltiesComplied = await this.getMemberPenaltyCount(member.id, 'completed');
            const messagesShared = await this.getMemberMessageCount(member.id);
            const eventsParticipated = await this.getMemberEventCount(member.id);

            const score = this.calculateMemberScore({
                tasksCompleted,
                goalsProgressed,
                penaltiesComplied,
                messagesShared,
                eventsParticipated,
            });

            memberStats.push({
                id: member.id,
                name: member.name || `Member ${member.id}`,
                tasksCompleted,
                goalsProgressed,
                penaltiesComplied,
                messagesShared,
                eventsParticipated,
                score,
            });
        }

        return memberStats;
    }

    // Helper methods for member statistics
    private async getMemberTaskCount(memberId: string, status: string): Promise<number> {
        try {
            const tasksData = await AsyncStorage.getItem('tasks_data');
            const tasks = tasksData ? JSON.parse(tasksData) : [];
            return tasks.filter((task: any) =>
                task.assignedTo === memberId && task.status === status
            ).length;
        } catch (error) {
            return 0;
        }
    }

    private async getMemberGoalCount(memberId: string, type: string): Promise<number> {
        try {
            const goalsData = await AsyncStorage.getItem('goals_data');
            const goals = goalsData ? JSON.parse(goalsData) : [];
            return goals.filter((goal: any) =>
                goal.createdBy === memberId && (type === 'progressed' ? goal.progress > 0 : true)
            ).length;
        } catch (error) {
            return 0;
        }
    }

    private async getMemberPenaltyCount(memberId: string, status: string): Promise<number> {
        try {
            const penaltiesData = await AsyncStorage.getItem('penalties_data');
            const penalties = penaltiesData ? JSON.parse(penaltiesData) : [];
            return penalties.filter((penalty: any) =>
                penalty.assignedTo === memberId && penalty.status === status
            ).length;
        } catch (error) {
            return 0;
        }
    }

    private async getMemberMessageCount(memberId: string): Promise<number> {
        try {
            const safeRoomData = await AsyncStorage.getItem('safeRoom_data');
            const messages = safeRoomData ? JSON.parse(safeRoomData) : [];
            return messages.filter((message: any) => message.sender === memberId).length;
        } catch (error) {
            return 0;
        }
    }

    private async getMemberEventCount(memberId: string): Promise<number> {
        try {
            const calendarData = await AsyncStorage.getItem('calendar_data');
            const events = calendarData ? JSON.parse(calendarData) : [];
            return events.filter((event: any) =>
                event.participants?.includes(memberId)
            ).length;
        } catch (error) {
            return 0;
        }
    }

    // Score calculations
    private calculateMemberScore(stats: any): number {
        const weights = {
            tasksCompleted: 0.3,
            goalsProgressed: 0.25,
            penaltiesComplied: 0.2,
            messagesShared: 0.15,
            eventsParticipated: 0.1,
        };

        const maxValues = {
            tasksCompleted: 10,
            goalsProgressed: 5,
            penaltiesComplied: 3,
            messagesShared: 20,
            eventsParticipated: 10,
        };

        let score = 0;
        Object.keys(weights).forEach(key => {
            const normalizedValue = Math.min(stats[key] / maxValues[key], 1);
            score += normalizedValue * weights[key];
        });

        return Math.round(score * 100);
    }

    private calculateEngagementScore(memberStats: any[]): number {
        if (memberStats.length === 0) return 0;

        const totalEngagement = memberStats.reduce((total, member) =>
            total + member.messagesShared + member.eventsParticipated, 0
        );

        return Math.min((totalEngagement / memberStats.length) * 10, 100);
    }

    private calculateCommunicationScore(memberStats: any[]): number {
        if (memberStats.length === 0) return 0;

        const totalMessages = memberStats.reduce((total, member) =>
            total + member.messagesShared, 0
        );

        return Math.min((totalMessages / memberStats.length) * 5, 100);
    }

    private calculateProductivityScore(memberStats: any[]): number {
        if (memberStats.length === 0) return 0;

        const totalProductivity = memberStats.reduce((total, member) =>
            total + member.tasksCompleted + member.goalsProgressed, 0
        );

        return Math.min((totalProductivity / memberStats.length) * 10, 100);
    }

    // Generate insights
    private async generateInsights(): Promise<void> {
        if (!this.analyticsData) return;

        const insights: Insight[] = [];

        // Task insights
        if (this.analyticsData.tasks.completionRate > 80) {
            insights.push({
                id: this.generateId(),
                type: 'positive',
                category: 'tasks',
                title: 'Excellent Task Completion',
                description: `Your family has a ${this.analyticsData.tasks.completionRate.toFixed(1)}% task completion rate!`,
                impact: 'high',
                actionable: false,
                timestamp: Date.now(),
            });
        } else if (this.analyticsData.tasks.completionRate < 50) {
            insights.push({
                id: this.generateId(),
                type: 'negative',
                category: 'tasks',
                title: 'Low Task Completion',
                description: `Task completion rate is only ${this.analyticsData.tasks.completionRate.toFixed(1)}%. Consider breaking down larger tasks.`,
                impact: 'medium',
                actionable: true,
                actionText: 'Review Task Management',
                timestamp: Date.now(),
            });
        }

        // Goal insights
        if (this.analyticsData.goals.averageProgress > 70) {
            insights.push({
                id: this.generateId(),
                type: 'positive',
                category: 'goals',
                title: 'Great Goal Progress',
                description: `Average goal progress is ${this.analyticsData.goals.averageProgress.toFixed(1)}%!`,
                impact: 'high',
                actionable: false,
                timestamp: Date.now(),
            });
        }

        // Penalty insights
        if (this.analyticsData.penalties.complianceRate < 60) {
            insights.push({
                id: this.generateId(),
                type: 'negative',
                category: 'penalties',
                title: 'Low Penalty Compliance',
                description: `Penalty compliance rate is ${this.analyticsData.penalties.complianceRate.toFixed(1)}%. Consider reviewing penalty system.`,
                impact: 'medium',
                actionable: true,
                actionText: 'Review Penalty System',
                timestamp: Date.now(),
            });
        }

        // Family insights
        if (this.analyticsData.family.overallScore > 80) {
            insights.push({
                id: this.generateId(),
                type: 'positive',
                category: 'family',
                title: 'Outstanding Family Performance',
                description: `Your family has an overall score of ${this.analyticsData.family.overallScore.toFixed(1)}!`,
                impact: 'high',
                actionable: false,
                timestamp: Date.now(),
            });
        }

        this.insights = insights;
        await this.saveInsights();
    }

    // Generate chart data
    generateChartData(type: string): ChartData[] {
        if (!this.analyticsData) return [];

        const charts: ChartData[] = [];

        switch (type) {
            case 'tasks':
                charts.push({
                    type: 'pie',
                    title: 'Task Status Distribution',
                    data: [
                        { label: 'Completed', value: this.analyticsData.tasks.completed, color: '#10B981' },
                        { label: 'Pending', value: this.analyticsData.tasks.pending, color: '#F59E0B' },
                        { label: 'Overdue', value: this.analyticsData.tasks.overdue, color: '#EF4444' },
                    ],
                });
                charts.push({
                    type: 'bar',
                    title: 'Tasks by Member',
                    data: Object.entries(this.analyticsData.tasks.byMember).map(([label, value]) => ({
                        label,
                        value,
                    })),
                });
                break;

            case 'goals':
                charts.push({
                    type: 'doughnut',
                    title: 'Goal Status Distribution',
                    data: [
                        { label: 'Active', value: this.analyticsData.goals.active, color: '#3B82F6' },
                        { label: 'Completed', value: this.analyticsData.goals.completed, color: '#10B981' },
                        { label: 'Paused', value: this.analyticsData.goals.paused, color: '#F59E0B' },
                    ],
                });
                charts.push({
                    type: 'bar',
                    title: 'Goals by Category',
                    data: Object.entries(this.analyticsData.goals.byCategory).map(([label, value]) => ({
                        label,
                        value,
                    })),
                });
                break;

            case 'family':
                charts.push({
                    type: 'bar',
                    title: 'Member Performance',
                    data: this.analyticsData.family.memberStats.map(member => ({
                        label: member.name,
                        value: member.score,
                    })),
                });
                charts.push({
                    type: 'area',
                    title: 'Family Scores',
                    data: [
                        { label: 'Engagement', value: this.analyticsData.family.engagementScore },
                        { label: 'Communication', value: this.analyticsData.family.communicationScore },
                        { label: 'Productivity', value: this.analyticsData.family.productivityScore },
                        { label: 'Overall', value: this.analyticsData.family.overallScore },
                    ],
                });
                break;
        }

        return charts;
    }

    // Generate trends (simplified)
    private generateTaskTrends(tasks: any[]): Array<{ date: string; completed: number; created: number }> {
        const trends = [];
        const now = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];

            const dayTasks = tasks.filter(task =>
                task.createdAt && task.createdAt.startsWith(dateStr)
            );

            const completedTasks = dayTasks.filter(task =>
                task.completedAt && task.completedAt.startsWith(dateStr)
            );

            trends.push({
                date: dateStr,
                completed: completedTasks.length,
                created: dayTasks.length,
            });
        }

        return trends;
    }

    private generateGoalTrends(goals: any[]): Array<{ date: string; progress: number; completed: number }> {
        const trends = [];
        const now = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];

            const dayGoals = goals.filter(goal =>
                goal.createdAt && goal.createdAt.startsWith(dateStr)
            );

            const completedGoals = dayGoals.filter(goal =>
                goal.completedAt && goal.completedAt.startsWith(dateStr)
            );

            const avgProgress = dayGoals.length > 0
                ? dayGoals.reduce((total, goal) => total + (goal.progress || 0), 0) / dayGoals.length
                : 0;

            trends.push({
                date: dateStr,
                progress: avgProgress,
                completed: completedGoals.length,
            });
        }

        return trends;
    }

    private generatePenaltyTrends(penalties: any[]): Array<{ date: string; assigned: number; completed: number }> {
        const trends = [];
        const now = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];

            const assignedPenalties = penalties.filter(penalty =>
                penalty.assignedAt && penalty.assignedAt.startsWith(dateStr)
            );

            const completedPenalties = penalties.filter(penalty =>
                penalty.completedAt && penalty.completedAt.startsWith(dateStr)
            );

            trends.push({
                date: dateStr,
                assigned: assignedPenalties.length,
                completed: completedPenalties.length,
            });
        }

        return trends;
    }

    private generateCalendarTrends(events: any[]): Array<{ date: string; events: number; participation: number }> {
        const trends = [];
        const now = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];

            const dayEvents = events.filter(event =>
                event.date && event.date.startsWith(dateStr)
            );

            const participation = dayEvents.reduce((total, event) =>
                total + (event.participants?.length || 0), 0
            );

            trends.push({
                date: dateStr,
                events: dayEvents.length,
                participation,
            });
        }

        return trends;
    }

    private generateSafeRoomTrends(messages: any[]): Array<{ date: string; messages: number; responses: number }> {
        const trends = [];
        const now = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];

            const dayMessages = messages.filter(message =>
                message.createdAt && message.createdAt.startsWith(dateStr)
            );

            const responses = dayMessages.filter(message =>
                message.type === 'response'
            ).length;

            trends.push({
                date: dateStr,
                messages: dayMessages.length,
                responses,
            });
        }

        return trends;
    }

    // Default analytics (fallback)
    private getDefaultTaskAnalytics(): AnalyticsData['tasks'] {
        return {
            total: 0,
            completed: 0,
            pending: 0,
            overdue: 0,
            completionRate: 0,
            averageCompletionTime: 0,
            byCategory: {},
            byMember: {},
            trends: [],
        };
    }

    private getDefaultGoalAnalytics(): AnalyticsData['goals'] {
        return {
            total: 0,
            active: 0,
            completed: 0,
            paused: 0,
            completionRate: 0,
            averageProgress: 0,
            byCategory: {},
            byMember: {},
            trends: [],
        };
    }

    private getDefaultPenaltyAnalytics(): AnalyticsData['penalties'] {
        return {
            total: 0,
            active: 0,
            completed: 0,
            cancelled: 0,
            complianceRate: 0,
            averageDuration: 0,
            byType: {},
            byMember: {},
            trends: [],
        };
    }

    private getDefaultCalendarAnalytics(): AnalyticsData['calendar'] {
        return {
            totalEvents: 0,
            upcomingEvents: 0,
            completedEvents: 0,
            participationRate: 0,
            byCategory: {},
            byMember: {},
            trends: [],
        };
    }

    private getDefaultSafeRoomAnalytics(): AnalyticsData['safeRoom'] {
        return {
            totalMessages: 0,
            messagesByType: {},
            byMember: {},
            averageResponseTime: 0,
            trends: [],
        };
    }

    private getDefaultFamilyAnalytics(): AnalyticsData['family'] {
        return {
            totalMembers: 0,
            activeMembers: 0,
            engagementScore: 0,
            communicationScore: 0,
            productivityScore: 0,
            overallScore: 0,
            memberStats: [],
        };
    }

    // Utility methods
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Storage methods
    private async saveAnalyticsData(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.ANALYTICS_DATA, JSON.stringify(this.analyticsData));
        } catch (error) {
            console.error('Error saving analytics data:', error);
        }
    }

    private async loadAnalyticsData(): Promise<void> {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.ANALYTICS_DATA);
            if (data) {
                this.analyticsData = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    }

    private async saveInsights(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.INSIGHTS, JSON.stringify(this.insights));
        } catch (error) {
            console.error('Error saving insights:', error);
        }
    }

    private async loadInsights(): Promise<void> {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.INSIGHTS);
            if (data) {
                this.insights = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading insights:', error);
        }
    }

    private async saveReports(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.REPORTS, JSON.stringify(this.reports));
        } catch (error) {
            console.error('Error saving reports:', error);
        }
    }

    private async loadReports(): Promise<void> {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.REPORTS);
            if (data) {
                this.reports = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading reports:', error);
        }
    }

    // Public API
    getAnalyticsData(): AnalyticsData | null {
        return this.analyticsData;
    }

    getInsights(): Insight[] {
        return this.insights;
    }

    async refreshAnalytics(): Promise<AnalyticsData> {
        return await this.generateAnalytics();
    }

    async generateReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<AnalyticsReport> {
        const now = new Date();
        const startDate = new Date();

        switch (period) {
            case 'daily':
                startDate.setDate(now.getDate() - 1);
                break;
            case 'weekly':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'monthly':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'yearly':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }

        const report: AnalyticsReport = {
            period,
            startDate: startDate.toISOString(),
            endDate: now.toISOString(),
            summary: {
                totalActivities: this.analyticsData ?
                    this.analyticsData.tasks.total +
                    this.analyticsData.goals.total +
                    this.analyticsData.penalties.total +
                    this.analyticsData.calendar.totalEvents : 0,
                completionRate: this.analyticsData?.tasks.completionRate || 0,
                engagementScore: this.analyticsData?.family.engagementScore || 0,
                familyScore: this.analyticsData?.family.overallScore || 0,
                topPerformer: this.analyticsData?.family.memberStats.reduce((prev, current) =>
                    prev.score > current.score ? prev : current
                )?.name || 'N/A',
                improvementAreas: this.getImprovementAreas(),
            },
            insights: this.insights,
            charts: this.generateChartData('family'),
            recommendations: this.generateRecommendations(),
        };

        this.reports.push(report);
        await this.saveReports();

        return report;
    }

    private getImprovementAreas(): string[] {
        const areas: string[] = [];

        if (this.analyticsData) {
            if (this.analyticsData.tasks.completionRate < 70) {
                areas.push('Task Completion');
            }
            if (this.analyticsData.goals.averageProgress < 50) {
                areas.push('Goal Progress');
            }
            if (this.analyticsData.penalties.complianceRate < 60) {
                areas.push('Penalty Compliance');
            }
            if (this.analyticsData.family.communicationScore < 60) {
                areas.push('Family Communication');
            }
        }

        return areas;
    }

    private generateRecommendations(): string[] {
        const recommendations: string[] = [];

        if (this.analyticsData) {
            if (this.analyticsData.tasks.completionRate < 70) {
                recommendations.push('Break down large tasks into smaller, manageable steps');
            }
            if (this.analyticsData.goals.averageProgress < 50) {
                recommendations.push('Set more realistic goal timelines and milestones');
            }
            if (this.analyticsData.family.communicationScore < 60) {
                recommendations.push('Encourage more family communication through Safe Room');
            }
            if (this.analyticsData.calendar.participationRate < 80) {
                recommendations.push('Increase family participation in calendar events');
            }
        }

        return recommendations;
    }
}

export default FamilyAnalyticsManager;

