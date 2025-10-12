import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AddReflectionScreenProps {
  navigation: any;
  route?: any;
}

const moodEmojis = {
  happy: '😊',
  grateful: '🙏',
  proud: '🌟',
  thoughtful: '🤔',
};

export default function AddReflectionScreen({ navigation, route }: AddReflectionScreenProps) {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<keyof typeof moodEmojis | null>(null);

  const handleSaveReflection = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write your reflection');
      return;
    }

    Alert.alert(
      'Reflection Added! 🎉',
      'Your reflection has been saved successfully.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

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
          <Text style={styles.headerTitle}>Add Reflection</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Form */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.label}>What are your thoughts?</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Share your thoughts about your goals, achievements, or challenges..."
            style={styles.textInput}
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>How are you feeling? (Optional)</Text>
          <View style={styles.moodContainer}>
            {Object.entries(moodEmojis).map(([moodKey, emoji]) => (
              <TouchableOpacity
                key={moodKey}
                onPress={() => setSelectedMood(moodKey as keyof typeof moodEmojis)}
                style={[
                  styles.moodButton,
                  selectedMood === moodKey && styles.moodButtonSelected
                ]}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
                <Text style={[
                  styles.moodText,
                  selectedMood === moodKey && styles.moodTextSelected
                ]}>
                  {moodKey.charAt(0).toUpperCase() + moodKey.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveReflection}
        >
          <LinearGradient 
            colors={['#3B82F6', '#10B981']} 
            style={styles.saveButtonGradient}
          >
            <Ionicons name="heart" size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Reflection</Text>
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
  card: {
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  moodButton: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    minWidth: 60,
  },
  moodButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  moodEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  moodText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  moodTextSelected: {
    color: '#FFFFFF',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
