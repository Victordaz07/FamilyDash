import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';

const PermissionTest: React.FC = () => {
    const [audioPermission, setAudioPermission] = useState<string>('unknown');
    const [mediaPermission, setMediaPermission] = useState<string>('unknown');

    useEffect(() => {
        checkPermissions();
    }, []);

    const checkPermissions = async () => {
        try {
            const audioStatus = await Audio.getPermissionsAsync();
            const mediaStatus = await MediaLibrary.getPermissionsAsync();

            setAudioPermission(audioStatus.status);
            setMediaPermission(mediaStatus.status);

            console.log('Audio permission:', audioStatus.status);
            console.log('Media permission:', mediaStatus.status);
        } catch (error) {
            console.error('Error checking permissions:', error);
        }
    };

    const requestPermissions = async () => {
        try {
            console.log('Requesting permissions...');

            const audioResult = await Audio.requestPermissionsAsync();
            const mediaResult = await MediaLibrary.requestPermissionsAsync();

            setAudioPermission(audioResult.status);
            setMediaPermission(mediaResult.status);

            console.log('Audio permission result:', audioResult.status);
            console.log('Media permission result:', mediaResult.status);

            if (audioResult.status === 'granted' && mediaResult.status === 'granted') {
                Alert.alert('Success', 'All permissions granted!');
            } else {
                Alert.alert('Permissions', `Audio: ${audioResult.status}, Media: ${mediaResult.status}`);
            }
        } catch (error) {
            console.error('Error requesting permissions:', error);
            Alert.alert('Error', 'Failed to request permissions');
        }
    };

    const testRecording = async () => {
        try {
            if (audioPermission !== 'granted') {
                Alert.alert('Error', 'Audio permission not granted');
                return;
            }

            console.log('Testing recording...');

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const recording = new Audio.Recording();

            const recordingOptions = {
                android: {
                    extension: '.m4a',
                    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
                    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.m4a',
                    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
                    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                },
            };

            await recording.prepareToRecordAsync(recordingOptions);
            await recording.startAsync();

            Alert.alert('Success', 'Recording started!');

            // Stop after 2 seconds
            setTimeout(async () => {
                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();
                console.log('Recording URI:', uri);
                Alert.alert('Success', `Recording saved to: ${uri}`);
            }, 2000);

        } catch (error) {
            console.error('Error testing recording:', error);
            Alert.alert('Error', `Recording failed: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Permission Test</Text>

            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>Audio Permission: {audioPermission}</Text>
                <Text style={styles.statusText}>Media Permission: {mediaPermission}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={checkPermissions}>
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.buttonText}>Check Permissions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={requestPermissions}>
                <Ionicons name="shield-checkmark" size={20} color="white" />
                <Text style={styles.buttonText}>Request Permissions</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, audioPermission !== 'granted' && styles.disabledButton]}
                onPress={testRecording}
                disabled={audioPermission !== 'granted'}
            >
                <Ionicons name="mic" size={20} color="white" />
                <Text style={styles.buttonText}>Test Recording</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#1F2937',
    },
    statusContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    statusText: {
        fontSize: 16,
        marginBottom: 10,
        color: '#374151',
    },
    button: {
        backgroundColor: '#EC4899',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
});

export default PermissionTest;
