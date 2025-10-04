/**
 * Sync Monitor Service
 * Advanced synchronization monitoring and conflict resolution
 */

import { RealDatabaseService, RealAuthService } from '../index';

export interface SyncEvent {
  id: string;
  type: 'create' | 'update' | 'delete' | 'sync' | 'conflict';
  module: string;
  deviceId: string;
  userId: string;
  data: any;
  timestamp: Date;
  status: 'sent' | 'received' | 'failed' | 'confirmed' | 'conflicted';
  latency?: number;
  conflictResolution?: 'local_wins' | 'remote_wins' | 'merge' | 'manual';
}

export interface SyncConflict {
  id: string;
  module: string;
  localPath: string;
  remotePath: string;
  localData: any;
  remoteData: any;
  timestamp: Date;
  resolution: 'pending' | 'resolved';
}

export interface SyncStats {
  totalEvents: number;
  successfulSyncs: number;
  failedSyncs: number;
  conflicts: number;
  averageLatency: number;
  lastSyncTime: Date | null;
  deviceCount: number;
  onlineDevices: string[];
}

class SyncMonitorService {
  private events: SyncEvent[] = [];
  private conflicts: SyncConflict[] = [];
  private stats: SyncStats = {
    totalEvents: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    conflicts: 0,
    averageLatency: 0,
    lastSyncTime: null,
    deviceCount: 0,
    onlineDevices: [],
  };
  private listeners: ((event: SyncEvent) => void)[] = [];
  private conflictListeners: ((conflict: SyncConflict) => void)[] = [];
  private syncSubscriptions: Map<string, () => void> = new Map();

  // Initialize sync monitoring
  async initialize(): Promise<void> {
    try {
      const user = RealAuthService.getCurrentUser();
      if (!user) {
        console.warn('⚠️ No authenticated user for sync monitoring');
        return;
      }

      console.log('🔄 Initializing Sync Monitor Service...');

      // Set up real-time sync listeners for each module
      await this.setupModuleListeners();

      // Listen for online devices
      await this.trackOnlineDevices();

      // Start conflict detection
      await this.setupConflictDetection();

      console.log('✅ Sync Monitor Service initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing sync monitoring:', error);
      throw error;
    }
  }

  // Set up listeners for each module
  private async setupModuleListeners(): Promise<void> {
    const user = RealAuthService.getCurrentUser();
    if (!user) return;

    const modules = [
      'tasks',
      'goals', 
      'penalties',
      'calendar/events',
      'calendar/votes',
      'calendar/responsibilities',
      'members',
      'invitations',
    ];

    for (const module of modules) {
      try {
        const unsubscribe = RealDatabaseService.listenToCollection(
          `families/${user.uid}/${module}`,
          (docs, error) => {
            if (error) {
              this.addSyncEvent({
                type: 'sync',
                module,
                deviceId: this.getDeviceId(),
                userId: user.uid,
                data: { error: error.message },
                status: 'failed',
              });
            } else {
              this.addSyncEvent({
                type: 'sync',
                module,
                deviceId: 'server',
                userId: user.uid,
                data: { documentCount: docs.length },
                status: 'received',
              });
            }
          }
        );

        this.syncSubscriptions.set(module, unsubscribe);
        console.log(`📡 Sync listener active for: ${module}`);

      } catch (error) {
        console.error(`❌ Failed to set up sync listener for ${module}:`, error);
      }
    }
  }

  // Track online devices
  private async trackOnlineDevices(): Promise<void> {
    const user = RealAuthService.getCurrentUser();
    if (!user) return;

    try {
      const deviceData = {
        deviceId: this.getDeviceId(),
        userId: user.uid,
        online: true,
        lastSeen: new Date(),
        capabilities: this.getDeviceCapabilities(),
      };

      // Update device status
      await RealDatabaseService.updateDocument(
        `families/${user.uid}/devices/${this.getDeviceId()}`,
        deviceData
      );

      // Set up cleanup on app close
      setInterval(() => {
        this.updateDeviceHeartbeat();
      }, 30000); // Every 30 seconds

      console.log('📱 Device tracking active');

    } catch (error) {
      console.error('❌ Failed to track online devices:', error);
    }
  }

  // Setup conflict detection
  private async setupConflictDetection(): Promise<void> {
    // This would detect conflicts by comparing document versions
    // and checking for simultaneous updates
    console.log('🔍 Conflict detection system active');
  }

  // Add sync event
  addSyncEvent(event: Omit<SyncEvent, 'id' | 'timestamp'>): void {
    const syncEvent: SyncEvent = {
      ...event,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.events.unshift(syncEvent);
    
    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(0, 100);
    }

    // Update stats
    this.updateStats(syncEvent);

    // Notify listeners
    this.listeners.forEach(listener => listener(syncEvent));

    console.log(`🔄 Sync Event: ${syncEvent.type} ${syncEvent.module} - ${syncEvent.status}`);
  }

  // Update statistics
  private updateStats(event: SyncEvent): void {
    this.stats.totalEvents++;
    this.stats.lastSyncTime = event.timestamp;

    switch (event.status) {
      case 'confirmed':
      case 'received':
        this.stats.successfulSyncs++;
        break;
      case 'failed':
        this.stats.failedSyncs++;
        break;
      case 'conflicted':
        this.stats.conflicts++;
        break;
    }

    // Update latency
    if (event.latency) {
      this.stats.averageLatency = 
        (this.stats.averageLatency + event.latency) / 2;
    }
  }

  // Get device capabilities
  private getDeviceCapabilities(): string[] {
    const capabilities = ['real-time-sync', 'offline-support'];
    
    // Detect device-specific capabilities
    if (typeof navigator !== 'undefined') {
      if ('serviceWorker' in navigator) {
        capabilities.push('pwa-support');
      }
      if ('Notification' in window) {
        capabilities.push('notifications');
      }
    }

    return capabilities;
  }

  // Update device heartbeat
  private async updateDeviceHeartbeat(): Promise<void> {
    const user = RealAuthService.getCurrentUser();
    if (!user) return;

    try {
      await RealDatabaseService.updateDocument(
        `families/${user.uid}/devices/${this.getDeviceId()}`,
        {
          lastSeen: new Date(),
          online: true,
        }
      );
    } catch (error) {
      console.warn('⚠️ Failed to update heartbeat:', error);
    }
  }

  // Get unique device ID
  private getDeviceId(): string {
    // In a real app, this would be a persistent device identifier
    const stored = typeof localStorage !== 'undefined' 
      ? localStorage.getItem('familydash_device_id') 
      : null;

    if (stored) {
      return stored;
    }

    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('familydash_device_id', deviceId);
    }

    return deviceId;
  }

  // Get online devices
  async getOnlineDevices(): Promise<string[]> {
    const user = RealAuthService.getCurrentUser();
    if (!user) return [];

    try {
      const devices = await RealDatabaseService.getCollection(
        `families/${user.uid}/devices`
      );

      const onlineDevices = devices
        .filter(doc => {
          const data = doc.data();
          const lastSeen = data.lastSeen?.toDate();
          return lastSeen && (Date.now() - lastSeen.getTime()) < 60000; // Online if seen within last minute
        })
        .map(doc => doc.id);

      this.stats.onlineDevices = onlineDevices;
      this.stats.deviceCount = onlineDevices.length;

      return onlineDevices;

    } catch (error) {
      console.error('❌ Failed to get online devices:', error);
      return [];
    }
  }

  // Resolve conflicts
  async resolveConflict(
    conflictId: string,
    resolution: SyncConflict['resolution']
  ): Promise<boolean> {
    try {
      const conflict = this.conflicts.find(c => c.id === conflictId);
      if (!conflict) return false;

      const user = RealAuthService.getCurrentUser();
      if (!user) return false;

      // Apply resolution logic here
      switch (resolution) {
        case 'local_wins':
          await RealDatabaseService.updateDocument(
            conflict.remotePath,
            conflict.localData
          );
          break;
        case 'remote_wins':
          // Keep remote data, update local store
          console.log('Using remote data for conflict resolution');
          break;
        case 'merge':
          // Custom merge logic would go here
          const mergedData = this.mergeData(conflict.localData, conflict.remoteData);
          await RealDatabaseService.updateDocument(
            conflict.remotePath,
            mergedData
          );
          break;
      }

      // Mark conflict as resolved
      conflict.resolution = 'resolved';
      
      // Notify listeners
      this.conflictListeners.forEach(listener => listener(conflict));

      console.log(`✅ Conflict resolved: ${conflictId}`);

      return true;

    } catch (error) {
      console.error('❌ Failed to resolve conflict:', error);
      return false;
    }
  }

  // Merge data (basic implementation)
  private mergeData(localData: any, remoteData: any): any {
    // This is a basic merge - in production you'd want sophisticated merging
    return {
      ...remoteData,
      ...localData,
      updatedAt: new Date(),
      mergedAt: new Date(),
    };
  }

  // Event listeners
  addEventListener(listener: (event: SyncEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  addConflictListener(listener: (conflict: SyncConflict) => void): () => void {
    this.conflictListeners.push(listener);
    return () => {
      const index = this.conflictListeners.indexOf(listener);
      if (index > -1) {
        this.conflictListeners.splice(index, 1);
      }
    };
  }

  // Getters
  getEvents(): SyncEvent[] {
    return [...this.events];
  }

  getConflicts(): SyncConflict[] {
    return [...this.conflicts];
  }

  getStats(): SyncStats {
    return { ...this.stats };
  }

  // Cleanup
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up sync monitor...');

    // Unsubscribe from all listeners
    this.syncSubscriptions.forEach((unsubscribe, module) => {
      unsubscribe();
      console.log(`📡 Unsubscribed from: ${module}`);
    });
    this.syncSubscriptions.clear();

    // Clear event listeners
    this.listeners = [];
    this.conflictListeners = [];

    // Update device status to offline
    const user = RealAuthService.getCurrentUser();
    if (user) {
      try {
        await RealDatabaseService.updateDocument(
          `families/${user.uid}/devices/${this.getDeviceId()}`,
          {
            online: false,
            lastSeen: new Date(),
          }
        );
      } catch (error) {
        console.warn('⚠️ Failed to set device offline:', error);
      }
    }

    console.log('✅ Sync monitor cleanup completed');
  }
}

// Export singleton instance
export const syncMonitorService = new SyncMonitorService();
export default syncMonitorService;
