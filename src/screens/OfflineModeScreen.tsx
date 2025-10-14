/**
 * Offline Mode Screen
 * Manages offline functionality and sync status
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Switch,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OfflineManager, { NetworkStatus, SyncConflict } from '@/services/offline/OfflineManager';

interface OfflineModeScreenProps {
    navigation: any;
}

const OfflineModeScreen: React.FC<OfflineModeScreenProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        strength: 80,
    });
    const [syncQueueLength, setSyncQueueLength] = useState(0);
    const [conflictsCount, setConflictsCount] = useState(0);
    const [lastSyncTime, setLastSyncTime] = useState(0);
    const [syncInProgress, setSyncInProgress] = useState(false);
    const [offlineMode, setOfflineMode] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const offlineManager = OfflineManager.getInstance();

    useEffect(() => {
        initializeOfflineManager();
        loadStatus();
    }, []);

    const initializeOfflineManager = async () => {
        await offlineManager.initialize();

        // Add network listener
        const removeListener = offlineManager.addNetworkListener(setNetworkStatus);

        return () => removeListener();
    };

    const loadStatus = () => {
        setSyncQueueLength(offlineManager.getSyncQueueLength());
        setConflictsCount(offlineManager.getConflictsCount());
        setLastSyncTime(offlineManager.getLastSyncTime());
        setSyncInProgress(offlineManager.isSyncInProgress());
    };

    const onRefresh = async () => {
        setRefreshing(true);
        loadStatus();
        setRefreshing(false);
    };

    const handleManualSync = async () => {
        if (!networkStatus.isConnected) {
            Alert.alert('No Internet', 'Please check your internet connection and try again.');
            return;
        }

        if (syncInProgress) {
            Alert.alert('Sync in Progress', 'A sync operation is already in progress.');
            return;
        }

        try {
            setSyncInProgress(true);
            await offlineManager.triggerSync();
            loadStatus();
            Alert.alert('Success', 'Sync completed successfully!');
        } catch (error) {
            Alert.alert('Sync Failed', 'Failed to sync data. Please try again.');
        } finally {
            setSyncInProgress(false);
        }
    };

    const handleClearOfflineData = () => {
        Alert.alert(
            'Clear Offline Data',
            'This will remove all offline data and sync queue. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await offlineManager.clearOfflineData();
                        loadStatus();
                        Alert.alert('Success', 'Offline data cleared successfully.');
                    },
                },
            ]
        );
    };

    const getNetworkIcon = () => {
        if (!networkStatus.isConnected) return 'wifi-outline' as const;
        switch (networkStatus.type) {
            case 'wifi': return 'wifi' as const;
            case 'cellular': return 'cellular' as const;
            case 'ethernet': return 'hardware-chip' as const;
            default: return 'wifi' as const;
        }
    };

    const getNetworkColor = (): string => {
        if (!networkStatus.isConnected) return '#EF4444';
        if (networkStatus.strength > 70) return '#10B981';
        if (networkStatus.strength > 40) return '#F59E0B';
        return '#EF4444';
    };

    const formatLastSync = (): string => {
        if (lastSyncTime === 0) return 'Never';

        const now = Date.now();
        const diff = now - lastSyncTime;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minutes ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours ago`;

        const days = Math.floor(hours / 24);
        return `${days} days ago`;
    };

    const getSyncStatusColor = (): string => {
        if (!networkStatus.isConnected) return '#EF4444';
        if (syncQueueLength > 0) return '#F59E0B';
        if (conflictsCount > 0) return '#8B5CF6';
        return '#10B981';
    };

    const getSyncStatusText = (): string => {
        if (!networkStatus.isConnected) return 'Offline';
        if (syncInProgress) return 'Syncing...';
        if (syncQueueLength > 0) return `${syncQueueLength} pending`;
        if (conflictsCount > 0) return `${conflictsCount} conflicts`;
        return 'All synced';
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <LinearGradient
                colors={['#3B82F6', '#1E40AF']}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Offline Mode</Text>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                    disabled={refreshing}
                >
                    <Ionicons
                        name={refreshing ? "refresh" : "refresh-outline"}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Network Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Network Status</Text>

                    <View style={styles.statusCard}>
                        <View style={styles.statusHeader}>
                            <Ionicons
                                name={getNetworkIcon()}
                                size={24}
                                color={getNetworkColor()}
                            />
                            <Text style={styles.statusTitle}>
                                {networkStatus.isConnected ? 'Connected' : 'Disconnected'}
                            </Text>
                        </View>

                        <View style={styles.statusDetails}>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Connection Type:</Text>
                                <Text style={styles.statusValue}>{networkStatus.type}</Text>
                            </View>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Signal Strength:</Text>
                                <Text style={styles.statusValue}>{networkStatus.strength}%</Text>
                            </View>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Internet Reachable:</Text>
                                <Text style={[
                                    styles.statusValue,
                                    { color: networkStatus.isInternetReachable ? '#10B981' : '#EF4444' }
                                ]}>
                                    {networkStatus.isInternetReachable ? 'Yes' : 'No'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Sync Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sync Status</Text>

                    <View style={styles.statusCard}>
                        <View style={styles.statusHeader}>
                            <View style={[
                                styles.statusIndicator,
                                { backgroundColor: getSyncStatusColor() }
                            ]} />
                            <Text style={styles.statusTitle}>{getSyncStatusText()}</Text>
                        </View>

                        <View style={styles.statusDetails}>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Last Sync:</Text>
                                <Text style={styles.statusValue}>{formatLastSync()}</Text>
                            </View>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Pending Operations:</Text>
                                <Text style={styles.statusValue}>{syncQueueLength}</Text>
                            </View>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Conflicts:</Text>
                                <Text style={styles.statusValue}>{conflictsCount}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Offline Mode Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Offline Mode Settings</Text>

                    <View style={styles.settingsCard}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>Enable Offline Mode</Text>
                                <Text style={styles.settingDescription}>
                                    Work without internet connection
                                </Text>
                            </View>
                            <Switch
                                value={offlineMode}
                                onValueChange={setOfflineMode}
                                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>Auto Sync</Text>
                                <Text style={styles.settingDescription}>
                                    Automatically sync when online
                                </Text>
                            </View>
                            <Switch
                                value={true}
                                onValueChange={() => { }}
                                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions</Text>

                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.primaryButton,
                                (!networkStatus.isConnected || syncInProgress) && styles.disabledButton
                            ]}
                            onPress={handleManualSync}
                            disabled={!networkStatus.isConnected || syncInProgress}
                        >
                            <Ionicons name="sync" size={20} color="white" />
                            <Text style={styles.actionButtonText}>
                                {syncInProgress ? 'Syncing...' : 'Sync Now'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.secondaryButton]}
                            onPress={() => {
                                // Navigate to conflicts screen
                                Alert.alert('Conflicts', `${conflictsCount} conflicts need resolution`);
                            }}
                            disabled={conflictsCount === 0}
                        >
                            <Ionicons name="warning" size={20} color="#8B5CF6" />
                            <Text style={[styles.actionButtonText, { color: '#8B5CF6' }]}>
                                Resolve Conflicts ({conflictsCount})
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.dangerButton]}
                            onPress={handleClearOfflineData}
                        >
                            <Ionicons name="trash" size={20} color="white" />
                            <Text style={styles.actionButtonText}>Clear Offline Data</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How Offline Mode Works</Text>

                    <View style={styles.infoCard}>
                        <View style={styles.infoItem}>
                            <Ionicons name="cloud-offline" size={20} color="#6B7280" />
                            <Text style={styles.infoText}>
                                When offline, all changes are saved locally and queued for sync
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="sync" size={20} color="#6B7280" />
                            <Text style={styles.infoText}>
                                When back online, changes are automatically synchronized
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="warning" size={20} color="#6B7280" />
                            <Text style={styles.infoText}>
                                Conflicts are detected and resolved automatically or manually
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="shield-checkmark" size={20} color="#6B7280" />
                            <Text style={styles.infoText}>
                                Your data is always safe and never lost
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    refreshButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#1F2937',
    },
    statusCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    statusDetails: {
        gap: 8,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    settingsCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 12,
        color: '#6B7280',
    },
    actionsContainer: {
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    primaryButton: {
        backgroundColor: '#3B82F6',
    },
    secondaryButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#8B5CF6',
    },
    dangerButton: {
        backgroundColor: '#EF4444',
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginLeft: 12,
    },
});

export default OfflineModeScreen;





