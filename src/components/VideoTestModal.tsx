/**
 * VideoTestModal - Simple test modal to verify video functionality
 */

import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { VideoErrorBoundary } from '../video/VideoErrorBoundary';
import { VideoPlayerView } from '../video/VideoPlayerView';

interface VideoTestModalProps {
    visible: boolean;
    onClose: () => void;
    videoUri: string;
}

export const VideoTestModal: React.FC<VideoTestModalProps> = ({
    visible,
    onClose,
    videoUri
}) => {
    const [testVideoVisible, setTestVideoVisible] = useState(false);

    const handleTestVideo = () => {
        setTestVideoVisible(true);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Video Test</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.infoText}>
                        URI: {videoUri}
                    </Text>
                    <Text style={styles.infoText}>
                        Type: {typeof videoUri}
                    </Text>
                    <Text style={styles.infoText}>
                        Length: {videoUri?.length || 'undefined'}
                    </Text>

                    <TouchableOpacity style={styles.testButton} onPress={handleTestVideo}>
                        <Text style={styles.testButtonText}>Test Video</Text>
                    </TouchableOpacity>

                    {testVideoVisible && (
                        <View style={styles.videoContainer}>
                            <VideoErrorBoundary
                                fallback={
                                    <View style={styles.fallbackContainer}>
                                        <Text style={styles.fallbackText}>
                                            Error loading video
                                        </Text>
                                    </View>
                                }
                            >
                                <VideoPlayerView
                                    uri={videoUri}
                                    visible={testVideoVisible}
                                    autoPlay={true}
                                    loop={false}
                                    muted={false}
                                    useCache={true}
                                    stallTimeoutMs={15000}
                                    maxRetries={3}
                                    onError={(error) => {
                                        console.error('Test video error:', error);
                                    }}
                                    onReady={() => {
                                        console.log('Test video ready');
                                    }}
                                    style={styles.videoPlayer}
                                />
                            </VideoErrorBoundary>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    infoText: {
        color: 'white',
        fontSize: 14,
        marginBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 10,
        borderRadius: 8,
    },
    testButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 20,
    },
    testButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    videoContainer: {
        flex: 1,
        marginTop: 20,
    },
    videoPlayer: {
        flex: 1,
        borderRadius: 8,
    },
    fallbackContainer: {
        flex: 1,
        backgroundColor: '#222',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fallbackText: {
        color: '#666',
        fontSize: 16,
    },
});
