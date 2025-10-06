/**
 * Data Export/Import System
 * Comprehensive data management with JSON, PDF, and CSV support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

// Types
export interface ExportData {
    tasks: any[];
    goals: any[];
    penalties: any[];
    calendar: any[];
    safeRoom: any[];
    profile: any;
    family: any[];
    metadata: {
        exportDate: string;
        version: string;
        totalRecords: number;
        familyName: string;
    };
}

export interface ImportResult {
    success: boolean;
    importedRecords: number;
    errors: string[];
    warnings: string[];
}

export interface ExportOptions {
    format: 'json' | 'pdf' | 'csv';
    includeTasks: boolean;
    includeGoals: boolean;
    includePenalties: boolean;
    includeCalendar: boolean;
    includeSafeRoom: boolean;
    includeProfile: boolean;
    dateRange?: {
        start: string;
        end: string;
    };
    password?: string;
}

export interface ReportData {
    title: string;
    subtitle: string;
    generatedDate: string;
    familyName: string;
    summary: {
        totalTasks: number;
        completedTasks: number;
        activeGoals: number;
        completedGoals: number;
        activePenalties: number;
        completedPenalties: number;
        calendarEvents: number;
        safeRoomMessages: number;
    };
    charts: Array<{
        title: string;
        type: 'bar' | 'line' | 'pie';
        data: any[];
    }>;
    details: any[];
}

// Data Export/Import Manager
export class DataExportImportManager {
    private static instance: DataExportImportManager;

    static getInstance(): DataExportImportManager {
        if (!DataExportImportManager.instance) {
            DataExportImportManager.instance = new DataExportImportManager();
        }
        return DataExportImportManager.instance;
    }

    // Export data
    async exportData(options: ExportOptions): Promise<string> {
        try {
            // Collect data based on options
            const exportData = await this.collectExportData(options);

            let filePath: string;

            switch (options.format) {
                case 'json':
                    filePath = await this.exportToJSON(exportData, options);
                    break;
                case 'pdf':
                    filePath = await this.exportToPDF(exportData, options);
                    break;
                case 'csv':
                    filePath = await this.exportToCSV(exportData, options);
                    break;
                default:
                    throw new Error('Unsupported export format');
            }

            return filePath;
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    }

    // Import data
    async importData(filePath: string): Promise<ImportResult> {
        try {
            const fileExtension = filePath.split('.').pop()?.toLowerCase();

            let importData: ExportData;

            switch (fileExtension) {
                case 'json':
                    importData = await this.importFromJSON(filePath);
                    break;
                case 'csv':
                    importData = await this.importFromCSV(filePath);
                    break;
                default:
                    throw new Error('Unsupported import format');
            }

            return await this.processImportData(importData);
        } catch (error) {
            console.error('Import failed:', error);
            return {
                success: false,
                importedRecords: 0,
                errors: [error.message],
                warnings: [],
            };
        }
    }

    // Collect data for export
    private async collectExportData(options: ExportOptions): Promise<ExportData> {
        const data: ExportData = {
            tasks: [],
            goals: [],
            penalties: [],
            calendar: [],
            safeRoom: [],
            profile: null,
            family: [],
            metadata: {
                exportDate: new Date().toISOString(),
                version: '1.3.0',
                totalRecords: 0,
                familyName: 'FamilyDash Family',
            },
        };

        // Collect tasks
        if (options.includeTasks) {
            data.tasks = await this.getTasksData(options.dateRange);
        }

        // Collect goals
        if (options.includeGoals) {
            data.goals = await this.getGoalsData(options.dateRange);
        }

        // Collect penalties
        if (options.includePenalties) {
            data.penalties = await this.getPenaltiesData(options.dateRange);
        }

        // Collect calendar
        if (options.includeCalendar) {
            data.calendar = await this.getCalendarData(options.dateRange);
        }

        // Collect safe room
        if (options.includeSafeRoom) {
            data.safeRoom = await this.getSafeRoomData(options.dateRange);
        }

        // Collect profile
        if (options.includeProfile) {
            data.profile = await this.getProfileData();
        }

        // Collect family data
        data.family = await this.getFamilyData();

        // Calculate total records
        data.metadata.totalRecords =
            data.tasks.length +
            data.goals.length +
            data.penalties.length +
            data.calendar.length +
            data.safeRoom.length +
            (data.profile ? 1 : 0) +
            data.family.length;

        return data;
    }

    // Get tasks data
    private async getTasksData(dateRange?: { start: string; end: string }): Promise<any[]> {
        try {
            const tasksData = await AsyncStorage.getItem('tasks_data');
            if (tasksData) {
                const tasks = JSON.parse(tasksData);

                if (dateRange) {
                    return tasks.filter((task: any) => {
                        const taskDate = new Date(task.createdAt);
                        const startDate = new Date(dateRange.start);
                        const endDate = new Date(dateRange.end);
                        return taskDate >= startDate && taskDate <= endDate;
                    });
                }

                return tasks;
            }
        } catch (error) {
            console.error('Error getting tasks data:', error);
        }
        return [];
    }

    // Get goals data
    private async getGoalsData(dateRange?: { start: string; end: string }): Promise<any[]> {
        try {
            const goalsData = await AsyncStorage.getItem('goals_data');
            if (goalsData) {
                const goals = JSON.parse(goalsData);

                if (dateRange) {
                    return goals.filter((goal: any) => {
                        const goalDate = new Date(goal.createdAt);
                        const startDate = new Date(dateRange.start);
                        const endDate = new Date(dateRange.end);
                        return goalDate >= startDate && goalDate <= endDate;
                    });
                }

                return goals;
            }
        } catch (error) {
            console.error('Error getting goals data:', error);
        }
        return [];
    }

    // Get penalties data
    private async getPenaltiesData(dateRange?: { start: string; end: string }): Promise<any[]> {
        try {
            const penaltiesData = await AsyncStorage.getItem('penalties_data');
            if (penaltiesData) {
                const penalties = JSON.parse(penaltiesData);

                if (dateRange) {
                    return penalties.filter((penalty: any) => {
                        const penaltyDate = new Date(penalty.assignedAt);
                        const startDate = new Date(dateRange.start);
                        const endDate = new Date(dateRange.end);
                        return penaltyDate >= startDate && penaltyDate <= endDate;
                    });
                }

                return penalties;
            }
        } catch (error) {
            console.error('Error getting penalties data:', error);
        }
        return [];
    }

    // Get calendar data
    private async getCalendarData(dateRange?: { start: string; end: string }): Promise<any[]> {
        try {
            const calendarData = await AsyncStorage.getItem('calendar_data');
            if (calendarData) {
                const events = JSON.parse(calendarData);

                if (dateRange) {
                    return events.filter((event: any) => {
                        const eventDate = new Date(event.date);
                        const startDate = new Date(dateRange.start);
                        const endDate = new Date(dateRange.end);
                        return eventDate >= startDate && eventDate <= endDate;
                    });
                }

                return events;
            }
        } catch (error) {
            console.error('Error getting calendar data:', error);
        }
        return [];
    }

    // Get safe room data
    private async getSafeRoomData(dateRange?: { start: string; end: string }): Promise<any[]> {
        try {
            const safeRoomData = await AsyncStorage.getItem('safeRoom_data');
            if (safeRoomData) {
                const messages = JSON.parse(safeRoomData);

                if (dateRange) {
                    return messages.filter((message: any) => {
                        const messageDate = new Date(message.createdAt);
                        const startDate = new Date(dateRange.start);
                        const endDate = new Date(dateRange.end);
                        return messageDate >= startDate && messageDate <= endDate;
                    });
                }

                return messages;
            }
        } catch (error) {
            console.error('Error getting safe room data:', error);
        }
        return [];
    }

    // Get profile data
    private async getProfileData(): Promise<any> {
        try {
            const profileData = await AsyncStorage.getItem('profile_data');
            if (profileData) {
                return JSON.parse(profileData);
            }
        } catch (error) {
            console.error('Error getting profile data:', error);
        }
        return null;
    }

    // Get family data
    private async getFamilyData(): Promise<any[]> {
        try {
            const familyData = await AsyncStorage.getItem('family_data');
            if (familyData) {
                return JSON.parse(familyData);
            }
        } catch (error) {
            console.error('Error getting family data:', error);
        }
        return [];
    }

    // Export to JSON
    private async exportToJSON(data: ExportData, options: ExportOptions): Promise<string> {
        const fileName = `FamilyDash_Export_${new Date().toISOString().split('T')[0]}.json`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;

        const jsonData = JSON.stringify(data, null, 2);
        await FileSystem.writeAsStringAsync(filePath, jsonData);

        return filePath;
    }

    // Export to PDF
    private async exportToPDF(data: ExportData, options: ExportOptions): Promise<string> {
        const fileName = `FamilyDash_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;

        // Generate PDF content
        const pdfContent = this.generatePDFContent(data);

        // For now, save as text file (in real implementation, use a PDF library)
        await FileSystem.writeAsStringAsync(filePath, pdfContent);

        return filePath;
    }

    // Export to CSV
    private async exportToCSV(data: ExportData, options: ExportOptions): Promise<string> {
        const fileName = `FamilyDash_Export_${new Date().toISOString().split('T')[0]}.csv`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;

        const csvContent = this.generateCSVContent(data);
        await FileSystem.writeAsStringAsync(filePath, csvContent);

        return filePath;
    }

    // Generate PDF content
    private generatePDFContent(data: ExportData): string {
        let content = `FamilyDash Family Report\n`;
        content += `Generated: ${data.metadata.exportDate}\n`;
        content += `Version: ${data.metadata.version}\n`;
        content += `Total Records: ${data.metadata.totalRecords}\n\n`;

        content += `=== TASKS ===\n`;
        data.tasks.forEach((task, index) => {
            content += `${index + 1}. ${task.title} - ${task.status}\n`;
        });

        content += `\n=== GOALS ===\n`;
        data.goals.forEach((goal, index) => {
            content += `${index + 1}. ${goal.title} - ${goal.status}\n`;
        });

        content += `\n=== PENALTIES ===\n`;
        data.penalties.forEach((penalty, index) => {
            content += `${index + 1}. ${penalty.type} - ${penalty.status}\n`;
        });

        content += `\n=== CALENDAR EVENTS ===\n`;
        data.calendar.forEach((event, index) => {
            content += `${index + 1}. ${event.title} - ${event.date}\n`;
        });

        content += `\n=== SAFE ROOM MESSAGES ===\n`;
        data.safeRoom.forEach((message, index) => {
            content += `${index + 1}. ${message.content} - ${message.createdAt}\n`;
        });

        return content;
    }

    // Generate CSV content
    private generateCSVContent(data: ExportData): string {
        let content = 'Type,Title,Status,Date,Created By\n';

        // Add tasks
        data.tasks.forEach(task => {
            content += `Task,"${task.title}",${task.status},${task.createdAt},${task.assignedTo}\n`;
        });

        // Add goals
        data.goals.forEach(goal => {
            content += `Goal,"${goal.title}",${goal.status},${goal.createdAt},${goal.createdBy}\n`;
        });

        // Add penalties
        data.penalties.forEach(penalty => {
            content += `Penalty,"${penalty.type}",${penalty.status},${penalty.assignedAt},${penalty.assignedBy}\n`;
        });

        // Add calendar events
        data.calendar.forEach(event => {
            content += `Event,"${event.title}",Scheduled,${event.date},${event.createdBy}\n`;
        });

        // Add safe room messages
        data.safeRoom.forEach(message => {
            content += `Message,"${message.content}",Sent,${message.createdAt},${message.sender}\n`;
        });

        return content;
    }

    // Import from JSON
    private async importFromJSON(filePath: string): Promise<ExportData> {
        const fileContent = await FileSystem.readAsStringAsync(filePath);
        return JSON.parse(fileContent);
    }

    // Import from CSV
    private async importFromCSV(filePath: string): Promise<ExportData> {
        const fileContent = await FileSystem.readAsStringAsync(filePath);
        const lines = fileContent.split('\n');
        const headers = lines[0].split(',');

        const data: ExportData = {
            tasks: [],
            goals: [],
            penalties: [],
            calendar: [],
            safeRoom: [],
            profile: null,
            family: [],
            metadata: {
                exportDate: new Date().toISOString(),
                version: '1.3.0',
                totalRecords: 0,
                familyName: 'Imported Family',
            },
        };

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim()) {
                const values = line.split(',');
                const record = {
                    type: values[0],
                    title: values[1].replace(/"/g, ''),
                    status: values[2],
                    date: values[3],
                    createdBy: values[4],
                };

                switch (record.type) {
                    case 'Task':
                        data.tasks.push(record);
                        break;
                    case 'Goal':
                        data.goals.push(record);
                        break;
                    case 'Penalty':
                        data.penalties.push(record);
                        break;
                    case 'Event':
                        data.calendar.push(record);
                        break;
                    case 'Message':
                        data.safeRoom.push(record);
                        break;
                }
            }
        }

        return data;
    }

    // Process import data
    private async processImportData(data: ExportData): Promise<ImportResult> {
        const result: ImportResult = {
            success: true,
            importedRecords: 0,
            errors: [],
            warnings: [],
        };

        try {
            // Import tasks
            if (data.tasks.length > 0) {
                await this.importTasks(data.tasks);
                result.importedRecords += data.tasks.length;
            }

            // Import goals
            if (data.goals.length > 0) {
                await this.importGoals(data.goals);
                result.importedRecords += data.goals.length;
            }

            // Import penalties
            if (data.penalties.length > 0) {
                await this.importPenalties(data.penalties);
                result.importedRecords += data.penalties.length;
            }

            // Import calendar
            if (data.calendar.length > 0) {
                await this.importCalendar(data.calendar);
                result.importedRecords += data.calendar.length;
            }

            // Import safe room
            if (data.safeRoom.length > 0) {
                await this.importSafeRoom(data.safeRoom);
                result.importedRecords += data.safeRoom.length;
            }

            // Import profile
            if (data.profile) {
                await this.importProfile(data.profile);
                result.importedRecords += 1;
            }

            // Import family
            if (data.family.length > 0) {
                await this.importFamily(data.family);
                result.importedRecords += data.family.length;
            }

        } catch (error) {
            result.success = false;
            result.errors.push(error.message);
        }

        return result;
    }

    // Import individual data types
    private async importTasks(tasks: any[]): Promise<void> {
        const existingTasks = await this.getTasksData();
        const mergedTasks = [...existingTasks, ...tasks];
        await AsyncStorage.setItem('tasks_data', JSON.stringify(mergedTasks));
    }

    private async importGoals(goals: any[]): Promise<void> {
        const existingGoals = await this.getGoalsData();
        const mergedGoals = [...existingGoals, ...goals];
        await AsyncStorage.setItem('goals_data', JSON.stringify(mergedGoals));
    }

    private async importPenalties(penalties: any[]): Promise<void> {
        const existingPenalties = await this.getPenaltiesData();
        const mergedPenalties = [...existingPenalties, ...penalties];
        await AsyncStorage.setItem('penalties_data', JSON.stringify(mergedPenalties));
    }

    private async importCalendar(events: any[]): Promise<void> {
        const existingEvents = await this.getCalendarData();
        const mergedEvents = [...existingEvents, ...events];
        await AsyncStorage.setItem('calendar_data', JSON.stringify(mergedEvents));
    }

    private async importSafeRoom(messages: any[]): Promise<void> {
        const existingMessages = await this.getSafeRoomData();
        const mergedMessages = [...existingMessages, ...messages];
        await AsyncStorage.setItem('safeRoom_data', JSON.stringify(mergedMessages));
    }

    private async importProfile(profile: any): Promise<void> {
        await AsyncStorage.setItem('profile_data', JSON.stringify(profile));
    }

    private async importFamily(family: any[]): Promise<void> {
        const existingFamily = await this.getFamilyData();
        const mergedFamily = [...existingFamily, ...family];
        await AsyncStorage.setItem('family_data', JSON.stringify(mergedFamily));
    }

    // Share file
    async shareFile(filePath: string): Promise<void> {
        try {
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(filePath);
            } else {
                Alert.alert('Sharing not available', 'File sharing is not available on this device.');
            }
        } catch (error) {
            console.error('Error sharing file:', error);
            Alert.alert('Share Error', 'Failed to share file.');
        }
    }

    // Pick file for import
    async pickFileForImport(): Promise<string | null> {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/json', 'text/csv', 'application/pdf'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                return result.assets[0].uri;
            }

            return null;
        } catch (error) {
            console.error('Error picking file:', error);
            return null;
        }
    }

    // Generate family report
    async generateFamilyReport(): Promise<ReportData> {
        const data = await this.collectExportData({
            format: 'json',
            includeTasks: true,
            includeGoals: true,
            includePenalties: true,
            includeCalendar: true,
            includeSafeRoom: true,
            includeProfile: true,
        });

        const report: ReportData = {
            title: 'FamilyDash Family Report',
            subtitle: 'Comprehensive Family Activity Report',
            generatedDate: new Date().toISOString(),
            familyName: data.metadata.familyName,
            summary: {
                totalTasks: data.tasks.length,
                completedTasks: data.tasks.filter(t => t.status === 'completed').length,
                activeGoals: data.goals.filter(g => g.status === 'in_progress').length,
                completedGoals: data.goals.filter(g => g.status === 'completed').length,
                activePenalties: data.penalties.filter(p => p.status === 'active').length,
                completedPenalties: data.penalties.filter(p => p.status === 'completed').length,
                calendarEvents: data.calendar.length,
                safeRoomMessages: data.safeRoom.length,
            },
            charts: [
                {
                    title: 'Task Completion Rate',
                    type: 'pie',
                    data: [
                        { label: 'Completed', value: data.tasks.filter(t => t.status === 'completed').length },
                        { label: 'Pending', value: data.tasks.filter(t => t.status === 'pending').length },
                        { label: 'Overdue', value: data.tasks.filter(t => t.status === 'overdue').length },
                    ],
                },
                {
                    title: 'Goal Progress',
                    type: 'bar',
                    data: data.goals.map(goal => ({
                        label: goal.title,
                        value: goal.progress || 0,
                    })),
                },
            ],
            details: [
                ...data.tasks.map(task => ({ ...task, type: 'task' })),
                ...data.goals.map(goal => ({ ...goal, type: 'goal' })),
                ...data.penalties.map(penalty => ({ ...penalty, type: 'penalty' })),
                ...data.calendar.map(event => ({ ...event, type: 'event' })),
                ...data.safeRoom.map(message => ({ ...message, type: 'message' })),
            ],
        };

        return report;
    }
}

export default DataExportImportManager;

