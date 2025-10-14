import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GoalInfoScreenProps {
  navigation: any;
}

export default function GoalInfoScreen({ navigation }: GoalInfoScreenProps) {
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
          <Text className="text-white text-xl font-bold">About Family Goals</Text>
          <View className="w-8" />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-6">
        <View className="bg-white rounded-2xl p-6 mb-4">
          <Text className="text-4xl mb-4 text-center">🎯</Text>
          <Text className="text-xl font-bold text-gray-900 mb-4 text-center">
            Family Goals Hub
          </Text>
          <Text className="text-gray-700 text-base leading-6 mb-4">
            Set meaningful goals together as a family and track your progress. 
            Build stronger connections while achieving your dreams.
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-6 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            ✨ Features
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">📊</Text>
              <Text className="text-gray-700 flex-1">Track progress with milestones</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">👨‍👩‍👧‍👦</Text>
              <Text className="text-gray-700 flex-1">Collaborate as a family</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">💭</Text>
              <Text className="text-gray-700 flex-1">Share reflections and insights</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">🏆</Text>
              <Text className="text-gray-700 flex-1">Celebrate achievements</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-6 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            🎨 Categories
          </Text>
          <Text className="text-gray-700 text-base leading-6">
            Organize your goals by category: Spiritual, Family, Personal, Health, 
            Education, Financial, and Relationship goals.
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            🚀 Getting Started
          </Text>
          <Text className="text-gray-700 text-base leading-6">
            1. Create your first family goal{'\n'}
            2. Break it down into milestones{'\n'}
            3. Track progress together{'\n'}
            4. Share reflections and celebrate wins!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}




