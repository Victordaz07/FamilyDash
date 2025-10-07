import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../../components/ui/WorkingComponents';
import { useEmotionalStore, EmotionalMessage } from '../store/emotionalStore';
import { mediaService } from '../services/mediaService';
import { useFocusEffect } from '@react-navigation/native';
import SafeRoomService, { SafeRoomMessage } from '../../../services/SafeRoomService';

const EmotionalSafeRoom: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
    const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [safeRoomMessages, setSafeRoomMessages] = useState<SafeRoomMessage[]>([]);
    const { messages, addReply, addHeart, loadMessages } = useEmotionalStore();

    // Check if we're in emotional support mode
    const isEmotionalMode = route?.params?.mode === 'emotional';

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    // Reload messages when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            console.log('🔄 Safe Room focused, reloading messages...');
            loadMessages();

            // Load SafeRoom messages
            const loadSafeRoomMessages = async () => {
                try {
                    // Remove duplicates first
                    await SafeRoomService.removeDuplicates();
                    const messages = await SafeRoomService.getMessages();
                    setSafeRoomMessages(messages);
                    console.log('📱 Loaded SafeRoom messages:', messages.length);
                } catch (error) {
                    console.error('❌ Error loading SafeRoom messages:', error);
                }
            };

            loadSafeRoomMessages();
        }, [loadMessages])
    );

    const handleBack = () => {
        navigation.goBack();
    };

    const handleQuickReaction = (reaction: string) => {
        setSelectedReaction(reaction);
        Alert.alert('Reaction Sent', `You sent ${reaction} reaction`);
    };

    const handleSendMessage = () => {
        if (messageText.trim()) {
            Alert.alert('Message Sent', 'Your support message has been sent');
            setMessageText('');
        } else {
            Alert.alert('Empty Message', 'Please write a message before sending');
        }
    };

    const handleVoicePlay = async (message: SafeRoomMessage | EmotionalMessage) => {
        if (message.type === 'voice' || message.type === 'audio') {
            try {
                const duration = 'duration' in message ? message.duration : undefined;
                const sender = 'sender' in message ? message.sender : message.sender;
                Alert.alert('Voice Message', `Playing voice message from ${sender}${duration ? ` (${duration}s)` : ''}`);
                // TODO: Implement actual audio playback using expo-av
            } catch (error) {
                Alert.alert('Error', 'Could not play voice message');
            }
        } else {
            Alert.alert('Voice Message', 'No voice data available');
        }
    };

    const handleTextShare = () => {
        navigation.navigate('TextMessage');
    };

    const handleVoiceShare = () => {
        navigation.navigate('VoiceMessage');
    };

    const handleDeleteMessage = async (messageId: string) => {
        Alert.alert(
            'Delete Message',
            'Are you sure you want to delete this message?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await SafeRoomService.deleteMessage(messageId);
                            // Reload messages
                            const messages = await SafeRoomService.getMessages();
                            setSafeRoomMessages(messages);
                            Alert.alert('Success', 'Message deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete message');
                        }
                    }
                }
            ]
        );
    };

    const handleEditMessage = async (message: SafeRoomMessage) => {
        if (message.type === 'voice') {
            Alert.alert('Edit Voice Message', 'Voice messages cannot be edited. You can delete and create a new one.');
            return;
        }

        Alert.prompt(
            'Edit Message',
            'Enter new message content:',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Save',
                    onPress: async (newContent) => {
                        if (newContent && newContent.trim() !== message.content) {
                            try {
                                await SafeRoomService.updateMessage(message.id, {
                                    content: newContent.trim()
                                });
                                // Reload messages
                                const messages = await SafeRoomService.getMessages();
                                setSafeRoomMessages(messages);
                                Alert.alert('Success', 'Message updated successfully');
                            } catch (error) {
                                Alert.alert('Error', 'Failed to update message');
                            }
                        }
                    }
                }
            ],
            'plain-text',
            message.content
        );
    };


    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={['#EC4899', '#DB2777']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>
                            {isEmotionalMode ? 'Emergency Support' : 'Safe Room'}
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            {isEmotionalMode ? 'We\'re here for you' : 'Emotional Support Space'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.navigate('NewEmotionalEntry')}
                    >
                        <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Safe Space Rules */}
            <View style={styles.rulesSection}>
                <Card style={[styles.rulesCard, { borderLeftColor: '#EC4899' }] as any}>
                    <View style={styles.rulesHeader}>
                        <View style={styles.rulesIcon}>
                            <Ionicons name="shield" size={20} color="#EC4899" />
                        </View>
                        <View>
                            <Text style={styles.rulesTitle}>Safe Space Rules</Text>
                            <Text style={styles.rulesSubtitle}>No judgment, only love</Text>
                        </View>
                    </View>
                    <View style={styles.rulesGrid}>
                        <View style={styles.ruleItem}>
                            <Ionicons name="heart" size={16} color="#EC4899" />
                            <Text style={styles.ruleText}>Support</Text>
                        </View>
                        <View style={styles.ruleItem}>
                            <Ionicons name="ear" size={16} color="#EC4899" />
                            <Text style={styles.ruleText}>Listen</Text>
                        </View>
                        <View style={styles.ruleItem}>
                            <Ionicons name="hand-left" size={16} color="#EC4899" />
                            <Text style={styles.ruleText}>Care</Text>
                        </View>
                    </View>
                </Card>
            </View>

            {/* Quick Share Options */}
            <View style={styles.quickShareSection}>
                <View style={styles.quickShareGrid}>
                    <TouchableOpacity
                        style={[styles.quickShareButton, { backgroundColor: '#3B82F6' }]}
                        onPress={handleTextShare}
                        activeOpacity={0.8}
                    >
                        <View style={styles.quickShareIcon}>
                            <Ionicons name="chatbubble" size={20} color="white" />
                        </View>
                        <Text style={styles.quickShareText}>Text</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.quickShareButton, { backgroundColor: '#8B5CF6' }]}
                        onPress={handleVoiceShare}
                        activeOpacity={0.8}
                    >
                        <View style={styles.quickShareIcon}>
                            <Ionicons name="mic" size={20} color="white" />
                        </View>
                        <Text style={styles.quickShareText}>Voice</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messages Section */}
            <View style={styles.messagesSection}>
                <Card style={styles.messagesCard}>
                    {safeRoomMessages.length === 0 ? (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
                            <Text style={styles.emptyStateTitle}>No Messages Yet</Text>
                            <Text style={styles.emptyStateText}>
                                Start sharing your feelings with your family
                            </Text>
                            <TouchableOpacity
                                style={styles.startSharingButton}
                                onPress={handleTextShare}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.startSharingText}>Start Sharing</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
                            {safeRoomMessages.map((message) => (
                                <View key={message.id} style={[
                                    styles.messageCard,
                                    message.isSystemMessage && styles.systemMessageCard
                                ]}>
                                    <View style={styles.messageHeader}>
                                        <Ionicons
                                            name={message.type === 'voice' ? 'mic-outline' : 'chatbubble-outline'}
                                            size={20}
                                            color={message.type === 'voice' ? '#8B5CF6' : '#3B82F6'}
                                        />
                                        <Text style={styles.messageSender}>
                                            {message.sender || 'Anonymous'}
                                        </Text>
                                        <Text style={styles.messageTime}>
                                            {new Date(message.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Text>
                                        {!message.isSystemMessage && (
                                            <View style={styles.messageActions}>
                                                <TouchableOpacity
                                                    style={styles.actionButton}
                                                    onPress={() => handleEditMessage(message)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Ionicons name="create-outline" size={16} color="#6B7280" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.actionButton}
                                                    onPress={() => handleDeleteMessage(message.id)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.messageContent}>
                                        {message.type === 'voice'
                                            ? `🎧 Voice message${message.duration ? ` (${Math.round(message.duration)}s)` : ''}`
                                            : message.content
                                        }
                                    </Text>
                                    {message.type === 'voice' && (
                                        <TouchableOpacity
                                            style={styles.playButton}
                                            onPress={() => handleVoicePlay(message)}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="play" size={16} color="#8B5CF6" />
                                            <Text style={styles.playButtonText}>Play</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </Card>
            </View>

            {/* Family Support Stats */}
            <View style={styles.statsSection}>
                <LinearGradient
                    colors={['#EC4899', '#DB2777']}
                    style={styles.statsCard}
                >
                    <View style={styles.statsHeader}>
                        <Text style={styles.statsTitle}>This Week's Support</Text>
                        <Ionicons name="trending-up" size={20} color="white" />
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Messages Shared</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Hearts Given</Text>
                        </View>
                    </View>

                    <View style={styles.connectionCard}>
                        <View style={styles.connectionHeader}>
                            <Text style={styles.connectionLabel}>Family Connection</Text>
                            <Text style={styles.connectionValue}>Getting Started</Text>
                        </View>
                        <View style={styles.connectionBar}>
                            <View style={[styles.connectionFill, { width: '0%' }]} />
                        </View>
                    </View>
                </LinearGradient>
            </View>

            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        paddingTop: 50,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    rulesSection: {
        paddingHorizontal: 16,
        marginTop: -12,
    },
    rulesCard: {
        padding: 16,
        borderLeftWidth: 4,
    },
    rulesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    rulesIcon: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    rulesTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    rulesSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    rulesGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    ruleItem: {
        alignItems: 'center',
    },
    ruleText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    quickShareSection: {
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 16,
    },
    quickShareGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickShareButton: {
        flex: 1,
        marginHorizontal: 4,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickShareIcon: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    quickShareText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'white',
    },
    messagesSection: {
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 16,
    },
    messagesCard: {
        padding: 16,
    },
    messagesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    messagesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    newCount: {
        fontSize: 14,
        color: '#EC4899',
        fontWeight: '600',
    },
    messagesList: {
        marginBottom: 16,
    },
    messageCard: {
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    messageInfo: {
        flex: 1,
    },
    messageTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    senderName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginRight: 8,
    },
    emotionTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    emotionIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    emotionText: {
        fontSize: 12,
        fontWeight: '500',
    },
    timestamp: {
        fontSize: 12,
        color: '#6B7280',
    },
    moreButton: {
        width: 32,
        height: 32,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageContent: {
        marginBottom: 12,
    },
    messageBubble: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    messageText: {
        fontSize: 14,
        color: '#1F2937',
        lineHeight: 20,
    },
    voicePlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    playButton: {
        width: 40,
        height: 40,
        backgroundColor: '#EC4899',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    progressContainer: {
        flex: 1,
        marginRight: 12,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(236, 72, 153, 0.3)',
        borderRadius: 4,
        marginBottom: 4,
    },
    progressFill: {
        height: 8,
        backgroundColor: '#EC4899',
        borderRadius: 4,
    },
    duration: {
        fontSize: 12,
        color: '#6B7280',
    },
    messageActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderRadius: 16,
        marginRight: 12,
    },
    heartCount: {
        fontSize: 12,
        color: '#EC4899',
        marginLeft: 4,
    },
    replyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
    },
    replyText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    repliesContainer: {
        marginTop: 12,
        paddingLeft: 16,
        borderLeftWidth: 2,
        borderLeftColor: '#E5E7EB',
    },
    replyItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    replyAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    replyContent: {
        flex: 1,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    replySender: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
        marginRight: 8,
    },
    replyTimestamp: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    replyReaction: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reactionEmoji: {
        fontSize: 16,
        marginRight: 4,
    },
    reactionText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    viewAllButton: {
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#EC4899',
        borderRadius: 12,
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: 14,
        color: '#EC4899',
        fontWeight: '600',
    },
    statsSection: {
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 100,
    },
    statsCard: {
        padding: 16,
        borderRadius: 16,
    },
    statsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    connectionCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 12,
        borderRadius: 12,
    },
    connectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    connectionLabel: {
        fontSize: 14,
        color: 'white',
    },
    connectionValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    connectionBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
    },
    connectionFill: {
        height: 8,
        backgroundColor: 'white',
        borderRadius: 4,
    },
    bottomSpacing: {
        height: 20,
    },
    emptyStateContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    startSharingButton: {
        backgroundColor: '#EC4899',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    startSharingText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    playButtonText: {
        fontSize: 14,
        color: '#8B5CF6',
        marginLeft: 4,
        fontWeight: '500',
    },
    messageActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    actionButton: {
        padding: 8,
        marginLeft: 8,
        borderRadius: 6,
        backgroundColor: '#F3F4F6',
    },
    systemMessageCard: {
        backgroundColor: '#F0F9FF',
        borderLeftColor: '#0EA5E9',
    },
});

export default EmotionalSafeRoom;
