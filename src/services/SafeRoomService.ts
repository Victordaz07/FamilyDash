/**
 * SafeRoomService
 * Centralized service for managing Safe Room messages (text and voice)
 * Handles both local storage and Firebase synchronization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import RealDatabaseService from './database/RealDatabaseService';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY = 'safeRoomMessages';

export interface SafeRoomMessage {
    id: string;
    type: 'text' | 'voice';
    content: string; // texto o URI de audio
    timestamp: number;
    createdAt: Date;
    userId: string;
    sender?: string;
    duration?: number; // para mensajes de voz
    isSystemMessage?: boolean; // para mensajes del sistema
}

export const SafeRoomService = {
    /**
     * Get all messages from local storage and Firebase
     */
    async getMessages(): Promise<SafeRoomMessage[]> {
        try {
            // Always check local storage first for immediate display
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            const localMessages = data ? JSON.parse(data) : [];

            // Try to get from Firebase if user is authenticated
            const firebaseMessages = await this.getMessagesFromFirebase();

            // Combine both sources, prioritizing Firebase
            const allMessages = [...firebaseMessages, ...localMessages];

            console.log('📱 SafeRoomService: Loaded', allMessages.length, 'messages total');
            console.log('📱 SafeRoomService: Firebase:', firebaseMessages.length, 'Local:', localMessages.length);

            return allMessages;
        } catch (error) {
            console.error('❌ SafeRoomService: Error loading messages:', error);
            return [];
        }
    },

    /**
     * Get messages from Firebase
     */
    async getMessagesFromFirebase(): Promise<SafeRoomMessage[]> {
        try {
            // This is a placeholder - in a real implementation, you'd need the user context
            // For now, we'll return empty array and rely on local storage
            console.log('🔄 SafeRoomService: Firebase messages not implemented yet');
            return [];
        } catch (error) {
            console.error('❌ SafeRoomService: Error loading Firebase messages:', error);
            return [];
        }
    },

    /**
     * Add a new message to storage
     */
    async addMessage(message: Omit<SafeRoomMessage, 'id' | 'timestamp' | 'createdAt'>): Promise<void> {
        try {
            // Generate a more unique ID
            const uniqueId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${Math.floor(Math.random() * 10000)}`;

            const newMessage: SafeRoomMessage = {
                ...message,
                id: uniqueId,
                timestamp: Date.now(),
                createdAt: new Date(),
            };

            const existing = await SafeRoomService.getMessages();
            const updated = [newMessage, ...existing];

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            console.log('✅ SafeRoomService: Message added successfully with ID:', uniqueId);

            // Try to sync to Firebase if user is authenticated
            await SafeRoomService.syncToFirebase(newMessage);

        } catch (error) {
            console.error('❌ SafeRoomService: Error adding message:', error);
            throw error;
        }
    },

    /**
     * Sync message to Firebase and local storage
     */
    async syncToFirebase(message: SafeRoomMessage): Promise<void> {
        try {
            // Save to local storage as backup
            const existing = await SafeRoomService.getMessages();
            const updated = [message, ...existing];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            console.log('💾 SafeRoomService: Message synced to local storage');

            // TODO: Implement Firebase sync when user context is available
            console.log('🔄 SafeRoomService: Firebase sync placeholder');
        } catch (error) {
            console.error('❌ SafeRoomService: Sync error:', error);
            // Don't throw error - local storage is working
        }
    },

    /**
     * Clear all messages (for testing)
     */
    async clearMessages(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            console.log('🗑️ SafeRoomService: All messages cleared');
        } catch (error) {
            console.error('❌ SafeRoomService: Error clearing messages:', error);
        }
    },

    /**
     * Remove duplicate messages based on ID
     */
    async removeDuplicates(): Promise<void> {
        try {
            const messages = await SafeRoomService.getMessages();
            const uniqueMessages = messages.filter((message, index, self) =>
                index === self.findIndex(m => m.id === message.id)
            );

            if (uniqueMessages.length !== messages.length) {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueMessages));
                console.log(`🧹 SafeRoomService: Removed ${messages.length - uniqueMessages.length} duplicate messages`);
            }
        } catch (error) {
            console.error('❌ SafeRoomService: Error removing duplicates:', error);
        }
    },

    /**
     * Get message count
     */
    async getMessageCount(): Promise<number> {
        const messages = await SafeRoomService.getMessages();
        return messages.length;
    },

    /**
     * Get messages by type
     */
    async getMessagesByType(type: 'text' | 'voice'): Promise<SafeRoomMessage[]> {
        const messages = await SafeRoomService.getMessages();
        return messages.filter(msg => msg.type === type);
    },

    /**
     * Delete a message by ID
     */
    async deleteMessage(messageId: string): Promise<void> {
        try {
            const messages = await SafeRoomService.getMessages();
            const filteredMessages = messages.filter(msg => msg.id !== messageId);

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredMessages));
            console.log('🗑️ SafeRoomService: Message deleted successfully');

            // Add a system message indicating deletion
            await SafeRoomService.addSystemMessage('A user deleted a message');

        } catch (error) {
            console.error('❌ SafeRoomService: Error deleting message:', error);
            throw error;
        }
    },

    /**
     * Update a message by ID
     */
    async updateMessage(messageId: string, updates: Partial<SafeRoomMessage>): Promise<void> {
        try {
            const messages = await SafeRoomService.getMessages();
            const updatedMessages = messages.map(msg =>
                msg.id === messageId ? { ...msg, ...updates, timestamp: Date.now() } : msg
            );

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
            console.log('✏️ SafeRoomService: Message updated successfully');

            // Add a system message indicating edit
            await SafeRoomService.addSystemMessage('A user edited a message');

        } catch (error) {
            console.error('❌ SafeRoomService: Error updating message:', error);
            throw error;
        }
    },

    /**
     * Add a system message (for notifications about deletions/edits)
     */
    async addSystemMessage(content: string): Promise<void> {
        try {
            // Generate a unique system message ID
            const systemId = `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${Math.floor(Math.random() * 10000)}`;

            const systemMessage: SafeRoomMessage = {
                id: systemId,
                type: 'text',
                content: content,
                timestamp: Date.now(),
                createdAt: new Date(),
                userId: 'system',
                sender: 'System',
                isSystemMessage: true
            };

            const existing = await SafeRoomService.getMessages();
            const updated = [systemMessage, ...existing];

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            console.log('📢 SafeRoomService: System message added with ID:', systemId);

        } catch (error) {
            console.error('❌ SafeRoomService: Error adding system message:', error);
        }
    }
};

export default SafeRoomService;
