import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Achievement } from '../types/quickActionsTypes';
import { theme } from '../../../styles/simpleTheme';

interface AchievementCardProps {
    achievement: Achievement;
    onPress: () => void;
    showProgress?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
    achievement,
    onPress,
    showProgress = true,
}) => {
    const getCategoryColor = (category: Achievement['category']) => {
        switch (category) {
            case 'tasksCompleted':
                return ['#10B981', '#34D399'];
            case 'goalsReached':
                return ['#3B82F6', '#60A5FA'];
            case 'noPenalties':
                return ['#F59E0B', '#FBBF24'];
            case 'specialEvents':
                return ['#8B5CF6', '#A855F7'];
            default:
                return ['#6B7280', '#9CA3AF'];
        }
    };

    const getCategoryLabel = (category: Achievement['category']) => {
        switch (category) {
            case 'tasksCompleted':
                return 'Tareas Completadas';
            case 'goalsReached':
                return 'Metas Alcanzadas';
            case 'noPenalties':
                return 'Sin Penas';
            case 'specialEvents':
                return 'Eventos Especiales';
            default:
                return 'Otros';
        }
    };

    const progressPercentage = achievement.maxProgress
        ? (achievement.progress || 0) / achievement.maxProgress * 100
        : 0;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <LinearGradient
                colors={achievement.achieved ? getCategoryColor(achievement.category) : ['#6B7280', '#9CA3AF']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>{achievement.icon}</Text>
                        {achievement.achieved && (
                            <View style={styles.checkmark}>
                                <Ionicons name="checkmark" size={16} color="white" />
                            </View>
                        )}
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.title}>{achievement.title}</Text>
                        <Text style={styles.description}>{achievement.description}</Text>
                        <Text style={styles.category}>{getCategoryLabel(achievement.category)}</Text>
                    </View>
                    <View style={styles.points}>
                        <Text style={styles.pointsText}>{achievement.points}</Text>
                        <Text style={styles.pointsLabel}>pts</Text>
                    </View>
                </View>

                {showProgress && achievement.maxProgress && achievement.maxProgress > 1 && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${progressPercentage}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {achievement.progress || 0} / {achievement.maxProgress}
                        </Text>
                    </View>
                )}

                {achievement.achieved && (
                    <View style={styles.achievedBadge}>
                        <Ionicons name="trophy" size={16} color="white" />
                        <Text style={styles.achievedText}>¡Completado!</Text>
                    </View>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    gradient: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        position: 'relative',
        marginRight: 12,
    },
    icon: {
        fontSize: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        width: 40,
        height: 40,
        textAlign: 'center',
        lineHeight: 40,
    },
    checkmark: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#10B981',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 2,
    },
    category: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    points: {
        alignItems: 'center',
    },
    pointsText: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
    },
    pointsLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    progressContainer: {
        marginTop: 12,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginTop: 4,
    },
    achievedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
    },
    achievedText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        marginLeft: 4,
    },
});
