import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import {
    RecordingConfig,
    RecordingState,
    MediaMetadata,
    SafeRoomMessage,
    MediaType
} from '../types/AdvancedTypes';

export class AdvancedMediaService {
    private static audioRecording: Audio.Recording | null = null;
    private static cameraRef: Camera | null = null;
    private static recordingState: RecordingState = {
        status: 'idle',
        mediaType: null,
        startTime: null,
        pauseTime: null,
        currentDuration: 0,
        totalDuration: 0,
        filePath: null,
        config: null,
    };

    // Permissions
    static async requestPermissions(): Promise<boolean> {
        try {
            const [audioStatus, cameraStatus, mediaLibraryStatus] = await Promise.all([
                Audio.requestPermissionsAsync(),
                Camera.requestCameraPermissionsAsync(),
                MediaLibrary.requestPermissionsAsync(),
            ]);

            const hasPermissions =
                audioStatus.status === 'granted' &&
                cameraStatus.status === 'granted' &&
                mediaLibraryStatus.status === 'granted';

            if (!hasPermissions) {
                Alert.alert(
                    'Permissions Required',
                    'SafeRoom needs access to your microphone, camera, and media library to record voice and video messages.',
                    [{ text: 'OK' }]
                );
            }

            return hasPermissions;
        } catch (error) {
            console.error('Error requesting permissions:', error);
            return false;
        }
    }

    // Audio Recording
    static async startAudioRecording(config: RecordingConfig = this.getDefaultConfig()) {
        try {
            const hasPermissions = await this.requestPermissions();
            if (!hasPermissions) {
                throw new Error('Permissions not granted');
            }

            // Stop any existing recording
            if (this.audioRecording) {
                await this.stopAudioRecording();
            }

            // Configure audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            // Start recording
            this.recordingState = {
                status: 'recording',
                mediaType: 'audio',
                startTime: new Date(),
                pauseTime: null,
                currentDuration: 0,
                totalDuration: 0,
                filePath: null,
                config,
            };

            this.audioRecording = new Audio.Recording();
            await this.audioRecording.prepareToRecordAsync({
                android: {
                    extension: `.${config.audio.format}`,
                    outputFormat: config.audio.format === 'mp3' ? Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT : Audio.ANDROID_AUDIO_FORMAT_PCM_16bit,
                    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
                    sampleRate: config.audio.sampleRate || 44100,
                    numberOfChannels: config.audio.channels || 2,
                    bitRate: config.audio.quality === 'high' ? 256000 : config.audio.quality === 'medium' ? 128000 : 64000,
                },
                ios: {
                    extension: `.${config.audio.format}`,
                    outputFormat: Audio.IOS_OUTPUT_FORMAT_MPEG4AAC,
                    audioQuality: config.audio.quality === 'high' ? Audio.IOS_AUDIO_QUALITY_MAX : config.audio.quality === 'medium' ? Audio.IOS_AUDIO_QUALITY_HIGH : Audio.IOS_AUDIO_QUALITY_MEDIUM,
                    sampleRate: config.audio.sampleRate || 44100,
                    numberOfChannels: config.audio.channels || 2,
                    bitRate: config.audio.quality === 'high' ? 256000 : config.audio.quality === 'medium' ? 128000 : 64000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
                web: {
                    mimeType: 'audio/webm',
                    bitsPerSecond: config.audio.quality === 'high' ? 256000 : config.audio.quality === 'medium' ? 128000 : 64000,
                },
            });

            await this.audioRecording.startAsync();

            // Start duration timer
            this.startDurationTimer();

            return this.recordingState;
        } catch (error) {
            console.error('Error starting audio recording:', error);
            this.recordingState = {
                ...this.recordingState,
                status: 'error',
                error: error.message,
            };
            throw error;
        }
    }

    static async pauseAudioRecording() {
        try {
            if (!this.audioRecording) {
                throw new Error('No active audio recording');
            }

            await this.audioRecording.pauseAsync();
            this.recordingState.status = 'paused';
            this.recordingState.pauseTime = new Date();

            return this.recordingState;
        } catch (error) {
            console.error('Error pausing audio recording:', error);
            throw error;
        }
    }

    static async resumeAudioRecording() {
        try {
            if (!this.audioRecording) {
                throw new Error('No active audio recording');
            }

            await this.audioRecording.startAsync();
            this.recordingState.status = 'recording';
            this.recordingState.pauseTime = null;

            return this.recordingState;
        } catch (error) {
            console.error('Error resuming audio recording:', error);
            throw error;
        }
    }

    static async stopAudioRecording(): Promise<{ uri: string; metadata: MediaMetadata }> {
        try {
            if (!this.audioRecording) {
                throw new Error('No active audio recording');
            }

            this.recordingState.status = 'processing';
            await this.audioRecording.stopAndUnloadAsync();

            const uri = this.audioRecording.getURI();
            if (!uri) {
                throw new Error('Failed to get recording URI');
            }

            // Get file info
            const fileInfo = await FileSystem.getInfoAsync(uri);
            const duration = this.recordingState.currentDuration;

            // Create metadata
            const metadata: MediaMetadata = {
                duration: duration / 1000, // Convert to seconds
                size: fileInfo.size || 0,
                format: this.recordingState.config?.audio.format || 'mp3',
                quality: this.recordingState.config?.audio.quality || 'medium',
                thumbnail: '', // Will be generated if needed
            };

            this.recordingState = {
                ...this.recordingState,
                status: 'completed',
                filePath: uri,
                totalDuration: duration,
            };

            this.audioRecording = null;
            this.stopDurationTimer();

            return { uri, metadata };
        } catch (error) {
            console.error('Error stopping audio recording:', error);
            this.recordingState = {
                ...this.recordingState,
                status: 'error',
                error: error.message,
            };
            this.audioRecording = null;
            throw error;
        }
    }

    // Video Recording
    static async startVideoRecording(config: RecordingConfig = this.getDefaultConfig()) {
        try {
            const hasPermissions = await this.requestPermissions();
            if (!hasPermissions) {
                throw new Error('Permissions not granted');
            }

            this.recordingState = {
                status: 'recording',
                mediaType: 'video',
                startTime: new Date(),
                pauseTime: null,
                currentDuration: 0,
                totalDuration: 0,
                filePath: null,
                config,
            };

            // Start duration timer for video
            this.startDurationTimer();

            return this.recordingState;
        } catch (error) {
            console.error('Error starting video recording:', error);
            this.recordingState = {
                ...this.recordingState,
                status: 'error',
                error: error.message,
            };
            throw error;
        }
    }

    static async stopVideoRecording(): Promise<{ uri: string; metadata: MediaMetadata }> {
        try {
            if (this.recordingState.mediaType !== 'video') {
                throw new Error('No active video recording');
            }

            this.recordingState.status = 'processing';

            // Generate mock URI for now (will be replaced with actual camera implementation)
            const uri = `${FileSystem.documentDirectory}safemom_video_${Date.now()}.mp4`;

            // Mock metadata
            const metadata: MediaMetadata = {
                duration: this.recordingState.currentDuration / 1000,
                size: 1024 * 1024, // Mock 1MB
                width: 1280,
                height: 720,
                format: 'mp4',
                quality: this.recordingState.config?.video?.quality || 'medium',
                thumbnail: `${FileSystem.documentDirectory}thumbnail_${Date.now()}.jpg`,
            };

            this.recordingState = {
                ...this.recordingState,
                status: 'completed',
                filePath: uri,
                totalDuration: this.recordingState.currentDuration,
            };

            this.stopDurationTimer();

            return { uri, metadata };
        } catch (error) {
            console.error('Error stopping video recording:', error);
            this.recordingState = {
                ...this.recordingState,
                status: 'error',
                error: error.message,
            };
            throw error;
        }
    }

    // Get recording state
    static getRecordingState(): RecordingState {
        return { ...this.recordingState };
    }

    // Stop all recordings
    static async cancelRecording() {
        try {
            if (this.recordingState.mediaType === 'audio' && this.audioRecording) {
                await this.audioRecording.stopAndUnloadAsync();
                this.audioRecording = null;
            }

            this.recordingState = {
                status: 'idle',
                mediaType: null,
                startTime: null,
                pauseTime: null,
                currentDuration: 0,
                totalDuration: 0,
                filePath: null,
                config: null,
            };

            this.stopDurationTimer();
        } catch (error) {
            console.error('Error canceling recording:', error);
        }
    }

    // Duration timer management
    private static durationTimerInterval: NodeJS.Timer | null = null;

    private static startDurationTimer() {
        if (this.durationTimerInterval) {
            clearInterval(this.durationTimerInterval);
        }

        this.durationTimerInterval = setInterval(() => {
            if (this.recordingState.startTime && this.recordingState.status === 'recording') {
                const now = Date.now();
                const startTime = this.recordingState.startTime.getTime();
                const pauseTime = this.recordingState.pauseTime?.getTime();

                if (pauseTime) {
                    // Recording is paused, don't update duration
                    return;
                }

                this.recordingState.currentDuration = now - startTime;
            }
        }, 100); // Update every 100ms for smooth progress
    }

    private static stopDurationTimer() {
        if (this.durationTimerInterval) {
            clearInterval(this.durationTimerInterval);
            this.durationTimerInterval = null;
        }
    }

    // Default configuration
    static getDefaultConfig(): RecordingConfig {
        return {
            audio: {
                quality: 'high',
                sampleRate: 44100,
                channels: 2,
                format: 'mp3',
            },
            video: {
                quality: 'high',
                resolution: { width: 1280, height: 720 },
                frameRate: 30,
                format: 'mp4',
                audioEnabled: true,
            },
        };
    }

    // File management
    static async saveToGallery(uri: string): Promise<void> {
        try {
            const asset = await MediaLibrary.createAssetAsync(uri);
            await MediaLibrary.createAlbumAsync('SafeMom', asset, true);
        } catch (error) {
            console.error('Error saving to gallery:', error);
            throw error;
        }
    }

    static async generateThumbnail(uri: string): Promise<string> {
        try {
            // For now, return empty string - actual implementation would generate thumbnail
            // In a real implementation, you'd use ffmpeg or similar library
            return '';
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            return '';
        }
    }

    static async compressMedia(uri: string, mediaType: MediaType): Promise<string> {
        try {
            // For now, return original URI
            // In a real implementation, you'd compress the media file
            return uri;
        } catch (error) {
            console.error('Error compressing media:', error);
            return uri;
        }
    }

    static async getMediaMetadata(uri: string): Promise<MediaMetadata> {
        try {
            const fileInfo = await FileSystem.getInfoAsync(uri);

            return {
                duration: 0, // Would be extracted from file
                size: fileInfo.size || 0,
                width: undefined,
                height: undefined,
                format: uri.split('.').pop() || 'mp4',
                quality: 'medium',
                thumbnail: '',
            };
        } catch (error) {
            console.error('Error getting media metadata:', error);
            throw error;
        }
    }
}
