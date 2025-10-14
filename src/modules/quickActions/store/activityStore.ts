import { create } from 'zustand';
import { ActivityLog } from '@/types/quickActionsTypes';
import { mockActivityLogs } from '../mock/mockActivity';

interface ActivityStore {
    activityLogs: ActivityLog[];
    loading: boolean;
    error: string | null;

    // Actions
    addActivityLog: (log: Omit<ActivityLog, 'id'>) => void;
    removeActivityLog: (id: string) => void;
    getActivityByType: (type: ActivityLog['type']) => ActivityLog[];
    getActivityByMember: (memberId: string) => ActivityLog[];
    getRecentActivity: (limit?: number) => ActivityLog[];
    clearOldActivity: (daysOld: number) => void;
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
    activityLogs: mockActivityLogs,
    loading: false,
    error: null,

    addActivityLog: (log) => {
        const newLog: ActivityLog = {
            ...log,
            id: Date.now().toString(),
        };
        set((state) => ({
            activityLogs: [newLog, ...state.activityLogs], // Add to beginning for newest first
        }));
    },

    removeActivityLog: (id) => {
        set((state) => ({
            activityLogs: state.activityLogs.filter((log) => log.id !== id),
        }));
    },

    getActivityByType: (type) => {
        return get().activityLogs.filter((log) => log.type === type);
    },

    getActivityByMember: (memberId) => {
        return get().activityLogs.filter((log) => log.memberId === memberId);
    },

    getRecentActivity: (limit = 10) => {
        const logs = get().activityLogs;
        return logs.slice(0, limit);
    },

    clearOldActivity: (daysOld) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        set((state) => ({
            activityLogs: state.activityLogs.filter((log) =>
                new Date(log.timestamp) > cutoffDate
            ),
        }));
    },
}));
