import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AddGoalScreenProps {
  navigation: any;
}

export default function AddGoalScreen({ navigation }: AddGoalScreenProps) {
  const handleCreateGoal = () => {
    Alert.alert(
      'Coming Soon',
      'Goal creation will be available in the next update!',
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
          <Text className="text-white text-xl font-bold">Create New Goal</Text>
          <View className="w-8" />
        </View>
      </LinearGradient>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-6xl mb-6">🎯</Text>
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          Create Your Family Goal
        </Text>
        <Text className="text-gray-600 text-center text-base mb-8">
          Set meaningful goals together and track your progress as a family
        </Text>
        
        <TouchableOpacity
          onPress={handleCreateGoal}
          className="bg-purple-600 rounded-2xl px-8 py-4"
        >
          <Text className="text-white font-semibold text-lg">
            Start Creating
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
