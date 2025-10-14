import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors, useThemeFonts, useThemeGradient } from '@/contexts/ThemeContext';
import { useAuth } from '@/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RealDatabaseService from '@/services/database/RealDatabaseService';
import SafeRoomService from '@/services/SafeRoomService';

export default function TextMessageScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const colors = useThemeColors();
    const fonts = useThemeFonts();
    const gradient = useThemeGradient();

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) {
            Alert.alert('Empty Message', 'Please write something to share.');
            return;
        }

        setIsLoading(true);

        try {
            console.log('💾 Starting text message save process...');
            console.log('👤 Current user:', user?.uid || 'anonymous');
            console.log('📝 Message content:', message.trim());

            // Use SafeRoomService for centralized message management
            await SafeRoomService.addMessage({
                type: 'text',
                content: message.trim(),
                userId: user?.uid || 'anonymous',
                sender: user?.displayName || user?.email || 'Anonymous'
            });

            // Update stats
            await updateStats('message');

            setMessage('');
            Alert.alert(
                'Message Sent! 💙',
                'Your message has been shared with your family.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('❌ Error sending message:', error);
            Alert.alert('Error', 'Failed to send message. Please try again.');
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
        if (message.trim()) {
            Alert.alert(
                'Discard Message?',
                'Are you sure you want to discard this message?',
                [
                    { text: 'Keep Writing', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
                            Text Message
                        </Text>
                        <Text style={[styles.headerSubtitle, { fontSize: fonts.body }]}>
                            Share your thoughts safely
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Content */}
            <View style={styles.content}>
                <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.inputLabel, { color: colors.text, fontSize: fonts.body }]}>
                        How are you feeling today?
                    </Text>
                    <TextInput
                        style={[
                            styles.textInput,
                            {
                                color: colors.text,
                                fontSize: fonts.body,
                                borderColor: colors.border,
                                backgroundColor: colors.background
                            }
                        ]}
                        placeholder="Write your message here..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={8}
                        value={message}
                        onChangeText={setMessage}
                        textAlignVertical="top"
                        maxLength={500}
                    />
                    <Text style={[styles.characterCount, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                        {message.length}/500 characters
                    </Text>
                </View>

                {/* Tips */}
                <View style={[styles.tipsContainer, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.tipsTitle, { color: colors.text, fontSize: fonts.body }]}>
                        💡 Tips for sharing:
                    </Text>
                    <Text style={[styles.tipItem, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                        • Be honest about your feelings
                    </Text>
                    <Text style={[styles.tipItem, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                        • Your family cares about you
                    </Text>
                    <Text style={[styles.tipItem, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                        • Sharing helps everyone understand
                    </Text>
                </View>
            </View>

            {/* Send Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        {
                            backgroundColor: message.trim() ? colors.accent : colors.border,
                            opacity: message.trim() && !isLoading ? 1 : 0.6
                        }
                    ]}
                    onPress={handleSend}
                    disabled={!message.trim() || isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <Text style={[styles.sendButtonText, { fontSize: fonts.button }]}>
                            Sending...
                        </Text>
                    ) : (
                        <>
                            <Ionicons name="send" size={20} color="white" />
                            <Text style={[styles.sendButtonText, { fontSize: fonts.button }]}>
                                Send Message
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    inputContainer: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputLabel: {
        fontWeight: '600',
        marginBottom: 12,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    characterCount: {
        textAlign: 'right',
        marginTop: 8,
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
    },
    sendButton: {
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
    sendButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
    },
});
