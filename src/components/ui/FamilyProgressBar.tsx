import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface FamilyProgressBarProps {
    progress: number; // 0-100
    title: string;
    subtitle?: string;
    showIcon?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    gradientColors?: string[];
    animated?: boolean;
}

export const FamilyProgressBar: React.FC<FamilyProgressBarProps> = ({
    progress,
    title,
    subtitle,
    showIcon = true,
    icon = 'people',
    gradientColors = ['#667eea', '#764ba2'] as const,
    animated = true
}) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    {showIcon && (
                        <Ionicons
                            name={icon}
                            size={20}
                            color={gradientColors[0]}
                            style={styles.icon}
                        />
                    )}
                    <Text style={styles.title}>{title}</Text>
                </View>
                <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                    <LinearGradient
                        colors={gradientColors}
                        style={[
                            styles.progressFill,
                            { width: `${clampedProgress}%` }
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />
                </View>
            </View>

            {/* Subtitle */}
            {subtitle && (
                <Text style={styles.subtitle}>{subtitle}</Text>
            )}

            {/* Progress indicators */}
            <View style={styles.indicators}>
                <View style={styles.indicator}>
                    <View style={[styles.indicatorDot, { backgroundColor: gradientColors[0] }]} />
                    <Text style={styles.indicatorText}>Family Tasks</Text>
                </View>
                <View style={styles.indicator}>
                    <View style={[styles.indicatorDot, { backgroundColor: '#22c55e' }]} />
                    <Text style={styles.indicatorText}>Tasks Completed</Text>
                </View>
                <View style={styles.indicator}>
                    <View style={[styles.indicatorDot, { backgroundColor: '#f59e0b' }]} />
                    <Text style={styles.indicatorText}>Streak Days</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    percentage: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#667eea',
    },
    progressContainer: {
        marginBottom: 8,
    },
    progressBackground: {
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    indicators: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    indicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    indicatorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    indicatorText: {
        fontSize: 12,
        color: '#666',
    },
});

export default FamilyProgressBar;




