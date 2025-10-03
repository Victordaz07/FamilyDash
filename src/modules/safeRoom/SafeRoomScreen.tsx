import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFamilyDashStore } from '../../state/store';

const SafeRoomScreen = () => {
    const { safeRoomMessages, addSafeRoomMessage, markMessageAsRead } = useFamilyDashStore();
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            addSafeRoomMessage({
                content: newMessage.trim(),
                sender: 'demo-user-123',
                timestamp: new Date(),
                isRead: false
            });
            setNewMessage('');
            Alert.alert('Message sent', 'Your love message has been sent to the Safe Room ❤️');
        }
    };

    const handleMarkAsRead = (messageId: string) => {
        markMessageAsRead(messageId);
    };

    const getUnreadCount = () => {
        return safeRoomMessages.filter(m => !m.isRead).length;
    };

    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={['#EC4899', '#DB2777']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>❤️ Safe Room</Text>
                <Text style={styles.headerSubtitle}>
                    {getUnreadCount()} unread messages
                </Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.welcomeSection}>
                    <Ionicons name="heart" size={48} color="#EC4899" />
                    <Text style={styles.welcomeTitle}>Love Space</Text>
                    <Text style={styles.welcomeText}>
                        This is a special place to share love messages,
                        support and love with your family.
                    </Text>
                </View>

                <View style={styles.messageInputSection}>
                    <Text style={styles.inputLabel}>Write a love message:</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.messageInput}
                            placeholder="Write your message here..."
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleSendMessage}
                            disabled={!newMessage.trim()}
                        >
                            <Ionicons name="send" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.characterCount}>
                        {newMessage.length}/500 characters
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Recent Messages</Text>

                {safeRoomMessages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="heart-outline" size={64} color="#EC4899" />
                        <Text style={styles.emptyText}>No messages yet</Text>
                        <Text style={styles.emptySubtext}>Be the first to send a love message!</Text>
                    </View>
                ) : (
                    safeRoomMessages
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((message) => (
                            <TouchableOpacity
                                key={message.id}
                                style={[
                                    styles.messageCard,
                                    !message.isRead && styles.unreadMessageCard
                                ]}
                                onPress={() => handleMarkAsRead(message.id)}
                            >
                                <View style={styles.messageHeader}>
                                    <View style={styles.messageInfo}>
                                        <Text style={styles.messageSender}>
                                            {message.sender}
                                        </Text>
                                        <Text style={styles.messageTime}>
                                            {new Date(message.timestamp).toLocaleString()}
                                        </Text>
                                    </View>
                                    {!message.isRead && (
                                        <View style={styles.unreadBadge}>
                                            <Ionicons name="mail-unread" size={16} color="white" />
                                        </View>
                                    )}
                                </View>

                                <Text style={styles.messageContent}>
                                    {message.content}
                                </Text>

                                <View style={styles.messageFooter}>
                                    <Ionicons name="heart" size={16} color="#EC4899" />
                                    <Text style={styles.messageFooterText}>
                                        {message.isRead ? 'Read' : 'New'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                )}

                <View style={styles.statsSection}>
                    <View style={styles.statCard}>
                        <Ionicons name="heart" size={24} color="#EC4899" />
                        <Text style={styles.statNumber}>{safeRoomMessages.length}</Text>
                        <Text style={styles.statLabel}>Total Messages</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="mail-unread" size={24} color="#EC4899" />
                        <Text style={styles.statNumber}>{getUnreadCount()}</Text>
                        <Text style={styles.statLabel}>Unread</Text>
                    </View>
                </View>
            </View>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    if (newMessage.trim()) {
                        handleSendMessage();
                    } else {
                        Alert.alert('Empty Message', 'Please write a message before sending');
                    }
                }}
            >
                <Ionicons name="add" size={24} color="#ffffff" />
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        padding: 24,
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    content: {
        padding: 16,
    },
    welcomeSection: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    welcomeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#EC4899',
        marginTop: 12,
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    messageInputSection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
    },
    messageInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#EC4899',
        padding: 8,
        borderRadius: 6,
        marginLeft: 8,
    },
    characterCount: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'right',
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#EC4899',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    },
    messageCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    unreadMessageCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#EC4899',
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    messageInfo: {
        flex: 1,
    },
    messageSender: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#EC4899',
    },
    messageTime: {
        fontSize: 12,
        color: '#6B7280',
    },
    unreadBadge: {
        backgroundColor: '#EC4899',
        padding: 4,
        borderRadius: 12,
    },
    messageContent: {
        fontSize: 16,
        color: '#1F2937',
        lineHeight: 22,
        marginBottom: 12,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    messageFooterText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    statsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#EC4899',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EC4899',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});

export default SafeRoomScreen;
