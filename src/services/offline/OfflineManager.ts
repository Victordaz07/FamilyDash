/**
 * Offline Manager for FamilyDash
 * Handles offline data synchronization and conflict resolution
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

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
            // Get initial network state
            const state = await NetInfo.fetch();
            this.updateNetworkStatus(state);

            // Listen for network changes
            NetInfo.addEventListener(state => {
                this.updateNetworkStatus(state);
            });
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

// React component for offline status display
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OfflineStatusProps {
    style?: any;
}

export const OfflineStatus: React.FC<OfflineStatusProps> = ({ style }) => {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isConnected: false,
        type: 'unknown',
        isInternetReachable: false,
    });
    const [syncQueueLength, setSyncQueueLength] = useState(0);
    const [conflictsCount, setConflictsCount] = useState(0);
    const [lastSyncTime, setLastSyncTime] = useState(0);

    const offlineManager = OfflineManager.getInstance();

    useEffect(() => {
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

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'white',
        borderRadius: 8,
        marginVertical: 4,
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
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    syncText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
});
