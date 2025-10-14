import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/styles/simpleTheme';

interface ProgressTrackerProps {
  progress: number; // 0-100
  points: number;
  earnedPoints?: number;
  completedSteps?: number;
  totalSteps?: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  points,
  earnedPoints = 0,
  completedSteps = 0,
  totalSteps = 0,
}) => {
  const getProgressColor = (progress: number) => {
    if (progress < 30) return [theme.colors.error, '#DC2626'];
    if (progress < 70) return [theme.colors.warning, '#D97706'];
    return [theme.colors.success, '#059669'];
  };

  const progressColors = getProgressColor(progress);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trending-up" size={20} color={theme.colors.primary} />
        <Text style={styles.title}>Progress</Text>
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Task Completion</Text>
          <Text style={[styles.progressValue, { color: progressColors[0] }]}>
            {Math.round(progress)}%
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <LinearGradient
              colors={progressColors as [string, string]}
              style={[styles.progressBarFill, { width: `${progress}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedSteps}</Text>
            <Text style={styles.statLabel}>Steps Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
              {earnedPoints}
            </Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.colors.gray }]}>
              {points - earnedPoints}
            </Text>
            <Text style={styles.statLabel}>Points to Earn</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  progressSection: {
    gap: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold,
  },
  progressBarContainer: {
    marginVertical: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.gray,
    textAlign: 'center',
  },
});

export default ProgressTracker;




