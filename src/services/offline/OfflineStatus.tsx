/**
 * Offline Status Component for FamilyDash
 * Displays current offline/sync status
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OfflineManager, NetworkStatus } from './OfflineManager';

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
        <View style={[styles.container, style]}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            <View style={styles.statusInfo}>
                <Text style={styles.statusText}>{getStatusText()}</Text>
                <Text style={styles.syncText}>Last sync: {formatLastSync()}</Text>
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
