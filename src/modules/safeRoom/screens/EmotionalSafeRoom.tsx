import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/WorkingComponents';
import { useEmotionalStore, EmotionalMessage } from '@/store/emotionalStore';
import { mediaService } from '@/services/mediaService';
import { useFocusEffect } from '@react-navigation/native';
import SafeRoomService, { SafeRoomMessage } from '@/services/SafeRoomService';
import { 
  VoiceComposer, 
  VoiceMessageCard, 
  VoiceMessageCardEnhanced,
  listenVoiceNotes, 
  deleteVoiceNote, 
  addVoiceNoteReaction,
  removeVoiceNoteReaction,
  VoiceNote 
} from '../../voice';
import { VideoPlayer, VideoNote } from '../../video';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';

const EmotionalSafeRoom: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
    const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [safeRoomMessages, setSafeRoomMessages] = useState<SafeRoomMessage[]>([]);
    const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
    const [videoNotes, setVideoNotes] = useState<VideoNote[]>([]);
    const [showVoiceComposer, setShowVoiceComposer] = useState(false);
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

    // Load voice notes
    useEffect(() => {
        // console.log('🎤 useEffect for voice notes listener triggered');
        
        const familyId = 'default-family'; // You might want to get this from context or params
        const roomId = 'safe-room'; // You might want to get this from params
        
        // console.log('🎤 Setting up voice notes listener with:', { familyId, context: "safe", roomId });
        
        try {
            const unsubscribe = listenVoiceNotes(familyId, "safe", roomId, (notes) => {
                // console.log('🎤 Voice notes received in callback:', notes);
                setVoiceNotes(notes);
            });
            
            // console.log('🎤 Voice notes listener set up successfully');
            
            return () => {
                // console.log('🎤 Unsubscribing from voice notes listener');
                unsubscribe();
            };
        } catch (error) {
            console.error('🎤 Error setting up voice notes listener:', error);
        }
    }, []);

    // Load video notes
    useEffect(() => {
        console.log('🎥 Setting up video notes listener');
        
        const familyId = "default-family";
        const context = "safe";
        const parentId = "emotional-entry";
        
        const q = query(
            collection(db, "video_notes"),
            where("familyId", "==", familyId),
            where("context", "==", context),
            where("parentId", "==", parentId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const videos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as VideoNote[];
            
            console.log('🎥 Video notes received:', videos.length, 'videos');
            setVideoNotes(videos);
        }, (error) => {
            console.error('🎥 Error listening to video notes:', error);
        });

        return () => {
            console.log('🎥 Cleaning up video notes listener');
            unsubscribe();
        };
    }, []);

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

    const handleVoiceShare = () => {
        setShowVoiceComposer(true);
    };

    const handleVoiceNoteSaved = () => {
        setShowVoiceComposer(false);
    };

    const handleDeleteVoiceNote = async (note: VoiceNote) => {
        Alert.alert(
            'Eliminar Nota de Voz',
            '¿Estás seguro de que quieres eliminar esta nota de voz?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteVoiceNote(note);
                            Alert.alert('Éxito', 'Nota de voz eliminada correctamente');
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar la nota de voz');
                        }
                    }
                }
            ]
        );
    };

    const handleAddReaction = async (noteId: string, emoji: string) => {
        try {
            await addVoiceNoteReaction(noteId, {
                userId: "current-user-id", // TODO: Get from auth context
                userDisplayName: "Usuario Actual", // TODO: Get from auth context
                emoji,
            });
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    };

    const handleRemoveReaction = async (noteId: string) => {
        try {
            await removeVoiceNoteReaction(noteId, "current-user-id"); // TODO: Get from auth context
        } catch (error) {
            console.error('Error removing reaction:', error);
        }
    };

    const handleTextShare = () => {
        navigation.navigate('TextMessage');
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
        <View style={styles.container}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => setShowVoiceComposer(true)}
                        >
                            <Ionicons name="mic" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => navigation.navigate('TextMessage')}
                        >
                            <Ionicons name="chatbubble" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => navigation.navigate('NewEmotionalEntry')}
                        >
                            <Ionicons name="add" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
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
                    {/* Video Notes Section */}
                    {videoNotes.length > 0 && (
                        <View style={styles.videoMessagesSection}>
                            <Text style={styles.sectionTitle}>Video Messages</Text>
                            {videoNotes.map((video) => (
                                <View key={video.id} style={styles.videoMessageCard}>
                                    <View style={styles.videoMessageHeader}>
                                        <Ionicons
                                            name="videocam"
                                            size={20}
                                            color="#EC4899"
                                        />
                                        <Text style={styles.videoMessageSender}>
                                            {video.userDisplayName || 'Family Member'}
                                        </Text>
                                        <Text style={styles.videoMessageTime}>
                                            {video.createdAt?.toDate?.() ? 
                                                new Date(video.createdAt.toDate()).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : 
                                                'Just now'
                                            }
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => {
                                                console.log('Delete video:', video.id);
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <View style={styles.videoMessageContent}>
                                        <VideoPlayer
                                            uri={video.url}
                                            duration={video.durationMs ? video.durationMs / 1000 : 0}
                                            showControls={true}
                                            onDelete={() => {
                                                console.log('Delete video from player:', video.id);
                                            }}
                                        />
                                        {video.userRole && (
                                            <Text style={styles.videoMessageRole}>
                                                {video.userRole === 'parent' ? '👨‍👩‍👧‍👦 Parent' : '👶 Child'}
                                            </Text>
                                        )}
                                    </View>
                                    
                                    {/* Reactions */}
                                    {video.reactions && video.reactions.length > 0 && (
                                        <View style={styles.reactionsContainer}>
                                            {video.reactions.map((reaction, index) => (
                                                <View key={index} style={styles.reactionItem}>
                                                    <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Voice Notes Section */}
                    {voiceNotes.length > 0 && (
                        <View style={styles.voiceNotesSection}>
                            <Text style={styles.sectionTitle}>Voice Messages</Text>
                        {voiceNotes.map((note) => (
                            <VoiceMessageCardEnhanced
                                key={note.id}
                                note={note}
                                onDelete={() => handleDeleteVoiceNote(note)}
                                currentUserId="current-user-id" // TODO: Get from auth context
                                onAddReaction={handleAddReaction}
                                onRemoveReaction={handleRemoveReaction}
                            />
                        ))}
                        </View>
                    )}

                    {/* Text Messages Section */}
                    {safeRoomMessages.length > 0 && (
                        <View style={styles.textMessagesSection}>
                            <Text style={styles.sectionTitle}>Text Messages</Text>
                            {safeRoomMessages.map((message) => (
                                <View key={message.id} style={[
                                    styles.messageCard,
                                    message.isSystemMessage && styles.systemMessageCard
                                ]}>
                                    <View style={styles.messageHeader}>
                                        <Ionicons
                                            name="chatbubble-outline"
                                            size={20}
                                            color="#3B82F6"
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
                                    {/* Check message type and render appropriate component */}
                                    {message.type === 'video' && message.videoUrl ? (
                                        <View style={styles.videoMessageContainer}>
                                            <VideoPlayer 
                                                uri={message.videoUrl}
                                                duration={message.duration || 0}
                                                showControls={true}
                                                onDelete={() => handleDeleteMessage(message.id)}
                                            />
                                            <Text style={styles.videoMessageText}>{message.content}</Text>
                                        </View>
                                    ) : message.type === 'voice' || message.content?.includes('.m4a') || message.content?.includes('file://') ? (
                                        <View style={styles.audioMessageContainer}>
                                            <VoiceMessageCard
                                                note={{
                                                    id: message.id,
                                                    familyId: 'default-family',
                                                    context: 'safe' as const,
                                                    parentId: 'safe-room',
                                                    userId: message.sender || 'unknown',
                                                    url: message.content,
                                                    storagePath: '',
                                                    durationMs: 0,
                                                    createdAt: message.timestamp
                                                }}
                                                onDelete={() => handleDeleteMessage(message.id)}
                                            />
                                        </View>
                                    ) : (
                                        <Text style={styles.messageContent}>
                                            {message.content}
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Empty State */}
                    {voiceNotes.length === 0 && safeRoomMessages.length === 0 && (
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

        {/* Voice Notes Debug - Commented out for production */}
        {/* <VoiceNotesDebug 
          voiceNotes={voiceNotes}
          familyId="default-family"
          context="safe"
          parentId="safe-room"
        />


        {/* Voice Composer */}
        {showVoiceComposer && (
            <View style={styles.composerOverlay}>
                <VoiceComposer
                    familyId="default-family"
                    context="safe"
                    parentId="safe-room"
                    userId="current-user"
                    userDisplayName="Usuario Actual"
                    userRole="parent"
                    onSaved={handleVoiceNoteSaved}
                    onCancel={() => setShowVoiceComposer(false)}
                />
            </View>
        )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContainer: {
        flex: 1,
    },
    messagesList: {
        flex: 1,
        paddingHorizontal: 16,
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
        elevation: 2,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    messageSender: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    messageTime: {
        fontSize: 12,
        color: '#6B7280',
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
    playButtonText: {
        fontSize: 14,
        color: '#8B5CF6',
        marginLeft: 4,
        fontWeight: '500',
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
    // Video Notes Styles
    videoMessagesSection: {
        marginBottom: 16,
    },
    videoMessageCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    videoMessageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    videoMessageSender: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 8,
        flex: 1,
    },
    videoMessageTime: {
        fontSize: 12,
        color: '#9CA3AF',
        marginLeft: 8,
    },
    videoMessageContent: {
        marginBottom: 8,
    },
    videoMessageRole: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
        fontStyle: 'italic',
    },
    deleteButton: {
        padding: 4,
    },
    reactionsContainer: {
        flexDirection: 'row',
        marginTop: 8,
        flexWrap: 'wrap',
    },
    reactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
        marginBottom: 4,
    },
    reactionCount: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    // Voice Notes Styles
    voiceNotesSection: {
        marginBottom: 16,
    },
    textMessagesSection: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    composerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 16,
    },
    audioMessageContainer: {
        marginTop: 8,
    },
    videoMessageContainer: {
        marginTop: 8,
    },
    videoMessageText: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
        fontStyle: 'italic',
    },
});

export default EmotionalSafeRoom;
