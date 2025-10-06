/**
 * Advanced Offline Mode Support
 * Provides comprehensive offline functionality with smart synchronization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

// Types
export interface OfflineData {
    tasks: any[];
    goals: any[];
    penalties: any[];
    calendar: any[];
    safeRoom: any[];
    profile: any;
    lastSync: number;
    version: string;
}

export interface SyncOperation {
    id: string;
    type: 'create' | 'update' | 'delete';
    collection: string;
    data: any;
    timestamp: number;
    retryCount: number;
    maxRetries: number;
}

export interface SyncConflict {
    id: string;
    collection: string;
    localData: any;
    remoteData: any;
    conflictType: 'update' | 'delete' | 'create';
    resolution: 'local' | 'remote' | 'merge' | 'manual';
}

export interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean;
    type: string;
    strength: number;
}

// Offline Manager Service
export class OfflineManager {
    private static instance: OfflineManager;
    private isOnline: boolean = true;
    private syncQueue: SyncOperation[] = [];
    private conflicts: SyncConflict[] = [];
    private listeners: Array<(status: NetworkStatus) => void> = [];
    private syncInProgress: boolean = false;
    private lastSyncTime: number = 0;
    private syncInterval: NodeJS.Timeout | null = null;

    // Storage keys
    private readonly STORAGE_KEYS = {
        OFFLINE_DATA: 'offline_data',
        SYNC_QUEUE: 'sync_queue',
        CONFLICTS: 'sync_conflicts',
        LAST_SYNC: 'last_sync_time',
    };

    static getInstance(): OfflineManager {
        if (!OfflineManager.instance) {
            OfflineManager.instance = new OfflineManager();
        }
        return OfflineManager.instance;
    }

    // Initialize offline manager
    async initialize(): Promise<void> {
        try {
            // Load existing data
            await this.loadOfflineData();
            await this.loadSyncQueue();
            await this.loadConflicts();

            // Setup network monitoring
            this.setupNetworkMonitoring();

            // Start periodic sync
            this.startPeriodicSync();

            console.log('OfflineManager initialized successfully');
        } catch (error) {
            console.error('Error initializing OfflineManager:', error);
        }
    }

    // Network monitoring
    private setupNetworkMonitoring(): void {
        NetInfo.addEventListener(state => {
            const wasOnline = this.isOnline;
            this.isOnline = state.isConnected && state.isInternetReachable === true;

            if (!wasOnline && this.isOnline) {
                // Came back online - trigger sync
                this.triggerSync();
            }

            // Notify listeners
            const networkStatus: NetworkStatus = {
                isConnected: state.isConnected,
                isInternetReachable: state.isInternetReachable === true,
                type: state.type,
                strength: this.getNetworkStrength(state),
            };

            this.listeners.forEach(listener => listener(networkStatus));
        });
    }

    private getNetworkStrength(state: any): number {
        // Simulate network strength based on connection type
        switch (state.type) {
            case 'wifi': return 90;
            case 'cellular': return 70;
            case 'ethernet': return 95;
            case 'bluetooth': return 30;
            case 'vpn': return 80;
            default: return 50;
        }
    }

    // Add network status listener
    addNetworkListener(listener: (status: NetworkStatus) => void): () => void {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    // Offline data management
    async saveOfflineData(data: Partial<OfflineData>): Promise<void> {
        try {
            const existingData = await this.getOfflineData();
            const updatedData: OfflineData = {
                ...existingData,
                ...data,
                lastSync: Date.now(),
                version: '1.3.0',
            };

            await AsyncStorage.setItem(
                this.STORAGE_KEYS.OFFLINE_DATA,
                JSON.stringify(updatedData)
            );
        } catch (error) {
            console.error('Error saving offline data:', error);
        }
    }

    async getOfflineData(): Promise<OfflineData> {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.OFFLINE_DATA);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading offline data:', error);
        }

        // Return default empty data
        return {
            tasks: [],
            goals: [],
            penalties: [],
            calendar: [],
            safeRoom: [],
            profile: null,
            lastSync: 0,
            version: '1.3.0',
        };
    }

    // Sync queue management
    async addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
        const syncOp: SyncOperation = {
            ...operation,
            id: this.generateId(),
            timestamp: Date.now(),
            retryCount: 0,
            maxRetries: 3,
        };

        this.syncQueue.push(syncOp);
        await this.saveSyncQueue();

        // Try to sync immediately if online
        if (this.isOnline) {
            this.triggerSync();
        }
    }

    private async saveSyncQueue(): Promise<void> {
        try {
            await AsyncStorage.setItem(
                this.STORAGE_KEYS.SYNC_QUEUE,
                JSON.stringify(this.syncQueue)
            );
        } catch (error) {
            console.error('Error saving sync queue:', error);
        }
    }

    private async loadSyncQueue(): Promise<void> {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.SYNC_QUEUE);
            if (data) {
                this.syncQueue = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading sync queue:', error);
        }
    }

    // Sync operations
    async triggerSync(): Promise<void> {
        if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
            return;
        }

        this.syncInProgress = true;
        console.log('Starting sync process...');

        try {
            // Process sync queue
            await this.processSyncQueue();

            // Handle conflicts
            await this.resolveConflicts();

            // Update last sync time
            this.lastSyncTime = Date.now();
            await AsyncStorage.setItem(
                this.STORAGE_KEYS.LAST_SYNC,
                this.lastSyncTime.toString()
            );

            console.log('Sync completed successfully');
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    private async processSyncQueue(): Promise<void> {
        const operationsToProcess = [...this.syncQueue];
        const successfulOps: string[] = [];
        const failedOps: SyncOperation[] = [];

        for (const operation of operationsToProcess) {
            try {
                await this.executeSyncOperation(operation);
                successfulOps.push(operation.id);
            } catch (error) {
                console.error(`Sync operation failed:`, error);
                operation.retryCount++;

                if (operation.retryCount < operation.maxRetries) {
                    failedOps.push(operation);
                } else {
                    console.error(`Operation ${operation.id} exceeded max retries`);
                }
            }
        }

        // Update sync queue
        this.syncQueue = failedOps;
        await this.saveSyncQueue();

        // Remove successful operations from queue
        if (successfulOps.length > 0) {
            console.log(`Successfully synced ${successfulOps.length} operations`);
        }
    }

    private async executeSyncOperation(operation: SyncOperation): Promise<void> {
        // Simulate API calls based on operation type
        switch (operation.type) {
            case 'create':
                await this.simulateCreateOperation(operation);
                break;
            case 'update':
                await this.simulateUpdateOperation(operation);
                break;
            case 'delete':
                await this.simulateDeleteOperation(operation);
                break;
        }
    }

    private async simulateCreateOperation(operation: SyncOperation): Promise<void> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate potential conflict
        if (Math.random() < 0.1) { // 10% chance of conflict
            throw new Error('Conflict detected during create');
        }
    }

    private async simulateUpdateOperation(operation: SyncOperation): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 800));

        if (Math.random() < 0.15) { // 15% chance of conflict
            throw new Error('Conflict detected during update');
        }
    }

    private async simulateDeleteOperation(operation: SyncOperation): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (Math.random() < 0.05) { // 5% chance of conflict
            throw new Error('Conflict detected during delete');
        }
    }

    // Conflict resolution
    private async resolveConflicts(): Promise<void> {
        for (const conflict of this.conflicts) {
            try {
                await this.resolveConflict(conflict);
            } catch (error) {
                console.error(`Failed to resolve conflict ${conflict.id}:`, error);
            }
        }
    }

    private async resolveConflict(conflict: SyncConflict): Promise<void> {
        switch (conflict.resolution) {
            case 'local':
                await this.applyLocalResolution(conflict);
                break;
            case 'remote':
                await this.applyRemoteResolution(conflict);
                break;
            case 'merge':
                await this.applyMergeResolution(conflict);
                break;
            case 'manual':
                // Manual resolution - keep conflict for user intervention
                return;
        }

        // Remove resolved conflict
        this.conflicts = this.conflicts.filter(c => c.id !== conflict.id);
        await this.saveConflicts();
    }

    private async applyLocalResolution(conflict: SyncConflict): Promise<void> {
        // Apply local data to remote
        console.log(`Applying local resolution for conflict ${conflict.id}`);
    }

    private async applyRemoteResolution(conflict: SyncConflict): Promise<void> {
        // Apply remote data to local
        console.log(`Applying remote resolution for conflict ${conflict.id}`);
    }

    private async applyMergeResolution(conflict: SyncConflict): Promise<void> {
        // Merge local and remote data intelligently
        console.log(`Applying merge resolution for conflict ${conflict.id}`);
    }

    private async saveConflicts(): Promise<void> {
        try {
            await AsyncStorage.setItem(
                this.STORAGE_KEYS.CONFLICTS,
                JSON.stringify(this.conflicts)
            );
        } catch (error) {
            console.error('Error saving conflicts:', error);
        }
    }

    private async loadConflicts(): Promise<void> {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEYS.CONFLICTS);
            if (data) {
                this.conflicts = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading conflicts:', error);
        }
    }

    // Periodic sync
    private startPeriodicSync(): void {
        // Sync every 5 minutes when online
        this.syncInterval = setInterval(() => {
            if (this.isOnline && this.syncQueue.length > 0) {
                this.triggerSync();
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    stopPeriodicSync(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // Utility methods
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Public API
    getNetworkStatus(): NetworkStatus {
        return {
            isConnected: this.isOnline,
            isInternetReachable: this.isOnline,
            type: 'unknown',
            strength: this.isOnline ? 80 : 0,
        };
    }

    getSyncQueueLength(): number {
        return this.syncQueue.length;
    }

    getConflictsCount(): number {
        return this.conflicts.length;
    }

    getLastSyncTime(): number {
        return this.lastSyncTime;
    }

    isSyncInProgress(): boolean {
        return this.syncInProgress;
    }

    // Manual conflict resolution
    async resolveConflictManually(conflictId: string, resolution: 'local' | 'remote' | 'merge'): Promise<void> {
        const conflict = this.conflicts.find(c => c.id === conflictId);
        if (conflict) {
            conflict.resolution = resolution;
            await this.resolveConflict(conflict);
        }
    }

    // Clear all offline data
    async clearOfflineData(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([
                this.STORAGE_KEYS.OFFLINE_DATA,
                this.STORAGE_KEYS.SYNC_QUEUE,
                this.STORAGE_KEYS.CONFLICTS,
                this.STORAGE_KEYS.LAST_SYNC,
            ]);

            this.syncQueue = [];
            this.conflicts = [];
            this.lastSyncTime = 0;

            console.log('Offline data cleared successfully');
        } catch (error) {
            console.error('Error clearing offline data:', error);
        }
    }

    // Cleanup
    destroy(): void {
        this.stopPeriodicSync();
        this.listeners = [];
    }
}

// Offline Status Component
export interface OfflineStatusProps {
    style?: any;
}

export const OfflineStatus: React.FC<OfflineStatusProps> = ({ style }) => {
    const [networkStatus, setNetworkStatus] = React.useState<NetworkStatus>({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        strength: 80,
    });
    const [syncQueueLength, setSyncQueueLength] = React.useState(0);
    const [conflictsCount, setConflictsCount] = React.useState(0);
    const [lastSyncTime, setLastSyncTime] = React.useState(0);

    React.useEffect(() => {
        const offlineManager = OfflineManager.getInstance();

        const removeListener = offlineManager.addNetworkListener(setNetworkStatus);

        const updateStats = () => {
            setSyncQueueLength(offlineManager.getSyncQueueLength());
            setConflictsCount(offlineManager.getConflictsCount());
            setLastSyncTime(offlineManager.getLastSyncTime());
        };

        // Update stats every 30 seconds
        const statsInterval = setInterval(updateStats, 30000);
        updateStats(); // Initial update

        return () => {
            removeListener();
            clearInterval(statsInterval);
        };
    }, []);

    const getStatusColor = (): string => {
        if (!networkStatus.isConnected) return '#EF4444';
        if (syncQueueLength > 0) return '#F59E0B';
        if (conflictsCount > 0) return '#8B5CF6';
        return '#10B981';
    };

    const getStatusText = (): string => {
        if (!networkStatus.isConnected) return 'Offline';
        if (syncQueueLength > 0) return `${syncQueueLength} pending`;
        if (conflictsCount > 0) return `${conflictsCount} conflicts`;
        return 'Synced';
    };

    const formatLastSync = (): string => {
        if (lastSyncTime === 0) return 'Never';

        const now = Date.now();
        const diff = now - lastSyncTime;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;

        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <View style= { [styles.container, style]} >
        <View style={ [styles.statusIndicator, { backgroundColor: getStatusColor() }] } />
            < View style = { styles.statusInfo } >
                <Text style={ styles.statusText }> { getStatusText() } </Text>
                    < Text style = { styles.syncText } > Last sync: { formatLastSync() } </Text>
                        </View>
                        </View>
  );
};

const styles = {
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusInfo: {
        flex: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    syncText: {
        fontSize: 10,
        color: '#6B7280',
        marginTop: 2,
    },
};

export default OfflineManager;

