/**
 * Real-time React Hook
 * Provides easy integration of real-time features in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Mock realtime services for development
interface RealTimeMessage {
    messageId: string;
    type: string;
    payload: any;
    timestamp: number;
    senderId: string;
    senderName: string;
    familyId: string;
}

interface ConnectionState {
    connected: boolean;
    connecting: boolean;
    reconnecting: boolean;
    connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
    latency?: number;
}

class WebSocketManager {
    private static instance: WebSocketManager;
    private connectionState: ConnectionState = {
        connected: false,
        connecting: false,
        reconnecting: false,
        connectionQuality: 'unknown',
    };
    private listeners: Map<string, ((state: ConnectionState) => void)[]> = new Map();
    private messageListeners: Map<string, ((message: RealTimeMessage) => void)[]> = new Map();
    private storedMessages: RealTimeMessage[] = [];

    static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }

    async connect(): Promise<void> {
        this.connectionState.connecting = true;
        this.notifyConnectionStateChange();

        // Simulate connection
        setTimeout(() => {
            this.connectionState.connected = true;
            this.connectionState.connecting = false;
            this.connectionState.connectionQuality = 'good';
            this.connectionState.latency = 50;
            this.notifyConnectionStateChange();
        }, 1000);
    }

    disconnect(): void {
        this.connectionState.connected = false;
        this.connectionState.connecting = false;
        this.connectionState.reconnecting = false;
        this.notifyConnectionStateChange();
    }

    send(message: RealTimeMessage): void {
        // Mock sending message
        console.log('Sending message:', message);
    }

    onConnectionStateChange(callback: (state: ConnectionState) => void): () => void {
        const listeners = this.listeners.get('connection') || [];
        listeners.push(callback);
        this.listeners.set('connection', listeners);

        return () => {
            const currentListeners = this.listeners.get('connection') || [];
            const index = currentListeners.indexOf(callback);
            if (index > -1) {
                currentListeners.splice(index, 1);
            }
        };
    }

    onMessage(messageType: string, callback: (message: RealTimeMessage) => void): () => void {
        const listeners = this.messageListeners.get(messageType) || [];
        listeners.push(callback);
        this.messageListeners.set(messageType, listeners);

        return () => {
            const currentListeners = this.messageListeners.get(messageType) || [];
            const index = currentListeners.indexOf(callback);
            if (index > -1) {
                currentListeners.splice(index, 1);
            }
        };
    }

    async getStoredMessages(maxItems: number): Promise<RealTimeMessage[]> {
        return this.storedMessages.slice(0, maxItems);
    }

    private notifyConnectionStateChange(): void {
        const listeners = this.listeners.get('connection') || [];
        listeners.forEach(callback => callback(this.connectionState));
    }
}

class RealTimeSync {
    private static instance: RealTimeSync;
    private listeners: Map<string, ((data?: any) => void)[]> = new Map();
    private stores: Map<string, any> = new Map();

    static getInstance(): RealTimeSync {
        if (!RealTimeSync.instance) {
            RealTimeSync.instance = new RealTimeSync();
        }
        return RealTimeSync.instance;
    }

    on(event: string, callback: (data?: any) => void): () => void {
        const listeners = this.listeners.get(event) || [];
        listeners.push(callback);
        this.listeners.set(event, listeners);

        return () => {
            const currentListeners = this.listeners.get(event) || [];
            const index = currentListeners.indexOf(callback);
            if (index > -1) {
                currentListeners.splice(index, 1);
            }
        };
    }

    syncLocalChanges(): void {
        this.emit('syncStarted');

        setTimeout(() => {
            this.emit('syncCompleted');
        }, 2000);
    }

    forceSync(): void {
        this.emit('syncStarted');

        setTimeout(() => {
            this.emit('syncCompleted');
        }, 1000);
    }

    registerStore(entityType: string, store: any): void {
        this.stores.set(entityType, store);
    }

    setConflictResolution(strategy: 'client' | 'server' | 'manual'): void {
        console.log('Setting conflict resolution strategy:', strategy);
    }

    queueEntityChange(change: any): void {
        console.log('Queueing entity change:', change);
    }

    private emit(event: string, data?: any): void {
        const listeners = this.listeners.get(event) || [];
        listeners.forEach(callback => callback(data));
    }
}

export interface RealTimeHookConfig {
    autoConnect?: boolean;
    reconnectAttempts?: number;
    retryInterval?: number;
    messageThrottle?: number;
}

export interface ConnectionStatus {
    connected: boolean;
    connecting: boolean;
    reconnecting: boolean;
    quality: 'excellent' | 'good' | 'poor' | 'unknown';
    latency?: number;
}

export interface RealTimeData<T = any> {
    data: T[];
    loading: boolean;
    error: string | null;
    lastUpdate: number;
    isConnected: boolean;
}

/**
 * Main real-time hook
 */
export const useRealTime = (config: RealTimeHookConfig = {}) => {
    const wsManager = WebSocketManager.getInstance();
    const syncService = RealTimeSync.getInstance();

    const {
        autoConnect = true,
        messageThrottle = 100,
    } = config;

    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        connected: false,
        connecting: false,
        reconnecting: false,
        quality: 'unknown',
    });

    const [syncStatus, setSyncStatus] = useState({
        syncing: false,
        pendingUpdates: 0,
        conflicts: 0,
        lastSync: null as number | null,
    });

    // Refs for cleanup
    const subscriptionsRef = useRef<(() => void)[]>([]);
    const messageThrottleRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Subscribe to connection state changes
    useEffect(() => {
        if (!autoConnect) return;

        const unsubscribe = wsManager.onConnectionStateChange((state) => {
            setConnectionStatus({
                connected: state.connected,
                connecting: state.connecting,
                reconnecting: state.reconnecting,
                quality: state.connectionQuality,
                latency: state.latency,
            });
        });

        subscriptionsRef.current.push(unsubscribe);

        // Subscribe to sync state changes
        const syncUnsubscribe = syncService.on('syncStarted', () => {
            setSyncStatus(prev => ({ ...prev, syncing: true }));
        });

        const syncCompletedUnsubscribe = syncService.on('syncCompleted', () => {
            setSyncStatus(prev => ({
                ...prev,
                syncing: false,
                lastSync: Date.now(),
                pendingUpdates: 0,
            }));
        });

        const syncErrorUnsubscribe = syncService.on('syncError', () => {
            setSyncStatus(prev => ({ ...prev, syncing: false }));
        });

        const conflictUnsubscribe = syncService.on('conflictDetected', () => {
            setSyncStatus(prev => ({ ...prev, conflicts: prev.conflicts + 1 }));
        });

        const conflictResolvedUnsubscribe = syncService.on('conflictResolved', () => {
            setSyncStatus(prev => ({ ...prev, conflicts: Math.max(0, prev.conflicts - 1) }));
        });

        const changeQueuedUnsubscribe = syncService.on('changeQueued', () => {
            setSyncStatus(prev => ({ ...prev, pendingUpdates: prev.pendingUpdates + 1 }));
        });

        subscriptionsRef.current.push(
            syncUnsubscribe,
            syncCompletedUnsubscribe,
            syncErrorUnsubscribe,
            conflictUnsubscribe,
            conflictResolvedUnsubscribe,
            changeQueuedUnsubscribe
        );

        return unsubscribe;
    }, [autoConnect, wsManager, syncService]);

    // Cleanup subscriptions
    useEffect(() => {
        return () => {
            subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
            if (messageThrottleRef.current) {
                clearTimeout(messageThrottleRef.current);
            }
        };
    }, []);

    // Connection methods
    const connect = useCallback(async () => {
        await wsManager.connect();
    }, [wsManager]);

    const disconnect = useCallback(() => {
        wsManager.disconnect();
    }, [wsManager]);

    // Sending messages with throttling
    const sendMessage = useCallback((message: Omit<RealTimeMessage, 'timestamp' | 'messageId' | 'senderId' | 'senderName' | 'familyId'>) => {
        if (messageThrottleRef.current) {
            clearTimeout(messageThrottleRef.current);
        }

        messageThrottleRef.current = setTimeout(() => {
            wsManager.send({
                ...message,
                messageId: `msg_${Date.now()}`,
                timestamp: Date.now(),
                senderId: 'current_user',
                senderName: 'Current User',
                familyId: 'family_ruiz_001',
            });
        }, messageThrottle);
    }, [wsManager, messageThrottle]);

    // Manual sync trigger
    const triggerSync = useCallback(() => {
        syncService.syncLocalChanges();
    }, [syncService]);

    const forceSync = useCallback(() => {
        syncService.forceSync();
    }, [syncService]);

    return {
        connectionStatus,
        syncStatus,
        connect,
        disconnect,
        sendMessage,
        triggerSync,
        forceSync,
    };
};

/**
 * Hook for real-time data subscriptions
 */
export const useRealTimeData = <T = any>(
    messageType: string,
    initialData: T[] = [],
    options?: {
        autoUpdate?: boolean;
        retentionPeriod?: number;
        maxItems?: number;
    }
): RealTimeData<T> => {
    const wsManager = WebSocketManager.getInstance();
    const {
        autoUpdate = true,
        retentionPeriod = 300000, // 5 minutes
        maxItems = 100,
    } = options || {};

    const [data, setData] = useState<T[]>(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
    const [isConnected, setIsConnected] = useState(false);

    // Message handler with data update
    const handleMessage = useCallback((message: RealTimeMessage) => {
        try {
            setData(prevData => {
                const newData = [message.payload, ...prevData];

                // Apply retention period
                const cutoffTime = Date.now() - retentionPeriod;
                const filteredData = newData.filter((item: any) =>
                    (item.timestamp || item.createdAt || 0) > cutoffTime
                );

                // Apply max items limit
                return filteredData.slice(0, maxItems);
            });

            setLastUpdate(Date.now());
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }, [retentionPeriod, maxItems]);

    // Subscribe to connection state
    useEffect(() => {
        const unsubscribe = wsManager.onConnectionStateChange((state) => {
            setIsConnected(state.connected);
        });

        return unsubscribe;
    }, [wsManager]);

    // Subscribe to messages
    useEffect(() => {
        if (!autoUpdate) return;

        const unsubscribe = wsManager.onMessage(messageType, handleMessage);

        // Load stored messages on mount
        const loadStoredMessages = async () => {
            setLoading(true);
            try {
                const storedMessages = await wsManager.getStoredMessages(maxItems);
                const filteredMessages = storedMessages
                    .filter(msg => msg.type === messageType)
                    .map(msg => msg.payload) as T[];

                if (filteredMessages.length > 0) {
                    setData(filteredMessages);
                    setLastUpdate(Date.now());
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load stored messages');
            } finally {
                setLoading(false);
            }
        };

        loadStoredMessages();

        return unsubscribe;
    }, [autoUpdate, messageType, handleMessage, maxItems, wsManager]);

    return {
        data,
        loading,
        error,
        lastUpdate,
        isConnected,
    };
};

/**
 * Hook for real-time entity synchronization
 */
export const useRealTimeEntity = <T = any>(
    entityType: string,
    entityId: string,
    store: any,
    options?: {
        autoSync?: boolean;
        conflictResolution?: 'client' | 'server' | 'manual';
    }
) => {
    const syncService = RealTimeSync.getInstance();
    const {
        autoSync = true,
        conflictResolution = 'server',
    } = options || {};

    const [entity, setEntity] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasConflicts, setHasConflicts] = useState(false);

    // Register store for sync
    useEffect(() => {
        if (store) {
            syncService.registerStore(entityType, store);
        }
    }, [entityType, store, syncService]);

    // Set conflict resolution strategy
    useEffect(() => {
        if (conflictResolution !== 'server') {
            syncService.setConflictResolution(conflictResolution);
        }
    }, [conflictResolution, syncService]);

    // Load entity data
    useEffect(() => {
        const loadEntity = async () => {
            setLoading(true);
            try {
                if (store && typeof store.getItem === 'function') {
                    const data = await store.getItem(entityId);
                    setEntity(data);
                } else if (store && typeof store.find === 'function') {
                    const data = await store.find({ id: entityId });
                    setEntity(data[0] || null);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load entity');
            } finally {
                setLoading(false);
            }
        };

        loadEntity();
    }, [entityType, entityId, store]);

    // Subscribe to entity updates
    useEffect(() => {
        if (!autoSync) return;

        const unsubscribe = syncService.on(`${entityType}_updated`, ({ entityId: updatedId, data }) => {
            if (updatedId === entityId) {
                setEntity(data);
            }
        });

        const createUnsubscribe = syncService.on(`${entityType}_created`, ({ entityId: createdId, data }) => {
            if (createdId === entityId) {
                setEntity(data);
            }
        });

        const deleteUnsubscribe = syncService.on(`${entityType}_deleted`, ({ entityId: updatedId }) => {
            if (updatedId === entityId) {
                setEntity(null);
            }
        });

        const conflictUnsubscribe = syncService.on('conflictDetected', (conflict) => {
            if (conflict.entityId === entityId) {
                setHasConflicts(true);
            }
        });

        const conflictResolvedUnsubscribe = syncService.on('conflictResolved', (conflict) => {
            if (conflict.entityId === entityId) {
                setHasConflicts(false);
            }
        });

        return () => {
            unsubscribe();
            createUnsubscribe();
            deleteUnsubscribe();
            conflictUnsubscribe();
            conflictResolvedUnsubscribe();
        };
    }, [autoSync, entityType, entityId, syncService]);

    // Update entity in store and sync
    const updateEntity = useCallback(async (updates: Partial<T>) => {
        if (!store) {
            setError('Store not available');
            return;
        }

        try {
            // Update local store
            if (typeof store.updateItem === 'function') {
                await store.updateItem(entityId, updates);
            } else if (typeof store.update === 'function') {
                await store.update({ [entityId]: updates });
            }

            // Queue for sync
            syncService.queueEntityChange({
                type: 'update',
                entity: entityType,
                entityId,
                data: updates,
            });

            // Update local state
            setEntity(prev => prev ? { ...prev, ...updates } : null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update entity');
        }
    }, [entityId, entityType, store, syncService]);

    // Delete entity
    const deleteEntity = useCallback(async () => {
        if (!store) {
            setError('Store not available');
            return;
        }

        try {
            // Delete from local store
            if (typeof store.removeItem === 'function') {
                await store.removeItem(entityId);
            } else if (typeof store.remove === 'function') {
                await store.remove(entityId);
            }

            // Queue for sync
            syncService.queueEntityChange({
                type: 'delete',
                entity: entityType,
                entityId,
                data: {},
            });

            // Update local state
            setEntity(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete entity');
        }
    }, [entityId, entityType, store, syncService]);

    return {
        entity,
        loading,
        error,
        hasConflicts,
        updateEntity,
        deleteEntity,
    };
};

/**
 * Hook for real-time family member status
 */
export const useRealTimeFamilyStatus = () => {
    const [members, setMembers] = useState<Array<{
        id: string;
        name: string;
        status: 'online' | 'offline' | 'away';
        lastActive?: number;
    }>>([]);

    const [memberCounts, setMemberCounts] = useState({
        online: 0,
        offline: 0,
        away: 0,
    });

    // Subscribe to member status changes
    useEffect(() => {
        const wsManager = WebSocketManager.getInstance();

        const unsubscribeOnline = wsManager.onMessage('family_member_online', (message) => {
            const { memberId, memberName, lastActive } = message.payload;

            setMembers(prev => {
                const existing = prev.find(m => m.id === memberId);
                if (existing) {
                    return prev.map(m =>
                        m.id === memberId
                            ? { ...m, status: 'online' as const, lastActive }
                            : m
                    );
                }

                return [...prev, { id: memberId, name: memberName, status: 'online' as const, lastActive }];
            });
        });

        const unsubscribeOffline = wsManager.onMessage('family_member_offline', (message) => {
            const { memberId } = message.payload;

            setMembers(prev =>
                prev.map(m =>
                    m.id === memberId
                        ? { ...m, status: 'offline' as const }
                        : m
                )
            );
        });

        return () => {
            unsubscribeOnline();
            unsubscribeOffline();
        };
    }, []);

    // Update member counts
    useEffect(() => {
        const counts = members.reduce(
            (acc, member) => {
                acc[member.status]++;
                return acc;
            },
            { online: 0, offline: 0, away: 0 }
        );

        setMemberCounts(counts);
    }, [members]);

    return {
        members,
        memberCounts,
    };
};
