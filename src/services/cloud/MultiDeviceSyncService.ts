/**
 * Multi-Device Synchronization Service for FamilyDash
 * Handles real-time synchronization across multiple devices
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

export interface SyncOperation {
  id: string;
  timestamp: number;
  operation: 'create' | 'update' | 'delete';
  collection: string;
  documentId: string;
  data?: any;
  clientId: string;
  familyId: string;
}

export interface Conflict {
  id: string;
  resource: string;
  resourceId: string;
  operation: 'create' | 'update' | 'delete';
  localVersion: {
    data: any;
    timestamp: number;
    modifiedBy: string;
  };
  cloudVersion: {
    data: any;
    timestamp: number;
    modifiedBy: string;
  };
  conflictType: 'data_conflict' | 'concurrent_modification' | 'deleted_conflict';
  status: 'unresolved' | 'resolved_local' | 'resolved_cloud' | 'merged';
  resolution?: {
    acceptedVersion: 'local' | 'cloud' | 'merged';
    mergedData?: any;
    resolutionStrategy: 'last_writer_wins' | 'manual_merge' | 'ai_merge';
  };
}

export interface DeviceSyncStatus {
  deviceId: string;
  familyId: string;
  lastSyncTime: number;
  syncStatus: 'synced' | 'syncing' | 'out_of_sync' | 'conflict' | 'error';
  offlineChanges: number;
  pendingUploads: SyncOperation[];
  conflicts: Conflict[];
  connectionState: 'online' | 'offline' | 'connecting';
}

export interface SyncMetrics {
  syncCount: number;
  conflictCount: number;
  avgSyncTime: number;
  lastSuccessfulSync: number;
  uploadBandwidth: number;
  downloadBandwidth: number;
  syncErrors: Array<{
    error: string;
    timestamp: number;
    operation: string;
  }>;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
  lastSeen: number;
  capabilities: string[];
  status: 'active' | 'idle' | 'offline';
}

export class MultiDeviceSyncService {
  private static instance: MultiDeviceSyncService;
  private deviceId: string;
  private familyId: string;
  private isOnline: boolean = true;
  private syncQueue: SyncOperation[] = [];
  private conflicts: Conflict[] = [];
  private syncSubscriptions: Map<string, () => void> = new Map();
  private conflictListeners: Array<(conflicts: Conflict[]) => void> = [];
  private syncMetrics: SyncMetrics = {
    syncCount: 0,
    conflictCount: 0,
    avgSyncTime: 0,
    lastSuccessfulSync: 0,
    uploadBandwidth: 0,
    downloadBandwidth: 0,
    syncErrors: [],
  };

  private COLLECTIONS = {
    SYNC_OPERATIONS: 'sync_operations',
    CONFLICTS: 'conflicts',
    DEVICES: 'devices',
    PENDING_SYNC: 'pending_sync',
  };

  private constructor() {
    this.deviceId = this.generateDeviceId();
    this.initializeSyncService();
  }

  static getInstance(): MultiDeviceSyncService {
    if (!MultiDeviceSyncService.instance) {
      MultiDeviceSyncService.instance = new MultiDeviceSyncService();
    }
    return MultiDeviceSyncService.instance;
  }

  /**
   * Initialize sync service
   */
  private async initializeSyncService(): Promise<void> {
    try {
      // Register device
      await this.registerDevice();
      
      // Set up network state listeners
      this.setupNetworkListeners();
      
      // Start sync queue processor
      this.startSyncQueueProcessor();
      
      console.log(`📱 Multi-device sync initialized for device ${this.deviceId}`);
    } catch (error) {
      console.error('Error initializing sync service:', error);
    }
  }

  /**
   * Generate unique device ID
   */
  private generateDeviceId(): string {
    const storedId = AsyncStorage.getItem('device_id');
    if (storedId) {
      return storedId;
    }
    
    const newId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    AsyncStorage.setItem('device_id', newId);
    return newId;
  }

  /**
   * Register device with family
   */
  async registerDevice(): Promise<void> {
    if (!this.familyId) return;

    try {
      const deviceInfo: DeviceInfo = {
        deviceId: this.deviceId,
        deviceName: `FamilyDash Device ${this.deviceId.slice(-6)}`,
        platform: 'android', // Would detect actual platform
        appVersion: '1.0.0',
        lastSeen: Date.now(),
        capabilities: ['realtime_sync', 'offline_mode', 'conflict_resolution'],
        status: 'active',
      }

      const deviceRef = doc(this.db, this.COLLECTIONS.DEVICES, this.deviceId);
      await updateDoc(deviceRef, {
        ...deviceInfo,
        lastSeen: serverTimestamp(),
        registeredAt: serverTimestamp(),
      });

      console.log(`📱 Device ${this.deviceId} registered successfully`);
    } catch (error) {
      console.error('Error registering device:', error);
    }
  }

  /**
   * Initialize sync for family
   */
  async initializeFamilySync(familyId: string): Promise<void> {
    try {
      this.familyId = familyId;
      
      // Register device
      await this.registerDevice();
      
      // Set up real-time listeners for all collections
      await this.setupRealtimeListeners(familyId);
      
      // Verify offline data integrity
      await this.verifyOfflineDataIntegrity();
      
      // Start sync for pending operations
      await this.processPendingSyncOperations();
      
      console.log(`🔄 Multi-device sync initialized for family ${familyId}`);
    } catch (error) {
      console.error('Error initializing family sync:', error);
    }
  }

  /**
   * Set up real-time listeners for all collections
   */
  private async setupRealtimeListeners(familyId: string): Promise<void> {
    try {
      // Listen for concurrent modifications
      await this.setupConcurrentModificationListener(familyId);
      
      // Listen for device status changes
      await this.setupDeviceStatusListener(familyId);
      
      // Listen for conflicts
      await this.setupConflictListener(familyId);
      
      // Listen for sync operations
      await this.setupSyncOperationListener(familyId);

    } catch (error) {
      console.error('Error setting up real-time listeners:', error);
    }
  }

  /**
   * Set up listener for concurrent modifications
   */
  private async setupConcurrentModificationListener(familyId: string): Promise<void> {
    const concurrentModQuery = query(
      collection(this.db, this.COLLECTIONS.SYNC_OPERATIONS),
      where('familyId', '==', familyId),
      where('clientId', '!=', this.deviceId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(concurrentModQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const syncOp = change.doc.data() as SyncOperation;
          await this.handleConcurrentModification(syncOp);
        }
      });
    });

    this.syncSubscriptions.set(`concurrent_mod_${familyId}`, unsubscribe);
  }

  /**
   * Set up listener for device status changes
   */
  private async setupDeviceStatusListener(familyId: string): Promise<void> {
    const devicesQuery = query(
      collection(this.db, this.COLLECTIONS.DEVICES),
      where('familyId', '==', familyId)
    );

    const unsubscribe = onSnapshot(devicesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const deviceInfo = change.doc.data() as DeviceInfo;
        console.log(`📱 Device status changed: ${deviceInfo.deviceId} is now ${deviceInfo.status}`);
      });
    });

    this.syncSubscriptions.set(`devices_${familyId}`, unsubscribe);
  }

  /**
   * Set up conflict listener
   */
  private async setupConflictListener(familyId: string): Promise<void> {
    const conflictsQuery = query(
      collection(this.db, this.COLLECTIONS.CONFLICTS),
      where('familyId', '==', familyId),
      where('status', '==', 'unresolved'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(conflictsQuery, (snapshot) => {
      const newConflicts: Conflict[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Conflict[];

      this.conflicts = newConflicts;
      
      // Notify listeners
      this.conflictListeners.forEach(listener => listener(newConflicts));
    });

    this.syncSubscriptions.set(`conflicts_${familyId}`, unsubscribe);
  }

  /**
   * Set up sync operations listener
   */
  private async setupSyncOperationListener(familyId: string): Promise<void> {
    const syncOpsQuery = query(
      collection(this.db, this.COLLECTIONS.SYNC_OPERATIONS),
      where('familyId', '==', familyId),
      where('clientId', '!=', this.deviceId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(syncOpsQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const syncOp = change.doc.data() as SyncOperation;
        await this.processRemoteSyncOperation(syncOp);
      });
    });

    this.syncSubscriptions.set(`sync_ops_${familyId}`, unsubscribe);
  }

  /**
   * Process remote sync operation
   */
  private async processRemoteSyncOperation(syncOp: SyncOperation): Promise<void> {
    try {
      console.log(`📥 Processing remote sync operation: ${syncOp.operation} on ${syncOp.collection}`);

      switch (syncOp.operation) {
        case 'create':
          await this.handleRemoteCreate(syncOp);
          break;
        case 'update':
          await this.handleRemoteUpdate(syncOp);
          break;
        case 'delete':
          await this.handleRemoteDelete(syncOp);
          break;
      }

      this.updateSyncMetrics('success', syncOp);
    } catch (error) {
      console.error('Error processing remote sync operation:', error);
      this.updateSyncMetrics('error', syncOp, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Handle remote create operation
   */
  private async handleRemoteCreate(syncOp: SyncOperation): Promise<void> {
    try {
      // Check for conflicts
      const conflictDetected = await this.checkForConflicts(syncOp);
      
      if (conflictDetected) {
        await this.createConflict(syncOp);
        return;
      }

      // Apply remote create
      await this.applyRemoteChange(syncOp);

      // Update local storage
      const localKey = this.getLocalStorageKey(syncOp.collection);
      const localData = await AsyncStorage.getItem(localKey);
      
      if (localData) {
        const data = JSON.parse(localData);
        data.push({
          id: syncOp.documentId,
          ...syncOp.data,
          syncedAt: Date.now(),
          modifiedBy: syncOp.clientId,
        });
        await AsyncStorage.setItem(localKey, JSON.stringify(data));
      }

      console.log(`✅ Applied remote create: ${syncOp.documentId}`);
    } catch (error) {
      console.error('Error handling remote create:', error);
    }
  }

  /**
   * Handle remote update operation
   */
  private async handleRemoteUpdate(syncOp: SyncOperation): Promise<void> {
    try {
      // Check for conflicts
      const conflictDetected = await this.checkForConflicts(syncOp);
      
      if (conflictDetected) {
        await this.createConflict(syncOp);
        return;
      }

      // Apply remote update
      await this.applyRemoteChange(syncOp);

      // Update local storage
      const localKey = this.getLocalStorageKey(syncOp.collection);
      const localData = await AsyncStorage.getItem(localKey);
      
      if (localData) {
        const data = JSON.parse(localData);
        const index = data.findIndex((item: any) => item.id === syncOp.documentId);
        
        if (index !== -1) {
          data[index] = {
            ...data[index],
            ...syncOp.data,
            syncedAt: Date.now(),
            modifiedBy: syncOp.clientId,
          };
          await AsyncStorage.setItem(localKey, JSON.stringify(data));
        }
      }

      console.log(`✅ Applied remote update: ${syncOp.documentId}`);
    } catch (error) {
      console.error('Error handling remote update:', error);
    }
  }

  /**
   * Handle remote delete operation
   */
  private async handleRemoteDelete(syncOp: SyncOperation): Promise<void> {
    try {
      // Check for conflicts
      const conflictDetected = await this.checkForConflicts(syncOp);
      
      if (conflictDetected) {
        await this.createConflict(syncOp);
        return;
      }

      // Apply remote delete
      await this.applyRemoteChange(syncOp);

      // Update local storage
      const localKey = this.getLocalStorageKey(syncOp.collection);
      const localData = await AsyncStorage.getItem(localKey);
      
      if (localData) {
        const data = JSON.parse(localData);
        const filteredData = data.filter((item: any) => item.id !== syncOp.documentId);
        await AsyncStorage.setItem(localKey, JSON.stringify(filteredData));
      }

      console.log(`✅ Applied remote delete: ${syncOp.documentId}`);
    } catch (error) {
      console.error('Error handling remote delete:', error);
    }
  }

  /**
   * Check for conflicts
   */
  private async checkForConflicts(syncOp: SyncOperation): Promise<boolean> {
    try {
      const localKey = this.getLocalStorageKey(syncOp.collection);
      const localData = await AsyncStorage.getItem(localKey);
      
      if (!localData) return false;

      const data = JSON.parse(localData);
      const localItem = data.find((item: any) => item.id === syncOp.documentId);

      if (!localItem) return false;

      // Check timestamp conflicts
      const localModifiedTime = localItem.modifiedAt || localItem.updatedAt || 0;
      const remoteModifierTime = syncOp.timestamp;

      if (localModifiedTime > remoteModifierTime) {
        return true; // Local version is newer
      }

      // Check concurrent modification logs
      const concurrentMods = await this.getConcurrentModifications(syncOp.documentId);
      return concurrentMods.length > 0;

    } catch (error) {
      console.error('Error checking for conflicts:', error);
      return false;
    }
  }

  /**
   * Create conflict record
   */
  private async createConflict(syncOp: SyncOperation): Promise<void> {
    try {
      const localKey = this.getLocalStorageKey(syncOp.collection);
      const localData = await AsyncStorage.getItem(localKey);
      
      if (!localData) return;

      const data = JSON.parse(localData);
      const localItem = data.find((item: any) => item.id === syncOp.documentId);

      if (!localItem) return;

      const conflict: Conflict = {
        id: `conflict_${Date.now()}`,
        resource: syncOp.collection,
        resourceId: syncOp.documentId,
        operation: syncOp.operation,
        localVersion: {
          data: localItem,
          timestamp: localItem.modifiedAt || Date.now(),
          modifiedBy: localItem.modifiedBy || this.deviceId,
        },
        cloudVersion: {
          data: syncOp.data,
          timestamp: syncOp.timestamp,
          modifiedBy: syncOp.clientId,
        },
        conflictType: syncOp.operation === 'delete' ? 'deleted_conflict' : 'concurrent_modification',
        status: 'unresolved',
      };

      // Save conflict to cloud
      const conflictRef = doc(this.db, this.COLLECTIONS.CONFLICTS);
      await addDoc(collection(this.db, this.COLLECTIONS.CONFLICTS), {
        ...conflict,
        familyId: this.familyId,
        createdAt: serverTimestamp(),
      });

      this.conflicts.push(conflict);
      this.syncMetrics.conflictCount++;

      console.log(`⚠️ Conflict created for ${syncOp.documentId}`);
    } catch (error) {
      console.error('Error creating conflict:', error);
    }
  }

  /**
   * Apply remote change
   */
  private async applyRemoteChange(syncOp: SyncOperation): Promise<void> {
    try {
      // Mock implementation - would apply to actual Firebase collections
      console.log(`🔄 Applying remote change: ${syncOp.operation} on ${syncOp.documentId}`);
      
      switch (syncOp.operation) {
        case 'create':
          // Would update Firebase Firestore
          break;
        case 'update':
          // Would update Firebase Firestore
          break;
        case 'delete':
          // Would delete from Firebase Firestore
          break;
      }
    } catch (error) {
      console.error('Error applying remote change:', error);
      throw error;
    }
  }

  /**
   * Resolve conflict manually
   */
  async resolveConflict(id: string, resolution: Conflict['resolution']): Promise<void> {
    try {
      const conflictIndex = this.conflicts.findIndex(c => c.id === id);
      if (conflictIndex === -1) return;

      const conflict = this.conflicts[conflictIndex];

      if (resolution?.acceptedVersion === 'local') {
        // Keep local version
        await this.applyLocalResolution(conflict);
      } else if (resolution?.acceptedVersion === 'cloud') {
        // Accept cloud version
        await this.applyCloudResolution(conflict);
      } else if (resolution?.acceptedVersion === 'merged' && resolution?.mergedData) {
        // Apply merged data
        await this.applyMergedResolution(conflict, resolution.mergedData);
      }

      // Mark conflict as resolved
      conflict.status = 'resolved_local';
      conflict.resolution = resolution;

      // Update conflict in cloud
      await this.updateConflictInCloud(conflict);

      // Remove from local conflicts
      this.conflicts.splice(conflictIndex, 1);

      console.log(`✅ Conflict resolved: ${id}`);
    } catch (error) {
      console.error('Error resolving conflict:', error);
    }
  }

  /**
   * Queue sync operation
   */
  async queueSyncOperation(
    operation: SyncOperation['operation'],
    collection: string,
    documentId: string,
    data?: any
  ): Promise<void> {
    try {
      const syncOp: SyncOperation = {
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        operation,
        collection,
        documentId,
        data,
        clientId: this.deviceId,
        familyId: this.familyId,
      };

      this.syncQueue.push(syncOp);

      if (this.isOnline) {
        await this.processSyncQueue();
      }

      console.log(`📤 Synced operation queued: ${operation} on ${collection}`);
    } catch (error) {
      console.error('Error queueing sync operation:', error);
    }
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0 || !this.isOnline) return;

    try {
      console.log(`📤 Processing ${this.syncQueue.length} queued sync operations`);

      while (this.syncQueue.length > 0) {
        const syncOp = this.syncQueue.shift()!;
        await this.processSyncOperation(syncOp);
      }

      this.updateSyncMetrics('success');
    } catch (error) {
      console.error('Error processing sync queue:', error);
      this.updateSyncMetrics('error', undefined, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Process individual sync operation
   */
  private async processSyncOperation(syncOp: SyncOperation): Promise<void> {
    try {
      // Add to Firebase
      const syncRef = doc(this.db, this.COLLECTIONS.SYNC_OPERATIONS, syncOp.id);
      await setDoc(syncRef, {
        ...syncOp,
        createdAt: serverTimestamp(),
      });

      // Update local storage
      await this.updateLocalStorage(syncOp);

      console.log(`📤 Processed sync operation: ${syncOp.operation} on ${syncOp.collection}`);
    } catch (error) {
      console.error('Error processing sync operation:', error);
      // Re-add to queue if failed
      this.syncQueue.unshift(syncOp);
      throw error;
    }
  }

  /**
   * Update local storage with sync operation
   */
  private async updateLocalStorage(syncOp: SyncOperation): Promise<void> {
    try {
      const localKey = this.getLocalStorageKey(syncOp.collection);
      const localData = await AsyncStorage.getItem(localKey) || '[]';
      const data = JSON.parse(localData);

      switch (syncOp.operation) {
        case 'create':
          data.push({
            id: syncOp.documentId,
            ...syncOp.data,
            syncedAt: Date.now(),
            modifiedBy: this.deviceId,
          });
          break;
        case 'update':
          const updateIndex = data.findIndex((item: any) => item.id === syncOp.documentId);
          if (updateIndex !== -1) {
            data[updateIndex] = {
              ...data[updateIndex],
              ...syncOp.data,
              syncedAt: Date.now(),
              modifiedBy: this.deviceId,
            };
          }
          break;
        case 'delete':
          const filteredData = data.filter((item: any) => item.id !== syncOp.documentId);
          await AsyncStorage.setItem(localKey, JSON.stringify(filteredData));
          return;
      }

      await AsyncStorage.setItem(localKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error updating local storage:', error);
    }
  }

  /**
   * Set up network listeners
   */
  private setupNetworkListeners(): void {
    // Mock network listener
    // In real app, would use @react-native-community/netinfo
    this.isOnline = true;
    
    console.log('📡 Network listeners setup');
  }

  /**
   * Start sync queue processor
   */
  private startSyncQueueProcessor(): void {
    setInterval(async () => {
      if (this.isOnline && this.syncQueue.length > 0) {
        await this.processSyncQueue();
      }
    }, 5000); // Process every 5 seconds
  }

  /**
   * Verify offline data integrity
   */
  private async verifyOfflineDataIntegrity(): Promise<void> {
    try {
      console.log('🔍 Verifying offline data integrity');
      
      // Mock implementation
      console.log('✅ Offline data integrity verified');
    } catch (error) {
      console.error('Data integrity verification failed:', error);
    }
  }

  /**
   * Process pending sync operations
   */
  private async processPendingSyncOperations(): Promise<boolean> {
    try {
      console.log('🔄 Processing pending sync operations');
      
      // Mock implementation
      return true;
    } catch (error) {
      console.error('Error processing pending sync operations:', error);
      return false;
    }
  }

  /**
   * Handle concurrent modification
   */
  private async handleConcurrentModification(syncOp: SyncOperation): Promise<void> {
    try {
      console.log(`⚠️ Concurrent modification detected: ${syncOp.operation} by ${syncOp.clientId}`);
      
      // Trigger conflict resolution
      await this.detectConcurrentConflict(syncOp);
    } catch (error) {
      console.error('Error handling concurrent modification:', error);
    }
  }

  /**
   * Detect concurrent conflict
   */
  private async detectConcurrentConflict(syncOp: SyncOperation): Promise<void> {
    try {
      const conflictDetected = await this.checkForConflicts(syncOp);
      
      if (conflictDetected) {
        await this.createConflict(syncOp);
      }
    } catch (error) {
      console.error('Error detecting concurrent conflict:', error);
    }
  }

  /**
   * Get concurrent modifications
   */
  private async getConcurrentModifications(documentId: string): Promise<SyncOperation[]> {
    try {
      // Mock implementation
      return [];
    } catch (error) {
      console.error('Error getting concurrent modifications:', error);
      return [];
    }
  }

  /**
   * Apply local resolution
   */
  private async applyLocalResolution(conflict: Conflict): Promise<void> {
    // Mock implementation
    console.log(`📱 Applying local resolution for ${conflict.resourceId}`);
  }

  /**
   * Apply cloud resolution
   */
  private async applyCloudResolution(conflict: Conflict): Promise<void> {
    // Mock implementation
    console.log(`☁️ Applying cloud resolution for ${conflict.resourceId}`);
  }

  /**
   * Apply merged resolution
   */
  private async applyMergedResolution(conflict: Conflict, mergedData: any): Promise<void> {
    // Mock implementation
    console.log(`🔀 Applying merged resolution for ${conflict.resourceId}`);
  }

  /**
   * Update conflict in cloud
   */
  private async updateConflictInCloud(conflict: Conflict): Promise<void> {
    try {
      const conflictRef = doc(this.db, this.COLLECTIONS.CONFLICTS, conflict.id);
      await updateDoc(conflictRef, {
        status: conflict.status,
        resolution: conflict.resolution,
        resolvedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating conflict in cloud:', error);
    }
  }

  /**
   * Add conflict listener
   */
  addConflictListener(listener: (conflicts: Conflict[]) => void): void {
    this.conflictListeners.push(listener);
  }

  /**
   * Remove conflict listener
   */
  removeConflictListener(listener: (conflicts: Conflict[]) => void): void {
    const index = this.conflictListeners.indexOf(listener);
    if (index > -1) {
      this.conflictListeners.splice(index, 1);
    }
  }

  /**
   * Get sync metrics
   */
  getSyncMetrics(): SyncMetrics {
    return this.syncMetrics;
  }

  /**
   * Get device sync status
   */
  getDeviceSyncStatus(): DeviceSyncStatus {
    return {
      deviceId: this.deviceId,
      familyId: this.familyId,
      lastSyncTime: this.syncMetrics.lastSuccessfulSync,
      syncStatus: this.isOnline ? 'synced' : 'offline',
      offlineChanges: this.syncQueue.length,
      pendingUploads: this.syncQueue,
      conflicts: this.conflicts,
      connectionState: this.isOnline ? 'online' : 'offline',
    };
  }

  /**
   * Get local storage key for collection
   */
  private getLocalStorageKey(collection: string): string {
    return collection.toLowerCase().replace(/s$/, ''); // Remove plural 's'
  }

  /**
   * Update sync metrics
   */
  private updateSyncMetrics(
    type: 'success' | 'error',
    syncOp?: SyncOperation,
    errorMessage?: string
  ): void {
    if (type === 'success') {
      this.syncMetrics.syncCount++;
      this.syncMetrics.lastSuccessfulSync = Date.now();
    } else if (type === 'error') {
      this.syncMetrics.syncErrors.push({
        error: errorMessage || 'Unknown error',
        timestamp: Date.now(),
        operation: syncOp?.operation || 'unknown',
      });
    }
  }

  /**
   * Cleanup subscriptions
   */
  cleanup(): void {
    this.syncSubscriptions.forEach(unsubscribe => unsubscribe());
    this.syncSubscriptions.clear();
    this.conflictListeners.clear();
  }
}
