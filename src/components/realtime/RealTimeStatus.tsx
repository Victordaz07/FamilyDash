/**
 * Real-time Status Component
 * Displays connection status, sync status, and real-time activity
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, AdvancedButton, AdvancedCard, themeUtils } from '../ui';
import { useRealTime } from '@/hooks/useRealTime';

interface RealTimeStatusProps {
    compact?: boolean;
    showSyncStatus?: boolean;
    showConflictResolution?: boolean;
}

export const RealTimeStatus: React.FC<RealTimeStatusProps> = ({
    compact = false,
    showSyncStatus = true,
    showConflictResolution = false,
}) => {
    const theme = useTheme();
    const { connectionStatus, syncStatus, triggerSync, forceSync } = useRealTime();
    const [showDetails, setShowDetails] = useState(false);
    const [lastActivity, setLastActivity] = useState('');

    // Update activity timestamp
    useEffect(() => {
        const updateActivity = () => {
            const now = new Date();
            setLastActivity(now.toLocaleTimeString());
        };

        const interval = setInterval(updateActivity, 30000); // Every 30 seconds
        updateActivity(); // Initial call

        return () => clearInterval(interval);
    }, []);

    const getConnectionColor = () => {
        switch (connectionStatus.quality) {
            case 'excellent':
                return '#10B981';
            case 'good':
                return '#3B82F6';
            case 'poor':
                return '#F59E0B';
            default:
                return '#6B7280';
        }
    };

    const getConnectionIcon = () => {
        if (connectionStatus.connecting) return 'sync';
        if (connectionStatus.reconnecting) return 'refresh';
        if (connectionStatus.connected) return 'checkmark-circle';
        return 'cloud-offline';
    };

    const getConnectionText = () => {
        if (connectionStatus.connecting) return 'Connecting...';
        if (connectionStatus.reconnecting) return 'Reconnecting...';
        if (connectionStatus.connected) {
            return connectionStatus.quality === 'excellent'
                ? 'Real-time Online'
                : `Online (${connectionStatus.quality})`;
        }
        return 'Offline';
    };

    const handleSyncPress = async () => {
        try {
            if (syncStatus.conflicts > 0) {
                Alert.alert(
                    'Resolve Conflicts First',
                    'Please resolve pending conflicts before syncing.',
                    [{ text: 'OK' }]
                );
                return;
            }

            await triggerSync();
        } catch (error) {
            Alert.alert('Sync Failed', 'Failed to sync data. Please try again.');
        }
    };

    const handleForceSyncPress = async () => {
        Alert.alert(
            'Force Sync',
            'This will force synchronization of all pending changes. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Force Sync',
                    onPress: async () => {
                        try {
                            await forceSync();
                        } catch (error) {
                            Alert.alert('Force Sync Failed', 'Failed to force sync. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    // Compact view
    if (compact) {
        return (
            <TouchableOpacity
                style={[
                    styles.compactContainer,
                    { backgroundColor: getConnectionColor() },
                ]}
                onPress={() => setShowDetails(true)}
            >
                <Ionicons
                    name={getConnectionIcon() as any}
                    size={16}
                    color={theme.colors.white}
                />
                {connectionStatus.latency && (
                    <Text style={styles.compactLatency}>
                        {connectionStatus.latency}ms
                    </Text>
                )}
            </TouchableOpacity>
        );
    }

    return (
        <>
            {/* Main status bar */}
            <AdvancedCard
                variant="outlined"
                size="sm"
                style={styles.statusCard}
            >
                <View style={styles.statusHeader}>
                    <View style={styles.statusInfo}>
                        <View style={styles.statusIndicator}>
                            <View
                                style={[
                                    styles.statusDot,
                                    { backgroundColor: getConnectionColor() },
                                ]}
                            />
                            <Ionicons
                                name={getConnectionIcon() as any}
                                size={18}
                                color={getConnectionColor()}
                            />
                        </View>

                        <View style={styles.statusTextContainer}>
                            <Text style={[theme.typography.textStyles.body, styles.statusText]}>
                                {getConnectionText()}
                            </Text>
                            {connectionStatus.latency && (
                                <Text style={[theme.typography.textStyles.caption, styles.latencyText]}>
                                    {connectionStatus.latency}ms latency
                                </Text>
                            )}
                        </View>
                    </View>

                    {showSyncStatus && (
                        <View style={styles.syncActions}>
                            {syncStatus.syncing ? (
                                <View style={styles.syncingIndicator}>
                                    <Text style={styles.syncingText}>Syncing...</Text>
                                </View>
                            ) : (
                                <AdvancedButton
                                    variant="ghost"
                                    size="sm"
                                    icon="refresh"
                                    onPress={handleSyncPress}
                                    disabled={syncStatus.pendingUpdates === 0}
                                >
                                    Sync
                                </AdvancedButton>
                            )}

                            {syncStatus.pendingUpdates > 0 && (
                                <View style={styles.pendingBadge}>
                                    <Text style={styles.pendingText}>
                                        {syncStatus.pendingUpdates}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Conflict indicator */}
                {showConflictResolution && syncStatus.conflicts > 0 && (
                    <View style={styles.conflictWarning}>
                        <Ionicons name="warning" size={16} color={theme.colors.error} />
                        <Text style={[styles.conflictText, { color: theme.colors.error }]}>
                            {syncStatus.conflicts} conflict(s) require resolution
                        </Text>
                    </View>
                )}

                {/* Activity stamp */}
                <Text style={[theme.typography.textStyles.caption, styles.activityText]}>
                    Last activity: {lastActivity}
                </Text>
            </AdvancedCard>

            {/* Details modal */}
            <Modal
                visible={showDetails}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowDetails(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    <LinearGradient
                        colors={['#3B82F6', '#2563EB'] as const}
                        style={styles.modalHeader}
                    >
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowDetails(false)}
                        >
                            <Ionicons name="close" size={24} color={theme.colors.white} />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Real-time Status</Text>

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowDetails(false)}
                        >
                            <Ionicons name="refresh" size={24} color={theme.colors.white} />
                        </TouchableOpacity>
                    </LinearGradient>

                    <ScrollView style={styles.modalContent}>
                        {/* Connection Details */}
                        <AdvancedCard variant="outlined" size="lg" style={styles.detailCard}>
                            <Text style={[theme.typography.textStyles.h3, styles.cardTitle]}>
                                Connection Status
                            </Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Status:</Text>
                                <Text style={styles.detailValue}>{getConnectionText()}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Quality:</Text>
                                <Text style={styles.detailValue}>{connectionStatus.quality}</Text>
                            </View>

                            {connectionStatus.latency && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Latency:</Text>
                                    <Text style={styles.detailValue}>{connectionStatus.latency}ms</Text>
                                </View>
                            )}
                        </AdvancedCard>

                        {/* Sync Details */}
                        {showSyncStatus && (
                            <AdvancedCard variant="outlined" size="lg" style={styles.detailCard}>
                                <Text style={[theme.typography.textStyles.h3, styles.cardTitle]}>
                                    Synchronization Status
                                </Text>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Sync Status:</Text>
                                    <Text style={styles.detailValue}>
                                        {syncStatus.syncing ? 'Syncing' : 'Idle'}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Pending Updates:</Text>
                                    <Text style={styles.detailValue}>{syncStatus.pendingUpdates}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Conflicts:</Text>
                                    <Text style={styles.detailValue}>
                                        {syncStatus.conflicts || 'None'}
                                    </Text>
                                </View>

                                {syncStatus.lastSync && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Last Sync:</Text>
                                        <Text style={styles.detailValue}>
                                            {new Date(syncStatus.lastSync).toLocaleTimeString()}
                                        </Text>
                                    </View>
                                )}

                                {/* Sync Actions */}
                                <View style={styles.syncActionsContainer}>
                                    <AdvancedButton
                                        variant="primary"
                                        size="md"
                                        icon="refresh"
                                        onPress={handleSyncPress}
                                        disabled={syncStatus.syncing || syncStatus.conflicts > 0}
                                        style={styles.syncButton}
                                    >
                                        Sync Now
                                    </AdvancedButton>

                                    <AdvancedButton
                                        variant="outline"
                                        size="md"
                                        icon="reload"
                                        onPress={handleForceSyncPress}
                                        disabled={syncStatus.syncing}
                                        style={styles.syncButton}
                                    >
                                        Force Sync
                                    </AdvancedButton>
                                </View>
                            </AdvancedCard>
                        )}

                        {/* Activity Log */}
                        <AdvancedCard variant="outlined" size="lg" style={styles.detailCard}>
                            <Text style={[theme.typography.textStyles.h3, styles.cardTitle]}>
                                Recent Activity
                            </Text>

                            <Text style={[theme.typography.textStyles.body, styles.activityLog]}>
                                • Real-time sync enabled{'\n'}
                                • Family data synchronized{'\n'}
                                • Connection established{'\n'}
                                • All systems operational
                            </Text>
                        </AdvancedCard>
                    </ScrollView>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    // Compact styles
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    compactLatency: {
        fontSize: 10,
        color: 'white',
        fontWeight: '500',
    },

    // Main status styles
    statusCard: {
        marginVertical: 8,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginRight: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusTextContainer: {
        flex: 1,
    },
    statusText: {
        fontWeight: '600',
    },
    latencyText: {
        opacity: 0.7,
    },

    // Sync status
    syncActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    syncingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    syncingText: {
        fontSize: 12,
        color: '#6B7280',
    },
    pendingBadge: {
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    pendingText: {
        fontSize: 10,
        fontWeight: '600',
        color: 'white',
    },

    // Conflict warning
    conflictWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginVertical: 8,
    },
    conflictText: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    activityText: {
        textAlign: 'right',
        opacity: 0.6,
    },

    // Modal styles
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    modalCloseButton: {
        padding: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    detailCard: {
        marginBottom: 20,
    },
    cardTitle: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '600',
    },
    syncActionsContainer: {
        marginTop: 16,
        gap: 12,
    },
    syncButton: {
        marginBottom: 0,
    },
    activityLog: {
        lineHeight: 24,
        color: '#4B5563',
    },
});

