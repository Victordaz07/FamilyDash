import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GoalDetailsScreenProps {
  navigation: any;
  route: any;
}

export default function GoalDetailsScreen({ navigation, route }: GoalDetailsScreenProps) {
  const { goalId } = route.params;

  const handleEditGoal = () => {
    Alert.alert(
      'Coming Soon',
      'Goal editing will be available in the next update!',
      [{ text: 'OK' }]
    );
  };

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
          <Text className="text-white text-xl font-bold">Goal Details</Text>
          <TouchableOpacity
            onPress={handleEditGoal}
            className="bg-white/20 rounded-full p-2"
          >
            <Text className="text-white text-lg">✏️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-6xl mb-6">📋</Text>
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          Goal Details
        </Text>
        <Text className="text-gray-600 text-center text-base mb-2">
          Goal ID: {goalId}
        </Text>
        <Text className="text-gray-600 text-center text-base mb-8">
          Detailed view with milestones, activity, and reflections coming soon!
        </Text>
        
        <TouchableOpacity
          onPress={handleEditGoal}
          className="bg-purple-600 rounded-2xl px-8 py-4"
        >
          <Text className="text-white font-semibold text-lg">
            Edit Goal
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
