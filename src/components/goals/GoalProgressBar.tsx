import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GoalProgressBarProps {
  completed: number;
  total: number;
  color?: string;
  showPercentage?: boolean;
}

export default function GoalProgressBar({ 
  completed, 
  total, 
  color = '#3B82F6',
  showPercentage = true 
}: GoalProgressBarProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View 
          style={[styles.progressBar, { 
            width: `${percentage}%`, 
            backgroundColor: color 
          }]} 
        />
      </View>
      {showPercentage && (
        <Text style={styles.progressText}>
          {percentage}% • {completed}/{total} milestones
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});




