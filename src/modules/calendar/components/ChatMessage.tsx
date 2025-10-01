import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface ChatMessageProps {
    message: {
        id: string;
        author: string;
        authorAvatar: string;
        message: string;
        timestamp: string;
    };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    return (
        <View style={styles.messageContainer}>
            <Image
                source={{ uri: message.authorAvatar }}
                style={styles.authorAvatar}
            />

            <View style={styles.messageContent}>
                <View style={styles.messageBubble}>
                    <Text style={styles.messageText}>{message.message}</Text>
                </View>
                <Text style={styles.messageTimestamp}>{message.author} • {message.timestamp}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    authorAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    messageContent: {
        flex: 1,
    },
    messageBubble: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        marginBottom: 4,
    },
    messageText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    messageTimestamp: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 12,
    },
});

export default ChatMessage;
