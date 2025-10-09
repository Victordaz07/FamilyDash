import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Feeling } from '../mock/safeRoomData';
import SafeRoomAttachmentsList from './SafeRoomAttachmentsList';
import SafeRoomMediaModal from './SafeRoomMediaModal';
import { SafeRoomAttachment, SafeRoomMessage } from '../types/safeRoomTypes';

interface FeelingCardProps {
    feeling: Feeling;
    onReaction: (feelingId: string, reactionType: 'heart' | 'clap' | 'star' | 'support') => void;
    onSupport: (feelingId: string) => void;
    onMediaPress?: (attachment: SafeRoomAttachment, message: SafeRoomMessage) => void;
}

const FeelingCard: React.FC<FeelingCardProps> = ({ feeling, onReaction, onSupport, onMediaPress }) => {
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState<SafeRoomAttachment | null>(null);

    const handleAttachmentPress = (attachment: SafeRoomAttachment) => {
        setSelectedAttachment(attachment);
        setMediaModalVisible(true);
        onMediaPress?.(attachment, convertFeelingToMessage(feeling));
    };

    const convertFeelingToMessage = (feeling: Feeling): SafeRoomMessage => {
        return {
            id: feeling.id,
            type: feeling.type as any,
            content: feeling.content,
            sender: feeling.author,
            senderId: feeling.authorId || 'unknown',
            timestamp: feeling.timestamp,
            mood: feeling.mood,
            attachments: feeling.attachments || [],
            reactions: feeling.reactions || [],
        };
    };

    const getMoodColor = (mood: string) => {
        const colors = {
            happy: '#4CAF50',
            neutral: '#FFC107',
            sad: '#2196F3',
            angry: '#F44336',
            worried: '#FF9800',
            excited: '#9C27B0'
        };
        return colors[mood as keyof typeof colors] || '#FFC107';
    };

    const getMoodEmoji = (mood: string) => {
        const emojis = {
            happy: '😃',
            neutral: '😐',
            sad: '😢',
            angry: '😡',
            worried: '😟',
            excited: '🤩'
        };
        return emojis[mood as keyof typeof emojis] || '😐';
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'text':
                return 'chatbubble-outline';
            case 'audio':
                return 'mic-outline';
            case 'video':
                return 'videocam-outline';
            default:
                return 'chatbubble-outline';
        }
    };

    return (
        <>
        <View style={[styles.card, { borderLeftColor: getMoodColor(feeling.mood) }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.memberInfo}>
                    <Text style={styles.avatar}>{feeling.memberAvatar}</Text>
                    <View style={styles.memberDetails}>
                        <Text style={styles.memberName}>{feeling.memberName}</Text>
                        <View style={styles.moodTag}>
                            <Text style={styles.moodEmoji}>{getMoodEmoji(feeling.mood)}</Text>
                            <Text style={[styles.moodText, { color: getMoodColor(feeling.mood) }]}>
                                {feeling.mood.charAt(0).toUpperCase() + feeling.mood.slice(1)}
                            </Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.timestamp}>{feeling.createdAt}</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {feeling.type === 'text' && (
                    <Text style={styles.textContent}>{feeling.content}</Text>
                )}

                {feeling.type === 'audio' && (
                    <View style={styles.audioPlayer}>
                        <TouchableOpacity style={styles.playButton}>
                            <Ionicons name="play" size={20} color="#EF4444" />
                        </TouchableOpacity>
                        <View style={styles.audioInfo}>
                            <Text style={styles.audioText}>{feeling.content}</Text>
                            <View style={styles.progressBar}>
                                <View style={styles.progressFill} />
                            </View>
                        </View>
                        <Ionicons name="mic" size={16} color="#EF4444" />
                    </View>
                )}

                {feeling.type === 'video' && (
                    <View style={styles.videoPlayer}>
                        <View style={styles.videoThumbnail}>
                            <TouchableOpacity style={styles.videoPlayButton}>
                                <Ionicons name="play" size={24} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.videoDuration}>2:15</Text>
                        </View>
                        <Text style={styles.videoText}>{feeling.content}</Text>
                    </View>
                )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <View style={styles.reactions}>
                    <TouchableOpacity
                        style={styles.reactionButton}
                        onPress={() => onReaction(feeling.id, 'heart')}
                    >
                        <Ionicons name="heart" size={16} color="#EF4444" />
                        <Text style={styles.reactionCount}>{feeling.supportCount}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.reactionButton}
                        onPress={() => onReaction(feeling.id, 'clap')}
                    >
                        <Ionicons name="hand-left" size={16} color="#FF9800" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.reactionButton}
                        onPress={() => onReaction(feeling.id, 'star')}
                    >
                        <Ionicons name="star" size={16} color="#FFC107" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.supportButton}
                    onPress={() => onSupport(feeling.id)}
                >
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.supportText}>I understand</Text>
                </TouchableOpacity>
            </View>

            {/* Type indicator */}
            <View style={styles.typeIndicator}>
                <Ionicons name={getTypeIcon(feeling.type)} size={12} color="#9CA3AF" />
                <Text style={styles.typeText}>
                    {feeling.type.charAt(0).toUpperCase() + feeling.type.slice(1)} Message
                </Text>
            </View>

            {/* Attachments */}
            {feeling.attachments && feeling.attachments.length > 0 && (
                <SafeRoomAttachmentsList
                    attachments={feeling.attachments}
                    onAttachmentPress={handleAttachmentPress}
                    compact={true}
                />
            )}
        </View>

        {/* Media Modal */}
        <SafeRoomMediaModal
            visible={mediaModalVisible}
            message={selectedAttachment ? convertFeelingToMessage(feeling) : null}
            attachment={selectedAttachment}
            onClose={() => {
                setMediaModalVisible(false);
                setSelectedAttachment(null);
            }}
            onReaction={(messageId, reactionType) => {
                onReaction(messageId, reactionType as any);
            }}
        />
    </>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        fontSize: 24,
        marginRight: 12,
    },
    memberDetails: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    moodTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    moodEmoji: {
        fontSize: 12,
        marginRight: 4,
    },
    moodText: {
        fontSize: 12,
        fontWeight: '500',
    },
    timestamp: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    content: {
        marginBottom: 12,
    },
    textContent: {
        fontSize: 14,
        lineHeight: 20,
        color: '#374151',
    },
    audioPlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    audioInfo: {
        flex: 1,
    },
    audioText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 4,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        width: '60%',
        backgroundColor: '#EF4444',
    },
    videoPlayer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        overflow: 'hidden',
    },
    videoThumbnail: {
        height: 120,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    videoPlayButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoDuration: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 12,
    },
    videoText: {
        fontSize: 14,
        color: '#374151',
        padding: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reactions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reactionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    reactionCount: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    supportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    supportText: {
        fontSize: 12,
        color: '#4CAF50',
        marginLeft: 4,
        fontWeight: '500',
    },
    typeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    typeText: {
        fontSize: 10,
        color: '#9CA3AF',
        marginLeft: 4,
    },
});

export default FeelingCard;
