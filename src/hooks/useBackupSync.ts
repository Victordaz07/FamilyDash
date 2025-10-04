/**
 * useBackupSync Hook
 * Simplified interface for backup and sync operations
 */

import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { BackupSyncService, BackupData, SyncStatus, SyncConflict } from '../services/backup/BackupSyncService';

interface UseBackupSyncOptions {
  familyId: string;
  userId: string;
  autoSync?: boolean;
  syncInterval?: number; // minutes
}

interface BackupSyncState {
  isLoading: boolean;
  lastBackup: BackupData | null;
  lastSync: SyncStatus | null;
  conflicts: SyncConflict[];
  autoBackupEnabled: boolean;
  autoSyncEnabled: boolean;
  cloudStorageEnabled: boolean;
}

interface UseBackupSyncReturn {
  // State
  state: BackupSyncState;
  
  // Actions
  createBackup: (options?: {
    compress?: boolean;
    encrypt?: boolean;
    includeMedia?: boolean;
    autoUpload?: boolean;
  }) => Promise<BackupData | null>;
  
  restoreFromBackup: (backupId: string, options?: {
    modules?: string[];
    preserveCurrent?: boolean;
    mergeStrategy?: 'replace' | 'merge' | 'ask_user';
  }) => Promise<boolean>;
  
  syncNow: (forceSync?: boolean) => Promise<SyncStatus | null>;
  
  resolveConflict: (conflictId: string, resolution: SyncConflict['resolution']) => Promise<boolean>;
  
  toggleAutoBackup: (enabled: boolean) => void;
  
  toggleAutoSync: (enabled: boolean) => void;
  
  toggleCloudStorage: (enabled: boolean) => void;
  
  getAvailableBackups: () => Promise<BackupData[]>;
  
  // Utilities
  formatFileSize: (bytes: number) => string;
  formatDate: (timestamp: number) => string;
  getBackupStats: () => {
    totalBackups: number;
    totalSize: number;
    lastBackupDate: number | null;
    compressionRatio: number;
  };
}

export const useBackupSync = ({
  familyId,
  userId,
  autoSync = true,
  syncInterval = 15,
}: UseBackupSyncOptions): UseBackupSyncReturn => {
  
  const backupService = BackupSyncService.getInstance();
  
  const [state, setState] = useState<BackupSyncState>({
    isLoading: false,
    lastBackup: null,
    lastSync: null,
    conflicts: [],
    autoBackupEnabled: true,
    autoSyncEnabled: autoSync,
    cloudStorageEnabled: false,
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<BackupSyncState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Auto-sync effect
  useEffect(() => {
    if (state.autoSyncEnabled && familyId) {
      const interval = setInterval(async () => {
        try {
          await syncNow(false); // Non-force sync
        } catch (error) {
          console.error('Auto-sync failed:', error);
        }
      }, syncInterval * 60 * 1000); // Convert minutes to milliseconds

      return () => clearInterval(interval);
    }
  }, [state.autoSyncEnabled, familyId, syncInterval]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [familyId]);

  const loadInitialData = async () => {
    try {
      const [backups, conflicts] = await Promise.all([
        backupService.getAvailableBackups(familyId),
        Promise.resolve(backupService.getConflicts()), // conflicts are in memory
      ]);
      
      updateState({
        lastBackup: backups[0] || null,
        conflicts,
      });
    } catch (error) {
      console.error('Error loading initial backup data:', error);
    }
  };

  // Create backup
  const createBackup = useCallback(async (options = {}) => {
    try {
      updateState({ isLoading: true });
      
      const backup = await backupService.createBackup(familyId, userId, {
        compress: true,
        encrypt: true,
        includeMedia: false,
        autoUpload: false,
        ...options,
      });
      
      updateState({
        lastBackup: backup,
        isLoading: false,
      });
      
      Alert.alert(
        'Backup Created',
        `Backup completed successfully!\nSize: ${formatFileSize(backup.size)}`,
        [{ text: 'OK' }]
      );
      
      return backup;
      
    } catch (error) {
      updateState({ isLoading: false });
      
      Alert.alert(
        'Backup Failed',
        error instanceof Error ? error.message : 'Unknown error occurred',
        [{ text: 'OK' }]
      );
      
      return null;
    }
  }, [familyId, userId]);

  // Restore from backup
  const restoreFromBackup = useCallback(async (backupId: string, options = {}) => {
    try {
      updateState({ isLoading: true });
      
      Alert.alert(
        'Restore Backup',
        'This will replace your current data. Do you want to continue?',
        [
          { text: 'Cancel', onPress: () => updateState({ isLoading: false }) },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: async () => {
              try {
                const success = await backupService.restoreFromBackup(backupId, {
                  preserveCurrent: false,
                  mergeStrategy: 'replace',
                  ...options,
                });
                
                updateState({ isLoading: false });
                
                if (success) {
                  Alert.alert('Success', 'Data restored successfully');
                  // Refresh data after restore
                  loadInitialData();
                } else {
                  Alert.alert('Error', 'Failed to restore backup');
                }
                
                return success;
                
              } catch (error) {
                updateState({ isLoading: false });
                Alert.alert('Error', 'Restore operation failed');
                return false;
              }
            },
          },
        ]
      );
      
      return false;
      
    } catch (error) {
      updateState({ isLoading: false });
      
      Alert.alert(
        'Restore Failed',
        error instanceof Error ? error.message : 'Unknown error occurred',
        [{ text: 'OK' }]
      );
      
      return false;
    }
  }, [familyId]);

  // Sync now
  const syncNow = useCallback(async (forceSync = false) => {
    try {
      updateState({ isLoading: true });
      
      const syncStatus = await backupService.synchronizeData(familyId, userId, forceSync);
      
      updateState({
        lastSync: syncStatus,
        conflicts: backupService.getConflicts(),
        isLoading: false,
      });
      
      if (syncStatus.status === 'completed') {
        console.log('✅ Sync completed successfully');
        
        // Show success message if there were no conflicts
        if (syncStatus.conflictCount === 0) {
          Alert.alert(
          'Sync Completed',
          `Synchronized ${syncStatus.newRecordsCount + syncStatus.updatedRecordsCount} records`
        );
        } else {
          Alert.alert(
            'Sync Completed with Conflicts',
            `Found ${syncStatus.conflictCount} conflicts that need resolution`
          );
        }
      } else if (syncStatus.status === 'failed') {
        Alert.alert(
          'Sync Failed',
          syncStatus.errors.length > 0 
            ? syncStatus.errors[0].error 
            : 'Synchronization failed'
        );
      }
      
      return syncStatus;
      
    } catch (error) {
      updateState({ isLoading: false });
      
      Alert.alert(
        'Sync Failed',
        error instanceof Error ? error.message : 'Unknown error occurred',
        [{ text: 'OK' }]
      );
      
      return null;
    }
  }, [familyId, userId]);

  // Resolve conflict
  const resolveConflict = useCallback(async (conflictId: string, resolution: SyncConflict['resolution']) => {
    try {
      const success = await backupService.resolveConflict(conflictId, resolution, userId);
      
      if (success) {
        updateState({
          conflicts: backupService.getConflicts(),
        });
        
        Alert.alert('Success', 'Conflict resolved successfully');
      } else {
        Alert.alert('Error', 'Failed to resolve conflict');
      }
      
      return success;
      
    } catch (error) {
      Alert.alert(
        'Conflict Resolution Failed',
        error instanceof Error ? error.message : 'Unknown error occurred',
        [{ text: 'OK' }]
      );
      
      return false;
    }
  }, [userId]);

  // Toggle auto backup
  const toggleAutoBackup = useCallback((enabled: boolean) => {
    updateState({ autoBackupEnabled: enabled });
    
    if (enabled) {
      Alert.alert(
        'Auto Backup Enabled',
        'Backups will be created automatically daily at 2:00 AM',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Auto Backup Disabled',
        'Automatic backups have been turned off',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Toggle auto sync
  const toggleAutoSync = useCallback((enabled: boolean) => {
    updateState({ autoSyncEnabled: enabled });
    
    if (enabled) {
      Alert.alert(
        'Auto Sync Enabled',
        'Data will sync automatically every 15 minutes',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Auto Sync Disabled',
        'Automatic synchronization has been turned off',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Toggle cloud storage
  const toggleCloudStorage = useCallback((enabled: boolean) => {
    updateState({ cloudStorageEnabled: enabled });
    
    if (enabled) {
      Alert.alert(
        'Cloud Storage Enabled',
        'Backups will be uploaded to cloud storage automatically',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Cloud Storage Disabled',
        'Backups will only be stored locally',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Get available backups
  const getAvailableBackups = useCallback(async () => {
    try {
      return await backupService.getAvailableBackups(familyId);
    } catch (error) {
      console.error('Error getting available backups:', error);
      return [];
    }
  }, [familyId]);

  // Utilities
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatDate = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  const getBackupStats = useCallback(() => {
    const stats = {
      totalBackups: 0,
      totalSize: 0,
      lastBackupDate: null as number | null,
      compressionRatio: 0,
    };

    if (state.lastBackup) {
      stats.totalBackups = 1; // Simplified - in real app would count all backups
      stats.totalSize = state.lastBackup.size;
      stats.lastBackupDate = state.lastBackup.createdAt;
      stats.compressionRatio = state.lastBackup.compressionRatio;
    }

    return stats;
  }, [state.lastBackup]);

  return {
    state,
    createBackup,
    restoreFromBackup,
    syncNow,
    resolveConflict,
    toggleAutoBackup,
    toggleAutoSync,
    toggleCloudStorage,
    getAvailableBackups,
    formatFileSize,
    formatDate,
    getBackupStats,
  };
};
