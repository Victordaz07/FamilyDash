/**
 * Backup & Sync Components Index
 * Central export for backup functionality
 */

// Components
export { BackupSyncDashboard } from './BackupSyncDashboard';

// Service
export { BackupSyncService } from '../services/backup/BackupSyncService';

// Types
export type {
  BackupData,
  SyncStatus,
  SyncConflict,
  CloudStorageConfig,
  SyncRule,
} from '../services/backup/BackupSyncService';
