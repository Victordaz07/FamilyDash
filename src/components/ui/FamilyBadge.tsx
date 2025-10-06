import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface FamilyBadgeProps {
    level: 'newcomer' | 'active' | 'leader' | 'master' | 'guardian';
    points: number;
    showPoints?: boolean;
    size?: 'small' | 'medium' | 'large';
}

const badgeConfig = {
    newcomer: {
        label: 'Newcomer',
        icon: 'leaf' as keyof typeof Ionicons.glyphMap,
        gradient: ['#94a3b8', '#64748b'],
        emoji: '🌱',
        description: 'Getting started'
    },
    active: {
        label: 'Active',
        icon: 'flash' as keyof typeof Ionicons.glyphMap,
        gradient: ['#3b82f6', '#1d4ed8'],
        emoji: '⚡',
        description: 'Making progress'
    },
    leader: {
        label: 'Family Leader',
        icon: 'crown' as keyof typeof Ionicons.glyphMap,
        gradient: ['#f59e0b', '#d97706'],
        emoji: '👑',
        description: 'Leading the family'
    },
    master: {
        label: 'Cool Master',
        icon: 'star' as keyof typeof Ionicons.glyphMap,
        gradient: ['#8b5cf6', '#7c3aed'],
        emoji: '⭐',
        description: 'Family expert'
    },
    guardian: {
        label: 'Safe Guardian',
        icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
        gradient: ['#10b981', '#059669'],
        emoji: '🛡️',
        description: 'Protecting family'
    }
};

export const FamilyBadge: React.FC<FamilyBadgeProps> = ({
    level,
    points,
    showPoints = true,
    size = 'medium'
}) => {
    const config = badgeConfig[level];

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    containerPadding: 8,
                    iconSize: 16,
                    fontSize: 12,
                    pointsSize: 10,
                    emojiSize: 14
                };
            case 'large':
                return {
                    containerPadding: 16,
                    iconSize: 24,
                    fontSize: 16,
                    pointsSize: 14,
                    emojiSize: 20
                };
            default:
                return {
                    containerPadding: 12,
                    iconSize: 20,
                    fontSize: 14,
                    pointsSize: 12,
                    emojiSize: 16
                };
        }
    };

    const { containerPadding, iconSize, fontSize, pointsSize, emojiSize } = getSizeStyles();

    return (
        <LinearGradient
            colors={config.gradient}
            style={[
                styles.container,
                {
                    padding: containerPadding,
                }
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.content}>
                {/* Icon and emoji */}
                <View style={styles.iconContainer}>
                    <Ionicons name={config.icon} size={iconSize} color="white" />
                    <Text style={[styles.emoji, { fontSize: emojiSize }]}>
                        {config.emoji}
                    </Text>
                </View>

                {/* Badge info */}
                <View style={styles.textContainer}>
                    <Text style={[styles.label, { fontSize }]}>
                        {config.label}
                    </Text>
                    <Text style={[styles.description, { fontSize: fontSize - 2 }]}>
                        {config.description}
                    </Text>
                    {showPoints && (
                        <Text style={[styles.points, { fontSize: pointsSize }]}>
                            {points} points
                        </Text>
                    )}
                </View>
            </View>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${Math.min(100, (points / 100) * 100)}%`,
                                backgroundColor: 'rgba(255, 255, 255, 0.3)'
                            }
                        ]}
                    />
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconContainer: {
        position: 'relative',
        marginRight: 12,
    },
    emoji: {
        position: 'absolute',
        top: -8,
        right: -8,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        color: 'white',
        fontWeight: '600',
        marginBottom: 2,
    },
    description: {
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 2,
    },
    points: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    progressContainer: {
        height: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
});

export default FamilyBadge;
