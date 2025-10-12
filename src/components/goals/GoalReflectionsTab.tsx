import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Reflection } from '../../types/goals';

interface GoalReflectionsTabProps {
  reflections: Reflection[];
  onAddReflection: (content: string, mood?: string) => void;
  onEditReflection: (reflectionId: string, content: string) => void;
  onDeleteReflection: (reflectionId: string) => void;
}

export default function GoalReflectionsTab({ 
  reflections, 
  onAddReflection, 
  onEditReflection, 
  onDeleteReflection 
}: GoalReflectionsTabProps) {
  const [newReflection, setNewReflection] = React.useState('');
  const [selectedMood, setSelectedMood] = React.useState<string>('');
  const [editingReflection, setEditingReflection] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState('');

  const moods = [
    { key: 'happy', emoji: '😊', label: 'Happy' },
    { key: 'grateful', emoji: '🙏', label: 'Grateful' },
    { key: 'proud', emoji: '🏆', label: 'Proud' },
    { key: 'thoughtful', emoji: '🤔', label: 'Thoughtful' }
  ];

  const handleAddReflection = () => {
    if (newReflection.trim()) {
      onAddReflection(newReflection.trim(), selectedMood || undefined);
      setNewReflection('');
      setSelectedMood('');
    }
  };

  const handleEditStart = (reflection: Reflection) => {
    setEditingReflection(reflection.id);
    setEditContent(reflection.content);
  };

  const handleEditSave = () => {
    if (editContent.trim() && editingReflection) {
      onEditReflection(editingReflection, editContent.trim());
      setEditingReflection(null);
      setEditContent('');
    }
  };

  const handleEditCancel = () => {
    setEditingReflection(null);
    setEditContent('');
  };

  const handleDeleteReflection = (reflectionId: string, content: string) => {
    Alert.alert(
      'Delete Reflection',
      `Are you sure you want to delete this reflection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDeleteReflection(reflectionId)
        }
      ]
    );
  };

  const getMoodEmoji = (mood?: string) => {
    const moodObj = moods.find(m => m.key === mood);
    return moodObj ? moodObj.emoji : '😊';
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 space-y-6">
        {/* Add New Reflection */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">Add Reflection</Text>
          
          <TextInput
            value={newReflection}
            onChangeText={setNewReflection}
            placeholder="Share your thoughts about this goal..."
            className="bg-gray-100 rounded-xl px-4 py-3 text-base mb-4 min-h-[100px]"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />

          {/* Mood Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">How are you feeling?</Text>
            <View className="flex-row gap-3">
              {moods.map((mood) => (
                <TouchableOpacity
                  key={mood.key}
                  onPress={() => setSelectedMood(mood.key)}
                  className={`p-3 rounded-xl ${
                    selectedMood === mood.key ? 'bg-purple-100 border-2 border-purple-300' : 'bg-gray-100'
                  }`}
                >
                  <Text className="text-2xl">{mood.emoji}</Text>
                  <Text className={`text-xs mt-1 ${
                    selectedMood === mood.key ? 'text-purple-700' : 'text-gray-600'
                  }`}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleAddReflection}
            className="bg-purple-600 py-3 rounded-xl"
            disabled={!newReflection.trim()}
          >
            <Text className="text-white font-medium text-center">Add Reflection</Text>
          </TouchableOpacity>
        </View>

        {/* Reflections List */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">Reflections</Text>
            <Text className="text-sm text-gray-500">{reflections.length} total</Text>
          </View>
          
          {reflections.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-4xl mb-3">💭</Text>
              <Text className="text-gray-500 text-center">No reflections yet</Text>
              <Text className="text-gray-400 text-center text-sm mt-1">
                Share your thoughts about this goal
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {reflections.map((reflection) => (
                <View key={reflection.id} className="bg-gray-50 rounded-xl p-4">
                  {editingReflection === reflection.id ? (
                    <View className="space-y-3">
                      <TextInput
                        value={editContent}
                        onChangeText={setEditContent}
                        className="bg-white rounded-lg px-3 py-2 text-base min-h-[80px]"
                        multiline
                        textAlignVertical="top"
                        autoFocus
                      />
                      <View className="flex-row gap-3">
                        <TouchableOpacity
                          onPress={handleEditSave}
                          className="flex-1 bg-green-500 py-2 rounded-lg"
                        >
                          <Text className="text-white text-center font-medium">Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleEditCancel}
                          className="flex-1 bg-gray-500 py-2 rounded-lg"
                        >
                          <Text className="text-white text-center font-medium">Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-2xl">{getMoodEmoji(reflection.mood)}</Text>
                          <Text className="text-sm text-gray-500">
                            {formatTimestamp(reflection.createdAt)}
                          </Text>
                        </View>
                        <View className="flex-row gap-2">
                          <TouchableOpacity
                            onPress={() => handleEditStart(reflection)}
                            className="p-2"
                          >
                            <Text className="text-gray-400">✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteReflection(reflection.id, reflection.content)}
                            className="p-2"
                          >
                            <Text className="text-gray-400">🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text className="text-gray-900 leading-6">{reflection.content}</Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
