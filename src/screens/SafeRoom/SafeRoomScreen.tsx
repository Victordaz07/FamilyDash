import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    FlatList,
    Alert,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeColors, useThemeFonts, useThemeGradient } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RealDatabaseService from '../../services/database/RealDatabaseService';
import { SharedQuickActions } from '../../components/quick/SharedQuickActions';

const { width } = Dimensions.get('window');

interface SafeRoomMessage {
    id: string;
    type: 'text' | 'voice' | 'mood';
    content?: string;
    mood?: string;
    uri?: string;
    createdAt: any;
    userId: string;
}

export default function SafeRoomScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const colors = useThemeColors();
    const fonts = useThemeFonts();
    const gradient = useThemeGradient();

    // Get route parameters or use defaults for SafeRoom context
    const familyId = route.params?.familyId || 'default_family';
    const safeRoomId = route.params?.safeRoomId || 'default_safe_room';
    const userId = route.params?.userId || 'default_user';

    const [messages, setMessages] = useState<SafeRoomMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        messagesShared: 0,
        heartsGiven: 0,
        weeklyGoal: 7
    });

    useEffect(() => {
        loadMessages();
        loadStats();
    }, []);

    const loadMessages = async () => {
        try {
            setIsLoading(true);
            // Try to load from Firestore first
            try {
                const user = await RealDatabaseService.getCurrentUser();
                if (user) {
                    const messagesData = await RealDatabaseService.getDocuments(
                        `families/${user.uid}/safe_room_messages`
                    );
                    setMessages(messagesData || []);
                }
            } catch (error) {
                console.log('Firebase not available, loading from local storage');
                // Fallback to local storage
                const localMessages = await AsyncStorage.getItem('safe_room_messages');
                if (localMessages) {
                    setMessages(JSON.parse(localMessages));
                }
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const savedStats = await AsyncStorage.getItem('safe_room_stats');
            if (savedStats) {
                setStats(JSON.parse(savedStats));
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const updateStats = async (type: 'message' | 'heart') => {
        const newStats = { ...stats };
        if (type === 'message') {
            newStats.messagesShared += 1;
        } else {
            newStats.heartsGiven += 1;
        }
        setStats(newStats);
        await AsyncStorage.setItem('safe_room_stats', JSON.stringify(newStats));
    };

    const handleActionPress = (action: 'text' | 'voice' | 'mood') => {
        switch (action) {
            case 'text':
                navigation.navigate('TextMessage' as never);
                break;
            case 'voice':
                // Voice handling is now done by SharedQuickActions with AudioNoteModal
                console.log('Voice action handled by SharedQuickActions');
                break;
            case 'mood':
                navigation.navigate('MoodTest' as never);
                break;
        }
    };

    const renderMessage = ({ item }: { item: SafeRoomMessage }) => (
        <View style={[styles.messageCard, { backgroundColor: colors.surface }]}>
            <View style={styles.messageHeader}>
                <View style={[styles.messageTypeIcon, { backgroundColor: colors.accent }]}>
                    <Ionicons
                        name={
                            item.type === 'text' ? 'chatbubble' :
                                item.type === 'voice' ? 'mic' : 'heart'
                        }
                        size={16}
                        color="white"
                    />
                </View>
                <Text style={[styles.messageType, { color: colors.text, fontSize: fonts.caption }]}>
                    {item.type === 'text' ? 'Text Message' :
                        item.type === 'voice' ? 'Voice Message' : 'Mood Check'}
                </Text>
                <Text style={[styles.messageTime, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                    {new Date(item.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                </Text>
            </View>

            {item.type === 'text' && (
                <Text style={[styles.messageContent, { color: colors.text, fontSize: fonts.body }]}>
                    {item.content}
                </Text>
            )}

            {item.type === 'mood' && (
                <View style={styles.moodDisplay}>
                    <Text style={[styles.moodEmoji, { fontSize: fonts.h2 }]}>
                        {item.mood === 'happy' ? '😊' :
                            item.mood === 'sad' ? '😔' :
                                item.mood === 'angry' ? '😠' : '😴'}
                    </Text>
                    <Text style={[styles.moodText, { color: colors.text, fontSize: fonts.body }]}>
                        {item.mood === 'happy' ? 'Happy' :
                            item.mood === 'sad' ? 'Sad' :
                                item.mood === 'angry' ? 'Angry' : 'Tired'}
                    </Text>
                </View>
            )}

            {item.type === 'voice' && (
                <View style={styles.voiceMessage}>
                    <Ionicons name="play-circle" size={24} color={colors.accent} />
                    <Text style={[styles.voiceText, { color: colors.textSecondary, fontSize: fonts.body }]}>
                        Voice message
                    </Text>
                </View>
            )}
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontSize: fonts.h2 }]}>
                No Messages Yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: fonts.body }]}>
                Start sharing your feelings with your family
            </Text>
            <TouchableOpacity
                style={[styles.startSharingButton, { backgroundColor: colors.accent }]}
                onPress={() => handleActionPress('text')}
            >
                <Text style={[styles.startSharingText, { fontSize: fonts.button }]}>
                    Start Sharing
                </Text>
            </TouchableOpacity>
        </View>
    );

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
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.headerTitle, { fontSize: fonts.h2 }]}>
                            Safe Room
                        </Text>
                        <Text style={[styles.headerSubtitle, { fontSize: fonts.body }]}>
                            Share your feelings safely
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Stats */}
            <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.accent, fontSize: fonts.h2 }]}>
                        {stats.messagesShared}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                        Messages Shared
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.accent, fontSize: fonts.h2 }]}>
                        {stats.heartsGiven}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                        Hearts Given
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: colors.accent, fontSize: fonts.h2 }]}>
                        {Math.round((stats.messagesShared / stats.weeklyGoal) * 100)}%
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                        Weekly Goal
                    </Text>
                </View>
            </View>

            {/* Quick Actions */}
            <SharedQuickActions
                mode="safe"
                familyId={familyId}
                userId={userId}
                safeRoomId={safeRoomId}
                onAddTextSafe={() => handleActionPress('text')}
            />

            {/* Messages List */}
            <View style={styles.messagesContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                    Recent Messages
                </Text>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={[styles.loadingText, { color: colors.textSecondary, fontSize: fonts.body }]}>
                            Loading messages...
                        </Text>
                    </View>
                ) : messages.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <FlatList
                        data={messages.slice(0, 5)} // Show only recent 5 messages
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessage}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.messagesList}
                    />
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
    statsContainer: {
        flexDirection: 'row',
        margin: 20,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        textAlign: 'center',
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    actionButton: {
        width: (width - 60) / 3,
        height: 80,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '600',
        marginTop: 8,
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontWeight: '700',
        marginBottom: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        textAlign: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        textAlign: 'center',
        marginBottom: 24,
    },
    startSharingButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    startSharingText: {
        color: 'white',
        fontWeight: '600',
    },
    messagesList: {
        paddingBottom: 20,
    },
    messageCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    messageTypeIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    messageType: {
        flex: 1,
        fontWeight: '600',
    },
    messageTime: {
        fontSize: 12,
    },
    messageContent: {
        lineHeight: 20,
    },
    moodDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    moodEmoji: {
        marginRight: 12,
    },
    moodText: {
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    voiceMessage: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    voiceText: {
        marginLeft: 8,
        fontStyle: 'italic',
    },
});
