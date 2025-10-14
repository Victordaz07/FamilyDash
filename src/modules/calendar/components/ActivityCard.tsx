import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActivityCardProps {
    activity: {
        id: string;
        title: string;
        time: string;
        location: string;
        icon: string;
        iconColor: string;
        bgColor: string;
        borderColor: string;
        participants: string[];
        action?: 'remind' | 'list' | 'pending' | 'vote';
    };
    onPress?: () => void;
    onActionPress?: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
    activity,
    onPress,
    onActionPress
}) => {
    const getActionButton = () => {
        switch (activity.action) {
            case 'remind':
                return (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: activity.iconColor }]}
                        onPress={onActionPress}
                    >
                        <Ionicons name="notifications" size={12} color="white" />
                        <Text style={styles.actionButtonText}>Remind</Text>
                    </TouchableOpacity>
                );
            case 'list':
                return (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: activity.iconColor }]}
                        onPress={onActionPress}
                    >
                        <Ionicons name="list" size={12} color="white" />
                        <Text style={styles.actionButtonText}>List</Text>
                    </TouchableOpacity>
                );
            case 'vote':
                return (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: activity.iconColor }]}
                        onPress={onActionPress}
                    >
                        <Text style={styles.actionButtonText}>Vote</Text>
                    </TouchableOpacity>
                );
            case 'pending':
                return (
                    <Text style={[styles.pendingText, { color: activity.iconColor }]}>Pending</Text>
                );
            default:
                return null;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.activityItem, { backgroundColor: activity.bgColor, borderLeftColor: activity.borderColor }]}
            onPress={onPress}
        >
            <View style={[styles.activityIcon, { backgroundColor: activity.iconColor }]}>
                <Ionicons name={activity.icon as any} size={20} color="white" />
            </View>
            <View style={styles.activityContent}>
                <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                <Text style={styles.activityLocation}>{activity.location}</Text>
                <View style={styles.activityFooter}>
                    <View style={styles.participantsContainer}>
                        {activity.participants.map((avatar, index) => (
                            <Image
                                key={index}
                                source={{ uri: avatar }}
                                style={[styles.participantAvatar, { marginLeft: index > 0 ? -4 : 0 }]}
                            />
                        ))}
                    </View>
                    <View style={styles.activityActions}>
                        {getActionButton()}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 12,
        borderLeftWidth: 4,
        marginBottom: 12,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 4,
    },
    activityContent: {
        flex: 1,
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    activityTime: {
        fontSize: 12,
        color: '#6B7280',
    },
    activityLocation: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    activityFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    participantsContainer: {
        flexDirection: 'row',
    },
    participantAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'white',
    },
    activityActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'white',
    },
    pendingText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default ActivityCard;




