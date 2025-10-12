import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Goal, GoalCategory, GoalStatus } from '../../types/goals';
import { categoryColors, categoryLabels, statusColors, statusLabels } from '../../theme/goalsColors';
import { useGoals } from '../../hooks/useGoals';
import DateTimePicker from '@react-native-community/datetimepicker';

interface EditGoalScreenProps {
  navigation: any;
  route: any;
}

export default function EditGoalScreen({ navigation, route }: EditGoalScreenProps) {
  const { goalId } = route.params;
  const { goals, updateGoal, deleteGoal } = useGoals();
  
  const goal = goals.find(g => g.id === goalId);

  // Form state
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [category, setCategory] = useState<GoalCategory>(goal?.category || 'family');
  const [status, setStatus] = useState<GoalStatus>(goal?.status || 'active');
  const [visibility, setVisibility] = useState<'family' | 'private'>(goal?.visibility || 'family');
  const [hasDeadline, setHasDeadline] = useState(!!goal?.deadlineAt);
  const [deadline, setDeadline] = useState(goal?.deadlineAt ? new Date(goal.deadlineAt) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const categories: GoalCategory[] = [
    'spiritual',
    'family', 
    'personal',
    'health',
    'education',
    'financial',
    'relationship'
  ];

  const statuses: GoalStatus[] = ['active', 'paused', 'completed', 'cancelled'];

  useEffect(() => {
    if (!goal) {
      Alert.alert('Error', 'Goal not found', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [goal]);

  const handleUpdateGoal = () => {
    if (!goal) return;

    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    // Update goal
    updateGoal(goal.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      status,
      visibility,
      deadlineAt: hasDeadline ? deadline.getTime() : undefined,
    });

    Alert.alert(
      'Success! ✅',
      'Goal updated successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handleDeleteGoal = () => {
    if (!goal) return;

    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteGoal(goal.id);
            Alert.alert('Deleted', 'Goal deleted successfully', [
              { text: 'OK', onPress: () => navigation.navigate('GoalsMain') }
            ]);
          }
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

  if (!goal) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Goal not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient 
        colors={['#7B6CF6', '#E96AC0']} 
        className="px-5 pt-12 pb-6"
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white/20 rounded-full p-2"
          >
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Edit Goal</Text>
          <TouchableOpacity
            onPress={handleDeleteGoal}
            className="bg-red-500/30 rounded-full p-2"
          >
            <Text className="text-white text-lg">🗑️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Form */}
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Title */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Goal Title *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Learn Spanish Together"
            className="bg-gray-100 rounded-xl px-4 py-3 text-base"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Description */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What do you want to achieve? (optional)"
            className="bg-gray-100 rounded-xl px-4 py-3 text-base min-h-[100px]"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Category */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Category *</Text>
          <View className="flex-row flex-wrap gap-2">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl ${
                  category === cat ? 'border-2' : 'bg-gray-100'
                }`}
                style={{
                  backgroundColor: category === cat ? `${categoryColors[cat]}20` : '#F3F4F6',
                  borderColor: category === cat ? categoryColors[cat] : 'transparent'
                }}
              >
                <Text 
                  className="font-medium"
                  style={{ color: category === cat ? categoryColors[cat] : '#6B7280' }}
                >
                  {categoryLabels[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Status</Text>
          <View className="flex-row flex-wrap gap-2">
            {statuses.map((stat) => (
              <TouchableOpacity
                key={stat}
                onPress={() => setStatus(stat)}
                className={`px-4 py-2 rounded-xl ${
                  status === stat ? 'border-2' : 'bg-gray-100'
                }`}
                style={{
                  backgroundColor: status === stat ? `${statusColors[stat]}20` : '#F3F4F6',
                  borderColor: status === stat ? statusColors[stat] : 'transparent'
                }}
              >
                <Text 
                  className="font-medium"
                  style={{ color: status === stat ? statusColors[stat] : '#6B7280' }}
                >
                  {statusLabels[stat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Visibility */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Visibility</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setVisibility('family')}
              className={`flex-1 py-3 rounded-xl ${
                visibility === 'family' ? 'bg-purple-100 border-2 border-purple-300' : 'bg-gray-100'
              }`}
            >
              <Text className={`text-center font-medium ${
                visibility === 'family' ? 'text-purple-700' : 'text-gray-600'
              }`}>
                👨‍👩‍👧‍👦 Family
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setVisibility('private')}
              className={`flex-1 py-3 rounded-xl ${
                visibility === 'private' ? 'bg-purple-100 border-2 border-purple-300' : 'bg-gray-100'
              }`}
            >
              <Text className={`text-center font-medium ${
                visibility === 'private' ? 'text-purple-700' : 'text-gray-600'
              }`}>
                🔒 Private
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Deadline */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Set Deadline</Text>
            <Switch
              value={hasDeadline}
              onValueChange={setHasDeadline}
              trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
              thumbColor={hasDeadline ? '#7C3AED' : '#F3F4F6'}
            />
          </View>
          {hasDeadline && (
            <>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-gray-100 rounded-xl px-4 py-3"
              >
                <Text className="text-base text-gray-900">
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

        {/* Progress Info (Read-only) */}
        <View className="bg-purple-50 rounded-2xl p-6 shadow-sm mb-4">
          <Text className="text-lg font-bold text-purple-900 mb-3">Progress</Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-sm text-purple-600">Milestones</Text>
              <Text className="text-2xl font-bold text-purple-900">
                {goal.milestonesDone}/{goal.milestonesCount}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-purple-600">Reflections</Text>
              <Text className="text-2xl font-bold text-purple-900">
                {goal.reflectionCount || 0}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-purple-600">Progress</Text>
              <Text className="text-2xl font-bold text-purple-900">
                {goal.milestonesCount > 0 
                  ? Math.round((goal.milestonesDone / goal.milestonesCount) * 100) 
                  : 0}%
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-1 bg-gray-200 rounded-2xl py-4"
          >
            <Text className="text-gray-700 font-semibold text-center text-lg">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleUpdateGoal}
            className="flex-1 bg-purple-600 rounded-2xl py-4"
          >
            <Text className="text-white font-semibold text-center text-lg">
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
