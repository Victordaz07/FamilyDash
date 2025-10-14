/**
 * Advanced Parental Controls System
 * Comprehensive family supervision and safety features
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Logger from '../Logger';

// Types
export interface ParentalControlSettings {
    userId: string;
    childId: string;
    timeLimits: {
        dailyLimit: number; // minutes
        bedtimeStart: string; // HH:MM format
        bedtimeEnd: string; // HH:MM format
        weekendLimit: number; // minutes
        schoolDayLimit: number; // minutes
    };
    contentFiltering: {
        safeRoomAccess: boolean;
        calendarVisibility: boolean;
        taskAssignment: boolean;
        goalCreation: boolean;
        penaltyViewing: boolean;
        profileEditing: boolean;
    };
    activityMonitoring: {
        trackAppUsage: boolean;
        trackTaskCompletion: boolean;
        trackGoalProgress: boolean;
        trackPenaltyCompliance: boolean;
        trackSafeRoomActivity: boolean;
        trackCalendarParticipation: boolean;
    };
    notifications: {
        dailyReport: boolean;
        weeklyReport: boolean;
        violationAlerts: boolean;
        achievementAlerts: boolean;
        bedtimeReminders: boolean;
    };
    emergencySettings: {
        panicButtonEnabled: boolean;
        locationSharing: boolean;
        emergencyContacts: string[];
        autoAlertParents: boolean;
    };
}

export interface ActivityLog {
    id: string;
    userId: string;
    childId: string;
    activityType: 'app_usage' | 'task_completion' | 'goal_progress' | 'penalty_compliance' | 'safe_room' | 'calendar';
    activity: string;
    timestamp: number;
    duration?: number; // minutes
    details?: any;
}

export interface ViolationReport {
    id: string;
    childId: string;
    violationType: 'time_limit' | 'bedtime' | 'content_access' | 'inappropriate_content' | 'emergency_usage';
    description: string;
    timestamp: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolved: boolean;
    resolution?: string;
}

export interface DailyReport {
    childId: string;
    date: string;
    summary: {
        totalScreenTime: number;
        tasksCompleted: number;
        goalsProgressed: number;
        penaltiesComplied: number;
        safeRoomMessages: number;
        calendarEvents: number;
    };
    violations: ViolationReport[];
    achievements: string[];
    recommendations: string[];
}

export interface ParentalDashboard {
    children: Array<{
        id: string;
        name: string;
        role: 'child' | 'teen';
        onlineStatus: boolean;
        currentActivity: string;
        screenTimeToday: number;
        violationsToday: number;
        achievementsToday: number;
    }>;
    alerts: Array<{
        id: string;
        type: 'violation' | 'achievement' | 'emergency' | 'reminder';
        title: string;
        message: string;
        timestamp: number;
        read: boolean;
    }>;
    familyStats: {
        totalScreenTime: number;
        totalTasksCompleted: number;
        totalGoalsAchieved: number;
        totalViolations: number;
        familyScore: number;
    };
}

// Parental Controls Manager
export class ParentalControlsManager {
    private static instance: ParentalControlsManager;
    private settings: Map<string, ParentalControlSettings> = new Map();
    private activityLogs: ActivityLog[] = [];
    private violations: ViolationReport[] = [];
    private reports: DailyReport[] = [];

    // Storage keys
    private readonly STORAGE_KEYS = {
        PARENTAL_SETTINGS: 'parental_control_settings',
        ACTIVITY_LOGS: 'parental_activity_logs',
        VIOLATIONS: 'parental_violations',
        REPORTS: 'parental_reports',
    };

    static getInstance(): ParentalControlsManager {
        if (!ParentalControlsManager.instance) {
            ParentalControlsManager.instance = new ParentalControlsManager();
        }
        return ParentalControlsManager.instance;
    }

    // Initialize parental controls
    async initialize(): Promise<void> {
        try {
            await this.loadSettings();
            await this.loadActivityLogs();
            await this.loadViolations();
            await this.loadReports();

            Logger.debug('ParentalControlsManager initialized successfully');
        } catch (error) {
            Logger.error('Error initializing ParentalControlsManager:', error);
        }
    }

    // Settings management
    async setParentalSettings(childId: string, settings: Partial<ParentalControlSettings>): Promise<void> {
        try {
            const existingSettings = this.settings.get(childId) || this.getDefaultSettings(childId);
            const updatedSettings = { ...existingSettings, ...settings };

            this.settings.set(childId, updatedSettings);
            await this.saveSettings();

            Logger.debug(`Parental settings updated for child ${childId}`);
        } catch (error) {
            Logger.error('Error setting parental controls:', error);
        }
    }

    async getParentalSettings(childId: string): Promise<ParentalControlSettings | null> {
        return this.settings.get(childId) || null;
    }

    private getDefaultSettings(childId: string): ParentalControlSettings {
        return {
            userId: 'parent',
            childId,
            timeLimits: {
                dailyLimit: 120, // 2 hours
                bedtimeStart: '21:00',
                bedtimeEnd: '07:00',
                weekendLimit: 180, // 3 hours
                schoolDayLimit: 60, // 1 hour
            },
            contentFiltering: {
                safeRoomAccess: true,
                calendarVisibility: true,
                taskAssignment: true,
                goalCreation: false,
                penaltyViewing: true,
                profileEditing: false,
            },
            activityMonitoring: {
                trackAppUsage: true,
                trackTaskCompletion: true,
                trackGoalProgress: true,
                trackPenaltyCompliance: true,
                trackSafeRoomActivity: true,
                trackCalendarParticipation: true,
            },
            notifications: {
                dailyReport: true,
                weeklyReport: true,
                violationAlerts: true,
                achievementAlerts: true,
                bedtimeReminders: true,
            },
            emergencySettings: {
                panicButtonEnabled: true,
                locationSharing: true,
                emergencyContacts: [],
                autoAlertParents: true,
            },
        };
    }

    // Activity logging
    async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
        try {
            const log: ActivityLog = {
                ...activity,
                id: this.generateId(),
                timestamp: Date.now(),
            };

            this.activityLogs.push(log);

            // Keep only last 1000 logs per child
            this.activityLogs = this.activityLogs
                .filter(log => log.childId === activity.childId)
                .slice(-1000);

            await this.saveActivityLogs();

            // Check for violations
            await this.checkViolations(activity);

        } catch (error) {
            Logger.error('Error logging activity:', error);
        }
    }

    async getActivityLogs(childId: string, days: number = 7): Promise<ActivityLog[]> {
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        return this.activityLogs.filter(log =>
            log.childId === childId && log.timestamp >= cutoffTime
        );
    }

    // Violation detection
    private async checkViolations(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
        const settings = this.settings.get(activity.childId);
        if (!settings) return;

        // Check time limits
        if (activity.activityType === 'app_usage' && activity.duration) {
            const dailyUsage = await this.getDailyScreenTime(activity.childId);
            if (dailyUsage + activity.duration > settings.timeLimits.dailyLimit) {
                await this.createViolation({
                    childId: activity.childId,
                    violationType: 'time_limit',
                    description: `Exceeded daily screen time limit of ${settings.timeLimits.dailyLimit} minutes`,
                    severity: 'medium',
                });
            }
        }

        // Check bedtime
        const currentHour = new Date().getHours();
        const bedtimeStart = parseInt(settings.timeLimits.bedtimeStart.split(':')[0]);
        const bedtimeEnd = parseInt(settings.timeLimits.bedtimeEnd.split(':')[0]);

        if (currentHour >= bedtimeStart || currentHour < bedtimeEnd) {
            await this.createViolation({
                childId: activity.childId,
                violationType: 'bedtime',
                description: `App usage during bedtime hours (${settings.timeLimits.bedtimeStart} - ${settings.timeLimits.bedtimeEnd})`,
                severity: 'low',
            });
        }

        // Check content access
        if (!settings.contentFiltering.safeRoomAccess && activity.activityType === 'safe_room') {
            await this.createViolation({
                childId: activity.childId,
                violationType: 'content_access',
                description: 'Accessed Safe Room without permission',
                severity: 'high',
            });
        }
    }

    private async createViolation(violation: Omit<ViolationReport, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
        const violationReport: ViolationReport = {
            ...violation,
            id: this.generateId(),
            timestamp: Date.now(),
            resolved: false,
        };

        this.violations.push(violationReport);
        await this.saveViolations();

        // Send notification to parents
        await this.sendViolationAlert(violationReport);
    }

    private async sendViolationAlert(violation: ViolationReport): Promise<void> {
        // Simulate sending notification
        Logger.debug(`Violation Alert: ${violation.description} for child ${violation.childId}`);

        // In real implementation, send push notification to parent devices
    }

    // Screen time tracking
    async getDailyScreenTime(childId: string): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = today.getTime();

        const todayLogs = this.activityLogs.filter(log =>
            log.childId === childId &&
            log.activityType === 'app_usage' &&
            log.timestamp >= startOfDay
        );

        return todayLogs.reduce((total, log) => total + (log.duration || 0), 0);
    }

    async getWeeklyScreenTime(childId: string): Promise<number> {
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

        const weekLogs = this.activityLogs.filter(log =>
            log.childId === childId &&
            log.activityType === 'app_usage' &&
            log.timestamp >= weekAgo
        );

        return weekLogs.reduce((total, log) => total + (log.duration || 0), 0);
    }

    // Report generation
    async generateDailyReport(childId: string, date?: string): Promise<DailyReport> {
        const reportDate = date || new Date().toISOString().split('T')[0];
        const startOfDay = new Date(reportDate).getTime();
        const endOfDay = startOfDay + (24 * 60 * 60 * 1000);

        const dayLogs = this.activityLogs.filter(log =>
            log.childId === childId &&
            log.timestamp >= startOfDay &&
            log.timestamp < endOfDay
        );

        const dayViolations = this.violations.filter(violation =>
            violation.childId === childId &&
            violation.timestamp >= startOfDay &&
            violation.timestamp < endOfDay
        );

        const report: DailyReport = {
            childId,
            date: reportDate,
            summary: {
                totalScreenTime: dayLogs
                    .filter(log => log.activityType === 'app_usage')
                    .reduce((total, log) => total + (log.duration || 0), 0),
                tasksCompleted: dayLogs.filter(log =>
                    log.activityType === 'task_completion' && log.activity === 'completed'
                ).length,
                goalsProgressed: dayLogs.filter(log => log.activityType === 'goal_progress').length,
                penaltiesComplied: dayLogs.filter(log =>
                    log.activityType === 'penalty_compliance' && log.activity === 'completed'
                ).length,
                safeRoomMessages: dayLogs.filter(log => log.activityType === 'safe_room').length,
                calendarEvents: dayLogs.filter(log => log.activityType === 'calendar').length,
            },
            violations: dayViolations,
            achievements: this.extractAchievements(dayLogs),
            recommendations: this.generateRecommendations(dayLogs, dayViolations),
        };

        this.reports.push(report);
        await this.saveReports();

        return report;
    }

    private extractAchievements(logs: ActivityLog[]): string[] {
        const achievements: string[] = [];

        const tasksCompleted = logs.filter(log =>
            log.activityType === 'task_completion' && log.activity === 'completed'
        ).length;

        if (tasksCompleted >= 5) {
            achievements.push('Completed 5+ tasks today');
        }

        const goalsProgressed = logs.filter(log => log.activityType === 'goal_progress').length;
        if (goalsProgressed >= 3) {
            achievements.push('Made progress on 3+ goals');
        }

        const violations = logs.filter(log => log.activityType === 'violation').length;
        if (violations === 0) {
            achievements.push('No violations today');
        }

        return achievements;
    }

    private generateRecommendations(logs: ActivityLog[], violations: ViolationReport[]): string[] {
        const recommendations: string[] = [];

        const screenTime = logs
            .filter(log => log.activityType === 'app_usage')
            .reduce((total, log) => total + (log.duration || 0), 0);

        if (screenTime > 120) {
            recommendations.push('Consider reducing screen time to under 2 hours');
        }

        if (violations.length > 2) {
            recommendations.push('Review family rules and expectations');
        }

        const tasksCompleted = logs.filter(log =>
            log.activityType === 'task_completion' && log.activity === 'completed'
        ).length;

        if (tasksCompleted < 3) {
            recommendations.push('Encourage more task completion');
        }

        return recommendations;
    }

    // Parental dashboard
    async getParentalDashboard(): Promise<ParentalDashboard> {
        const children = Array.from(this.settings.keys()).map(childId => {
            const settings = this.settings.get(childId);
            const recentLogs = this.activityLogs.filter(log =>
                log.childId === childId &&
                log.timestamp >= Date.now() - (24 * 60 * 60 * 1000)
            );

            const violationsToday = this.violations.filter(violation =>
                violation.childId === childId &&
                violation.timestamp >= Date.now() - (24 * 60 * 60 * 1000)
            ).length;

            return {
                id: childId,
                name: `Child ${childId}`,
                role: 'child',
                onlineStatus: recentLogs.length > 0,
                currentActivity: recentLogs[recentLogs.length - 1]?.activity || 'Inactive',
                screenTimeToday: recentLogs
                    .filter(log => log.activityType === 'app_usage')
                    .reduce((total, log) => total + (log.duration || 0), 0),
                violationsToday,
                achievementsToday: this.extractAchievements(recentLogs).length,
            };
        });

        const alerts = this.violations
            .filter(violation => !violation.resolved)
            .map(violation => ({
                id: violation.id,
                type: 'violation' as const,
                title: 'Violation Alert',
                message: violation.description,
                timestamp: violation.timestamp,
                read: false,
            }));

        const familyStats = {
            totalScreenTime: children.reduce((total, child) => total + child.screenTimeToday, 0),
            totalTasksCompleted: children.reduce((total, child) => total + child.achievementsToday, 0),
            totalGoalsAchieved: 0, // Calculate from logs
            totalViolations: children.reduce((total, child) => total + child.violationsToday, 0),
            familyScore: this.calculateFamilyScore(children),
        };

        return {
            children,
            alerts,
            familyStats,
        };
    }

    private calculateFamilyScore(children: any[]): number {
        const totalViolations = children.reduce((total, child) => total + child.violationsToday, 0);
        const totalAchievements = children.reduce((total, child) => total + child.achievementsToday, 0);

        // Simple scoring algorithm
        const baseScore = 100;
        const violationPenalty = totalViolations * 5;
        const achievementBonus = totalAchievements * 10;

        return Math.max(0, Math.min(100, baseScore - violationPenalty + achievementBonus));
    }

    // Emergency features
    async triggerEmergency(childId: string, emergencyType: 'panic' | 'location' | 'help'): Promise<void> {
        const settings = this.settings.get(childId);
        if (!settings?.emergencySettings.panicButtonEnabled) {
            Alert.alert('Emergency Disabled', 'Emergency features are disabled for this child.');
            return;
        }

        const emergencyAlert = {
            id: this.generateId(),
            childId,
            type: 'emergency' as const,
            title: 'Emergency Alert',
            message: `Emergency triggered by ${childId}: ${emergencyType}`,
            timestamp: Date.now(),
            read: false,
        };

        // Send emergency notification to parents
        Logger.debug('Emergency Alert:', emergencyAlert);

        // In real implementation, send immediate push notification and SMS to emergency contacts
    }

    // Utility methods
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Storage methods
    private async saveSettings(): Promise<void> {
        try {
            const settingsObj = Object.fromEntries(this.settings);
            await AsyncStorage.setItem(this.STORAGE_KEYS.PARENTAL_SETTINGS, JSON.stringify(settingsObj));
        } catch (error) {
            Logger.error('Error saving parental settings:', error);
        }
    }

    private async loadSettings(): Promise<void> {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.PARENTAL_SETTINGS);
            if (data) {
                const settingsObj = JSON.parse(data);
                this.settings = new Map(Object.entries(settingsObj));
            }
        } catch (error) {
            Logger.error('Error loading parental settings:', error);
        }
    }

    private async saveActivityLogs(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(this.activityLogs));
        } catch (error) {
            Logger.error('Error saving activity logs:', error);
        }
    }

    private async loadActivityLogs(): Promise<void> {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.ACTIVITY_LOGS);
            if (data) {
                this.activityLogs = JSON.parse(data);
            }
        } catch (error) {
            Logger.error('Error loading activity logs:', error);
        }
    }

    private async saveViolations(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.VIOLATIONS, JSON.stringify(this.violations));
        } catch (error) {
            Logger.error('Error saving violations:', error);
        }
    }

    private async loadViolations(): Promise<void> {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.VIOLATIONS);
            if (data) {
                this.violations = JSON.parse(data);
            }
        } catch (error) {
            Logger.error('Error loading violations:', error);
        }
    }

    private async saveReports(): Promise<void> {
        try {
            await AsyncStorage.setItem(this.STORAGE_KEYS.REPORTS, JSON.stringify(this.reports));
        } catch (error) {
            Logger.error('Error saving reports:', error);
        }
    }

    private async loadReports(): Promise<void> {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.REPORTS);
            if (data) {
                this.reports = JSON.parse(data);
            }
        } catch (error) {
            Logger.error('Error loading reports:', error);
        }
    }

    // Public API
    async resolveViolation(violationId: string, resolution: string): Promise<void> {
        const violation = this.violations.find(v => v.id === violationId);
        if (violation) {
            violation.resolved = true;
            violation.resolution = resolution;
            await this.saveViolations();
        }
    }

    async getViolations(childId: string, unresolved: boolean = true): Promise<ViolationReport[]> {
        return this.violations.filter(violation =>
            violation.childId === childId &&
            (!unresolved || !violation.resolved)
        );
    }

    async getReports(childId: string, days: number = 7): Promise<DailyReport[]> {
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        return this.reports.filter(report =>
            report.childId === childId &&
            new Date(report.date).getTime() >= cutoffTime
        );
    }
}

export default ParentalControlsManager;





