/**
 * Offline Manager for FamilyDash
 * Handles offline data synchronization and conflict resolution
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// import NetInfo from '@react-native-community/netinfo'; // Temporarily disabled

export interface SyncItem {
    id: string;
    type: 'create' | 'update' | 'delete';
    data: any;
    timestamp: number;
    familyId: string;
    memberId: string;
    conflictResolution?: 'manual' | 'automatic';
}

export interface ConflictItem {
    id: string;
    localData: any;
    remoteData: any;
    timestamp: number;
    familyId: string;
    memberId: string;
    resolved: boolean;
}

export interface NetworkStatus {
    isConnected: boolean;
    type: string;
    isInternetReachable: boolean;
}

export class OfflineManager {
    private static instance: OfflineManager;
    private syncQueue: SyncItem[] = [];
    private conflicts: ConflictItem[] = [];
    private networkStatus: NetworkStatus = {
        isConnected: false,
        type: 'unknown',
        isInternetReachable: false,
    };
    private listeners: Array<(status: NetworkStatus) => void> = [];
    private netInfoUnsubscribe: (() => void) | null = null;

    private constructor() {
        this.initializeNetworkListener();
        this.loadStoredData();
    }

    static getInstance(): OfflineManager {
        if (!OfflineManager.instance) {
            OfflineManager.instance = new OfflineManager();
        }
        return OfflineManager.instance;
    }

    private async initializeNetworkListener(): Promise<void> {
        try {
            // Real network state detection with NetInfo
            try {
                const NetInfo = require('@react-native-community/netinfo').default;
                
                // Get initial state
                const initialState = await NetInfo.fetch();
                this.updateNetworkStatus({
                    isConnected: initialState.isConnected ?? false,
                    type: initialState.type || 'unknown',
                    isInternetReachable: initialState.isInternetReachable ?? false
                });

                // Subscribe to network state updates
                this.netInfoUnsubscribe = NetInfo.addEventListener((state: any) => {
                    this.updateNetworkStatus({
                        isConnected: state.isConnected ?? false,
                        type: state.type || 'unknown',
                        isInternetReachable: state.isInternetReachable ?? false
                    });
                });

                console.log('📡 Network listener initialized (real NetInfo)');
            } catch (error) {
                console.warn('⚠️ NetInfo not available, using mock state:', error);
                // Fallback to mock state if NetInfo is not available
                const mockState = {
                    isConnected: true,
                    type: 'wifi',
                    isInternetReachable: true
                };
                this.updateNetworkStatus(mockState);
            }
        } catch (error) {
            console.error('Error initializing network listener:', error);
        }
    }

    private updateNetworkStatus(state: any): void {
        const newStatus: NetworkStatus = {
            isConnected: state.isConnected ?? false,
            type: state.type ?? 'unknown',
            isInternetReachable: state.isInternetReachable ?? false,
        };

        this.networkStatus = newStatus;

        // Notify listeners
        this.listeners.forEach(listener => listener(newStatus));

        // Auto-sync when connection is restored
        if (newStatus.isConnected && newStatus.isInternetReachable) {
            this.performAutoSync();
        }
    }

    private async loadStoredData(): Promise<void> {
        try {
            // Load sync queue
            const storedQueue = await AsyncStorage.getItem('offline_sync_queue');
            if (storedQueue) {
                this.syncQueue = JSON.parse(storedQueue);
            }

            // Load conflicts
            const storedConflicts = await AsyncStorage.getItem('offline_conflicts');
            if (storedConflicts) {
                this.conflicts = JSON.parse(storedConflicts);
            }

            console.log(`📱 Loaded ${this.syncQueue.length} sync items and ${this.conflicts.length} conflicts`);
        } catch (error) {
            console.error('Error loading stored data:', error);
        }
    }

    private async saveStoredData(): Promise<void> {
        try {
            await AsyncStorage.setItem('offline_sync_queue', JSON.stringify(this.syncQueue));
            await AsyncStorage.setItem('offline_conflicts', JSON.stringify(this.conflicts));
        } catch (error) {
            console.error('Error saving stored data:', error);
        }
    }

    async addToSyncQueue(item: SyncItem): Promise<void> {
        try {
            this.syncQueue.push(item);
            await this.saveStoredData();

            console.log(`📋 Added item to sync queue: ${item.type} ${item.id}`);

            // Try to sync immediately if online
            if (this.networkStatus.isConnected) {
                await this.performAutoSync();
            }
        } catch (error) {
            console.error('Error adding to sync queue:', error);
        }
    }

    async performAutoSync(): Promise<void> {
        if (!this.networkStatus.isConnected || this.syncQueue.length === 0) {
            return;
        }

        try {
            console.log(`🔄 Starting auto-sync for ${this.syncQueue.length} items`);

            const itemsToSync = [...this.syncQueue];
            const successfulItems: string[] = [];

            for (const item of itemsToSync) {
                try {
                    await this.syncItem(item);
                    successfulItems.push(item.id);
                } catch (error) {
                    console.error(`Error syncing item ${item.id}:`, error);
                }
            }

            // Remove successfully synced items
            this.syncQueue = this.syncQueue.filter(item => !successfulItems.includes(item.id));
            await this.saveStoredData();

            console.log(`✅ Auto-sync completed: ${successfulItems.length} items synced`);
        } catch (error) {
            console.error('Error during auto-sync:', error);
        }
    }

    private async syncItem(item: SyncItem): Promise<void> {
        // Mock sync implementation
        console.log(`🔄 Syncing item: ${item.type} ${item.id}`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Mock success
        console.log(`✅ Item synced: ${item.id}`);
    }

    async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge'): Promise<void> {
        try {
            const conflict = this.conflicts.find(c => c.id === conflictId);
            if (!conflict) {
                throw new Error(`Conflict not found: ${conflictId}`);
            }

            console.log(`🔧 Resolving conflict ${conflictId} with resolution: ${resolution}`);

            // Apply resolution
            let resolvedData: any;
            switch (resolution) {
                case 'local':
                    resolvedData = conflict.localData;
                    break;
                case 'remote':
                    resolvedData = conflict.remoteData;
                    break;
                case 'merge':
                    resolvedData = { ...conflict.localData, ...conflict.remoteData };
                    break;
            }

            // Add resolved data to sync queue
            await this.addToSyncQueue({
                id: conflictId,
                type: 'update',
                data: resolvedData,
                timestamp: Date.now(),
                familyId: conflict.familyId,
                memberId: conflict.memberId,
            });

            // Mark conflict as resolved
            conflict.resolved = true;
            await this.saveStoredData();

            console.log(`✅ Conflict resolved: ${conflictId}`);
        } catch (error) {
            console.error('Error resolving conflict:', error);
            throw error;
        }
    }

    addNetworkListener(listener: (status: NetworkStatus) => void): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    getSyncQueueLength(): number {
        return this.syncQueue.length;
    }

    getConflictsCount(): number {
        return this.conflicts.filter(c => !c.resolved).length;
    }

    getLastSyncTime(): number {
        if (this.syncQueue.length === 0) {
            return Date.now(); // Return current time if no items to sync
        }

        return Math.min(...this.syncQueue.map(item => item.timestamp));
    }

    getNetworkStatus(): NetworkStatus {
        return { ...this.networkStatus };
    }

    getSyncQueue(): SyncItem[] {
        return [...this.syncQueue];
    }

    getConflicts(): ConflictItem[] {
        return [...this.conflicts];
    }

    async clearSyncQueue(): Promise<void> {
        this.syncQueue = [];
        await this.saveStoredData();
        console.log('🗑️ Sync queue cleared');
    }

    async clearResolvedConflicts(): Promise<void> {
        this.conflicts = this.conflicts.filter(c => !c.resolved);
        await this.saveStoredData();
        console.log('🗑️ Resolved conflicts cleared');
    }
}




