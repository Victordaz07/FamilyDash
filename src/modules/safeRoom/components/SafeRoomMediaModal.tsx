/**
 * SafeRoomMediaModal - Modal for previewing multimedia content in SafeRoom
 * Based on TaskPreviewModal but adapted for SafeRoom context
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useThemeColors, useThemeFonts, useThemeGradient } from '@/contexts/ThemeContext';
import { SafeRoomAttachment, SafeRoomMessage } from '@/types/safeRoomTypes';
import { VideoErrorBoundary } from '../../../video/VideoErrorBoundary';
import { VideoPlayerViewSimple } from '../../../video/VideoPlayerViewSimple';

const { width, height } = Dimensions.get('window');

// Video Preview Component using the robust VideoPlayerView
const VideoPreview: React.FC<{ uri: string; onPress: () => void }> = ({ uri, onPress }) => {
    return (
        <TouchableOpacity
            style={styles.videoContainer}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <VideoPlayerViewSimple
                uri={uri}
                visible={true}
                autoPlay={false}
                loop={false}
                muted={true}
                stallTimeoutMs={12000}
                maxRetries={2}
                onError={(error) => {
                    console.warn('SafeRoom video preview error:', error);
                }}
                style={styles.mediaVideo}
            />
            <View style={styles.mediaOverlay}>
                <Ionicons name="play" size={32} color="white" />
            </View>
        </TouchableOpacity>
    );
};

interface SafeRoomMediaModalProps {
    visible: boolean;
    message: SafeRoomMessage | null;
    attachment: SafeRoomAttachment | null;
    onClose: () => void;
    onReaction?: (messageId: string, reactionType: string) => void;
}

const SafeRoomMediaModal: React.FC<SafeRoomMediaModalProps> = ({
    visible,
    message,
    attachment,
    onClose,
    onReaction
}) => {
    const colors = useThemeColors();
    const fonts = useThemeFonts();
    const gradient = useThemeGradient();

    // Video modal state - Hooks must be at the top
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);

    // Image modal state
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

    // Audio player state
    const [audioSound, setAudioSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [playbackDuration, setPlaybackDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const playbackStatusUpdateInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!visible) {
            setVideoModalVisible(false);
            setSelectedVideoUri(null);
            setImageModalVisible(false);
            setSelectedImageUri(null);
            stopAudio();
        }
    }, [visible]);

    // Cleanup audio when component unmounts
    useEffect(() => {
        return () => {
            stopAudio();
            if (playbackStatusUpdateInterval.current) {
                clearInterval(playbackStatusUpdateInterval.current);
            }
        };
    }, []);

    const loadAudio = async (uri: string) => {
        try {
            setIsLoading(true);
            
            // Stop any existing audio
            if (audioSound) {
                await audioSound.unloadAsync();
            }

            // Create new sound instance
            const { sound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: false },
                onPlaybackStatusUpdate
            );

            setAudioSound(sound);
            setIsLoading(false);
        } catch (error) {
            console.error('Error loading audio:', error);
            setIsLoading(false);
            Alert.alert('Error', 'No se pudo cargar el audio');
        }
    };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            setPlaybackPosition(status.positionMillis || 0);
            setPlaybackDuration(status.durationMillis || 0);
            
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPlaybackPosition(0);
                if (audioSound) {
                    audioSound.setPositionAsync(0);
                }
            }
        }
    };

    const playAudio = async () => {
        try {
            if (!audioSound) {
                if (attachment?.url) {
                    await loadAudio(attachment.url);
                    return;
                } else {
                    Alert.alert('Error', 'No hay audio para reproducir');
                    return;
                }
            }

            if (isPlaying) {
                await audioSound.pauseAsync();
            } else {
                await audioSound.playAsync();
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            Alert.alert('Error', 'No se pudo reproducir el audio');
        }
    };

    const stopAudio = async () => {
        try {
            if (audioSound) {
                await audioSound.stopAsync();
                await audioSound.unloadAsync();
                setAudioSound(null);
                setIsPlaying(false);
                setPlaybackPosition(0);
                setPlaybackDuration(0);
            }
        } catch (error) {
            console.error('Error stopping audio:', error);
        }
    };

    const seekAudio = async (position: number) => {
        try {
            if (audioSound && playbackDuration > 0) {
                const seekPosition = (position / 100) * playbackDuration;
                await audioSound.setPositionAsync(seekPosition);
                setPlaybackPosition(seekPosition);
            }
        } catch (error) {
            console.error('Error seeking audio:', error);
        }
    };

    const handleVideoPress = (videoUrl: string) => {
        console.log('Opening SafeRoom video modal with URL:', videoUrl);
        setSelectedVideoUri(videoUrl);
        setVideoModalVisible(true);
    };

    const handleImagePress = (imageUrl: string) => {
        console.log('Opening SafeRoom image modal with URL:', imageUrl);
        setSelectedImageUri(imageUrl);
        setImageModalVisible(true);
    };

    const closeVideoModal = () => {
        setVideoModalVisible(false);
        setSelectedVideoUri(null);
    };

    const closeImageModal = () => {
        setImageModalVisible(false);
        setSelectedImageUri(null);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatTime = (milliseconds: number) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (!message || !attachment) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <LinearGradient
                    colors={gradient.safeRoom}
                    style={styles.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    
                    <View style={styles.headerContent}>
                        <Text style={[styles.headerTitle, { fontSize: fonts.h2 }]}>
                            Safe Room Media
                        </Text>
                        <Text style={[styles.headerSubtitle, { fontSize: fonts.caption }]}>
                            Shared by {message.sender}
                        </Text>
                    </View>

                    <View style={styles.headerActions}>
                        {onReaction && (
                            <TouchableOpacity
                                style={styles.reactionButton}
                                onPress={() => onReaction(message.id, 'heart')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="heart" size={20} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>
                </LinearGradient>

                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Message Info */}
                    <View style={[styles.messageCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.messageHeader}>
                            <View style={styles.senderInfo}>
                                <View style={[styles.avatar, { backgroundColor: '#FF6B9D' }]}>
                                    <Text style={styles.avatarText}>
                                        {message.sender.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={[styles.senderName, { color: colors.text, fontSize: fonts.body }]}>
                                        {message.sender}
                                    </Text>
                                    <Text style={[styles.messageTime, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                                        {formatDate(message.timestamp)}
                                    </Text>
                                </View>
                            </View>
                            
                            {message.mood && (
                                <View style={styles.moodBadge}>
                                    <Text style={styles.moodEmoji}>{message.mood}</Text>
                                </View>
                            )}
                        </View>

                        {message.content && (
                            <Text style={[styles.messageContent, { color: colors.text, fontSize: fonts.body }]}>
                                {message.content}
                            </Text>
                        )}

                        <View style={styles.messageMeta}>
                            <View style={styles.metaItem}>
                                <Ionicons
                                    name={attachment.type === 'video' ? 'videocam' : 
                                          attachment.type === 'image' ? 'image' : 
                                          attachment.type === 'voice' ? 'mic' : 'musical-notes'}
                                    size={16}
                                    color="#FF6B9D"
                                />
                                <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                                    {attachment.type.toUpperCase()}
                                </Text>
                            </View>

                            {attachment.duration && (
                                <View style={styles.metaItem}>
                                    <Ionicons name="time" size={16} color={colors.textSecondary} />
                                    <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                                        {attachment.duration}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.metaItem}>
                                <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                                <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                                    Shared: {formatDate(message.timestamp)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Media Content */}
                    <View style={[styles.mediaCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                            {attachment.title}
                        </Text>

                        <View style={styles.mediaContainer}>
                            {attachment.type === 'video' ? (
                                <VideoErrorBoundary
                                    fallback={
                                        <View style={styles.videoContainer}>
                                            <View style={styles.errorContainer}>
                                                <Ionicons name="videocam-off" size={32} color="#666" />
                                                <Text style={styles.errorText}>Error de video</Text>
                                            </View>
                                        </View>
                                    }
                                    onError={(error, errorInfo) => {
                                        console.error('SafeRoom Video Error Boundary triggered:', error, errorInfo);
                                    }}
                                >
                                    <VideoPreview
                                        uri={attachment.url}
                                        onPress={() => handleVideoPress(attachment.url)}
                                    />
                                </VideoErrorBoundary>
                            ) : attachment.type === 'image' ? (
                                <TouchableOpacity
                                    style={styles.imageContainer}
                                    onPress={() => handleImagePress(attachment.url)}
                                    activeOpacity={0.8}
                                >
                                    <Image
                                        source={{ uri: attachment.url }}
                                        style={styles.mediaImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.mediaOverlay}>
                                        <Ionicons name="expand" size={24} color="white" />
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.audioContainer}>
                                    {/* Audio Player */}
                                    <TouchableOpacity
                                        style={[
                                            styles.audioButton, 
                                            { backgroundColor: isPlaying ? '#10B981' : '#FF6B9D' }
                                        ]}
                                        onPress={playAudio}
                                        activeOpacity={0.8}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <View style={styles.loadingSpinner}>
                                                <Text style={styles.loadingText}>...</Text>
                                            </View>
                                        ) : (
                                            <Ionicons 
                                                name={isPlaying ? 'pause' : (attachment.type === 'voice' ? 'mic' : 'musical-notes')} 
                                                size={32} 
                                                color="white" 
                                            />
                                        )}
                                    </TouchableOpacity>

                                    <Text style={[styles.audioLabel, { color: colors.text, fontSize: fonts.body }]}>
                                        {attachment.type === 'voice' ? 'Voice Message' : 'Audio File'}
                                    </Text>

                                    {/* Progress Bar */}
                                    {playbackDuration > 0 && (
                                        <View style={styles.progressContainer}>
                                            <View style={styles.progressBar}>
                                                <View 
                                                    style={[
                                                        styles.progressFill, 
                                                        { 
                                                            width: `${(playbackPosition / playbackDuration) * 100}%`,
                                                            backgroundColor: '#FF6B9D'
                                                        }
                                                    ]} 
                                                />
                                            </View>
                                            <View style={styles.timeContainer}>
                                                <Text style={[styles.timeText, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                                                    {formatTime(playbackPosition)}
                                                </Text>
                                                <Text style={[styles.timeText, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                                                    {formatTime(playbackDuration)}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Duration from metadata */}
                                    {attachment.duration && !playbackDuration && (
                                        <Text style={[styles.audioDuration, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                                            Duration: {attachment.duration}
                                        </Text>
                                    )}
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                        <View style={[styles.reactionsCard, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                                Family Reactions ({message.reactions.length})
                            </Text>
                            <View style={styles.reactionsList}>
                                {message.reactions.map((reaction, index) => (
                                    <View key={index} style={styles.reactionItem}>
                                        <Ionicons 
                                            name={reaction.type === 'heart' ? 'heart' : 
                                                  reaction.type === 'support' ? 'hand-left' :
                                                  reaction.type === 'listen' ? 'ear' : 'care'}
                                            size={16} 
                                            color="#FF6B9D" 
                                        />
                                        <Text style={[styles.reactionText, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                                            {reaction.userName} {reaction.type}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Video Player Modal */}
                <Modal
                    visible={videoModalVisible}
                    animationType="slide"
                    presentationStyle="fullScreen"
                    onRequestClose={closeVideoModal}
                >
                    <View style={styles.videoModalContainer}>
                        {/* Close button */}
                        <TouchableOpacity
                            style={styles.videoModalCloseButton}
                            onPress={closeVideoModal}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                                style={styles.videoModalCloseButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="close" size={24} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Video Player */}
                        <VideoErrorBoundary
                            fallback={
                                <View style={styles.videoModalFallback}>
                                    <Ionicons name="videocam-off" size={64} color="#666" />
                                    <Text style={styles.videoModalFallbackText}>
                                        No se pudo reproducir el video
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.videoModalRetryButton}
                                        onPress={closeVideoModal}
                                    >
                                        <Text style={styles.videoModalRetryButtonText}>Cerrar</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            onError={(error, errorInfo) => {
                                console.error('SafeRoom Video Modal Error Boundary triggered:', error, errorInfo);
                            }}
                        >
                            {selectedVideoUri && (
                                <VideoPlayerViewSimple
                                    uri={selectedVideoUri}
                                    visible={videoModalVisible}
                                    autoPlay={true}
                                    loop={false}
                                    muted={false}
                                    stallTimeoutMs={15000}
                                    maxRetries={3}
                                    onError={(error) => {
                                        console.error('SafeRoom video modal error:', error);
                                        console.error('Video URI:', selectedVideoUri);
                                        console.error('Error details:', JSON.stringify(error, null, 2));
                                    }}
                                    onReady={() => {
                                        console.log('SafeRoom video modal is ready to play');
                                        console.log('Video URI:', selectedVideoUri);
                                    }}
                                    style={styles.videoModalPlayer}
                                />
                            )}
                        </VideoErrorBoundary>
                    </View>
                </Modal>

                {/* Image Modal */}
                <Modal
                    visible={imageModalVisible}
                    animationType="fade"
                    presentationStyle="fullScreen"
                    onRequestClose={closeImageModal}
                >
                    <View style={styles.imageModalContainer}>
                        <TouchableOpacity
                            style={styles.imageModalCloseButton}
                            onPress={closeImageModal}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                        
                        {selectedImageUri && (
                            <Image
                                source={{ uri: selectedImageUri }}
                                style={styles.imageModalImage}
                                resizeMode="contain"
                            />
                        )}
                    </View>
                </Modal>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        gap: 16,
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        color: 'white',
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    reactionButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    messageCard: {
        borderRadius: 16,
        padding: 20,
        marginVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    senderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    senderName: {
        fontWeight: '600',
    },
    messageTime: {
        marginTop: 2,
    },
    moodBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255, 107, 157, 0.1)',
        borderRadius: 16,
    },
    moodEmoji: {
        fontSize: 20,
    },
    messageContent: {
        lineHeight: 24,
        marginBottom: 16,
    },
    messageMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontWeight: '500',
    },
    mediaCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    mediaContainer: {
        alignItems: 'center',
    },
    videoContainer: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: '#000',
        overflow: 'hidden',
        position: 'relative',
    },
    mediaVideo: {
        width: '100%',
        height: '100%',
    },
    mediaOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    mediaImage: {
        width: '100%',
        height: '100%',
    },
    audioContainer: {
        alignItems: 'center',
        padding: 40,
    },
    audioButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    loadingSpinner: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    audioLabel: {
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    audioDuration: {
        fontWeight: '500',
        marginTop: 8,
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 16,
    },
    progressBar: {
        width: '80%',
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginTop: 8,
    },
    timeText: {
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#666',
        marginTop: 8,
        fontSize: 14,
    },
    reactionsCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    reactionsList: {
        gap: 12,
    },
    reactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reactionText: {
        fontWeight: '500',
    },
    // Video Modal Styles
    videoModalContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoModalCloseButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1000,
    },
    videoModalCloseButtonGradient: {
        padding: 12,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoModalPlayer: {
        width: width,
        height: height * 0.8,
    },
    videoModalFallback: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    videoModalFallbackText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 20,
    },
    videoModalRetryButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    videoModalRetryButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    // Image Modal Styles
    imageModalContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageModalCloseButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1000,
        padding: 12,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    imageModalImage: {
        width: width,
        height: height,
    },
});

export default SafeRoomMediaModal;
