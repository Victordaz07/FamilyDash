import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import Logger from '@/services/Logger';
import * as FileSystem from 'expo-file-system';

export interface RecordingResult {
    uri: string;
    duration: string;
    size: number;
}

class MediaService {
    private recording: Audio.Recording | null = null;
    private isRecording = false;

    async requestPermissions(): Promise<boolean> {
        try {
            Logger.debug('Requesting audio permissions...');

            const audioPermission = await Audio.requestPermissionsAsync();
            Logger.debug('Audio permission status:', audioPermission.status);

            // Try media library permissions, but don't fail if they're not available in Expo Go
            let mediaPermission = { status: 'granted' }; // Default to granted for Expo Go
            try {
                mediaPermission = await MediaLibrary.requestPermissionsAsync();
                Logger.debug('Media permission status:', mediaPermission.status);
            } catch (mediaError) {
                console.warn('Media library permission request failed (likely in Expo Go):', mediaError);
                Logger.debug('Continuing with audio-only permissions for Expo Go compatibility');
            }

            // For Expo Go, we'll accept just audio permissions
            const audioGranted = audioPermission.status === 'granted';
            const mediaGranted = mediaPermission.status === 'granted';

            Logger.debug('Audio permissions granted:', audioGranted);
            Logger.debug('Media permissions granted:', mediaGranted);
            Logger.debug('Expo Go compatible mode:', !mediaGranted && audioGranted);

            return audioGranted;
        } catch (error) {
            Logger.error('Error requesting permissions:', error);
            return false;
        }
    }

    async startAudioRecording(): Promise<boolean> {
        try {
            Logger.debug('Starting audio recording...');

            if (this.isRecording) {
                Logger.debug('Already recording, returning false');
                return false;
            }

            Logger.debug('Requesting permissions...');
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                Logger.error('Permissions not granted');
                throw new Error('Permissions not granted');
            }

            Logger.debug('Permissions granted, proceeding with recording setup...');

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            Logger.debug('Audio mode set, preparing recording...');

            const recordingOptions = {
                android: {
                    extension: '.m4a',
                    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
                    audioEncoder: Audio.AndroidAudioEncoder.AAC,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.m4a',
                    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
                    audioQuality: Audio.IOSAudioQuality.HIGH,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
                web: {
                    mimeType: 'audio/webm',
                    bitsPerSecond: 128000,
                },
            };

            Logger.debug('Creating recording instance...');
            this.recording = new Audio.Recording();

            Logger.debug('Preparing to record...');
            await this.recording.prepareToRecordAsync(recordingOptions);

            Logger.debug('Starting recording...');
            await this.recording.startAsync();
            this.isRecording = true;

            Logger.debug('Recording started successfully!');
            return true;
        } catch (error) {
            Logger.error('Error starting audio recording:', error);
            return false;
        }
    }

    async stopAudioRecording(): Promise<RecordingResult | null> {
        try {
            if (!this.recording || !this.isRecording) {
                return null;
            }

            await this.recording.stopAndUnloadAsync();
            const uri = this.recording.getURI();
            this.isRecording = false;
            this.recording = null;

            if (!uri) {
                throw new Error('No recording URI');
            }

            // Get file info - handle Expo Go limitations
            let fileSize = 0;
            let duration = 5000; // Default 5 seconds

            try {
                const fileInfo = await FileSystem.getInfoAsync(uri);
                if (fileInfo.exists && 'size' in fileInfo) {
                    fileSize = fileInfo.size || 0;
                }

                duration = await this.getAudioDuration(uri);
            } catch (fileError) {
                console.warn('File system operations failed (Expo Go limitation):', fileError);
                Logger.debug('Using default file size and duration for Expo Go compatibility');
            }

            Logger.debug('Recording completed successfully:', { uri, duration, size: fileSize });

            return {
                uri,
                duration: this.formatDuration(duration),
                size: fileSize,
            };
        } catch (error) {
            Logger.error('Error stopping audio recording:', error);
            return null;
        }
    }

    async cancelAudioRecording(): Promise<void> {
        try {
            if (this.recording && this.isRecording) {
                await this.recording.stopAndUnloadAsync();
                this.isRecording = false;
                this.recording = null;
            }
        } catch (error) {
            Logger.error('Error canceling audio recording:', error);
        }
    }

    private async getAudioDuration(uri: string): Promise<number> {
        try {
            const sound = new Audio.Sound();
            await sound.loadAsync({ uri });
            const status = await sound.getStatusAsync();
            const duration = status.isLoaded ? status.durationMillis || 0 : 0;
            await sound.unloadAsync();
            return duration;
        } catch (error) {
            Logger.error('Error getting audio duration:', error);
            // Return a default duration if we can't get the actual duration
            return 5000; // 5 seconds default
        }
    }

    private formatDuration(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    async playAudio(uri: string): Promise<void> {
        try {
            const sound = new Audio.Sound();
            await sound.loadAsync({ uri });
            await sound.playAsync();

            // Auto-unload after playing
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    sound.unloadAsync();
                }
            });
        } catch (error) {
            Logger.error('Error playing audio:', error);
        }
    }

    async saveToMediaLibrary(uri: string, type: 'audio' | 'video'): Promise<boolean> {
        try {
            const hasPermission = await MediaLibrary.requestPermissionsAsync();
            if (!hasPermission) {
                return false;
            }

            const asset = await MediaLibrary.createAssetAsync(uri);
            return !!asset;
        } catch (error) {
            Logger.error('Error saving to media library:', error);
            return false;
        }
    }

    // Video recording placeholder (would need expo-camera)
    async startVideoRecording(): Promise<boolean> {
        // This would require expo-camera implementation
        Logger.debug('Video recording not implemented yet');
        return false;
    }

    async stopVideoRecording(): Promise<RecordingResult | null> {
        // This would require expo-camera implementation
        Logger.debug('Video recording not implemented yet');
        return null;
    }

    getRecordingStatus(): boolean {
        return this.isRecording;
    }
}

export const mediaService = new MediaService();
