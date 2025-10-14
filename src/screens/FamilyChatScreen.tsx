import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/store';

interface ChatMessage {
    id: string;
    text: string;
    user: {
        name: string;
        avatar?: string;
    };
    createdAt: Date;
}

export default function FamilyChatScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Listen to messages
        const messagesRef = collection(db, 'familyChats');
        const q = query(messagesRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                text: doc.data().text,
                user: {
                    name: doc.data().user.name,
                    avatar: doc.data().user.avatar,
                },
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            }));
            setMessages(newMessages);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const sendMessage = useCallback(async () => {
        if (!newMessage.trim() || !user) return;

        try {
            await addDoc(collection(db, 'familyChats'), {
                text: newMessage.trim(),
                createdAt: serverTimestamp(),
                user: {
                    name: user.displayName || user.email || 'Anonymous',
                    avatar: 'https://via.placeholder.com/40',
                },
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        }
    }, [newMessage, user]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isMyMessage = (message: ChatMessage) => {
        return message.user.name === (user?.displayName || user?.email || 'Anonymous');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={['#9b59b6', '#8e44ad']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>Family Chat</Text>
                        <Text style={styles.headerSubtitle}>Stay connected</Text>
                    </View>
                    <TouchableOpacity style={styles.infoButton}>
                        <Ionicons name="information-circle-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Messages */}
            <KeyboardAvoidingView
                style={styles.chatContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Loading messages...</Text>
                        </View>
                    ) : messages.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Text style={styles.emptySubtext}>Start the conversation!</Text>
                        </View>
                    ) : (
                        messages.map((message) => (
                            <View
                                key={message.id}
                                style={[
                                    styles.messageContainer,
                                    isMyMessage(message) ? styles.myMessageContainer : styles.otherMessageContainer
                                ]}
                            >
                                <View style={[
                                    styles.messageBubble,
                                    isMyMessage(message) ? styles.myMessageBubble : styles.otherMessageBubble
                                ]}>
                                    <Text style={[
                                        styles.messageText,
                                        isMyMessage(message) ? styles.myMessageText : styles.otherMessageText
                                    ]}>
                                        {message.text}
                                    </Text>
                                    <Text style={[
                                        styles.messageTime,
                                        isMyMessage(message) ? styles.myMessageTime : styles.otherMessageTime
                                    ]}>
                                        {formatTime(message.createdAt)}
                                    </Text>
                                </View>
                                <View style={styles.messageAvatar}>
                                    <Text style={styles.avatarText}>
                                        {message.user.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>

                {/* Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message..."
                        placeholderTextColor="#999"
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
                        onPress={sendMessage}
                        disabled={!newMessage.trim()}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={newMessage.trim() ? "white" : "#ccc"}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },

    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: { fontSize: 24, color: '#fff', fontWeight: '800' },
    headerSubtitle: { fontSize: 14, color: '#EEE', marginTop: 4 },
    infoButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    chatContainer: {
        flex: 1,
    },

    messagesContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    messagesContent: {
        paddingVertical: 16,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
    },

    messageContainer: {
        flexDirection: 'row',
        marginVertical: 4,
        alignItems: 'flex-end',
    },
    myMessageContainer: {
        justifyContent: 'flex-end',
    },
    otherMessageContainer: {
        justifyContent: 'flex-start',
    },

    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginHorizontal: 8,
    },
    myMessageBubble: {
        backgroundColor: '#9b59b6',
        borderBottomRightRadius: 4,
    },
    otherMessageBubble: {
        backgroundColor: '#E5E5EA',
        borderBottomLeftRadius: 4,
    },

    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    myMessageText: {
        color: 'white',
    },
    otherMessageText: {
        color: '#000',
    },

    messageTime: {
        fontSize: 12,
        marginTop: 4,
    },
    myMessageTime: {
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'right',
    },
    otherMessageTime: {
        color: '#666',
    },

    messageAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#9b59b6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        maxHeight: 100,
        marginRight: 12,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonActive: {
        backgroundColor: '#9b59b6',
    },
    sendButtonInactive: {
        backgroundColor: '#E5E5EA',
    },
});
