import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Switch, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Goal, GoalCategory, GoalStatus } from '@/types/goals';
import { categoryColors, categoryLabels } from '../../theme/goalsColors';
import { useGoals } from '@/hooks/useGoals';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface AddGoalScreenProps {
  navigation: any;
}

export default function AddGoalScreen({ navigation }: AddGoalScreenProps) {
  const { addGoal } = useGoals();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('family');
  const [visibility, setVisibility] = useState<'family' | 'private'>('family');
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [initialMilestones, setInitialMilestones] = useState<string[]>(['']);

  const categories: GoalCategory[] = [
    'spiritual',
    'family', 
    'personal',
    'health',
    'education',
    'financial',
    'relationship'
  ];

  const handleAddMilestoneField = () => {
    setInitialMilestones([...initialMilestones, '']);
  };

  const handleRemoveMilestoneField = (index: number) => {
    const newMilestones = initialMilestones.filter((_, i) => i !== index);
    setInitialMilestones(newMilestones);
  };

  const handleUpdateMilestone = (index: number, value: string) => {
    const newMilestones = [...initialMilestones];
    newMilestones[index] = value;
    setInitialMilestones(newMilestones);
  };

  const handleCreateGoal = () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    // Count valid milestones
    const validMilestones = initialMilestones.filter(m => m.trim().length > 0);

    // Create new goal
    const newGoal: Goal = {
      id: Date.now().toString(),
      familyId: 'family-1', // TODO: Get from auth context
      ownerId: 'user-1', // TODO: Get from auth context
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deadlineAt: hasDeadline ? deadline.getTime() : undefined,
      milestonesCount: validMilestones.length,
      milestonesDone: 0,
      visibility,
      reflectionCount: 0,
      lastActivityAt: Date.now(),
    };

    addGoal(newGoal);

    Alert.alert(
      'Success! 🎉',
      `"${title}" has been created successfully!`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDeadline(selectedDate);
    }
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
          <Text style={styles.headerTitle}>Create New Goal</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Form */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Title */}
        <View style={styles.card}>
          <Text style={styles.label}>Goal Title *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Learn Spanish Together"
            style={styles.textInput}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What do you want to achieve? (optional)"
            style={[styles.textInput, styles.multilineInput]}
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Category */}
        <View style={styles.card}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: category === cat ? `${categoryColors[cat]}20` : '#F3F4F6',
                    borderColor: category === cat ? categoryColors[cat] : 'transparent',
                    borderWidth: category === cat ? 2 : 0,
                  }
                ]}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    { color: category === cat ? categoryColors[cat] : '#6B7280' }
                  ]}
                >
                  {categoryLabels[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Visibility */}
        <View style={styles.card}>
          <Text style={styles.label}>Visibility</Text>
          <View style={styles.visibilityContainer}>
            <TouchableOpacity
              onPress={() => setVisibility('family')}
              style={[
                styles.visibilityButton,
                {
                  backgroundColor: visibility === 'family' ? '#3B82F620' : '#F3F4F6',
                  borderColor: visibility === 'family' ? '#3B82F6' : 'transparent',
                  borderWidth: visibility === 'family' ? 2 : 0,
                }
              ]}
            >
              <Text style={[
                styles.visibilityButtonText,
                { color: visibility === 'family' ? '#3B82F6' : '#6B7280' }
              ]}>
                👨‍👩‍👧‍👦 Family
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setVisibility('private')}
              style={[
                styles.visibilityButton,
                {
                  backgroundColor: visibility === 'private' ? '#3B82F620' : '#F3F4F6',
                  borderColor: visibility === 'private' ? '#3B82F6' : 'transparent',
                  borderWidth: visibility === 'private' ? 2 : 0,
                }
              ]}
            >
              <Text style={[
                styles.visibilityButtonText,
                { color: visibility === 'private' ? '#3B82F6' : '#6B7280' }
              ]}>
                🔒 Private
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Deadline */}
        <View style={styles.card}>
          <View style={styles.deadlineHeader}>
            <Text style={styles.label}>Set Deadline</Text>
            <Switch
              value={hasDeadline}
              onValueChange={setHasDeadline}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={hasDeadline ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
          {hasDeadline && (
            <>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                <Text style={styles.dateButtonText}>
                  📅 {deadline.toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={deadline}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
            </>
          )}
        </View>

        {/* Initial Milestones */}
        <View style={styles.card}>
          <View style={styles.milestonesHeader}>
            <Text style={styles.label}>Milestones (Optional)</Text>
            <TouchableOpacity
              onPress={handleAddMilestoneField}
              style={styles.addMilestoneButton}
            >
              <Text style={styles.addMilestoneButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.milestonesSubtitle}>
            Break down your goal into smaller steps
          </Text>
          {initialMilestones.map((milestone, index) => (
            <View key={index} style={styles.milestoneRow}>
              <TextInput
                value={milestone}
                onChangeText={(value) => handleUpdateMilestone(index, value)}
                placeholder={`Milestone ${index + 1}`}
                style={styles.milestoneInput}
                placeholderTextColor="#9CA3AF"
              />
              {initialMilestones.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveMilestoneField(index)}
                  style={styles.removeMilestoneButton}
                >
                  <Text style={styles.removeMilestoneButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleCreateGoal}
          style={styles.createButton}
        >
          <Text style={styles.createButtonText}>
            Create Goal 🎯
          </Text>
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
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  multilineInput: {
    minHeight: 100,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  visibilityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  visibilityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
  },
  visibilityButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  deadlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1E293B',
  },
  milestonesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addMilestoneButton: {
    backgroundColor: '#3B82F620',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addMilestoneButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  milestonesSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  milestoneInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  removeMilestoneButton: {
    padding: 8,
  },
  removeMilestoneButtonText: {
    color: '#EF4444',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
