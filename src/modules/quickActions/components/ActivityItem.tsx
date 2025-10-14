import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityLog } from '@/types/quickActionsTypes';
import { theme } from '@/styles/simpleTheme';

interface ActivityItemProps {
    activity: ActivityLog;
    onPress: () => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
    activity,
    onPress,
}) => {
    const getTypeIcon = (type: ActivityLog['type']) => {
        switch (type) {
            case 'task':
                return 'checkmark-circle';
            case 'goal':
                return 'trophy';
            case 'penalty':
                return 'warning';
            case 'safeRoom':
                return 'heart';
            default:
                return 'information-circle';
        }
    };

    const getTypeColor = (type: ActivityLog['type']) => {
        switch (type) {
            case 'task':
                return '#10B981';
            case 'goal':
                return '#3B82F6';
            case 'penalty':
                return '#F59E0B';
            case 'safeRoom':
                return '#8B5CF6';
            default:
                return '#6B7280';
        }
    };

    const getTypeLabel = (type: ActivityLog['type']) => {
        switch (type) {
            case 'task':
                return 'Tarea';
            case 'goal':
                return 'Meta';
            case 'penalty':
                return 'Pena';
            case 'safeRoom':
                return 'Cuarto Seguro';
            default:
                return 'Actividad';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            return 'Hace unos minutos';
        } else if (diffInHours < 24) {
            return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.iconContainer}>
                <Ionicons
                    name={getTypeIcon(activity.type) as any}
                    size={24}
                    color={getTypeColor(activity.type)}
                />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.typeLabel}>{getTypeLabel(activity.type)}</Text>
                    <Text style={styles.timestamp}>{formatTimestamp(activity.timestamp)}</Text>
                </View>

                <Text style={styles.description}>{activity.description}</Text>
                <Text style={styles.memberName}>por {activity.memberName}</Text>

                {activity.details && (
                    <Text style={styles.details}>{activity.details}</Text>
                )}
            </View>

            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    typeLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primary,
        textTransform: 'uppercase',
    },
    timestamp: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    description: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.text,
        marginBottom: 2,
    },
    memberName: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    details: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
});
