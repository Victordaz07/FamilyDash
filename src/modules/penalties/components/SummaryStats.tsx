import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SummaryStatsProps {
    stats: {
        active: number;
        thisWeek: number;
        completed: number;
        averageTime: number;
    };
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ stats }) => {
    const formatAverageTime = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes}m`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="hourglass" size={24} color="#EF4444" />
                </View>
                <Text style={styles.statNumber}>{stats.active}</Text>
                <Text style={styles.statLabel}>Active</Text>
            </View>

            <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="calendar" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.statNumber}>{stats.thisWeek}</Text>
                <Text style={styles.statLabel}>This Week</Text>
            </View>

            <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
                <Text style={styles.statNumber}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="time" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.statNumber}>{formatAverageTime(stats.averageTime)}</Text>
                <Text style={styles.statLabel}>Avg Time</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default SummaryStats;
