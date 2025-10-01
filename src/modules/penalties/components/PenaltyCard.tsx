import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Penalty } from '../mock/penalties';

interface PenaltyCardProps {
    penalty: Penalty;
    onPress?: () => void;
    onAddTime?: () => void;
    onSubtractTime?: () => void;
    onEndEarly?: () => void;
    showActions?: boolean;
}

const PenaltyCard: React.FC<PenaltyCardProps> = ({
    penalty,
    onPress,
    onAddTime,
    onSubtractTime,
    onEndEarly,
    showActions = false
}) => {
    const formatTimeRemaining = (minutes: number) => {
        if (minutes <= 0) return '00:00';

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:00`;
        } else {
            return `${mins.toString().padStart(2, '0')}:00`;
        }
    };

    const getStatusColor = () => {
        switch (penalty.status) {
            case 'active':
                return penalty.color;
            case 'completed':
                return '#10B981';
            case 'paused':
                return '#F59E0B';
            default:
                return '#6B7280';
        }
    };

    const getStatusIcon = () => {
        switch (penalty.status) {
            case 'active':
                return 'play-circle';
            case 'completed':
                return 'checkmark-circle';
            case 'paused':
                return 'pause-circle';
            default:
                return 'stop-circle';
        }
    };

    const getTimeDisplay = () => {
        if (penalty.status === 'completed') {
            return penalty.endedEarly ? 'Ended Early' : 'Full Time';
        }
        return `${formatTimeRemaining(penalty.remainingTime)} remaining`;
    };

    return (
        <TouchableOpacity
            style={[
                styles.card,
                { borderLeftColor: getStatusColor() },
                penalty.status === 'active' && styles.activeCard
            ]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.cardHeader}>
                <View style={styles.memberInfo}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {penalty.memberName.charAt(0)}
                            </Text>
                        </View>
                        {penalty.status === 'active' && (
                            <View style={styles.activeBadge}>
                                <Ionicons name="ban" size={12} color="white" />
                            </View>
                        )}
                    </View>
                    <View style={styles.memberDetails}>
                        <Text style={styles.memberName}>{penalty.memberName}</Text>
                        <Text style={styles.penaltyType}>{penalty.penaltyType}</Text>
                    </View>
                </View>

                <View style={styles.timeInfo}>
                    <Text style={[styles.timeRemaining, { color: getStatusColor() }]}>
                        {penalty.status === 'completed' ?
                            formatTimeRemaining(penalty.duration) :
                            formatTimeRemaining(penalty.remainingTime)
                        }
                    </Text>
                    <Text style={styles.timeLabel}>
                        {penalty.status === 'completed' ?
                            (penalty.endedEarly ? 'Early end' : 'Full time') :
                            'remaining'
                        }
                    </Text>
                </View>
            </View>

            {penalty.status === 'active' && (
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressText}>{Math.round(penalty.progress)}% complete</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${penalty.progress}%`,
                                    backgroundColor: getStatusColor()
                                }
                            ]}
                        />
                    </View>
                </View>
            )}

            {showActions && penalty.status === 'active' && (
                <View style={styles.actionsSection}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onAddTime}
                    >
                        <Ionicons name="add" size={16} color="white" />
                        <Text style={styles.actionButtonText}>+5 min</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.subtractButton]}
                        onPress={onSubtractTime}
                    >
                        <Ionicons name="remove" size={16} color="white" />
                        <Text style={styles.actionButtonText}>-5 min</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.endButton]}
                        onPress={onEndEarly}
                    >
                        <Text style={styles.endButtonText}>End Early</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.cardFooter}>
                <View style={styles.reasonSection}>
                    <Text style={styles.reasonLabel}>Reason: {penalty.reason}</Text>
                    <Text style={styles.startTime}>Started: {penalty.startedAt}</Text>
                </View>

                {penalty.status === 'completed' && (
                    <View style={styles.statusIcon}>
                        <Ionicons name={getStatusIcon() as any} size={20} color={getStatusColor()} />
                    </View>
                )}
            </View>

            {onPress && (
                <TouchableOpacity style={styles.viewDetailsButton} onPress={onPress}>
                    <Text style={[styles.viewDetailsText, { color: getStatusColor() }]}>
                        View Details
                    </Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activeCard: {
        backgroundColor: '#FEF2F2',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#EF4444',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    activeBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
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
    penaltyType: {
        fontSize: 14,
        color: '#6B7280',
    },
    timeInfo: {
        alignItems: 'flex-end',
    },
    timeRemaining: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    timeLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    progressSection: {
        marginBottom: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    progressText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#EF4444',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    progressFill: {
        height: 8,
        borderRadius: 4,
    },
    actionsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F59E0B',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    subtractButton: {
        backgroundColor: '#10B981',
    },
    endButton: {
        backgroundColor: '#EF4444',
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    endButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reasonSection: {
        flex: 1,
    },
    reasonLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    startTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    statusIcon: {
        alignItems: 'center',
    },
    viewDetailsButton: {
        marginTop: 8,
        paddingVertical: 8,
        alignItems: 'center',
    },
    viewDetailsText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default PenaltyCard;
