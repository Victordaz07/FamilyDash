import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PenaltyTimer from './PenaltyTimer';
import { Penalty } from '@/types/penaltyTypes';
import { penaltyTypeConfigs } from '../mock/penaltiesData';
import { theme } from '@/styles/simpleTheme';
// i18n removed - using hardcoded English text

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
  // Force English for now until i18n is fully working
  const language = 'en';

  // Direct English translations
  const translations = {
    day: 'day',
    days: 'days',
    completed: 'completed',
    remaining: 'remaining',
    roulette: 'Roulette',
    manual: 'Manual',
    complete: 'Complete',
    completedBadge: 'Completed!',
    minusDay: '-1 day',
    plusDay: '+1 day'
  };

  const penaltyTypeConfig = penaltyTypeConfigs.find(c => c.type === penalty.penaltyType);
  const cardColor = penaltyTypeConfig?.color || theme.colors.gray;
  const cardIcon = penaltyTypeConfig?.icon || 'alert-circle';

  const formatDuration = (days: number) => {
    if (days === 1) return `1 ${translations.day}`;
    return `${days} ${translations.days}`;
  };

  const getMethodIcon = (method: 'fixed' | 'random') => {
    return method === 'random' ? 'refresh' : 'hand-left';
  };

  const getMethodText = (method: 'fixed' | 'random') => {
    return method === 'random' ? translations.roulette : translations.manual;
  };

  const getProgressPercentage = () => {
    if (penalty.duration === 0) return 0;
    return ((penalty.duration - penalty.remaining) / penalty.duration) * 100;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onViewDetails(penalty.id)}
      activeOpacity={0.8}
    >
      {/* Card Header with Gradient */}
      <LinearGradient
        colors={[cardColor + '15', cardColor + '05'] as unknown as readonly [string, string, ...string[]]}
        style={styles.cardHeader}
      >
        <View style={styles.memberInfo}>
          <Image source={{ uri: penalty.memberAvatar }} style={styles.avatar} />
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{penalty.memberName}</Text>
            <View style={styles.typeBadge}>
              <Ionicons name={cardIcon as any} size={14} color="white" />
              <Text style={styles.typeText}>{penaltyTypeConfig?.name}</Text>
            </View>
          </View>
        </View>

        {/* Timer */}
        <PenaltyTimer
          remainingMinutes={penalty.remaining * 24 * 60}
          totalMinutes={penalty.duration * 24 * 60}
          size={70}
          strokeWidth={6}
          color={cardColor}
          showDays={true}
        />
      </LinearGradient>

      {/* Card Content */}
      <View style={styles.cardContent}>
        <Text style={styles.reason}>{penalty.reason}</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: cardColor
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(getProgressPercentage())}% {translations.completed}
          </Text>
        </View>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={16} color={theme.colors.gray} />
            <Text style={styles.infoText}>{formatDuration(penalty.duration)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name={getMethodIcon(penalty.selectionMethod)} size={16} color={theme.colors.gray} />
            <Text style={styles.infoText}>{getMethodText(penalty.selectionMethod)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={16} color={theme.colors.gray} />
            <Text style={styles.infoText}>{penalty.remaining}d {translations.remaining}</Text>
          </View>
        </View>

        {/* Actions for Active Penalties */}
        {penalty.isActive && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.minusButton]}
              onPress={() => onAdjustTime(penalty.id, -1)}
            >
              <Ionicons name="remove" size={18} color="#EF4444" />
              <Text style={styles.actionButtonText}>{translations.minusDay}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.plusButton]}
              onPress={() => onAdjustTime(penalty.id, 1)}
            >
              <Ionicons name="add" size={18} color="#10B981" />
              <Text style={styles.actionButtonText}>{translations.plusDay}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.endButton}
              onPress={() => onEndPenalty(penalty.id)}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark] as unknown as readonly [string, string, ...string[]]}
                style={styles.endButtonGradient}
              >
                <Ionicons name="checkmark-circle" size={18} color="white" />
                <Text style={styles.endButtonText}>{translations.complete}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Completed Badge */}
        {!penalty.isActive && penalty.reflection && (
          <View style={styles.completedSection}>
            <LinearGradient
              colors={['#10B981', '#059669'] as unknown as readonly [string, string, ...string[]]}
              style={styles.completedBadge}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.completedText}>{translations.completedBadge}</Text>
            </LinearGradient>
            <Text style={styles.reflectionText}>"{penalty.reflection}"</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 3,
    borderColor: 'white',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  reason: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 16,
    lineHeight: 22,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.gray,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.gray,
    marginLeft: 4,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
  },
  minusButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  plusButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  endButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  endButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  endButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  completedSection: {
    alignItems: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  completedText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  reflectionText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: theme.colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PenaltyCard;



