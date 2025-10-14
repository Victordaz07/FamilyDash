import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors, useThemeFonts, useThemeGradient } from '@/contexts/ThemeContext';
import { useAuth } from '@/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RealDatabaseService from '@/services/database/RealDatabaseService';
import SafeRoomService from '@/services/SafeRoomService';
import { Audio } from 'expo-av';

export default function VoiceMessageScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const colors = useThemeColors();
    const fonts = useThemeFonts();
    const gradient = useThemeGradient();

    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [recordingUri, setRecordingUri] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        requestPermissions();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRecording) {
            // Start pulsing animation
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulseAnimation.start();

            // Update recording duration
            interval = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
            pulseAnim.stopAnimation();
        };
    }, [isRecording]);

    const requestPermissions = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please allow microphone access to record voice messages.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error requesting permissions:', error);
        }
    };

    const startRecording = async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                Alert.alert(
                    'Permission Required',
                    'Please allow microphone access to record voice messages.'
                );
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
            setIsRecording(true);
            setRecordingDuration(0);

            console.log('Recording started');
        } catch (error) {
            console.error('Failed to start recording:', error);
            Alert.alert('Error', 'Failed to start recording. Please try again.');
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        try {
            console.log('🛑 Stopping recording...');
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            console.log('🎵 Recording URI:', uri);

            setRecordingUri(uri);
            setIsRecording(false);
            setRecording(null);

            console.log('✅ Recording stopped successfully');
        } catch (error) {
            console.error('❌ Failed to stop recording:', error);
            Alert.alert('Error', 'Failed to stop recording.');
        }
    };

    const handleSave = async () => {
        console.log('💾 Starting voice message save process...');
        console.log('📁 Recording URI:', recordingUri);
        console.log('⏱️ Recording duration:', recordingDuration);
        console.log('👤 Current user:', user?.uid || 'anonymous');

        if (!recordingUri) {
            console.log('❌ No recording URI found');
            Alert.alert('No Recording', 'Please record a message first.');
            return;
        }

        setIsLoading(true);

        try {
            // Use SafeRoomService for centralized message management
            await SafeRoomService.addMessage({
                type: 'voice',
                content: recordingUri,
                userId: user?.uid || 'anonymous',
                sender: user?.displayName || user?.email || 'Anonymous',
                duration: recordingDuration
            });

            // Update stats
            await updateStats('message');

            Alert.alert(
                'Voice Message Saved! 🎤',
                'Your voice message has been shared with your family.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('❌ Error saving voice message:', error);
            Alert.alert('Error', 'Failed to save voice message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateStats = async (type: 'message' | 'heart') => {
        try {
            const savedStats = await AsyncStorage.getItem('safe_room_stats');
            const stats = savedStats ? JSON.parse(savedStats) : {
                messagesShared: 0,
                heartsGiven: 0,
                weeklyGoal: 7
            };

            if (type === 'message') {
                stats.messagesShared += 1;
            } else {
                stats.heartsGiven += 1;
            }

            await AsyncStorage.setItem('safe_room_stats', JSON.stringify(stats));
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    };

    const handleCancel = () => {
        if (recordingUri || isRecording) {
            Alert.alert(
                'Discard Recording?',
                'Are you sure you want to discard this recording?',
                [
                    { text: 'Keep Recording', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={gradient}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleCancel}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.headerTitle, { fontSize: fonts.h2 }]}>
                            Voice Message
                        </Text>
                        <Text style={[styles.headerSubtitle, { fontSize: fonts.body }]}>
                            Record your feelings
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Content */}
            <View style={styles.content}>
                {/* Recording Area */}
                <View style={[styles.recordingContainer, { backgroundColor: colors.surface }]}>
                    <View style={styles.recordingIconContainer}>
                        <Animated.View
                            style={[
                                styles.recordingIcon,
                                {
                                    backgroundColor: colors.accent,
                                    transform: [{ scale: pulseAnim }]
                                }
                            ]}
                        >
                            <Ionicons
                                name={isRecording ? "stop" : "mic"}
                                size={48}
                                color="white"
                            />
                        </Animated.View>
                    </View>

                    {isRecording && (
                        <View style={styles.recordingStatus}>
                            <View style={[styles.recordingIndicator, { backgroundColor: '#ef4444' }]} />
                            <Text style={[styles.recordingText, { color: '#ef4444', fontSize: fonts.body }]}>
                                Recording... {formatDuration(recordingDuration)}
                            </Text>
                        </View>
                    )}

                    {recordingUri && !isRecording && (
                        <View style={styles.playbackContainer}>
                            <TouchableOpacity style={styles.playButton}>
                                <Ionicons name="play" size={32} color={colors.accent} />
                            </TouchableOpacity>
                            <Text style={[styles.playbackText, { color: colors.text, fontSize: fonts.body }]}>
                                {formatDuration(recordingDuration)} recorded
                            </Text>
                        </View>
                    )}

                    <Text style={[styles.instructionText, { color: colors.textSecondary, fontSize: fonts.body }]}>
                        {isRecording
                            ? 'Tap the button to stop recording'
                            : recordingUri
                                ? 'Tap the button to record a new message'
                                : 'Tap the button to start recording'
                        }
                    </Text>
                </View>

                {/* Tips */}
                <View style={[styles.tipsContainer, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.tipsTitle, { color: colors.text, fontSize: fonts.body }]}>
                        💡 Voice message tips:
                    </Text>
                    <Text style={[styles.tipItem, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                        • Speak clearly and at a comfortable pace
                    </Text>
                    <Text style={[styles.tipItem, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                        • Find a quiet place to record
                    </Text>
                    <Text style={[styles.tipItem, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                        • Your voice helps convey emotions better
                    </Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.recordButton,
                        {
                            backgroundColor: isRecording ? '#ef4444' : colors.accent,
                            opacity: !isLoading ? 1 : 0.6
                        }
                    ]}
                    onPress={isRecording ? stopRecording : startRecording}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={isRecording ? "stop" : "mic"}
                        size={24}
                        color="white"
                    />
                    <Text style={[styles.recordButtonText, { fontSize: fonts.button }]}>
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Text>
                </TouchableOpacity>

                {recordingUri && !isRecording && (
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            {
                                backgroundColor: colors.success,
                                opacity: !isLoading ? 1 : 0.6
                            }
                        ]}
                        onPress={handleSave}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <Text style={[styles.saveButtonText, { fontSize: fonts.button }]}>
                                Saving...
                            </Text>
                        ) : (
                            <>
                                <Ionicons name="checkmark" size={20} color="white" />
                                <Text style={[styles.saveButtonText, { fontSize: fonts.button }]}>
                                    Save Message
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        color: 'white',
        fontWeight: '700',
        marginBottom: 8,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    recordingContainer: {
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    recordingIconContainer: {
        marginBottom: 20,
    },
    recordingIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    recordingStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    recordingIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    recordingText: {
        fontWeight: '600',
    },
    playbackContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    playButton: {
        marginRight: 12,
    },
    playbackText: {
        fontWeight: '600',
    },
    instructionText: {
        textAlign: 'center',
    },
    tipsContainer: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tipsTitle: {
        fontWeight: '600',
        marginBottom: 8,
    },
    tipItem: {
        marginBottom: 4,
    },
    buttonContainer: {
        padding: 20,
        gap: 12,
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    recordButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
    },
});




