import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '../../../components/ui/WorkingComponents';
import { useEmotionalStore } from '../store/emotionalStore';
import { mediaService } from '../services/mediaService';

interface Emotion {
    id: string;
    name: string;
    icon: string;
    color: string;
    gradient: string[];
}

const NewEmotionalEntry: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
    const [messageText, setMessageText] = useState('');
    const [selectedType, setSelectedType] = useState<'text' | 'audio' | 'video'>('text');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const { addMessage } = useEmotionalStore();

    const emotions: Emotion[] = [
        { id: 'happy', name: 'Happy', icon: '😊', color: '#10B981', gradient: ['#10B981', '#059669'] },
        { id: 'sad', name: 'Sad', icon: '😢', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] },
        { id: 'worried', name: 'Worried', icon: '😟', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
        { id: 'angry', name: 'Angry', icon: '😠', color: '#EF4444', gradient: ['#EF4444', '#DC2626'] },
        { id: 'excited', name: 'Excited', icon: '🤩', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
        { id: 'calm', name: 'Calm', icon: '😌', color: '#06B6D4', gradient: ['#06B6D4', '#0891B2'] },
        { id: 'confused', name: 'Confused', icon: '😕', color: '#6B7280', gradient: ['#6B7280', '#4B5563'] },
        { id: 'grateful', name: 'Grateful', icon: '🙏', color: '#EC4899', gradient: ['#EC4899', '#DB2777'] },
    ];

    const handleBack = () => {
        navigation.goBack();
    };

    const handleEmotionSelect = (emotion: Emotion) => {
        setSelectedEmotion(emotion);
    };

    const handleTypeSelect = (type: 'text' | 'audio' | 'video') => {
        setSelectedType(type);
    };

    const handleSend = async () => {
        if (!selectedEmotion) {
            Alert.alert('Select Emotion', 'Please select how you\'re feeling');
            return;
        }

        if (selectedType === 'text' && !messageText.trim()) {
            Alert.alert('Empty Message', 'Please write your message');
            return;
        }

        if (selectedType === 'audio' && !isRecording) {
            Alert.alert('No Recording', 'Please record a voice message first');
            return;
        }

        try {
            let content = messageText;
            let voicePath: string | undefined;
            let voiceDuration: string | undefined;

            if (selectedType === 'audio' && isRecording) {
                const result = await mediaService.stopAudioRecording();
                if (result) {
                    voicePath = result.uri;
                    voiceDuration = result.duration;
                    content = 'Voice message';
                    setIsRecording(false);
                    setRecordingDuration(0);
                } else {
                    Alert.alert('Error', 'Failed to save voice recording');
                    return;
                }
            }

            await addMessage({
                sender: 'You',
                senderAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
                emotion: selectedEmotion.name,
                emotionIcon: selectedEmotion.icon,
                emotionColor: selectedEmotion.color,
                content,
                timestamp: 'Just now',
                type: selectedType,
                replies: [],
                hearts: 0,
            });

            Alert.alert(
                'Message Sent',
                `Your ${selectedEmotion.name.toLowerCase()} message has been shared with your family ❤️`
            );

            // Reset form
            setSelectedEmotion(null);
            setMessageText('');
            setSelectedType('text');
            setIsRecording(false);
            setRecordingDuration(0);

            // Navigate back
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to send message');
        }
    };

    const handleStartRecording = async () => {
        try {
            console.log('User clicked start recording...');
            const success = await mediaService.startAudioRecording();
            console.log('Recording start result:', success);

            if (success) {
                setIsRecording(true);
                setRecordingDuration(0);

                // Start duration counter
                const interval = setInterval(() => {
                    setRecordingDuration(prev => prev + 1);
                }, 1000);

                // Store interval to clear later
                (global as any).recordingInterval = interval;
                console.log('Recording state updated to true');
            } else {
                Alert.alert('Error', 'Failed to start recording. Please check your microphone permissions.');
            }
        } catch (error) {
            console.error('Error in handleStartRecording:', error);
            Alert.alert('Error', 'Failed to start recording. Please check your microphone permissions.');
        }
    };

    const handleStopRecording = async () => {
        try {
            setIsRecording(false);

            // Clear duration counter
            if ((global as any).recordingInterval) {
                clearInterval((global as any).recordingInterval);
            }

            const result = await mediaService.stopAudioRecording();

            if (result && result.uri) {
                Alert.alert('Recording Saved', `Voice message recorded (${result.duration})\n\nNote: In Expo Go, recordings are saved temporarily. For permanent storage, install the app from the APK build.`);
                console.log('Recording saved successfully:', result);

                // Store recording in AsyncStorage for Expo Go
                try {
                    const storedRecordings = await AsyncStorage.getItem('voiceRecordings');
                    const recordings = storedRecordings ? JSON.parse(storedRecordings) : [];
                    recordings.push({
                        id: Date.now(),
                        uri: result.uri,
                        duration: result.duration,
                        timestamp: new Date().toISOString() as any,
                        emotion: selectedEmotion
                    });
                    await AsyncStorage.setItem('voiceRecordings', JSON.stringify(recordings));
                    console.log('Recording stored in AsyncStorage for Expo Go');
                } catch (storageError) {
                    console.warn('Could not store in AsyncStorage:', storageError);
                }
            } else {
                Alert.alert('Error', 'Failed to save recording. Please try again.');
                console.error('No recording result or URI');
            }
        } catch (error) {
            console.error('Error stopping recording:', error);
            Alert.alert('Error', 'Failed to stop recording. Please try again.');
        }
    };

    const handleCancelRecording = async () => {
        try {
            await mediaService.cancelAudioRecording();
            setIsRecording(false);
            setRecordingDuration(0);

            // Clear duration counter
            if ((global as any).recordingInterval) {
                clearInterval((global as any).recordingInterval);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to cancel recording');
        }
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderEmotionButton = (emotion: Emotion) => (
        <TouchableOpacity
            key={emotion.id}
            style={[
                styles.emotionButton,
                selectedEmotion?.id === emotion.id && styles.selectedEmotionButton,
                { borderColor: emotion.color }
            ]}
            onPress={() => handleEmotionSelect(emotion)}
        >
            <Text style={styles.emotionIcon}>{emotion.icon}</Text>
            <Text style={[
                styles.emotionName,
                selectedEmotion?.id === emotion.id && { color: emotion.color }
            ]}>
                {emotion.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
                        <Text style={styles.headerTitle}>Share Your Feelings</Text>
                        <Text style={styles.headerSubtitle}>Safe emotional space</Text>
                    </View>
                    <View style={styles.headerButton} />
                </View>
            </LinearGradient>

            {/* Safe Space Guidelines */}
            <View style={styles.guidelinesSection}>
                <Card style={[styles.guidelinesCard, { borderLeftColor: '#EC4899' }] as any}>
                    <View style={styles.guidelinesHeader}>
                        <View style={styles.guidelinesIcon}>
                            <Ionicons name="shield" size={20} color="#EC4899" />
                        </View>
                        <View>
                            <Text style={styles.guidelinesTitle}>Safe Space Guidelines</Text>
                            <Text style={styles.guidelinesSubtitle}>No judgment, only love</Text>
                        </View>
                    </View>
                    <View style={styles.guidelinesList}>
                        <Text style={styles.guidelineItem}>• No judgment, only love and support</Text>
                        <Text style={styles.guidelineItem}>• Share your feelings freely</Text>
                        <Text style={styles.guidelineItem}>• Listen with your heart</Text>
                    </View>
                </Card>
            </View>

            {/* How are you feeling? */}
            <View style={styles.emotionsSection}>
                <Text style={styles.sectionTitle}>How are you feeling?</Text>
                <View style={styles.emotionsGrid}>
                    {emotions.map(renderEmotionButton)}
                </View>
            </View>

            {/* Message Type Selection */}
            <View style={styles.typeSection}>
                <Text style={styles.sectionTitle}>Share your message</Text>
                <View style={styles.typeButtons}>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            selectedType === 'text' && styles.selectedTypeButton,
                            { borderColor: '#3B82F6' }
                        ]}
                        onPress={() => handleTypeSelect('text')}
                    >
                        <Ionicons
                            name="chatbubble"
                            size={20}
                            color={selectedType === 'text' ? '#3B82F6' : '#6B7280'}
                        />
                        <Text style={[
                            styles.typeButtonText,
                            selectedType === 'text' && { color: '#3B82F6' }
                        ]}>
                            Text
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            selectedType === 'audio' && styles.selectedTypeButton,
                            { borderColor: '#8B5CF6' }
                        ]}
                        onPress={() => handleTypeSelect('audio')}
                    >
                        <Ionicons
                            name="mic"
                            size={20}
                            color={selectedType === 'audio' ? '#8B5CF6' : '#6B7280'}
                        />
                        <Text style={[
                            styles.typeButtonText,
                            selectedType === 'audio' && { color: '#8B5CF6' }
                        ]}>
                            Voice
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            selectedType === 'video' && styles.selectedTypeButton,
                            { borderColor: '#F59E0B' }
                        ]}
                        onPress={() => handleTypeSelect('video')}
                    >
                        <Ionicons
                            name="videocam"
                            size={20}
                            color={selectedType === 'video' ? '#F59E0B' : '#6B7280'}
                        />
                        <Text style={[
                            styles.typeButtonText,
                            selectedType === 'video' && { color: '#F59E0B' }
                        ]}>
                            Video
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Message Input */}
            {selectedType === 'text' && (
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>What's on your mind?</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Share your thoughts and feelings..."
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline
                            maxLength={500}
                            textAlignVertical="top"
                        />
                        <Text style={styles.characterCount}>
                            {messageText.length}/500
                        </Text>
                    </View>
                </View>
            )}

            {/* Voice/Video Recording */}
            {(selectedType === 'audio' || selectedType === 'video') && (
                <View style={styles.recordingSection}>
                    {selectedType === 'audio' ? (
                        <View style={styles.recordingContainer}>
                            {!isRecording ? (
                                <View style={styles.recordingPlaceholder}>
                                    <Ionicons name="mic" size={48} color="#EC4899" />
                                    <Text style={styles.recordingText}>
                                        Tap to start recording your voice message
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.recordingButton}
                                        onPress={handleStartRecording}
                                    >
                                        <Text style={styles.recordingButtonText}>Start Recording</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.recordingActive}>
                                    <View style={styles.recordingIndicator}>
                                        <View style={styles.recordingDot} />
                                        <Text style={styles.recordingStatus}>Recording...</Text>
                                        <Text style={styles.recordingTime}>{formatDuration(recordingDuration)}</Text>
                                    </View>
                                    <View style={styles.recordingControls}>
                                        <TouchableOpacity
                                            style={[styles.controlButton, styles.stopButton]}
                                            onPress={handleStopRecording}
                                        >
                                            <Ionicons name="stop" size={20} color="white" />
                                            <Text style={styles.controlButtonText}>Stop</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.controlButton, styles.cancelButton]}
                                            onPress={handleCancelRecording}
                                        >
                                            <Ionicons name="close" size={20} color="white" />
                                            <Text style={styles.controlButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.recordingPlaceholder}>
                            <Ionicons name="videocam" size={48} color="#EC4899" />
                            <Text style={styles.recordingText}>
                                Video recording functionality coming soon
                            </Text>
                            <TouchableOpacity
                                style={styles.recordingButton}
                                onPress={() => Alert.alert('Coming Soon', 'Video recording will be available soon')}
                            >
                                <Text style={styles.recordingButtonText}>Start Video</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Send Button */}
            <View style={styles.sendSection}>
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!selectedEmotion || (selectedType === 'text' && !messageText.trim())) && styles.disabledButton
                    ]}
                    onPress={handleSend}
                    disabled={!selectedEmotion || (selectedType === 'text' && !messageText.trim())}
                >
                    <LinearGradient
                        colors={selectedEmotion ? selectedEmotion.gradient as any : ['#9CA3AF', '#6B7280']}
                        style={styles.sendButtonGradient}
                    >
                        <Ionicons name="heart" size={20} color="white" />
                        <Text style={styles.sendButtonText}>Share with Family</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
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
    guidelinesSection: {
        paddingHorizontal: 16,
        marginTop: -12,
    },
    guidelinesCard: {
        padding: 16,
        borderLeftWidth: 4,
    },
    guidelinesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    guidelinesIcon: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    guidelinesTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    guidelinesSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    guidelinesList: {
        marginTop: 8,
    },
    guidelineItem: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    emotionsSection: {
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    emotionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    emotionButton: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: 'white',
    },
    selectedEmotionButton: {
        backgroundColor: 'rgba(236, 72, 153, 0.05)',
    },
    emotionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    emotionName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    typeSection: {
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 16,
    },
    typeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    typeButton: {
        flex: 1,
        marginHorizontal: 4,
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    selectedTypeButton: {
        backgroundColor: 'rgba(236, 72, 153, 0.05)',
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        marginTop: 4,
    },
    inputSection: {
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    inputContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
    },
    textInput: {
        fontSize: 16,
        color: '#1F2937',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    characterCount: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'right',
        marginTop: 8,
    },
    recordingSection: {
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 16,
    },
    recordingContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    recordingPlaceholder: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    recordingText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginVertical: 16,
    },
    recordingButton: {
        backgroundColor: '#EC4899',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    recordingButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    recordingActive: {
        padding: 20,
        backgroundColor: '#FEF2F2',
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    recordingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#EF4444',
        marginRight: 8,
    },
    recordingStatus: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
        marginRight: 12,
    },
    recordingTime: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    recordingControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    stopButton: {
        backgroundColor: '#EF4444',
    },
    cancelButton: {
        backgroundColor: '#6B7280',
    },
    controlButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    sendSection: {
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 100,
    },
    sendButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    disabledButton: {
        opacity: 0.5,
    },
    sendButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    sendButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    bottomSpacing: {
        height: 20,
    },
});

export default NewEmotionalEntry;