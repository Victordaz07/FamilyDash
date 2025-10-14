import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ResponsibilityItemProps {
    responsibility: {
        id: string;
        title: string;
        assignedTo: string;
        assignedToAvatar: string;
        dueDate?: string;
        dueTime?: string;
        completed: boolean;
    };
    onPress?: () => void;
    onRemind?: () => void;
}

const ResponsibilityItem: React.FC<ResponsibilityItemProps> = ({
    responsibility,
    onPress,
    onRemind
}) => {
    const getStatusColor = () => {
        if (responsibility.completed) return '#10B981';
        if (responsibility.dueDate && responsibility.dueTime) return '#F59E0B';
        return '#6B7280';
    };

    const getStatusIcon = () => {
        if (responsibility.completed) return 'checkmark-circle';
        if (responsibility.dueDate && responsibility.dueTime) return 'time';
        return 'ellipse-outline';
    };

    const getActionButton = () => {
        if (responsibility.completed) {
            return (
                <View style={styles.completedIcon}>
                    <Ionicons name="checkmark" size={16} color="white" />
                </View>
            );
        }

        if (responsibility.dueDate && responsibility.dueTime) {
            return (
                <TouchableOpacity
                    style={styles.remindButton}
                    onPress={onRemind}
                >
                    <Text style={styles.remindButtonText}>Remind</Text>
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.pendingIcon}>
                <Ionicons name="time" size={16} color="#6B7280" />
            </View>
        );
    };

    const getStatusText = () => {
        if (responsibility.completed) {
            return `${responsibility.assignedTo} • Completed`;
        }
        if (responsibility.dueDate && responsibility.dueTime) {
            return `${responsibility.assignedTo} • Due ${responsibility.dueDate} ${responsibility.dueTime}`;
        }
        return `${responsibility.assignedTo} • Pending`;
    };

    return (
        <TouchableOpacity
            style={[
                styles.responsibilityItem,
                { backgroundColor: responsibility.completed ? '#F0FDF4' : '#FFFBEB' }
            ]}
            onPress={onPress}
        >
            <View style={[styles.statusIcon, { backgroundColor: getStatusColor() }]}>
                <Ionicons name={getStatusIcon() as any} size={16} color="white" />
            </View>

            <Image
                source={{ uri: responsibility.assignedToAvatar }}
                style={styles.assignedToAvatar}
            />

            <View style={styles.responsibilityContent}>
                <Text style={styles.responsibilityTitle}>{responsibility.title}</Text>
                <Text style={styles.responsibilityStatus}>{getStatusText()}</Text>
            </View>

            <View style={styles.responsibilityAction}>
                {getActionButton()}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    responsibilityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    statusIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    assignedToAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    responsibilityContent: {
        flex: 1,
    },
    responsibilityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 2,
    },
    responsibilityStatus: {
        fontSize: 12,
        color: '#6B7280',
    },
    responsibilityAction: {
        alignItems: 'center',
    },
    completedIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
    },
    remindButton: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    remindButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    pendingIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ResponsibilityItem;




