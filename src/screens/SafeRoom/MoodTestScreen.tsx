import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors, useThemeFonts, useThemeGradient } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RealDatabaseService from '../../services/database/RealDatabaseService';

interface Mood {
    id: string;
    label: string;
    emoji: string;
    value: string;
    color: string;
    description: string;
}

const moods: Mood[] = [
    {
        id: 'happy',
        label: 'Happy',
        emoji: '😊',
        value: 'happy',
        color: '#22c55e',
        description: 'Feeling joyful and positive'
    },
    {
        id: 'sad',
        label: 'Sad',
        emoji: '😔',
        value: 'sad',
        color: '#3b82f6',
        description: 'Feeling down or blue'
    },
    {
        id: 'angry',
        label: 'Angry',
        emoji: '😠',
        value: 'angry',
        color: '#ef4444',
        description: 'Feeling frustrated or mad'
    },
    {
        id: 'tired',
        label: 'Tired',
        emoji: '😴',
        value: 'tired',
        color: '#8b5cf6',
        description: 'Feeling exhausted or sleepy'
    },
    {
        id: 'anxious',
        label: 'Anxious',
        emoji: '😰',
        value: 'anxious',
        color: '#f59e0b',
        description: 'Feeling worried or nervous'
    },
    {
        id: 'excited',
        label: 'Excited',
        emoji: '🤩',
        value: 'excited',
        color: '#ec4899',
        description: 'Feeling enthusiastic and energetic'
    },
    {
        id: 'calm',
        label: 'Calm',
        emoji: '😌',
        value: 'calm',
        color: '#10b981',
        description: 'Feeling peaceful and relaxed'
    },
    {
        id: 'confused',
        label: 'Confused',
        emoji: '😕',
        value: 'confused',
        color: '#6b7280',
        description: 'Feeling uncertain or puzzled'
    }
];

export default function MoodTestScreen() {
    const navigation = useNavigation();
    const colors = useThemeColors();
    const fonts = useThemeFonts();
    const gradient = useThemeGradient();

    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleMoodSelect = (moodValue: string) => {
        setSelectedMood(moodValue);
    };

    const handleSave = async () => {
        if (!selectedMood) {
            Alert.alert('No Mood Selected', 'Please select how you are feeling today.');
            return;
        }

        setIsLoading(true);

        try {
            const user = await RealDatabaseService.getCurrentUser();
            const moodData = {
                type: 'mood',
                mood: selectedMood,
                createdAt: new Date(),
                userId: user?.uid || 'anonymous'
            };

            if (user) {
                // Try to save to Firestore
                try {
                    await RealDatabaseService.createDocument(
                        `families/${user.uid}/safe_room_messages`,
                        moodData
                    );
                } catch (firebaseError) {
                    console.log('Firebase error, saving locally:', firebaseError);
                    // Fallback to local storage
                    await saveLocally(moodData);
                }
            } else {
                // Save locally if no user
                await saveLocally(moodData);
            }

            // Update stats
            await updateStats('message');

            const selectedMoodData = moods.find(m => m.value === selectedMood);
            Alert.alert(
                'Mood Saved! 💙',
                `Your ${selectedMoodData?.label.toLowerCase()} mood has been shared with your family.`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('Error saving mood:', error);
            Alert.alert('Error', 'Failed to save mood. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const saveLocally = async (moodData: any) => {
        try {
            const existingMessages = await AsyncStorage.getItem('safe_room_messages');
            const messages = existingMessages ? JSON.parse(existingMessages) : [];
            messages.unshift({ ...moodData, id: Date.now().toString() });
            await AsyncStorage.setItem('safe_room_messages', JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving locally:', error);
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
        if (selectedMood) {
            Alert.alert(
                'Discard Mood Check?',
                'Are you sure you want to discard this mood check?',
                [
                    { text: 'Keep Selecting', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
                ]
            );
        } else {
            navigation.goBack();
        }
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
                            Mood Check
                        </Text>
                        <Text style={[styles.headerSubtitle, { fontSize: fonts.body }]}>
                            How are you feeling today?
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.questionContainer, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.questionText, { color: colors.text, fontSize: fonts.h3 }]}>
                        Take a moment to check in with yourself
                    </Text>
                    <Text style={[styles.questionSubtext, { color: colors.textSecondary, fontSize: fonts.body }]}>
                        Select the mood that best describes how you're feeling right now
                    </Text>
                </View>

                {/* Mood Options */}
                <View style={styles.moodsContainer}>
                    {moods.map((mood) => (
                        <TouchableOpacity
                            key={mood.id}
                            style={[
                                styles.moodOption,
                                {
                                    backgroundColor: selectedMood === mood.value ? mood.color : colors.surface,
                                    borderColor: selectedMood === mood.value ? mood.color : colors.border,
                                    borderWidth: selectedMood === mood.value ? 2 : 1,
                                }
                            ]}
                            onPress={() => handleMoodSelect(mood.value)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.moodContent}>
                                <Text style={[styles.moodEmoji, { fontSize: fonts.h1 }]}>
                                    {mood.emoji}
                                </Text>
                                <View style={styles.moodTextContainer}>
                                    <Text style={[
                                        styles.moodLabel,
                                        {
                                            color: selectedMood === mood.value ? 'white' : colors.text,
                                            fontSize: fonts.body
                                        }
                                    ]}>
                                        {mood.label}
                                    </Text>
                                    <Text style={[
                                        styles.moodDescription,
                                        {
                                            color: selectedMood === mood.value ? 'rgba(255,255,255,0.8)' : colors.textSecondary,
                                            fontSize: fonts.caption
                                        }
                                    ]}>
                                        {mood.description}
                                    </Text>
                                </View>
                                {selectedMood === mood.value && (
                                    <View style={styles.selectedIndicator}>
                                        <Ionicons name="checkmark-circle" size={24} color="white" />
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tips */}
                <View style={[styles.tipsContainer, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.tipsTitle, { color: colors.text, fontSize: fonts.body }]}>
                        💡 Remember:
                    </Text>
                    <Text style={[styles.tipItem, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                        • It's okay to feel any of these emotions
                    </Text>
                    <Text style={[styles.tipItem, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                        • Your feelings are valid and important
                    </Text>
                    <Text style={[styles.tipItem, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                        • Sharing helps your family understand you better
                    </Text>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        {
                            backgroundColor: selectedMood ? colors.accent : colors.border,
                            opacity: selectedMood && !isLoading ? 1 : 0.6
                        }
                    ]}
                    onPress={handleSave}
                    disabled={!selectedMood || isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <Text style={[styles.saveButtonText, { fontSize: fonts.button }]}>
                            Saving...
                        </Text>
                    ) : (
                        <>
                            <Ionicons name="heart" size={20} color="white" />
                            <Text style={[styles.saveButtonText, { fontSize: fonts.button }]}>
                                Save Mood Check
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
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
    questionContainer: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    questionText: {
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    questionSubtext: {
        textAlign: 'center',
    },
    moodsContainer: {
        marginBottom: 20,
    },
    moodOption: {
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    moodContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    moodEmoji: {
        marginRight: 16,
    },
    moodTextContainer: {
        flex: 1,
    },
    moodLabel: {
        fontWeight: '600',
        marginBottom: 4,
    },
    moodDescription: {
        lineHeight: 16,
    },
    selectedIndicator: {
        marginLeft: 8,
    },
    tipsContainer: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
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
