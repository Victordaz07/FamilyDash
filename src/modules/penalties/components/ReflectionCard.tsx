import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ReflectionCardProps {
    reflection: string;
    memberName: string;
    memberAvatar: string;
    timestamp: number;
    onReaction?: (reaction: string) => void;
}

const ReflectionCard: React.FC<ReflectionCardProps> = ({
    reflection,
    memberName,
    timestamp,
    onReaction
}) => {
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;

        return date.toLocaleDateString();
    };

    const reactions = [
        { emoji: '❤️', name: 'heart' },
        { emoji: '👏', name: 'clap' },
        { emoji: '💪', name: 'strong' },
        { emoji: '🤗', name: 'hug' }
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#F8FAFC', '#F1F5F9'] as unknown as readonly [string, string, ...string[]]}
                style={styles.card}
            >
                {/* Quote Icon */}
                <View style={styles.quoteIcon}>
                    <Ionicons name="chatbubble-ellipses" size={24} color="#8B5CF6" />
                </View>

                {/* Reflection Text */}
                <Text style={styles.reflectionText}>"{reflection}"</Text>

                {/* Member Info */}
                <View style={styles.footer}>
                    <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>— {memberName}</Text>
                        <Text style={styles.timestamp}>{formatDate(timestamp)}</Text>
                    </View>

                    {/* Reaction Buttons */}
                    <View style={styles.reactions}>
                        {reactions.map((reaction) => (
                            <TouchableOpacity
                                key={reaction.name}
                                style={styles.reactionButton}
                                onPress={() => onReaction?.(reaction.name)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#8B5CF6',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    quoteIcon: {
        alignSelf: 'flex-start',
        marginBottom: 12,
        opacity: 0.7,
    },
    reflectionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#374151',
        fontStyle: 'italic',
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 4,
    },
    timestamp: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    reactions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reactionButton: {
        marginLeft: 8,
        padding: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    reactionEmoji: {
        fontSize: 18,
    },
});

export default ReflectionCard;



