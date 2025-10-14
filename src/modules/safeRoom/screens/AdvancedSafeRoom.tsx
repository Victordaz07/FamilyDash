import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Dimensions,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, AdvancedCard, AdvancedButton } from '@/components/ui';
import { MediaPlayer } from '@/components/ui/MediaPlayer';
import { AdvancedMediaService } from '@/services/AdvancedMediaService';
import {
    SafeRoomMessage,
    RecordingConfig,
    RecordingState,
    MediaMetadata,
    MediaType
} from '@/types/AdvancedTypes';

const { width: screenWidth } = Dimensions.get('window');

export const AdvancedSafeRoom: React.FC = () => {
    const theme = useTheme();
    const [recordingState, setRecordingState] = useState<RecordingState>({
        status: 'idle',
        mediaType: null,
        startTime: null,
        pauseTime: null,
        currentDuration: 0,
        totalDuration: 0,
        filePath: null,
        config: null,
    });
    const [messages, setMessages] = useState<SafeRoomMessage[]>([]);
    const [showRecordingOptions, setShowRecordingOptions] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<SafeRoomMessage | null>(null);

    useEffect(() => {
        // Sync recording state with service
        const interval = setInterval(() => {
            const currentState = AdvancedMediaService.getRecordingState();
            setRecordingState(currentState);
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const handleStartRecording = async (mediaType: MediaType) => {
        try {
            let newState: RecordingState;

            if (mediaType === 'audio') {
                newState = await AdvancedMediaService.startAudioRecording();
            } else {
                newState = await AdvancedMediaService.startVideoRecording();
            }

            setRecordingState(newState);
            setShowRecordingOptions(false);
        } catch (error) {
            Alert.alert('Recording Error', `Failed to start recording: ${error.message}`);
        }
    };

    const handleStopRecording = async () => {
        try {
            if (recordingState.mediaType === 'audio') {
                const result = await AdvancedMediaService.stopAudioRecording();
                await handleRecordingComplete(result);
            } else if (recordingState.mediaType === 'video') {
                const result = await AdvancedMediaService.stopVideoRecording();
                await handleRecordingComplete(result);
            }
        } catch (error) {
            Alert.alert('Recording Error', `Failed to stop recording: ${error.message}`);
        }
    };

    const handleRecordingComplete = async (result: { uri: string; metadata: MediaMetadata }) => {
        try {
            // Create new message from recording
            const newMessage: SafeRoomMessage = {
                id: `msg_${Date.now()}`,
                type: recordingState.mediaType!,
                content: result.uri,
                metadata: result.metadata,
                authorId: 'current_user',
                authorName: 'You',
                authorAvatar: '👤',
                createdAt: new Date(),
                reactions: [],
                comments: [],
                isPublic: true,
            };

            setMessages(prev => [newMessage, ...prev]);

            Alert.alert(
                'Recording Complete!',
                `${recordingState.mediaType === 'audio' ? 'Audio' : 'Video'} message saved successfully.`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to save recording');
        }
    };

    const handleCancelRecording = async () => {
        await AdvancedMediaService.cancelRecording();
        setRecordingState({
            status: 'idle',
            mediaType: null,
            startTime: null,
            pauseTime: null,
            currentDuration: 0,
            totalDuration: 0,
            filePath: null,
            config: null,
        });
    };

    const formatDuration = (milliseconds: number): string => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const renderRecordingIndicator = () => {
        if (recordingState.status === 'idle') return null;

        return (
            <View style={styles.recordingContainer}>
                <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    style={styles.recordingCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View style={styles.recordingInfo}>
                        <View style={styles.recordingIconContainer}>
                            <Ionicons
                                name={recordingState.mediaType === 'audio' ? 'mic' : 'videocam'}
                                size={24}
                                color="#ffffff"
                            />
                            {recordingState.status === 'recording' && (
                                <View style={styles.recordingDot} />
                            )}
                        </View>

                        <View style={styles.recordingDetails}>
                            <Text style={styles.recordingTitle}>
                                Recording {recordingState.mediaType === 'audio' ? 'Audio' : 'Video'}
                            </Text>
                            <Text style={styles.recordingDuration}>
                                {formatDuration(recordingState.currentDuration)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.recordingControls}>
                        {recordingState.status === 'recording' ? (
                            <AdvancedButton
                                variant="error"
                                size="sm"
                                icon="stop"
                                onPress={handleStopRecording}
                            >
                                Stop
                            </AdvancedButton>
                        ) : (
                            <AdvancedButton
                                variant="primary"
                                size="sm"
                                icon="play"
                                onPress={() => handleStartRecording(recordingState.mediaType!)}
                            >
                                Resume
                            </AdvancedButton>
                        )}

                        <AdvancedButton
                            variant="outline"
                            size="sm"
                            icon="close-circle"
                            onPress={handleCancelRecording}
                            style={styles.cancelButton}
                        >
                            Cancel
                        </AdvancedButton>
                    </View>
                </LinearGradient>
            </View>
        );
    };

    const renderMessage = (message: SafeRoomMessage) => {
        return (
            <AdvancedCard key={message.id} variant="outlined" size="md" style={styles.messageCard}>
                {/* Message Header */}
                <View style={styles.messageHeader}>
                    <View style={styles.authorInfo}>
                        <Text style={styles.authorAvatar}>{message.authorAvatar}</Text>
                        <View style={styles.authorDetails}>
                            <Text style={[theme.typography.textStyles.title, { fontSize: 16 }]}>
                                {message.authorName}
                            </Text>
                            <Text style={[theme.typography.textStyles.caption]}>
                                {message.createdAt.toLocaleDateString()} • {message.createdAt.toLocaleTimeString()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Message Content */}
                <View style={styles.messageContent}>
                    {message.type === 'text' && (
                        <Text style={[theme.typography.textStyles.body, styles.textMessage]}>
                            {message.content}
                        </Text>
                    )}

                    {(message.type === 'audio' || message.type === 'video') && (
                        <MediaPlayer
                            uri={message.content}
                            type={message.type}
                            duration={(message.metadata as MediaMetadata).duration ? (message.metadata as MediaMetadata).duration! * 1000 : 0}
                            size="compact"
                            author={message.authorName}
                            style={styles.messageMedia}
                        />
                    )}
                </View>

                {/* Reactions */}
                {message.reactions.length > 0 && (
                    <View style={styles.reactionsContainer}>
                        {message.reactions.map((reaction) => (
                            <Text key={reaction.id} style={styles.reactionEmoji}>
                                {reaction.type === 'heart' ? '❤️' :
                                    reaction.type === 'love' ? '💝' :
                                        reaction.type === 'hug' ? '🤗' : '👍'}
                            </Text>
                        ))}
                        {message.reactions.length > 1 && (
                            <Text style={[theme.typography.textStyles.caption, styles.reactionCount]}>
                                +{message.reactions.length - 1} more
                            </Text>
                        )}
                    </View>
                )}

                {/* Comments */}
                {message.comments.length > 0 && (
                    <View style={styles.commentsContainer}>
                        {message.comments.map((comment) => (
                            <View key={comment.id} style={styles.commentItem}>
                                <Text style={styles.commentAuthor}>{comment.authorName}:</Text>
                                <Text style={styles.commentText}>{comment.content}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </AdvancedCard>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

            {/* Header */}
            <LinearGradient
                colors={themeUtils.gradients.primary as any}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text style={styles.headerTitle}>SafeMom</Text>
                <Text style={styles.headerSubtitle}>Your family's emotional safe space</Text>

                <AdvancedButton
                    variant="secondary"
                    size="sm"
                    icon="add-circle-outline"
                    onPress={() => setShowRecordingOptions(true)}
                    style={styles.recordButton}
                >
                    Add Message
                </AdvancedButton>
            </LinearGradient>

            {/* Recording Indicator */}
            {renderRecordingIndicator()}

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Introduction Card */}
                <AdvancedCard variant="gradient" size="lg" style={styles.introCard}>
                    <View style={styles.introContent}>
                        <Text style={styles.introTitle}>Welcome to SafeMom</Text>
                        <Text style={styles.introText}>
                            This is a safe space where family members can share thoughts, feelings,
                            voice messages, and videos with loved ones. Every message is private
                            and only visible to our family.
                        </Text>

                        <View style={styles.familyRules}>
                            <Text style={styles.rulesTitle}>SafeMom Guidelines:</Text>
                            <Text style={styles.ruleItem}>💜 Respect and kindness always</Text>
                            <Text style={styles.ruleItem}>🔒 Keep content family-appropriate</Text>
                            <Text style={styles.ruleItem}>🎤 Express yourself freely</Text>
                            <Text style={styles.ruleItem}>🤗 Support each other</Text>
                        </View>
                    </View>
                </AdvancedCard>

                {/* Messages */}
                {messages.map(renderMessage)}
            </ScrollView>

            {/* Recording Options Modal */}
            {showRecordingOptions && (
                <View style={styles.modalOverlay}>
                    <AdvancedCard variant="elevated" size="lg" style={styles.recordingOptionsCard}>
                        <Text style={[theme.typography.textStyles.h3, styles.optionsTitle]}>
                            What would you like to share?
                        </Text>

                        <View style={styles.optionsContainer}>
                            <AdvancedButton
                                variant="primary"
                                size="lg"
                                icon="mic"
                                onPress={() => handleStartRecording('audio')}
                                style={styles.optionButton}
                                gradient={true}
                            >
                                Voice Message
                            </AdvancedButton>

                            <AdvancedButton
                                variant="secondary"
                                size="lg"
                                icon="videocam"
                                onPress={() => handleStartRecording('video')}
                                style={styles.optionButton}
                                gradient={true}
                            >
                                Video Message
                            </AdvancedButton>

                            <AdvancedButton
                                variant="outline"
                                size="lg"
                                icon="text"
                                onPress={() => {
                                    // TODO: Text input modal
                                    setShowRecordingOptions(false);
                                    Alert.alert('Coming Soon', 'Text messages will be available in the next update!');
                                }}
                                style={styles.optionButton}
                            >
                                Text Message
                            </AdvancedButton>
                        </View>

                        <AdvancedButton
                            variant="ghost"
                            size="md"
                            icon="close-circle"
                            onPress={() => setShowRecordingOptions(false)}
                        >
                            Cancel
                        </AdvancedButton>
                    </AdvancedCard>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#E5E7EB',
        marginBottom: 20,
        textAlign: 'center',
    },
    recordButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },

    // Recording Indicator
    recordingContainer: {
        padding: 20,
        backgroundColor: '#FEF2F2',
    },
    recordingCard: {
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    recordingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    recordingIconContainer: {
        position: 'relative',
        marginRight: 12,
    },
    recordingDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
    },
    recordingDetails: {
        flex: 1,
    },
    recordingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    recordingDuration: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    recordingControls: {
        flexDirection: 'row',
        gap: 8,
    },
    cancelButton: {
        borderColor: '#FFFFFF',
        borderWidth: 1,
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },

    // Introduction Card
    introCard: {
        marginTop: 20,
        marginBottom: 24,
    },
    introContent: {
        alignItems: 'center',
    },
    introTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 12,
        textAlign: 'center',
    },
    introText: {
        fontSize: 16,
        color: '#E5E7EB',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 20,
    },
    familyRules: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        width: '100%',
    },
    rulesTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 12,
        textAlign: 'center',
    },
    ruleItem: {
        fontSize: 14,
        color: '#E5E7EB',
        marginBottom: 8,
        textAlign: 'left',
    },

    // Messages
    messageCard: {
        marginBottom: 16,
    },
    messageHeader: {
        marginBottom: 12,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        fontSize: 32,
        marginRight: 12,
    },
    authorDetails: {
        flex: 1,
    },
    messageContent: {
        marginBottom: 12,
    },
    textMessage: {
        fontSize: 16,
        lineHeight: 24,
    },
    messageMedia: {
        marginTop: 8,
    },

    // Reactions
    reactionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    reactionEmoji: {
        fontSize: 18,
    },
    reactionCount: {
        color: '#6B7280',
    },

    // Comments
    commentsContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    commentItem: {
        marginBottom: 8,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },

    // Recording Options Modal
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    recordingOptionsCard: {
        alignItems: 'center',
        maxWidth: 300,
    },
    optionsTitle: {
        marginBottom: 24,
        textAlign: 'center',
    },
    optionsContainer: {
        width: '100%',
        marginBottom: 24,
    },
    optionButton: {
        marginBottom: 16,
    },
});

// Import theme utils
import { themeUtils } from '@/components/ui';
