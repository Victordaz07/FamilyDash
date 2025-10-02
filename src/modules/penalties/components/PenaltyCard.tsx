import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Penalty } from '../types/penaltyTypes';
import PenaltyTimer from './PenaltyTimer';

interface PenaltyCardProps {
    penalty: Penalty;
    onAdjustTime: (id: string, minutes: number) => void;
    onEndEarly: (id: string) => void;
    onPress?: (id: string) => void;
}

const PenaltyCard: React.FC<PenaltyCardProps> = ({
    penalty,
    onAdjustTime,
    onEndEarly,
    onPress
}) => {
    const handleEndEarly = () => {
        Alert.alert(
            'End Penalty Early',
            `Are you sure you want to end ${penalty.memberName}'s penalty early?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Early',
                    style: 'destructive',
                    onPress: () => onEndEarly(penalty.id)
                }
            ]
        );
    };

    const getCategoryColor = () => {
        const colors = {
            behavior: '#EF4444',
            chores: '#F59E0B',
            screen_time: '#8B5CF6',
            homework: '#3B82F6',
            other: '#6B7280'
        };
        return colors[penalty.category] || colors.other;
    };

    const getCategoryIcon = () => {
        const icons = {
            behavior: 'person',
            chores: 'home',
            screen_time: 'phone-portrait',
            homework: 'book',
            other: 'ellipsis-horizontal'
        };
        return icons[penalty.category] || icons.other;
    };

    const formatTimeAgo = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    return (
        <TouchableOpacity
            style={[
                styles.card,
                { borderLeftColor: getCategoryColor() }
            ]}
            onPress={() => onPress?.(penalty.id)}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.memberInfo}>
                        <Image source={{ uri: penalty.memberAvatar }} style={styles.avatar} />
                        <View style={styles.memberDetails}>
                            <Text style={styles.memberName}>{penalty.memberName}</Text>
                            <Text style={styles.timeAgo}>{formatTimeAgo(penalty.startTime)}</Text>
                        </View>
                    </View>

                    <View style={styles.categoryBadge}>
                        <Ionicons
                            name={getCategoryIcon() as any}
                            size={14}
                            color={getCategoryColor()}
                        />
                        <Text style={[styles.categoryText, { color: getCategoryColor() }]}>
                            {penalty.category.replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                {/* Reason */}
                <Text style={styles.reason}>{penalty.reason}</Text>

                {/* Timer and Progress */}
                <View style={styles.timerSection}>
                    <PenaltyTimer
                        remaining={penalty.remaining}
                        duration={penalty.duration}
                        size={80}
                        strokeWidth={6}
                    />

                    <View style={styles.progressInfo}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${penalty.duration > 0 ? ((penalty.duration - penalty.remaining) / penalty.duration) * 100 : 0}%`,
                                        backgroundColor: getCategoryColor()
                                    }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {penalty.duration - penalty.remaining} of {penalty.duration} minutes
                        </Text>
                    </View>
                </View>

                {/* Actions */}
                {penalty.isActive && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.adjustButton]}
                            onPress={() => onAdjustTime(penalty.id, -5)}
                        >
                            <Ionicons name="remove" size={16} color="#10B981" />
                            <Text style={[styles.actionText, { color: '#10B981' }]}>-5 min</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.endButton]}
                            onPress={handleEndEarly}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#7C3AED']}
                                style={styles.endButtonGradient}
                            >
                                <Ionicons name="checkmark" size={16} color="white" />
                                <Text style={styles.endButtonText}>End Early</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.adjustButton]}
                            onPress={() => onAdjustTime(penalty.id, 5)}
                        >
                            <Ionicons name="add" size={16} color="#EF4444" />
                            <Text style={[styles.actionText, { color: '#EF4444' }]}>+5 min</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Completed Status */}
                {!penalty.isActive && (
                    <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        <Text style={styles.completedText}>Completed</Text>
                        {penalty.reflection && (
                            <Ionicons name="chatbubble" size={14} color="#6B7280" />
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardContent: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    memberDetails: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    timeAgo: {
        fontSize: 12,
        color: '#6B7280',
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
        textTransform: 'capitalize',
    },
    reason: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 16,
        lineHeight: 20,
    },
    timerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressInfo: {
        flex: 1,
        marginLeft: 16,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: '#6B7280',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    adjustButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    endButton: {
        flex: 2,
        marginHorizontal: 8,
    },
    endButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    endButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0FDF4',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    completedText: {
        color: '#10B981',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
        marginRight: 8,
    },
});

export default PenaltyCard;