import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ViewStyle,
    Modal,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, AdvancedCard } from '../ui';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type MediaPlayerSize = 'compact' | 'fullscreen' | 'embedded';

interface MediaPlayerProps {
    uri: string;
    type: 'video' | 'audio';
    duration?: number;
    size?: MediaPlayerSize;
    title?: string;
    author?: string;
    style?: ViewStyle;
    autoPlay?: boolean;
    showControls?: boolean;
    onPlay?: () => void;
    onPause?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
    thumbnail?: string;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({
    uri,
    type,
    duration = 0,
    size = 'compact',
    title,
    author,
    style,
    autoPlay = false,
    showControls = true,
    onPlay,
    onPause,
    onEnd,
    onError,
    thumbnail,
}) => {
    const theme = useTheme();
    const videoRef = useRef<Video>(null);

    const [status, setStatus] = useState<any>({});
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Convert milliseconds to formatted time string
    const formatTime = (timeMs: number): string => {
        const totalSeconds = Math.floor(timeMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Get progress percentage
    const getProgress = (): number => {
        if (!status.isLoaded || duration === 0) return 0;
        return (currentTime / duration) * 100;
    };

    // Play/Pause controls
    const handlePlayPause = async () => {
        try {
            if (!videoRef.current || !status.isLoaded) return;

            if (isPlaying) {
                await videoRef.current.pauseAsync();
                setIsPlaying(false);
                onPause?.();
            } else {
                await videoRef.current.playAsync();
                setIsPlaying(true);
                onPlay?.();
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMsg);
            onError?.(errorMsg);
        }
    };

    // Seek to specific time
    const handleSeek = async (timeMs: number) => {
        try {
            if (!videoRef.current || !status.isLoaded) return;
            await videoRef.current.setPositionAsync(timeMs);
        } catch (err) {
            console.error('Error seeking:', err);
        }
    };

    // Status change handler
    const onPlaybackStatusUpdate = (playbackStatus: any) => {
        setStatus(playbackStatus);

        if (playbackStatus.isLoaded) {
            setIsLoading(false);
            setCurrentTime(playbackStatus.positionMillis || 0);

            if (playbackStatus.didJustFinish) {
                setIsPlaying(false);
                setCurrentTime(duration);
                onEnd?.();
            }
        }

        if (playbackStatus.error) {
            setError(playbackStatus.error);
            setIsLoading(false);
            onError?.(playbackStatus.error);
        }
    };

    // Get styles based on size
    const getPlayerStyles = () => {
        switch (size) {
            case 'fullscreen':
                return {
                    container: styles.fullscreenContainer,
                    player: styles.fullscreenPlayer,
                    controls: styles.fullscreenControls,
                };
            case 'embedded':
                return {
                    container: styles.embeddedContainer,
                    player: styles.embeddedPlayer,
                    controls: styles.embeddedControls,
                };
            case 'compact':
            default:
                return {
                    container: styles.compactContainer,
                    player: styles.compactPlayer,
                    controls: styles.compactControls,
                };
        }
    };

    const playerStyles = getPlayerStyles();

    // Render error state
    if (error) {
        return (
            <View style={[styles.errorContainer, style]}>
                <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    Media Error: {error}
                </Text>
            </View>
        );
    }

    // Render audio player (compact variant)
    if (type === 'audio') {
        return (
            <AdvancedCard
                variant="outlined"
                size="md"
                style={[styles.audioContainer, style]}
            >
                <View style={styles.audioHeader}>
                    <View style={styles.audioInfo}>
                        <Text style={[theme.typography.textStyles.title, styles.audioTitle]}>
                            {title || 'Audio Message'}
                        </Text>
                        {author && (
                            <Text style={[theme.typography.textStyles.subtitle, styles.audioAuthor]}>
                                by {author}
                            </Text>
                        )}
                    </View>
                    <View style={styles.audioIcon}>
                        <Ionicons
                            name="musical-notes"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </View>
                </View>

                <View style={styles.audioControls}>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={handlePlayPause}
                        disabled={isLoading}
                    >
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={20}
                            color={theme.colors.white}
                        />
                    </TouchableOpacity>

                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${getProgress()}%`,
                                        backgroundColor: theme.colors.primary,
                                    }
                                ]}
                            />
                        </View>
                    </View>

                    <Text style={[theme.typography.textStyles.caption, styles.timeText]}>
                        {formatTime(currentTime)}
                    </Text>
                </View>
            </AdvancedCard>
        );
    }

    // Render video player
    return (
        <>
            <AdvancedCard
                variant="outlined"
                size="md"
                style={[styles.videoContainer, style]}
            >
                <View style={styles.videoWrapper}>
                    <Video
                        ref={videoRef}
                        style={[styles.videoPlayer, playerStyles.player]}
                        source={{ uri }}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay={isPlaying}
                        isLooping={false}
                        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                        onLoadStart={() => setIsLoading(true)}
                        onLoad={() => setIsLoading(false)}
                    />

                    {/* Loading overlay */}
                    {isLoading && (
                        <View style={styles.loadingOverlay}>
                            <Text style={[styles.loadingText, { color: theme.colors.white }]}>
                                Loading...
                            </Text>
                        </View>
                    )}

                    {/* Controls overlay */}
                    {showControls && (
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                            style={styles.controlsOverlay}
                        >
                            <View style={styles.topControls}>
                                {title && (
                                    <View style={styles.titleContainer}>
                                        <Text style={[styles.videoTitle, { color: theme.colors.white }]}>
                                            {title}
                                        </Text>
                                        {author && (
                                            <Text style={[styles.videoAuthor, { color: theme.colors.white }]}>
                                                by {author}
                                            </Text>
                                        )}
                                    </View>
                                )}

                                {size !== 'fullscreen' && (
                                    <TouchableOpacity
                                        style={styles.fullscreenButton}
                                        onPress={() => setIsFullscreen(true)}
                                    >
                                        <Ionicons name="expand" size={20} color={theme.colors.white} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.bottomControls}>
                                <TouchableOpacity
                                    style={styles.playPauseButton}
                                    onPress={handlePlayPause}
                                >
                                    <Ionicons
                                        name={isPlaying ? "pause" : "play"}
                                        size={24}
                                        color={theme.colors.white}
                                    />
                                </TouchableOpacity>

                                <View style={styles.progressContainer}>
                                    <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                                        <View
                                            style={[
                                                styles.progressBarFill,
                                                {
                                                    width: `${getProgress()}%`,
                                                    backgroundColor: theme.colors.primary,
                                                }
                                            ]}
                                        />
                                    </View>
                                </View>

                                <Text style={[styles.timeText, { color: theme.colors.white }]}>
                                    {formatTime(currentTime)}
                                </Text>
                            </View>
                        </LinearGradient>
                    )}
                </View>
            </AdvancedCard>

            {/* Fullscreen Modal */}
            <Modal
                visible={isFullscreen}
                animationType="fade"
                presentationStyle="fullScreen"
                onRequestClose={() => setIsFullscreen(false)}
            >
                <MediaPlayer
                    uri={uri}
                    type={type}
                    duration={duration}
                    size="fullscreen"
                    title={title}
                    author={author}
                    autoPlay={false}
                    showControls={true}
                    onPlay={onPlay}
                    onPause={onPause}
                    onEnd={() => {
                        setIsFullscreen(false);
                        onEnd?.();
                    }}
                    onError={onError}
                />
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    // Video Container Styles
    videoContainer: {
        overflow: 'hidden',
    },
    videoWrapper: {
        position: 'relative',
        backgroundColor: '#000',
    },

    // Player Sizes
    compactPlayer: {
        height: 200,
        width: '100%',
    },
    embeddedPlayer: {
        height: 120,
        width: '100%',
    },
    fullscreenPlayer: {
        height: screenHeight,
        width: screenWidth,
    },

    // Control Overlays
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '500',
    },

    controlsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
        padding: 16,
    },

    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleContainer: {
        flex: 1,
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    videoAuthor: {
        fontSize: 12,
        opacity: 0.8,
    },
    fullscreenButton: {
        padding: 8,
    },

    bottomControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    playPauseButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 24,
        padding: 12,
        minWidth: 48,
        alignItems: 'center',
    },

    // Progress Bar
    progressContainer: {
        flex: 1,
        paddingHorizontal: 8,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },

    // Time Text
    timeText: {
        fontSize: 12,
        fontWeight: '500',
        minWidth: 40,
    },

    // Audio Container Styles
    audioContainer: {
        padding: 16,
    },
    audioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    audioInfo: {
        flex: 1,
    },
    audioTitle: {
        marginBottom: 2,
    },
    audioAuthor: {
        opacity: 0.7,
    },
    audioIcon: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 8,
    },

    audioControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    playButton: {
        backgroundColor: '#8B5CF6',
        borderRadius: 20,
        padding: 12,
        minWidth: 40,
        alignItems: 'center',
    },

    // Error Styles
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
        gap: 8,
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
});
