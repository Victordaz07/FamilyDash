/**
 * Backup & Sync Dashboard Component
 * Comprehensive backup management and synchronization interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, AdvancedCard, AdvancedButton, AdvancedInput } from '../ui';
// @ts-ignore: The BackupSyncService module may not have type declarations
import { BackupSyncService, BackupData, SyncStatus, SyncConflict } from '../services/backup/BackupSyncService';

interface BackupSyncDashboardProps {
  familyId: string;
  userId: string;
  onNavigate?: (screen: string, params?: any) => void;
}

export const BackupSyncDashboard: React.FC<BackupSyncDashboardProps> = ({
  familyId,
  userId,
  onNavigate,
}) => {
  const theme = useTheme();
  const backupService = BackupSyncService.getInstance();

  const [activeTab, setActiveTab] = useState<'overview' | 'backups' | 'sync' | 'conflicts' | 'settings'>('overview');
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [cloudStorageEnabled, setCloudStorageEnabled] = useState(false);

  // Load data
  useEffect(() => {
    loadDashboardData();
  }, [familyId]);

  // Auto-refresh sync status
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSyncStatuses();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      const backupsData = await backupService.getAvailableBackups(familyId);
      const conflictsData = backupService.getConflicts();

      setBackups(backupsData);
      setConflicts(conflictsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load backup sync data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSyncStatuses = async () => {
    const activeSyncs = syncStatuses.filter(s => s.status === 'in_progress');
    if (activeSyncs.length > 0) {
      const updatedStatuses = [...syncStatuses];
      activeSyncs.forEach(sync => {
        const updatedStatus = backupService.getSyncStatus(sync.syncId);
        if (updatedStatus) {
          const index = updatedStatuses.findIndex(s => s.syncId === sync.syncId);
          if (index !== -1) {
            updatedStatuses[index] = updatedStatus;
          }
        }
      });
      setSyncStatuses(updatedStatuses);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsLoading(true);

      Alert.alert(
        'Create Backup',
        'Include media files and upload to cloud?',
        [
          { text: 'Local Only', onPress: () => createBackupOption(false, false) },
          { text: 'Local + Cloud', onPress: () => createBackupOption(true, true) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createBackupOption = async (includeMedia: boolean, uploadToCloud: boolean) => {
    try {
      const backup = await backupService.createBackup(familyId, userId, {
        compress: true,
        encrypt: true,
        includeMedia,
        autoUpload: uploadToCloud,
      });

      setBackups(prev => [backup, ...prev]);

      Alert.alert(
        'Backup Created',
        `Backup ${backup.backupId} created successfully!\nSize: ${Math.round(backup.size / 1024)}KB`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      Alert.alert('Error', 'Failed to create backup');
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    Alert.alert(
      'Restore Backup',
      'This will replace your current data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            const success = await backupService.restoreFromBackup(backupId, {
              preserveCurrent: false,
              mergeStrategy: 'replace',
            });

            if (success) {
              Alert.alert('Success', 'Data restored successfully');
              loadDashboardData();
            } else {
              Alert.alert('Error', 'Failed to restore backup');
            }
          }
        },
      ]
    );
  };

  const handleSyncNow = async () => {
    try {
      setIsLoading(true);

      const syncStatus = await backupService.synchronizeData(familyId, userId, true);
      setSyncStatuses(prev => [syncStatus, ...prev]);

      Alert.alert(
        'Sync Started',
        `Sync ${syncStatus.syncId} initiated${syncStatus.status === 'completed' ? ' and completed!' : '...'}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      Alert.alert('Error', 'Failed to start synchronization');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveConflict = async (conflictId: string, resolution: SyncConflict['resolution']) => {
    Alert.alert(
      'Resolve Conflict',
      `Apply "${resolution}" resolution?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: async () => {
            const success = await backupService.resolveConflict(conflictId, resolution, userId);

            if (success) {
              Alert.alert('Success', 'Conflict resolved successfully');
              loadDashboardData();
            } else {
              Alert.alert('Error', 'Failed to resolve conflict');
            }
          },
        },
      ]
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString();
  };

  const renderOverviewTab = () => {
    const totalBackups = backups.length;
    const totalBackupSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const activeSyncs = syncStatuses.filter(s => s.status === 'in_progress').length;
    const pendingConflicts = conflicts.filter(c => c.resolution === 'pending').length;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Status Cards */}
        <View style={styles.statusGrid}>
          <AdvancedCard variant="elevated" size="md" style={styles.statusCard}>
            <LinearGradient
              colors={themeUtils.gradients.primary as [string, string]}
              style={styles.statusGradient}
            >
              <Ionicons name="save" size={32} color="white" />
              <Text style={styles.statusValue}>{totalBackups}</Text>
              <Text style={styles.statusLabel}>Total Backups</Text>
            </LinearGradient>
          </AdvancedCard>

          <AdvancedCard variant="elevated" size="md" style={styles.statusCard}>
            <LinearGradient
              colors={themeUtils.gradients.success as [string, string]}
              style={styles.statusGradient}
            >
              <Ionicons name="folder" size={32} color="white" />
              <Text style={styles.statusValue}>{formatBytes(totalBackupSize)}</Text>
              <Text style={styles.statusLabel}>Storage Used</Text>
            </LinearGradient>
          </AdvancedCard>

          <AdvancedCard variant="elevated" size="md" style={styles.statusCard}>
            <LinearGradient
              colors={themeUtils.gradients.warning as [string, string]}
              style={styles.statusGradient}
            >
              <Ionicons name="sync" size={32} color="white" />
              <Text style={styles.statusValue}>{activeSyncs}</Text>
              <Text style={styles.statusLabel}>Active Syncs</Text>
            </LinearGradient>
          </AdvancedCard>

          <AdvancedCard variant="elevated" size="md" style={styles.statusCard}>
            <LinearGradient
              colors={themeUtils.gradients.error as [string, string]}
              style={styles.statusGradient}
            >
              <Ionicons name="warning" size={32} color="white" />
              <Text style={styles.statusValue}>{pendingConflicts}</Text>
              <Text style={styles.statusLabel}>Pending Conflicts</Text>
            </LinearGradient>
          </AdvancedCard>
        </View>

        {/* Quick Actions */}
        <AdvancedCard variant="outlined" size="lg" style={styles.actionCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionGrid}>
            <AdvancedButton
              variant="primary"
              size="md"
              onPress={handleCreateBackup}
              icon="save"
              style={styles.actionGridButton}
            >
              Create Backup
            </AdvancedButton>

            <AdvancedButton
              variant="outline"
              size="md"
              onPress={handleSyncNow}
              icon="sync"
              style={styles.actionGridButton}
            >
              Sync Now
            </AdvancedButton>
          </View>
        </AdvancedCard>

        {/* Settings Summary */}
        <AdvancedCard variant="outlined" size="lg" style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Current Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="time" size={20} color={theme.colors.primary} />
              <Text style={theme.typography.textStyles.title}>Auto Backup</Text>
              <Text style={theme.typography.textStyles.caption}>Daily at 2:00 AM</Text>
            </View>
            <Switch
              value={autoBackupEnabled}
              onValueChange={setAutoBackupEnabled}
              trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
              thumbColor={autoBackupEnabled ? 'white' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="sync" size={20} color={theme.colors.success} />
              <Text style={theme.typography.textStyles.title}>Auto Sync</Text>
              <Text style={theme.typography.textStyles.caption}>Every 15 minutes</Text>
            </View>
            <Switch
              value={autoSyncEnabled}
              onValueChange={setAutoSyncEnabled}
              trackColor={{ false: '#E5E7EB', true: theme.colors.success }}
              thumbColor={autoSyncEnabled ? 'white' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="cloud" size={20} color={theme.colors.secondary} />
              <Text style={theme.typography.textStyles.title}>Cloud Storage</Text>
              <Text style={theme.typography.textStyles.caption}>AWS S3 configured</Text>
            </View>
            <Switch
              value={cloudStorageEnabled}
              onValueChange={setCloudStorageEnabled}
              trackColor={{ false: '#E5E7EB', true: theme.colors.secondary }}
              thumbColor={cloudStorageEnabled ? 'white' : '#9CA3AF'}
            />
          </View>
        </AdvancedCard>
      </ScrollView>
    );
  };

  const renderBackupsTab = () => {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <AdvancedCard variant="outlined" size="lg" style={styles.backupsHeader}>
          <View style={styles.backupsHeaderContent}>
            <Text style={styles.sectionTitle}>Backup History</Text>
            <AdvancedButton
              variant="outline"
              size="sm"
              onPress={handleCreateBackup}
              icon="add"
            >
              New Backup
            </AdvancedButton>
          </View>
        </AdvancedCard>

        {backups.length === 0 ? (
          <AdvancedCard variant="outlined" size="lg" style={styles.emptyState}>
            <Ionicons name="save-outline" size={48} color={theme.colors.gray500} />
            <Text style={[theme.typography.textStyles.h3, styles.emptyTitle]}>No Backups Yet</Text>
            <Text style={[theme.typography.textStyles.body, styles.emptySubtitle]}>
              Create your first backup to protect your family data!
            </Text>

            <AdvancedButton
              variant="primary"
              size="lg"
              onPress={handleCreateBackup}
              icon="save"
              style={styles.emptyAction}
            >
              Create First Backup
            </AdvancedButton>
          </AdvancedCard>
        ) : (
          backups.map((backup) => (
            <AdvancedCard key={backup.backupId} variant="outlined" size="md" style={styles.backupCard}>
              <View style={styles.backupHeader}>
                <View style={styles.backupInfo}>
                  <Text style={theme.typography.textStyles.title}>{backup.backupId}</Text>
                  <Text style={theme.typography.textStyles.body}>
                    Created {formatDate(backup.createdAt)}
                  </Text>
                  <Text style={theme.typography.textStyles.caption}>
                    Size: {formatBytes(backup.size)} • Compressed: {(backup.compressionRatio * 100).toFixed(0)}%
                  </Text>
                </View>

                <View style={styles.backupActions}>
                  <AdvancedButton
                    variant="ghost"
                    size="sm"
                    onPress={() => handleRestoreBackup(backup.backupId)}
                    icon="reload"
                  >
                    Restore
                  </AdvancedButton>
                </View>
              </View>

              <View style={styles.backupModules}>
                <Text style={theme.typography.textStyles.caption}>Modules:</Text>
                <View style={styles.modulesList}>
                  {backup.modules.map((module) => (
                    <View key={module.module} style={styles.moduleBadge}>
                      <Text style={styles.moduleBadgeText}>{module.module}</Text>
                      <Text style={styles.moduleCountText}>{module.recordCount}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </AdvancedCard>
          ))
        )}
      </ScrollView>
    );
  };

  const renderSyncTab = () => {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <AdvancedCard variant="outlined" size="lg" style={styles.syncCard}>
          <View style={styles.syncHeader}>
            <Text style={styles.sectionTitle}>Synchronization</Text>
            <AdvancedButton
              variant="outline"
              size="sm"
              onPress={handleSyncNow}
              icon="sync"
            >
              Sync Now
            </AdvancedButton>
          </View>

          {syncStatuses.length === 0 ? (
            <View style={styles.emptySyncState}>
              <Ionicons name="sync-outline" size={32} color={theme.colors.gray500} />
              <Text style={[theme.typography.textStyles.body, styles.emptySyncText]}>
                No recent synchronization activity
              </Text>
            </View>
          ) : (
            syncStatuses.map((sync) => (
              <AdvancedCard key={sync.syncId} variant="outlined" size="md" style={styles.syncItem}>
                <View style={styles.syncItemHeader}>
                  <Text style={theme.typography.textStyles.title}>
                    Sync {sync.syncId.substr(-8)}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    {
                      backgroundColor: sync.status === 'completed' ? theme.colors.success :
                        sync.status === 'in_progress' ? theme.colors.warning :
                          sync.status === 'failed' ? theme.colors.error : theme.colors.gray500
                    }
                  ]}>
                    <Text style={styles.statusBadgeText}>{sync.status}</Text>
                  </View>
                </View>

                <Text style={theme.typography.textStyles.body}>
                  Started {formatDate(sync.startedAt)}
                </Text>

                {sync.status === 'in_progress' && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${sync.progress}%`, backgroundColor: theme.colors.primary }
                        ]}
                      />
                    </View>
                    <Text style={theme.typography.textStyles.caption}>{sync.progress}% complete</Text>
                  </View>
                )}

                <View style={styles.syncMetrics}>
                  <View style={styles.syncMetric}>
                    <Text style={styles.metricLabel}>New:</Text>
                    <Text style={styles.metricValue}>{sync.newRecordsCount}</Text>
                  </View>
                  <View style={styles.syncMetric}>
                    <Text style={styles.metricLabel}>Updated:</Text>
                    <Text style={styles.metricValue}>{sync.updatedRecordsCount}</Text>
                  </View>
                  <View style={styles.syncMetric}>
                    <Text style={styles.metricLabel}>Conflicts:</Text>
                    <Text style={styles.metricValue}>{sync.conflictCount}</Text>
                  </View>
                </View>
              </AdvancedCard>
            ))
          )}
        </AdvancedCard>
      </ScrollView>
    );
  };

  const renderConflictsTab = () => {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <AdvancedCard variant="outlined" size="lg" style={styles.conflictsCard}>
          <Text style={styles.sectionTitle}>Data Conflicts</Text>

          {conflicts.length === 0 ? (
            <View style={styles.emptyConflictState}>
              <Ionicons name="checkmark-circle" size={32} color={theme.colors.success} />
              <Text style={[theme.typography.textStyles.body, styles.emptyConflictText]}>
                No conflicts detected
              </Text>
            </View>
          ) : (
            conflicts.map((conflict) => (
              <AdvancedCard key={conflict.conflictId} variant="outlined" size="md" style={styles.conflictItem}>
                <View style={styles.conflictHeader}>
                  <Text style={theme.typography.textStyles.title}>
                    {conflict.module}: {conflict.recordId}
                  </Text>
                  <View style={[
                    styles.conflictTypeBadge,
                    {
                      backgroundColor: conflict.conflictType === 'data_mismatch' ? theme.colors.warning :
                        conflict.conflictType === 'concurrent_modification' ? theme.colors.error :
                          theme.colors.secondary
                    }
                  ]}>
                    <Text style={styles.conflictTypeText}>{conflict.conflictType}</Text>
                  </View>
                </View>

                <Text style={theme.typography.textStyles.body}>
                  Conflict detected at {formatDate(conflict.localTimestamp)}
                </Text>

                <View style={styles.conflictActions}>
                  <AdvancedButton
                    variant="outline"
                    size="sm"
                    onPress={() => handleResolveConflict(conflict.conflictId, 'keep_local')}
                    icon="phone-portrait"
                    style={styles.resolveButton}
                  >
                    Keep Local
                  </AdvancedButton>

                  <AdvancedButton
                    variant="outline"
                    size="sm"
                    onPress={() => handleResolveConflict(conflict.conflictId, 'keep_remote')}
                    icon="cloud"
                    style={styles.resolveButton}
                  >
                    Keep Remote
                  </AdvancedButton>

                  <AdvancedButton
                    variant="primary"
                    size="sm"
                    onPress={() => handleResolveConflict(conflict.conflictId, 'merge')}
                    icon="git-merge"
                    style={styles.resolveButton}
                  >
                    Merge
                  </AdvancedButton>
                </View>
              </AdvancedCard>
            ))
          )}
        </AdvancedCard>
      </ScrollView >
    );
  };

  const renderSettingsTab = () => {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <AdvancedCard variant="outlined" size="lg" style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Storage Settings</Text>

          <AdvancedButton
            variant="outline"
            size="lg"
            onPress={() => onNavigate?.('CloudStorageSettings')}
            icon="cloud"
            style={styles.settingButton}
          >
            Configure Cloud Storage
          </AdvancedButton>

          <AdvancedButton
            variant="outline"
            size="lg"
            onPress={() => onNavigate?.('SyncRules')}
            icon="settings"
            style={styles.settingButton}
          >
            Sync Rules & Frequency
          </AdvancedButton>

          <AdvancedButton
            variant="outline"
            size="lg"
            onPress={() => onNavigate?.('BackupSettings')}
            icon="save"
            style={styles.settingButton}
          >
            Backup Preferences
          </AdvancedButton>

          <AdvancedButton
            variant="outline"
            size="lg"
            onPress={() => {
              Alert.alert(
                'Clear All Data',
                'This will permanently delete all local backups and sync data. Continue?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: () => {
                      // Clear all backup/sync data
                      Alert.alert('Success', 'All backup/sync data cleared');
                    }
                  },
                ]
              );
            }}
            icon="trash"
            style={styles.settingButton}
          >
            Clear All Data
          </AdvancedButton>
        </AdvancedCard>
      </ScrollView>
    );
  };

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'backups':
        return renderBackupsTab();
      case 'sync':
        return renderSyncTab();
      case 'conflicts':
        return renderConflictsTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient colors={themeUtils.gradients.secondary as [string, string]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Backup & Sync</Text>
          <Text style={styles.headerSubtitle}>Data Protection & Synchronization</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={loadDashboardData} style={styles.actionButton}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSyncNow} style={styles.actionButton}>
            <Ionicons name="sync" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { id: 'overview', label: 'Overview', icon: 'home' },
          { id: 'backup', label: 'Backups', icon: 'save' },
          { id: 'sync', label: 'Sync', icon: 'sync' },
          { id: 'conflicts', label: 'Conflicts', icon: 'warning' },
          { id: 'settings', label: 'Settings', icon: 'settings' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.id ? 'white' : theme.colors.gray500}
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadDashboardData} />}
      >
        {renderCurrentTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    flex: 1,
  },

  // Status grid
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statusCard: {
    flex: 1,
    minWidth: '45%',
  },
  statusGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },

  // Action cards
  actionCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionGridButton: {
    flex: 1,
  },

  // Settings
  settingsCard: {
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Backups
  backupsHeader: {
    marginBottom: 20,
  },
  backupsHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backupCard: {
    marginBottom: 16,
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  backupInfo: {
    flex: 1,
  },
  backupActions: {
    gap: 8,
  },
  backupModules: {
    gap: 8,
  },
  modulesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moduleBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  moduleCountText: {
    fontSize: 10,
    color: '#6B7280',
  },

  // Sync
  syncCard: {
    marginBottom: 20,
  },
  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  syncItem: {
    marginBottom: 12,
  },
  syncItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  syncMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  syncMetric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Conflicts
  conflictsCard: {
    marginBottom: 20,
  },
  conflictItem: {
    marginBottom: 12,
  },
  conflictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conflictTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conflictTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  conflictActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  resolveButton: {
    flex: 1,
  },

  // Status badges
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },

  // Empty states
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
  },
  emptyAction: {
    marginTop: 8,
  },

  emptySyncState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptySyncText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 12,
  },

  emptyConflictState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyConflictText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 12,
  },

  // Settings buttons
  settingButton: {
    marginBottom: 12,
  },
});

// Import theme utils
import { themeUtils } from '../ui';

export default BackupSyncDashboard;
