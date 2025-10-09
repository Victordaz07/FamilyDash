/**
 * Safe Room Service - Enhanced Firebase Integration
 * FamilyDash v1.4.0-pre - Real-time Message Management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService, { DatabaseResult } from './DatabaseService';
import Logger from './Logger';

export interface SafeRoomMessage {
    id: string;
    type: 'text' | 'voice' | 'image' | 'video';
    content: string; // Text content or file URL
    userId: string;
    sender: string;
    timestamp: number;
    createdAt: Date;
    updatedAt: Date;
    duration?: number; // For voice messages
    isSystemMessage?: boolean;
    metadata?: {
        fileSize?: number;
        mimeType?: string;
        thumbnailUrl?: string;
    };
}

export interface MessageInput {
    type: SafeRoomMessage['type'];
    content: string;
    userId: string;
    sender: string;
    duration?: number;
    metadata?: SafeRoomMessage['metadata'];
    isSystemMessage?: boolean;
}

const COLLECTION = 'safeRoomMessages';
const STORAGE_KEY = 'safeRoom_messages';

export const SafeRoomService = {
    /**
     * Add a new message (Firebase + Local Storage)
     */
    async addMessage(messageData: MessageInput): Promise<DatabaseResult<SafeRoomMessage>> {
        try {
            Logger.debug('💬 Adding SafeRoom message:', messageData);

            const message: Omit<SafeRoomMessage, 'id'> = {
                ...messageData,
                timestamp: Date.now(),
                createdAt: new Date(),
                updatedAt: new Date(),
                isSystemMessage: messageData.isSystemMessage || false
            };

            // Add to Firebase
            const firebaseResult = await DatabaseService.add<SafeRoomMessage>(COLLECTION, message);

            if (firebaseResult.success && firebaseResult.data) {
                // Also save locally for offline access
                await this.saveMessageLocally(firebaseResult.data);
                Logger.debug('✅ SafeRoom message added successfully');
                return firebaseResult;
            } else {
                // If Firebase fails, save locally only
                Logger.debug('⚠️ Firebase failed, saving locally only');
                const localMessage = {
                    ...message,
                    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                };
                await this.saveMessageLocally(localMessage);
                return { success: true, data: localMessage };
            }
        } catch (error: any) {
            Logger.error('❌ Error adding SafeRoom message:', error);
            return {
                success: false,
                error: error.message || 'Failed to add message'
            };
        }
    },

    /**
     * Get all messages (Firebase + Local fallback)
     */
    async getMessages(): Promise<SafeRoomMessage[]> {
        try {
            Logger.debug('📖 Getting SafeRoom messages');

            // Try Firebase first
            const firebaseResult = await DatabaseService.getAll<SafeRoomMessage>(COLLECTION, {
                orderBy: [{ field: 'timestamp', direction: 'desc' }]
            });

            if (firebaseResult.success && firebaseResult.data) {
                Logger.debug(`✅ Retrieved ${firebaseResult.data.length} messages from Firebase`);
                // Update local storage with Firebase data
                await this.updateLocalStorage(firebaseResult.data);
                return firebaseResult.data;
            } else {
                // Fallback to local storage
                Logger.debug('⚠️ Firebase failed, using local storage');
                return await this.getLocalMessages();
            }
        } catch (error) {
            Logger.error('❌ Error getting messages:', error);
            return await this.getLocalMessages();
        }
    },

    /**
     * Listen to real-time message updates
     */
    listenToMessages(callback: (messages: SafeRoomMessage[]) => void): () => void {
        Logger.debug('👂 Setting up real-time SafeRoom message listener');

        return DatabaseService.listen<SafeRoomMessage>(
            COLLECTION,
            (messages) => {
                Logger.debug(`📡 Real-time update: ${messages.length} messages`);
                // Update local storage
                this.updateLocalStorage(messages);
                callback(messages);
            },
            {
                orderBy: [{ field: 'timestamp', direction: 'desc' }]
            }
        );
    },

    /**
     * Update a message
     */
    async updateMessage(id: string, updates: Partial<MessageInput>): Promise<DatabaseResult<SafeRoomMessage>> {
        try {
            Logger.debug(`📝 Updating SafeRoom message ${id}:`, updates);

            const updateData = {
                ...updates,
                updatedAt: new Date()
            };

            const result = await DatabaseService.update<SafeRoomMessage>(COLLECTION, id, updateData);

            if (result.success) {
                // Update local storage
                await this.updateLocalMessage(id, updateData);
                Logger.debug(`✅ SafeRoom message ${id} updated successfully`);
            }

            return result;
        } catch (error: any) {
            Logger.error(`❌ Error updating SafeRoom message ${id}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to update message'
            };
        }
    },

    /**
     * Delete a message
     */
    async deleteMessage(id: string): Promise<DatabaseResult> {
        try {
            Logger.debug(`🗑️ Deleting SafeRoom message ${id}`);

            const result = await DatabaseService.remove(COLLECTION, id);

            if (result.success) {
                // Remove from local storage
                await this.removeLocalMessage(id);
                Logger.debug(`✅ SafeRoom message ${id} deleted successfully`);
            }

            return result;
        } catch (error: any) {
            Logger.error(`❌ Error deleting SafeRoom message ${id}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to delete message'
            };
        }
    },

    /**
     * Add a system message (for notifications)
     */
    async addSystemMessage(content: string): Promise<void> {
        try {
            Logger.debug('📢 Adding system message:', content);

            const systemMessage: MessageInput = {
                type: 'text',
                content: content,
                userId: 'system',
                sender: 'System',
                isSystemMessage: true
            };

            await this.addMessage(systemMessage);
        } catch (error) {
            Logger.error('❌ Error adding system message:', error);
        }
    },

    /**
     * Clear all messages (for testing)
     */
    async clearMessages(): Promise<void> {
        try {
            Logger.debug('🗑️ Clearing all SafeRoom messages');

            // Clear Firebase (this would require batch delete in production)
            // For now, just clear local storage
            await AsyncStorage.removeItem(STORAGE_KEY);
            Logger.debug('✅ All SafeRoom messages cleared');
        } catch (error) {
            Logger.error('❌ Error clearing messages:', error);
        }
    },

    /**
     * Get message count
     */
    async getMessageCount(): Promise<number> {
        try {
            const messages = await this.getMessages();
            return messages.length;
        } catch (error) {
            Logger.error('❌ Error getting message count:', error);
            return 0;
        }
    },

    // Local Storage Helper Methods

    /**
     * Save message to local storage
     */
    async saveMessageLocally(message: SafeRoomMessage): Promise<void> {
        try {
            const existing = await this.getLocalMessages();
            const updated = [message, ...existing];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            Logger.error('❌ Error saving message locally:', error);
        }
    },

    /**
     * Get messages from local storage
     */
    async getLocalMessages(): Promise<SafeRoomMessage[]> {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const messages = JSON.parse(stored);
                Logger.debug(`📱 Retrieved ${messages.length} messages from local storage`);
                return messages;
            }
            return [];
        } catch (error) {
            Logger.error('❌ Error getting local messages:', error);
            return [];
        }
    },

    /**
     * Update local storage with Firebase data
     */
    async updateLocalStorage(messages: SafeRoomMessage[]): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch (error) {
            Logger.error('❌ Error updating local storage:', error);
        }
    },

    /**
     * Update a specific message in local storage
     */
    async updateLocalMessage(id: string, updates: Partial<SafeRoomMessage>): Promise<void> {
        try {
            const messages = await this.getLocalMessages();
            const updatedMessages = messages.map(msg =>
                msg.id === id ? { ...msg, ...updates } : msg
            );
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
        } catch (error) {
            Logger.error('❌ Error updating local message:', error);
        }
    },

    /**
     * Remove a message from local storage
     */
    async removeLocalMessage(id: string): Promise<void> {
        try {
            const messages = await this.getLocalMessages();
            const updatedMessages = messages.filter(msg => msg.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
        } catch (error) {
            Logger.error('❌ Error removing local message:', error);
        }
    },

    /**
     * Remove duplicate messages based on ID
     */
    async removeDuplicates(): Promise<void> {
        try {
            const messages = await this.getMessages();
            const uniqueMessages = messages.filter((message, index, self) =>
                index === self.findIndex(m => m.id === message.id)
            );

            if (uniqueMessages.length !== messages.length) {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueMessages));
                Logger.debug(`🧹 Removed ${messages.length - uniqueMessages.length} duplicate messages`);
            }
        } catch (error) {
            Logger.error('❌ Error removing duplicates:', error);
        }
    }
};

export default SafeRoomService;