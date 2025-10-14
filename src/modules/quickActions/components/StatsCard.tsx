import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/styles/simpleTheme';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    gradient: [string, string];
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    gradient,
    trend,
    trendValue,
}) => {
    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return 'trending-up';
            case 'down':
                return 'trending-down';
            default:
                return 'remove';
        }
    };

    const getTrendColor = () => {
        switch (trend) {
            case 'up':
                return '#10B981';
            case 'down':
                return '#EF4444';
            default:
                return theme.colors.textSecondary;
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradient}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name={icon as any} size={24} color="white" />
                    </View>
                    {trend && trendValue && (
                        <View style={styles.trendContainer}>
                            <Ionicons
                                name={getTrendIcon() as any}
                                size={16}
                                color={getTrendColor()}
                            />
                            <Text style={[styles.trendText, { color: getTrendColor() }]}>
                                {trendValue}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    <Text style={styles.value}>{value}</Text>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 8,
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
        minHeight: 120,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    value: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
        marginBottom: 4,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
});
