/**
 * AchievementsWidget - Home screen widget for achievements overview
 * Shows completed, total, points, and progress percentage
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAchievementsStore } from '@/modules/quickActions/store/achievementsStore';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/styles/simpleTheme';
import { Ionicons } from '@expo/vector-icons';

interface AchievementsWidgetProps {
  familyId?: string;
}

export const AchievementsWidget: React.FC<AchievementsWidgetProps> = ({ familyId }) => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { init, progressById, templates, loading } = useAchievementsStore();

  useEffect(() => {
    // Initialize achievements if we have both familyId and userId
    if (familyId && user?.uid) {
      void init(familyId, user.uid);
    }
  }, [familyId, user?.uid]);

  // Calculate stats
  const total = templates.length;
  const completed = Object.values(progressById).filter(p => p.achieved).length;
  const points = Object.values(progressById).reduce((sum, p) => sum + (p.pointsAwarded ?? 0), 0);
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handlePress = () => {
    navigation.navigate('QuickActions', { screen: 'AchievementsScreen' });
  };

  if (loading && total === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="trophy" size={20} color="#3B82F6" />
          <Text style={styles.title}>Achievements & Medals</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
      
      <View style={styles.statsRow}>
        <StatItem label="Completed" value={completed} />
        <StatItem label="Total" value={total} />
        <StatItem label="Points" value={points} />
        <StatItem label="Progress" value={`${progressPct}%`} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Tap to view details →</Text>
      </View>
    </TouchableOpacity>
  );
};

interface StatItemProps {
  label: string;
  value: string | number;
}

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 130, 246, 0.1)',
  },
  footerText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },
});

