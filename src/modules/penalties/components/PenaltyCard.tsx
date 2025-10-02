import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PenaltyTimer from './PenaltyTimer';
import { Penalty } from '../types/penaltyTypes';
import { penaltyTypeConfigs } from '../mock/penaltiesData';
import { theme } from '../../../styles/simpleTheme';

interface PenaltyCardProps {
    penalty: Penalty;
    onAdjustTime: (id: string, days: number) => void;
    onEndPenalty: (id: string) => void;
    onViewDetails: (id: string) => void;
}

const PenaltyCard: React.FC<PenaltyCardProps> = ({
    penalty,
    onAdjustTime,
    onEndPenalty,
    onViewDetails,
}) => {
    const penaltyTypeConfig = penaltyTypeConfigs.find(c => c.type === penalty.penaltyType);
    const cardColor = penaltyTypeConfig?.color || theme.colors.gray;
    const cardIcon = penaltyTypeConfig?.icon || 'alert-circle';

    const formatDuration = (days: number) => {
        if (days === 1) return '1 día';
        return `${days} días`;
    };

    const getMethodIcon = (method: 'fixed' | 'random') => {
        return method === 'random' ? 'refresh' : 'hand-left';
    };

    return (
        <TouchableOpacity style={styles.card} onPress={() => onViewDetails(penalty.id)}>
            {/* Card Type Indicator */}
            <View style={[styles.typeIndicator, { backgroundColor: cardColor }]} />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Image source={{ uri: penalty.memberAvatar }} style={styles.avatar} />
                    <View style={styles.headerText}>
                        <Text style={styles.memberName}>{penalty.memberName}</Text>
                        <View style={styles.typeBadge}>
                            <Ionicons name={cardIcon as any} size={12} color="white" />
                            <Text style={styles.typeText}>{penaltyTypeConfig?.name}</Text>
                        </View>
                    </View>

          {/* Timer */}
          <PenaltyTimer
            remainingMinutes={penalty.remaining * 24 * 60} // Convert days to minutes for timer
            totalMinutes={penalty.duration * 24 * 60}
            size={50}
            strokeWidth={4}
            color={cardColor}
            showDays={true}
          />
                </View>

                <Text style={styles.reason}>{penalty.reason}</Text>

                {/* Duration and Method Info */}
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="time" size={14} color={theme.colors.gray} />
                        <Text style={styles.infoText}>{formatDuration(penalty.duration)}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name={getMethodIcon(penalty.selectionMethod)} size={14} color={theme.colors.gray} />
                        <Text style={styles.infoText}>
                            {penalty.selectionMethod === 'random' ? 'Ruleta' : 'Fijo'}
                        </Text>
                    </View>
                </View>

        {/* Actions for Active Penalties */}
        {penalty.isActive && (
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onAdjustTime(penalty.id, -1)}
            >
              <Ionicons name="remove" size={16} color={theme.colors.text} />
              <Text style={styles.actionButtonText}>-1 día</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onAdjustTime(penalty.id, 1)}
            >
              <Ionicons name="add" size={16} color={theme.colors.text} />
              <Text style={styles.actionButtonText}>+1 día</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.endButton} onPress={() => onEndPenalty(penalty.id)}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.endButtonGradient}
              >
                <Ionicons name="stop-circle" size={16} color="white" />
                <Text style={styles.endButtonText}>Terminar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

                {/* Completed Badge */}
                {!penalty.isActive && penalty.reflection && (
                    <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                        <Text style={styles.completedText}>Completada</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.small,
    flexDirection: 'row',
    overflow: 'hidden',
    ...theme.shadows.small,
  },
    typeIndicator: {
        width: 8,
        backgroundColor: theme.colors.primary,
    },
  content: {
    flex: 1,
    padding: theme.spacing.small,
  },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.small,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: theme.spacing.small,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    headerText: {
        flex: 1,
        marginRight: theme.spacing.small,
    },
    memberName: {
        fontSize: theme.typography.fontSize.large,
        fontWeight: theme.typography.fontWeight.bold as any,
        color: theme.colors.text,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: theme.borderRadius.small,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    typeText: {
        fontSize: theme.typography.fontSize.small,
        color: 'white',
        marginLeft: 4,
        fontWeight: theme.typography.fontWeight.medium as any,
    },
    reason: {
        fontSize: theme.typography.fontSize.medium,
        color: theme.colors.text,
        marginBottom: theme.spacing.small,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.small,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        fontSize: theme.typography.fontSize.small,
        color: theme.colors.gray,
        marginLeft: 4,
    },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.small,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 80,
    justifyContent: 'center',
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: theme.typography.fontSize.small,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.text,
  },
  endButton: {
    flex: 1,
    borderRadius: theme.borderRadius.small,
    overflow: 'hidden',
    minWidth: 100,
  },
  endButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  endButtonText: {
    marginLeft: 4,
    fontSize: theme.typography.fontSize.small,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.white,
  },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.successLight,
        borderRadius: theme.borderRadius.small,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginTop: theme.spacing.small,
    },
    completedText: {
        marginLeft: 4,
        fontSize: theme.typography.fontSize.small,
        fontWeight: theme.typography.fontWeight.medium as any,
        color: theme.colors.success,
    },
});

export default PenaltyCard;