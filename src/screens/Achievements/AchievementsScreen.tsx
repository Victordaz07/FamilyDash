/**
 * 🏆 ACHIEVEMENTS SCREEN
 * Displays all achievements organized by category with progress tracking
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/store';
import { ACHIEVEMENTS, getAchievementsByCategory, CATEGORY_LABELS, AchievementCategory } from '@/features/achievements/definitions';
import { AchievementCard } from '@/components/achievements/AchievementCard';

interface AchievementsScreenProps {
  navigation: any;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ navigation }) => {
  const { achievements, points, stats } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);

  // Calculate stats
  const totalAchievements = Object.keys(ACHIEVEMENTS).length;
  const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;

  // Filter achievements by category
  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') {
      return Object.values(ACHIEVEMENTS);
    }
    return getAchievementsByCategory(selectedCategory);
  }, [selectedCategory]);

  const categories: Array<{ key: AchievementCategory | 'all'; label: string; icon: string }> = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'getting_started', label: 'Getting Started', icon: 'rocket' },
    { key: 'consistency', label: 'Consistency', icon: 'flame' },
    { key: 'helper', label: 'Helper', icon: 'hand-left' },
    { key: 'habit_builder', label: 'Habits', icon: 'trending-up' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Achievements</Text>
          <Text style={styles.headerSubtitle}>
            {unlockedCount}/{totalAchievements} unlocked • {points} points
          </Text>
        </View>
        
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#8B5CF6" />
          <Text style={styles.statValue}>{unlockedCount}</Text>
          <Text style={styles.statLabel}>Unlocked</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="star" size={24} color="#FBBF24" />
          <Text style={styles.statValue}>{points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="flame" size={24} color="#EF4444" />
          <Text style={styles.statValue}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done" size={24} color="#10B981" />
          <Text style={styles.statValue}>{stats.totalCompleted}</Text>
          <Text style={styles.statLabel}>Tasks Done</Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryButton,
              selectedCategory === cat.key && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Ionicons
              name={cat.icon as any}
              size={20}
              color={selectedCategory === cat.key ? '#FFFFFF' : '#8B5CF6'}
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === cat.key && styles.categoryButtonTextActive
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Achievements List */}
      <ScrollView style={styles.achievementsList} contentContainerStyle={styles.achievementsContent}>
        {filteredAchievements.map((def) => (
          <AchievementCard
            key={def.id}
            definition={def}
            state={achievements[def.id]}
            onPress={() => setSelectedAchievement(def.id)}
          />
        ))}
      </ScrollView>

      {/* Detail Modal */}
      {selectedAchievement && (
        <Modal
          visible={!!selectedAchievement}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedAchievement(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedAchievement(null)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {ACHIEVEMENTS[selectedAchievement].title}
              </Text>
              <Text style={styles.modalDescription}>
                {ACHIEVEMENTS[selectedAchievement].description}
              </Text>
              <Text style={styles.modalPoints}>
                {ACHIEVEMENTS[selectedAchievement].points} points
              </Text>
              {achievements[selectedAchievement]?.unlocked && (
                <Text style={styles.modalUnlocked}>
                  ✅ Unlocked on {new Date(achievements[selectedAchievement].unlockedAt!).toLocaleDateString()}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  categoriesScroll: {
    marginVertical: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  categoryButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 6,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  achievementsList: {
    flex: 1,
  },
  achievementsContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalPoints: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalUnlocked: {
    fontSize: 14,
    color: '#10B981',
    textAlign: 'center',
    fontWeight: '500',
  },
});
