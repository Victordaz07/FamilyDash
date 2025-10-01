import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Reflection } from '../mock/penalties';

interface ReflectionCardProps {
    reflection: Reflection;
    onPress?: () => void;
    onReaction?: (reactionType: 'heart' | 'clap' | 'muscle' | 'star') => void;
}

const ReflectionCard: React.FC<ReflectionCardProps> = ({ reflection, onPress, onReaction }) => {
    const getReactionIcon = (type: string) => {
        const icons = {
            'heart': 'heart',
            'clap': 'hand-left',
            'muscle': 'fitness',
            'star': 'star'
        };
        return icons[type as keyof typeof icons] || 'heart';
    };

    const getReactionColor = (type: string) => {
        const colors = {
            'heart': '#EF4444',
            'clap': '#3B82F6',
            'muscle': '#10B981',
            'star': '#F59E0B'
        };
        return colors[type as keyof typeof colors] || '#EF4444';
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress}>
            <View style={styles.cardHeader}>
                <View style={styles.memberInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {reflection.memberName.charAt(0)}
                        </Text>
                    </View>
                    <View style={styles.memberDetails}>
                        <Text style={styles.memberName}>{reflection.memberName}'s Reflection</Text>
                        <Text style={styles.penaltyTitle}>{reflection.penaltyTitle}</Text>
                    </View>
                </View>
                <Text style={styles.timestamp}>{reflection.createdAt}</Text>
            </View>

            <View style={styles.reflectionContent}>
                <Text style={styles.reflectionText}>{reflection.reflectionText}</Text>
            </View>

            <View style={styles.learnedItems}>
                {reflection.learnedItems.map((item, index) => (
                    <View key={index} style={styles.learnedItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        <Text style={styles.learnedItemText}>{item}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.reactionsSection}>
                <View style={styles.reactions}>
                    {Object.entries(reflection.reactions).map(([type, count]) => (
                        count > 0 && (
                            <TouchableOpacity
                                key={type}
                                style={styles.reactionButton}
                                onPress={() => onReaction?.(type as any)}
                            >
                                <Ionicons
                                    name={getReactionIcon(type) as any}
                                    size={16}
                                    color={getReactionColor(type)}
                                />
                                <Text style={styles.reactionCount}>{count}</Text>
                            </TouchableOpacity>
                        )
                    ))}
                </View>

                <TouchableOpacity style={styles.addReactionButton}>
                    <Ionicons name="add" size={16} color="#6B7280" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    memberDetails: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 2,
    },
    penaltyTitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    timestamp: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    reflectionContent: {
        marginBottom: 12,
    },
    reflectionText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    learnedItems: {
        marginBottom: 12,
    },
    learnedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    learnedItemText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
    },
    reactionsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    reactions: {
        flexDirection: 'row',
        gap: 12,
    },
    reactionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        gap: 4,
    },
    reactionCount: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    addReactionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ReflectionCard;
