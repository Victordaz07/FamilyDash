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
    type: 'text' | 'voice' | 'video';
    voiceDuration?: string;
    voicePath?: string;
    videoPath?: string;
    replies: Reply[];
    hearts: number;
    createdAt: number;
}

export interface Reply {
    id: string;
    sender: string;
    senderAvatar: string;
    content: string;
    timestamp: string;
    reaction: string;
    createdAt: number;
}

interface EmotionalStore {
    messages: EmotionalMessage[];
    addMessage: (message: Omit<EmotionalMessage, 'id' | 'createdAt'>) => void;
    addReply: (messageId: string, reply: Omit<Reply, 'id' | 'createdAt'>) => void;
    addHeart: (messageId: string) => void;
    loadMessages: () => Promise<void>;
    saveMessages: () => Promise<void>;
    deleteMessage: (messageId: string) => void;
}

const STORAGE_KEY = 'emotional_messages';

export const useEmotionalStore = create<EmotionalStore>((set, get) => ({
    messages: [],

    addMessage: async (messageData) => {
        const newMessage: EmotionalMessage = {
            ...messageData,
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
        };

        set((state) => ({
            messages: [newMessage, ...state.messages],
        }));

        // Save to storage
        await get().saveMessages();
    },

    addReply: async (messageId, replyData) => {
        const newReply: Reply = {
            ...replyData,
            id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
        };

        set((state) => ({
            messages: state.messages.map((msg) =>
                msg.id === messageId
                    ? { ...msg, replies: [...msg.replies, newReply] }
                    : msg
            ),
        }));

        // Save to storage
        await get().saveMessages();
    },

    addHeart: async (messageId) => {
        set((state) => ({
            messages: state.messages.map((msg) =>
                msg.id === messageId
                    ? { ...msg, hearts: msg.hearts + 1 }
                    : msg
            ),
        }));

        // Save to storage
        await get().saveMessages();
    },

    loadMessages: async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const messages = JSON.parse(stored);
                set({ messages });
            } else {
                // Load mock data if no stored messages
                const mockMessages: EmotionalMessage[] = [
                    {
                        id: 'msg_1',
                        sender: 'Emma',
                        senderAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
                        emotion: 'Worried',
                        emotionIcon: '😟',
                        emotionColor: '#F59E0B',
                        content: "I'm really nervous about my math test tomorrow. I studied but I still feel like I might forget everything. What if I fail? 😰",
                        timestamp: '2 hours ago',
                        type: 'text',
                        replies: [
                            {
                                id: 'reply_1',
                                sender: 'Mom',
                                senderAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
                                content: "Sweetie, you're so smart and prepared! Remember when you aced your science test? You've got this! ❤️",
                                timestamp: '1h ago',
                                reaction: '❤️',
                                createdAt: Date.now() - 3600000,
                            },
                            {
                                id: 'reply_2',
                                sender: 'Dad',
                                senderAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
                                content: "How about we practice together after dinner? I'll help you with the tricky parts! 💪",
                                timestamp: '45m ago',
                                reaction: '💪',
                                createdAt: Date.now() - 2700000,
                            }
                        ],
                        hearts: 5,
                        createdAt: Date.now() - 7200000,
                    },
                    {
                        id: 'msg_2',
                        sender: 'Jake',
                        senderAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
                        emotion: 'Sad',
                        emotionIcon: '😢',
                        emotionColor: '#3B82F6',
                        content: "I feel bad about breaking Mom's vase. I didn't mean to do it and now I'm scared...",
                        timestamp: '2 min ago',
                        type: 'text',
                        replies: [
                            {
                                id: 'reply_3',
                                sender: 'Mom',
                                senderAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
                                content: "It's okay honey, accidents happen. I love you no matter what ❤️",
                                timestamp: '1 min ago',
                                reaction: '❤️',
                                createdAt: Date.now() - 60000,
                            }
                        ],
                        hearts: 3,
                        createdAt: Date.now() - 120000,
                    },
                    {
                        id: 'msg_3',
                        sender: 'Dad',
                        senderAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
                        emotion: 'Happy',
                        emotionIcon: '😊',
                        emotionColor: '#10B981',
                        content: "So proud of both kids today! They helped each other with homework without being asked 🌟",
                        timestamp: '3h ago',
                        type: 'text',
                        replies: [],
                        hearts: 8,
                        createdAt: Date.now() - 10800000,
                    }
                ];
                set({ messages: mockMessages });
                await get().saveMessages();
            }
        } catch (error) {
            console.error('Error loading emotional messages:', error);
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

    deleteMessage: async (messageId) => {
        set((state) => ({
            messages: state.messages.filter((msg) => msg.id !== messageId),
        }));

        // Save to storage
        await get().saveMessages();
    },
}));
