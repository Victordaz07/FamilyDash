/**
 * Real-time Data Synchronization Service
 * Synchronizes data across family members instantly
 */

import { EventEmitter } from 'events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebSocketManager, RealTimeMessage } from './WebSocketManager';

export interface SyncState {
    syncing: boolean;
    lastSync: number | null;
    conflictResolution: 'client' | 'server' | 'manual';
    pendingUpdates: number;
}

export interface SyncOperation {
    type: 'create' | 'update' | 'delete';
    entity: string; // 'task', 'goal', 'penalty', 'calendar_event', etc.
    entityId: string;
    data: any;
    timestamp: number;
    userId: string;
    version: number;
}

export interface ConflictResolution {
    entityId: string;
    localData: any;
    remoteData: any;
    localTimestamp: number;
    remoteTimestamp: number;
    resolution: 'local' | 'remote' | 'merge';
}

export class RealTimeSync extends EventEmitter {
    private static instance: RealTimeSync;
    private wsManager: WebSocketManager;
    private syncState: SyncState;
    private syncQueue: SyncOperation[] = [];
    private conflicts: ConflictResolution[] = [];
    private localDataVersions = new Map<string, number>();
    private entityStores = new Map<string, any>();

    private constructor() {
        super();
        this.wsManager = WebSocketManager.getInstance();
        this.syncState = {
            syncing: false,
            lastSync: null,
            conflictResolution: 'server',
            pendingUpdates: 0,
        };

        this.initializeMessageHandlers();
    }

    static getInstance(): RealTimeSync {
        if (!RealTimeSync.instance) {
            RealTimeSync.instance = new RealTimeSync();
        }
        return RealTimeSync.instance;
    }

    /**
     * Initialize WebSocket message handlers
     */
    private initializeMessageHandlers(): void {
        // Handle entity updates from other family members
        this.wsManager.onMessage('entity_update', (message) => {
            this.handleRemoteUpdate(message.payload);
        });

        // Handle entity deletions
        this.wsManager.onMessage('entity_delete', (message) => {
            this.handleRemoteDelete(message.payload);
        });

        // Handle entity creation
        this.wsManager.onMessage('entity_create', (message) => {
            this.handleRemoteCreate(message.payload);
        });

        // Handle sync conflicts
        this.wsManager.onMessage('sync_conflict', (message) => {
            this.handleConflict(message.payload);
        });

        // Handle family member online/offline status
        this.wsManager.onMessage('family_member_online', (message) => {
            this.handleMemberStatusChange(message.payload, true);
        });

        this.wsManager.onMessage('family_member_offline', (message) => {
            this.handleMemberStatusChange(message.payload, false);
        });
    }

    /**
     * Register a data store for synchronization
     */
    registerStore(entityType: string, store: any): void {
        this.entityStores.set(entityType, store);
    }

    /**
     * Sync local changes to server
     */
    async syncLocalChanges(): Promise<void> {
        if (this.syncState.syncing || this.syncQueue.length === 0) {
            return;
        }

        this.syncState.syncing = true;
        this.emit('syncStarted');

        try {
            // Process queue and send updates
            const operations = [...this.syncQueue];
            this.syncQueue = [];

            for (const operation of operations) {
                await this.sendSyncOperation(operation);
            }

            this.syncState.lastSync = Date.now();
            this.syncState.pendingUpdates = 0;
            this.emit('syncCompleted', { operationsProcessed: operations.length });

        } catch (error) {
            console.error('Sync error:', error);
            this.emit('syncError', error);
            // Re-add operations to queue for retry
            this.syncQueue.unshift(...operations);
        } finally {
            this.syncState.syncing = false;
        }
    }

    /**
     * Send sync operation to server
     */
    private async sendSyncOperation(operation: SyncOperation): Promise<void> {
        // Send through WebSocket
        this.wsManager.send({
            type: `entity_${operation.type}`,
            payload: {
                entity: operation.entity,
                entityId: operation.entityId,
                data: operation.data,
                timestamp: operation.timestamp,
                version: operation.version,
                userId: operation.userId,
            },
            senderId: operation.userId,
            senderName: 'Current User',
            familyId: 'family_ruiz_001',
        });

        // Update local version
        this.localDataVersions.set(
            `${operation.entity}_${operation.entityId}`,
            operation.version + 1
        );
    }

    /**
     * Handle remote entity update
     */
    private async handleRemoteUpdate(payload: any): Promise<void> {
        const { entity, entityId, data, timestamp, version, userId } = payload;
        const localVersion = this.localDataVersions.get(`${entity}_${entityId}`) || 0;

        // Check for conflicts
        if (localVersion > version) {
            await this.handleConflict({
                entity,
                entityId,
                localData: await this.getLocalEntityData(entity, entityId),
                remoteData: data,
                localTimestamp: Date.now(),
                remoteTimestamp: timestamp,
            });
            return;
        }

        // Apply remote update
        await this.applyRemoteUpdate(entity, entityId, data, version);
        this.emit('entityUpdated', { entity, entityId, data });
    }

    /**
     * Handle remote entity creation
     */
    private async handleRemoteCreate(payload: any): Promise<void> => {
    const { entity, entityId, data, userId } = payload;

    // Check if entity already exists locally
    const exists = await this.entityExists(entity, entityId);
    if (exists) {
        console.log(`Entity ${entityId} already exists locally, skipping create`);
        return;
    }

    await this.applyRemoteCreate(entity, entityId, data);
    this.emit('entityCreated', { entity, entityId, data });
}

  /**
   * Handle remote entity deletion
   */
  private async handleRemoteDelete(payload: any): Promise<void> => {
    const { entity, entityId } = payload;

    await this.applyRemoteDelete(entity, entityId);
    this.emit('entityDeleted', { entity, entityId });
}

/**
 * Queue local entity changes for sync
 */
queueEntityChange(
    operation: Omit<SyncOperation, 'timestamp' | 'version'>
): void {
    const version = this.localDataVersions.get(`${operation.entity}_${operation.entityId}`) || 0;

    const syncOperation: SyncOperation = {
        ...operation,
        timestamp: Date.now(),
        version: version,
        userId: 'current_user',
    };

    this.syncQueue.push(syncOperation);
    this.syncState.pendingUpdates = this.syncQueue.length;

    this.emit('changeQueued');

    // Auto-sync if not too busy
    if(!this.syncState.syncing && Date.now() - (this.syncState.lastSync || 0) > 2000) {
    setTimeout(() => this.syncLocalChanges(), 500);
}
  }

  /**
   * Apply remote update to local store
   */
  private async applyRemoteUpdate(entity: string, entityId: string, data: any, version: number): Promise < void> {
    const store = this.entityStores.get(entity);
    if(!store) {
        console.warn(`No store found for entity: ${entity}`);
        return;
    }

    try {
        // Update entity in store
        if(typeof store.updateItem === 'function') {
    await store.updateItem(entityId, data);
} else if (typeof store.update === 'function') {
    await store.update({ [entityId]: data });
}

// Update version tracking
this.localDataVersions.set(`${entity}_${entityId}`, version);
    } catch (error) {
    console.error(`Error applying remote update for ${entity}:${entityId}:`, error);
    this.emit('updateError', { entity, entityId, error });
}
  }

  /**
   * Apply remote creation to local store
   */
  private async applyRemoteCreate(entity: string, entityId: string, data: any): Promise < void> {
    const store = this.entityStores.get(entity);
    if(!store) return;

    try {
        if(typeof store.addItem === 'function') {
    await store.addItem({ ...data, id: entityId });
} else if (typeof store.add === 'function') {
    await store.add({ ...data, id: entityId });
}

// Set initial version
this.localDataVersions.set(`${entity}_${entityId}`, 1);
    } catch (error) {
    console.error(`Error applying remote create for ${entity}:${entityId}:`, error);
}
  }

  /**
   * Apply remote deletion to local store
   */
  private async applyRemoteDelete(entity: string, entityId: string): Promise < void> {
    const store = this.entityStores.get(entity);
    if(!store) return;

    try {
        if(typeof store.removeItem === 'function') {
    await store.removeItem(entityId);
} else if (typeof store.remove === 'function') {
    await store.remove(entityId);
}

// Remove version tracking
this.localDataVersions.delete(`${entity}_${entityId}`);
    } catch (error) {
    console.error(`Error applying remote delete for ${entity}:${entityId}:`, error);
}
  }

  /**
   * Handle sync conflicts
   */
  private async handleConflict(conflict: ConflictResolution): Promise < void> {
    this.conflicts.push(conflict);
    this.emit('conflictDetected', conflict);

    // Auto-resolve based on strategy
    if(this.syncState.conflictResolution === 'server') {
    const resolution = {
        ...conflict,
        resolution: 'remote' as const,
    };

    await this.resolveConflict(resolution);
} else if (this.syncState.conflictResolution === 'client') {
    const resolution = {
        ...conflict,
        resolution: 'local' as const,
    };

    await this.resolveConflict(resolution);
} else {
    // Manual resolution required
    console.log('Manual conflict resolution required:', conflict);
}
  }

  /**
   * Resolve sync conflict
   */
  async resolveConflict(resolution: ConflictResolution): Promise < void> {
    const { entity, entityId, resolution: resolutionType } = resolution;

    let dataToApply: any;
    let versionToApply: number;

    switch(resolutionType) {
      case 'local':
    dataToApply = resolution.localData;
    versionToApply = this.localDataVersions.get(`${entity}_${entityId}`) || 0;
    break;
    case 'remote':
    dataToApply = resolution.remoteData;
    versionToApply = Date.now(); // Server wins
    break;
    case 'merge':
    dataToApply = this.mergeEntities(resolution.localData, resolution.remoteData);
    versionToApply = Math.max(
        this.localDataVersions.get(`${entity}_${entityId}`) || 0,
        resolution.remoteTimestamp
    );
    break;
    default:
        console.error('Invalid conflict resolution type:', resolutionType);
    return;
}

// Apply resolution
await this.applyRemoteUpdate(entity, entityId, dataToApply, versionToApply);

// Remove from conflicts list
this.conflicts = this.conflicts.filter(c => c.entityId !== entityId);

this.emit('conflictResolved', resolution);
  }

  /**
   * Merge two entity objects intelligently
   */
  private mergeEntities(local: any, remote: any): any {
    const merged = { ...local };

    for (const key in remote) {
        if (remote.hasOwnProperty(key)) {
            const localValue = local[key];
            const remoteValue = remote[key];

            // Use newer timestamp for time-sensitive fields
            if (key.includes('timestamp') || key.includes('updatedAt')) {
                merged[key] = Math.max(localValue, remoteValue);
            }
            // Merge arrays by combining unique items
            else if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
                merged[key] = [...new Set([...localValue, ...remoteValue])];
            }
            // Merge objects recursively
            else if (typeof localValue === 'object' && typeof remoteValue === 'object') {
                merged[key] = this.mergeEntities(localValue, remoteValue);
            }
            // Use remote value for conflicts
            else {
                merged[key] = remoteValue;
            }
        }
    }

    return merged;
}

  /**
   * Handle family member status changes
   */
  private handleMemberStatusChange(payload: any, isOnline: boolean): void {
    this.emit('memberStatusChanged', {
        memberId: payload.memberId,
        memberName: payload.memberName,
        isOnline,
        lastActive: payload.lastActive,
    });
}

  /**
   * Check if entity exists locally
   */
  private async entityExists(entity: string, entityId: string): Promise < boolean > {
    const store = this.entityStores.get(entity);
    if(!store) return false;

    try {
        if(typeof store.getItem === 'function') {
    const item = await store.getItem(entityId);
    return !!item;
} else if (typeof store.get === 'function') {
    const items = await store.get({ id: entityId });
    return items.length > 0;
}
    } catch (error) {
    console.error('Error checking entity existence:', error);
}

return false;
  }

  /**
   * Get local entity data
   */
  private async getLocalEntityData(entity: string, entityId: string): Promise < any > {
    const store = this.entityStores.get(entity);
    if(!store) return null;

    try {
        if(typeof store.getItem === 'function') {
    return await store.getItem(entityId);
} else if (typeof store.get === 'function') {
    const items = await store.get({ id: entityId });
    return items[0] || null;
}
    } catch (error) {
    console.error('Error getting local entity data:', error);
}

return null;
  }

/**
 * Get sync state
 */
getSyncState(): SyncState {
    return { ...this.syncState };
}

/**
 * Get pending conflicts
 */
getConflicts(): ConflictResolution[] {
    return [...this.conflicts];
}

/**
 * Set conflict resolution strategy
 */
setConflictResolution(strategy: SyncState['conflictResolution']): void {
    this.syncState.conflictResolution = strategy;
    this.emit('conflictResolutionChanged', strategy);
}

  /**
   * Force sync all pending changes
   */
  async forceSync(): Promise < void> {
    if(this.syncState.syncing) {
    this.emit('syncAlreadyInProgress');
    return;
}

// Move all current queue operations to the front for priority
while (this.syncQueue.length > 0) {
    this.syncQueue.unshift(this.syncQueue.pop()!);
}

await this.syncLocalChanges();
  }

/**
 * Get sync statistics
 */
getSyncStats() {
    return {
        pendingUpdates: this.syncQueue.length,
        conflicts: this.conflicts.length,
        lastSync: this.syncState.lastSync,
        connectionState: this.wsManager.getConnectionState(),
    };
}
}
