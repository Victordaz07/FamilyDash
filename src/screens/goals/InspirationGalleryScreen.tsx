import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface InspirationGalleryScreenProps {
  navigation: any;
}

// Mock data for inspiration gallery
const inspirationItems = [
  {
    id: '1',
    title: 'Family Reading Time',
    description: 'Set aside 30 minutes daily for family reading',
    category: 'Family',
    image: '📚',
    color: '#3B82F6',
  },
  {
    id: '2',
    title: 'Weekly Adventure',
    description: 'Explore a new place together every weekend',
    category: 'Personal',
    image: '🏔️',
    color: '#10B981',
  },
  {
    id: '3',
    title: 'Gratitude Journal',
    description: 'Share three things you\'re grateful for each day',
    category: 'Spiritual',
    image: '📖',
    color: '#F59E0B',
  },
  {
    id: '4',
    title: 'Healthy Cooking',
    description: 'Learn and cook one new healthy recipe weekly',
    category: 'Health',
    image: '🍳',
    color: '#EF4444',
  },
  {
    id: '5',
    title: 'Family Garden',
    description: 'Plant and maintain a small family garden',
    category: 'Family',
    image: '🌱',
    color: '#8B5CF6',
  },
  {
    id: '6',
    title: 'Tech-Free Time',
    description: 'One hour daily without screens for family connection',
    category: 'Relationship',
    image: '📵',
    color: '#06B6D4',
  },
];

export default function InspirationGalleryScreen({ navigation }: InspirationGalleryScreenProps) {
  const renderInspirationItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.inspirationCard, { borderLeftColor: item.color }]}>
      <View style={styles.inspirationHeader}>
        <Text style={styles.inspirationEmoji}>{item.image}</Text>
        <View style={styles.inspirationInfo}>
          <Text style={styles.inspirationTitle}>{item.title}</Text>
          <Text style={styles.inspirationCategory}>{item.category}</Text>
        </View>
        <TouchableOpacity style={styles.useButton}>
          <Text style={styles.useButtonText}>Use</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.inspirationDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#10B981']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inspiration Gallery</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>✨ Goal Inspiration</Text>
          <Text style={styles.introDescription}>
            Browse through these inspiring ideas to help you create meaningful family goals. 
            Tap "Use" to turn any inspiration into your own family goal!
          </Text>
        </View>

        <FlatList
          data={inspirationItems}
          renderItem={renderInspirationItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('AddGoal')}
        >
          <LinearGradient 
            colors={['#3B82F6', '#10B981']} 
            style={styles.createButtonGradient}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.createButtonText}>Create Custom Goal</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  introDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    gap: 12,
  },
  inspirationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inspirationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inspirationEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  inspirationInfo: {
    flex: 1,
  },
  inspirationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  inspirationCategory: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  useButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  inspirationDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 18,
  },
  createButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});




