/**
 * Emotional Store
 * Zustand store for managing emotional messages and interactions
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EmotionalMessage {
    id: string;
    sender: string;
    senderAvatar: string;
    emotion: string;
    emotionIcon: string;
    emotionColor: string;
    content: string;
    timestamp: string;
    type: 'text' | 'audio' | 'video';
    replies: EmotionalReply[];
    hearts: number;
    createdAt: number;
}

export interface EmotionalReply {
    id: string;
    sender: string;
    senderAvatar: string;
    content: string;
    timestamp: string;
    reaction: string;
    createdAt: number;
}

interface EmotionalState {
    messages: EmotionalMessage[];
    isLoading: boolean;
    error: string | null;

    // Actions
    loadMessages: () => Promise<void>;
    saveMessages: () => Promise<void>;
    addMessage: (message: Omit<EmotionalMessage, 'id' | 'createdAt'>) => void;
    addReply: (messageId: string, reply: Omit<EmotionalReply, 'id' | 'createdAt'>) => void;
    addHeart: (messageId: string) => void;
    removeMessage: (messageId: string) => void;
}

const STORAGE_KEY = 'emotional_messages';

export const useEmotionalStore = create<EmotionalState>((set, get) => ({
    messages: [],
    isLoading: false,
    error: null,

    loadMessages: async () => {
        set({ isLoading: true, error: null });
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const messages = JSON.parse(stored);
                set({ messages });
            } else {
                // Start with empty messages for new users
                set({ messages: [] });
            }
        } catch (error) {
            console.error('Error loading emotional messages:', error);
            set({ error: 'Failed to load messages' });
        } finally {
            set({ isLoading: false });
        }
    },

    saveMessages: async () => {
        try {
            const { messages } = get();
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving emotional messages:', error);
        }
    },

    addMessage: (messageData) => {
        const newMessage: EmotionalMessage = {
            ...messageData,
            id: `msg_${Date.now()}`,
            createdAt: Date.now(),
        };

        set(state => ({
            messages: [newMessage, ...state.messages]
        }));

        get().saveMessages();
    },

    addReply: (messageId, replyData) => {
        const newReply: EmotionalReply = {
            ...replyData,
            id: `reply_${Date.now()}`,
            createdAt: Date.now(),
        };

        set(state => ({
            messages: state.messages.map(msg =>
                msg.id === messageId
                    ? { ...msg, replies: [...msg.replies, newReply] }
                    : msg
            )
        }));

        get().saveMessages();
    },

    addHeart: (messageId) => {
        set(state => ({
            messages: state.messages.map(msg =>
                msg.id === messageId
                    ? { ...msg, hearts: msg.hearts + 1 }
                    : msg
            )
        }));

        get().saveMessages();
    },

    removeMessage: (messageId) => {
        set(state => ({
            messages: state.messages.filter(msg => msg.id !== messageId)
        }));

        get().saveMessages();
    },
}));