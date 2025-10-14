/**
 * 🏆 ACHIEVEMENT CARD COMPONENT
 * Displays achievement with unlock status and progress
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AchievementDefinition } from '@/features/achievements/definitions';
import { AchievementState } from '@/store/achievementsSlice';

interface AchievementCardProps {
  definition: AchievementDefinition;
  state?: AchievementState;
  onPress?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  definition,
  state,
  onPress,
}) => {
  const isUnlocked = state?.unlocked ?? false;
  const progress = state?.progress ?? 0;
  const progressPercent = (progress / definition.threshold) * 100;

  return (
    <TouchableOpacity
      style={[styles.card, !isUnlocked && styles.cardLocked]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={isUnlocked ? ['#10B981', '#34D399'] : ['#9CA3AF', '#D1D5DB']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, !isUnlocked && styles.iconLocked]}>
          <Ionicons
            name={definition.icon as any}
            size={32}
            color={isUnlocked ? '#FFFFFF' : '#6B7280'}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, !isUnlocked && styles.titleLocked]}>
            {definition.title}
          </Text>
          <Text style={[styles.description, !isUnlocked && styles.descriptionLocked]}>
            {definition.description}
          </Text>
          
          {/* Progress bar */}
          {!isUnlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {progress}/{definition.threshold}
              </Text>
            </View>
          )}
          
          {/* Points */}
          <View style={styles.points}>
            <Ionicons name="star" size={16} color={isUnlocked ? '#FBBF24' : '#9CA3AF'} />
            <Text style={[styles.pointsText, !isUnlocked && styles.pointsTextLocked]}>
              {definition.points} pts
            </Text>
          </View>
        </View>

        {/* Unlocked badge */}
        {isUnlocked && (
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLocked: {
    opacity: 0.7,
  },
  gradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconLocked: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  titleLocked: {
    color: '#374151',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  descriptionLocked: {
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    minWidth: 40,
    textAlign: 'right',
  },
  points: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  pointsTextLocked: {
    color: '#6B7280',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
  },
});




