import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../../components/ui/WorkingComponents';
import { useEmotionalStore, EmotionalMessage } from '../store/emotionalStore';
import { mediaService } from '../services/mediaService';

const EmotionalSafeRoom: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const { messages, addReply, addHeart, loadMessages } = useEmotionalStore();

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

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

    const handleVoicePlay = async (message: EmotionalMessage) => {
        if (message.type === 'audio') {
            try {
                // For now, show alert since we don't have voicePath in the interface
                Alert.alert('Voice Message', 'Voice playback functionality - audio type detected');
            } catch (error) {
                Alert.alert('Error', 'Could not play voice message');
            }
        } else {
            Alert.alert('Voice Message', 'Voice playback functionality');
        }
    };

    const handleAddHeart = async (messageId: string) => {
        await addHeart(messageId);
        Alert.alert('Heart Added', 'You showed your support with a heart ❤️');
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
                        <Text style={styles.headerTitle}>Safe Room</Text>
                        <Text style={styles.headerSubtitle}>Emotional Support Space</Text>
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
                    <TouchableOpacity style={[styles.quickShareButton, { backgroundColor: '#3B82F6' }]}>
                        <View style={styles.quickShareIcon}>
                            <Ionicons name="chatbubble" size={20} color="white" />
                        </View>
                        <Text style={styles.quickShareText}>Text</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.quickShareButton, { backgroundColor: '#8B5CF6' }]}>
                        <View style={styles.quickShareIcon}>
                            <Ionicons name="mic" size={20} color="white" />
                        </View>
                        <Text style={styles.quickShareText}>Voice</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.quickShareButton, { backgroundColor: '#F59E0B' }]}
                        onPress={() => navigation.navigate('PermissionTest')}
                    >
                        <View style={styles.quickShareIcon}>
                            <Ionicons name="settings" size={20} color="white" />
                        </View>
                        <Text style={styles.quickShareText}>Test</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Empty State for Messages */}
            <View style={styles.messagesSection}>
                <Card style={styles.messagesCard}>
                    <View style={styles.emptyStateContainer}>
                        <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
                        <Text style={styles.emptyStateTitle}>No Messages Yet</Text>
                        <Text style={styles.emptyStateText}>
                            Start sharing your feelings with your family
                        </Text>
                        <TouchableOpacity style={styles.startSharingButton}>
                            <Text style={styles.startSharingText}>Start Sharing</Text>
                        </TouchableOpacity>
                    </View>
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
});

export default EmotionalSafeRoom;
