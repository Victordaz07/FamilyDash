/**
 * 🎥 Video Test Component - Para probar el reproductor de video
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface VideoTestComponentProps {
    videoUri?: string;
}

export const VideoTestComponent: React.FC<VideoTestComponentProps> = ({
    videoUri = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Crear player de video
    const player = useVideoPlayer(videoUri, (player) => {
        player.loop = false;
        player.muted = true; // Muted para preview
    });

    const handlePlayPause = () => {
        try {
            if (isPlaying) {
                player.pause();
                setIsPlaying(false);
            } else {
                player.play();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error playing video:', error);
            Alert.alert('Error', 'No se pudo reproducir el video');
            setHasError(true);
        }
    };

    if (hasError) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="videocam-off" size={48} color="#666" />
                <Text style={styles.errorText}>Error al cargar el video</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => setHasError(false)}
                >
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎥 Prueba de Video</Text>
            <Text style={styles.subtitle}>URI: {videoUri}</Text>

            <View style={styles.videoContainer}>
                <VideoView
                    style={styles.videoPlayer}
                    player={player}
                    nativeControls={false}
                    contentFit="contain"
                />

                {/* Overlay de controles */}
                <View style={styles.controlsOverlay}>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={handlePlayPause}
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
                            style={styles.playButtonGradient}
                        >
                            <Ionicons
                                name={isPlaying ? "pause" : "play"}
                                size={32}
                                color="white"
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    Estado: {isPlaying ? 'Reproduciendo' : 'Pausado'}
                </Text>
                <Text style={styles.infoText}>
                    Player creado: {player ? '✅' : '❌'}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
    videoContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#000',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
    },
    videoPlayer: {
        width: '100%',
        height: '100%',
    },
    controlsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        borderRadius: 50,
        overflow: 'hidden',
    },
    playButtonGradient: {
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    infoText: {
        fontSize: 14,
        marginBottom: 8,
        color: '#333',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});

export default VideoTestComponent;
