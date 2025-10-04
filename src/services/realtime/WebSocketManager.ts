/**
 * WebSocket Manager for FamilyDash Real-time Features
 * Provides real-time communication between family members
 */

import { EventEmitter } from 'events';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WebSocketConfig {
    uri: string;
    protocols?: string[];
    timeout?: number;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    heartbeatInterval?: number;
}

export interface RealTimeMessage {
    type: string;
    payload: any;
    timestamp: number;
    senderId: string;
    senderName: string;
    familyId: string;
    messageId: string;
}

export interface ConnectionState {
    connected: boolean;
    connecting: boolean;
    reconnecting: boolean;
    lastConnected?: number;
    reconnectAttempts: number;
    connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
    latency?: number;
}

export class WebSocketManager extends EventEmitter {
    private static instance: WebSocketManager;
    private ws: WebSocket | null = null;
    private config: WebSocketConfig;
    private connectionState: ConnectionState;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private heartbeatTimer: NodeJS.Timeout | null = null;
    private latencyTimer: NodeJS.Timeout | null = null;
    private messageQueue: RealTimeMessage[] = [];
    private isManuallyDisconnected = false;
    private messageHandlers = new Map<string, (message: RealTimeMessage) => void>();

    private constructor(config: WebSocketConfig) {
        super();
        this.config = {
            timeout: 10000,
            reconnectInterval: 3000,
            maxReconnectAttempts: 5,
            heartbeatInterval: 30000,
            ...config,
        };
        this.connectionState = {
            connected: false,
            connecting: false,
            reconnecting: false,
            reconnectAttempts: 0,
            connectionQuality: 'unknown',
        };
    }

    static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager({
                uri: 'wss://realtime.familydash.app',
            });
        }
        return WebSocketManager.instance;
    }

    /**
     * Connect to WebSocket server
     */
    async connect(): Promise<void> {
        if (this.ws?.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return;
        }

        this.connectionState.connecting = true;
        this.isManuallyDisconnected = false;
        this.emit('connecting');

        try {
            // For now, simulate WebSocket connection for development
            // In production, you would connect to your WebSocket server
            this.simulateConnection();
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.handleConnectionError(error);
        }
    }

    /**
     * Simulate WebSocket connection for development
     */
    private simulateConnection(): void {
        setTimeout(() => {
            this.connectionState = {
                connected: true,
                connecting: false,
                reconnecting: false,
                lastConnected: Date.now(),
                reconnectAttempts: 0,
                connectionQuality: 'excellent',
                latency: 25, // Simulated latency
            };

            this.emit('connected');
            this.startHeartbeat();
            this.processMessageQueue();

            // Simulate some initial messages
            this.simulateInitialMessages();
        }, 1000);
    }

    /**
     * Simulate initial real-time messages
     */
    private simulateInitialMessages(): void {
        const messages = [
            {
                type: 'family_member_online',
                payload: {
                    memberId: 'anna_001',
                    memberName: 'Ana Sofia',
                    status: 'online',
                    lastActive: Date.now(),
                },
                timestamp: Date.now(),
                senderId: 'system',
                senderName: 'System',
                familyId: 'family_ruiz_001',
                messageId: `msg_${Date.now()}_online`,
            },
            {
                type: 'task_assigned',
                payload: {
                    taskId: 'task_001',
                    taskTitle: 'Clean up your room',
                    assignedTo: 'diego_001',
                    assignedBy: 'maria_001',
                    dueDate: Date.now() + 3600000, // 1 hour from now
                },
                timestamp: Date.now(),
                senderId: 'maria_001',
                senderName: 'Maria Ruiz',
                familyId: 'family_ruiz_001',
                messageId: `msg_${Date.now()}_task`,
            },
            {
                type: 'goal_progress',
                payload: {
                    goalId: 'goal_001',
                    goalTitle: 'Learn Spanish',
                    progress: 75,
                    milestone: 'Advanced conversations',
                    updatedBy: 'ana_001',
                },
                timestamp: Date.now(),
                senderId: 'ana_001',
                senderName: 'Ana Sofia',
                familyId: 'family_ruiz_001',
                messageId: `msg_${Date.now()}_goal`,
            },
            {
                type: 'penalty_expired',
                payload: {
                    penaltyId: 'penalty_001',
                    penaltyType: 'yellow_card',
                    memberId: 'diego_001',
                    memberName: ' Diego Alejandro',
                    expiredAt: Date.now(),
                },
                timestamp: Date.now(),
                senderId: 'system',
                senderName: 'System',
                familyId: 'family_ruiz_001',
                messageId: `msg_${Date.now()}_penalty`,
            },
            {
                type: 'saferoom_message',
                payload: {
                    messageId: 'safe_001',
                    content: 'Hey family! I had a great day at school today. Thanks for all your support! 💜',
                    type: 'text',
                    authorId: 'ana_001',
                    authorName: 'Ana Sofia',
                    createdAt: Date.now(),
                    reactions: [],
                    comments: [],
                },
                timestamp: Date.now(),
                senderId: 'ana_001',
                senderName: 'Ana Sofia',
                familyId: 'family_ruiz_001',
                messageId: `msg_${Date.now()}_safe`,
            },
        ];

        // Emit messages with some delay to simulate real-time
        messages.forEach((message, index) => {
            setTimeout(() => {
                this.handleMessage(message);
            }, (index + 1) * 2000); // 2 second intervals
        });
    }

    /**
     * Send message through WebSocket
     */
    send(message: Omit<RealTimeMessage, 'timestamp' | 'messageId'>): void {
        const fullMessage: RealTimeMessage = {
            ...message,
            timestamp: Date.now(),
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        if (this.connectionState.connected) {
            // In production, send through actual WebSocket
            this.ws?.send(JSON.stringify(fullMessage));
            this.emit('messageSent', fullMessage);
        } else {
            // Queue message for when connection is restored
            this.messageQueue.push(fullMessage);
            console.log('WebSocket not connected, queuing message:', fullMessage.type);
        }
    }

    /**
     * Handle incoming WebSocket message
     */
    private handleMessage(message: RealTimeMessage): void {
        try {
            // Emit specific message type
            this.emit(message.type, message);

            // Emit general message event
            this.emit('message', message);

            // Call registered handlers
            const handler = this.messageHandlers.get(message.type);
            if (handler) {
                handler(message);
            }

            // Store message for offline access
            this.storeMessage(message);
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
            this.emit('error', { type: 'message_handling_error', error });
        }
    }

    /**
     * Process queued messages
     */
    private processMessageQueue(): void {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) {
                this.send(message);
            }
        }
    }

    /**
     * Start heartbeat for keeping connection alive
     */
    private startHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }

        this.heartbeatTimer = setInterval(() => {
            if (this.connectionState.connected) {
                this.send({
                    type: 'ping',
                    payload: { timestamp: Date.now() },
                    senderId: 'client',
                    senderName: 'FamilyDash Client',
                    familyId: 'family_ruiz_001',
                });

                // Measure latency
                this.measureLatency();
            }
        }, this.config.heartbeatInterval);
    }

    /**
     * Measure connection latency
     */
    private measureLatency(): void {
        const startTime = Date.now();

        this.latencyTimer = setTimeout(() => {
            const latency = Date.now() - startTime;
            this.connectionState.latency = latency;

            // Update connection quality based on latency
            if (latency < 100) {
                this.connectionState.connectionQuality = 'excellent';
            } else if (latency < 300) {
                this.connectionState.connectionQuality = 'good';
            } else {
                this.connectionState.connectionQuality = 'poor';
            }

            this.emit('latencyUpdate', latency);
        }, 1000); // Timeout after 1 second

        // Listen for pong to measure actual latency
        this.once('pong', () => {
            if (this.latencyTimer) {
                clearTimeout(this.latencyTimer);
            }
        });
    }

    /**
     * Handle connection errors
     */
    private handleConnectionError(error: any): void {
        this.connectionState.connecting = false;
        this.connectionState.reconnecting = true;

        this.emit('error', { type: 'connection_error', error });

        if (!this.isManuallyDisconnected && this.connectionState.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect();
        } else {
            this.connectionState.reconnecting = false;
            this.emit('disconnected', { reason: 'failed_to_connect' });
        }
    }

    /**
     * Schedule reconnection attempt
     */
    private scheduleReconnect(): void {
        this.connectionState.reconnectAttempts++;

        console.log(`Reconnecting in ${this.config.reconnectInterval}ms (attempt ${this.connectionState.reconnectAttempts})`);

        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, this.config.reconnectInterval);
    }

    /**
     * Disconnect WebSocket
     */
    disconnect(): void {
        this.isManuallyDisconnected = true;

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        if (this.latencyTimer) {
            clearTimeout(this.latencyTimer);
            this.latencyTimer = null;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.connectionState = {
            connected: false,
            connecting: false,
            reconnecting: false,
            reconnectAttempts: 0,
            connectionQuality: 'unknown',
        };

        this.emit('disconnected', { reason: 'manual' });
    }

    /**
     * Register message handler for specific message type
     */
    onMessage(type: string, handler: (message: RealTimeMessage) => void): () => void {
        this.messageHandlers.set(type, handler);

        return () => {
            this.messageHandlers.delete(type);
        };
    }

    /**
     * Get current connection state
     */
    getConnectionState(): ConnectionState {
        return { ...this.connectionState };
    }

    /**
     * Subscribe to connection state changes
     */
    onConnectionStateChange(callback: (state: ConnectionState) => void): () => void {
        const handler = () => callback(this.connectionState);

        this.on('connected', handler);
        this.on('disconnected', handler);
        this.on('connecting', handler);
        this.on('reconnecting', handler);
        this.on('connectionQualityChanged', handler);

        // Call immediately with current state
        handler();

        return () => {
            this.off('connected', handler);
            this.off('disconnected', handler);
            this.off('connecting', handler);
            this.off('reconnecting', handler);
            this.off('connectionQualityChanged', handler);
        };
    }

    /**
     * Store message for offline access
     */
    private async storeMessage(message: RealTimeMessage): Promise<void> {
        try {
            const key = `realtime_message_${message.messageId}`;
            await AsyncStorage.setItem(key, JSON.stringify(message));

            // Keep only last 100 messages to manage storage
            await this.cleanupOldMessages();
        } catch (error) {
            console.error('Error storing message:', error);
        }
    }

    /**
     * Cleanup old stored messages
     */
    private async cleanupOldMessages(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const messageKeys = keys.filter(key => key.startsWith('realtime_message_'));

            if (messageKeys.length > 100) {
                // Sort by timestamp and remove oldest
                const messages = await Promise.all(
                    messageKeys.map(async (key) => ({
                        key,
                        data: await AsyncStorage.getItem(key),
                    }))
                );

                messages.sort((a, b) => {
                    const timestampA = JSON.parse(a.data!).timestamp;
                    const timestampB = JSON.parse(b.data!).timestamp;
                    return timestampB - timestampA;
                });

                // Remove oldest messages
                const toRemove = messages.slice(100).map(msg => msg.key);
                await AsyncStorage.multiRemove(toRemove);
            }
        } catch (error) {
            console.error('Error cleaning up old messages:', error);
        }
    }

    /**
     * Get stored messages for offline access
     */
    async getStoredMessages(limit: number = 50): Promise<RealTimeMessage[]> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const messageKeys = keys
                .filter(key => key.startsWith('realtime_message_'))
                .slice(-limit);

            const messages = await AsyncStorage.multiGet(messageKeys);

            return messages
                .map(([_, data]) => data && JSON.parse(data))
                .filter(Boolean)
                .sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error('Error getting stored messages:', error);
            return [];
        }
    }
}
