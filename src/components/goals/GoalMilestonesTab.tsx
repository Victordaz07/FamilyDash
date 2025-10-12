import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Milestone } from '../../types/goals';

interface GoalMilestonesTabProps {
  milestones: Milestone[];
  onToggleMilestone: (milestoneId: string, done: boolean) => void;
  onAddMilestone: (title: string) => void;
  onEditMilestone: (milestoneId: string, title: string) => void;
  onDeleteMilestone: (milestoneId: string) => void;
}

export default function GoalMilestonesTab({ 
  milestones, 
  onToggleMilestone, 
  onAddMilestone, 
  onEditMilestone, 
  onDeleteMilestone 
}: GoalMilestonesTabProps) {
  const [newMilestoneTitle, setNewMilestoneTitle] = React.useState('');
  const [editingMilestone, setEditingMilestone] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');

  const handleAddMilestone = () => {
    if (newMilestoneTitle.trim()) {
      onAddMilestone(newMilestoneTitle.trim());
      setNewMilestoneTitle('');
    }
  };

  const handleEditStart = (milestone: Milestone) => {
    setEditingMilestone(milestone.id);
    setEditTitle(milestone.title);
  };

  const handleEditSave = () => {
    if (editTitle.trim() && editingMilestone) {
      onEditMilestone(editingMilestone, editTitle.trim());
      setEditingMilestone(null);
      setEditTitle('');
    }
  };

  const handleEditCancel = () => {
    setEditingMilestone(null);
    setEditTitle('');
  };

  const handleDeleteMilestone = (milestoneId: string, title: string) => {
    Alert.alert(
      'Delete Milestone',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDeleteMilestone(milestoneId)
        }
      ]
    );
  };

  const completedCount = milestones.filter(m => m.done).length;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 space-y-6">
        {/* Progress Summary */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">Milestones</Text>
            <Text className="text-sm text-gray-500">
              {completedCount}/{milestones.length} completed
            </Text>
          </View>
          <View className="h-3 bg-gray-200 rounded-full">
            <View 
              className="h-3 bg-purple-600 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
          <Text className="text-center mt-2 text-sm text-gray-600">
            {Math.round(progress)}% Complete
          </Text>
        </View>

        {/* Add New Milestone */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">Add Milestone</Text>
          <View className="flex-row gap-3">
            <TextInput
              value={newMilestoneTitle}
              onChangeText={setNewMilestoneTitle}
              placeholder="Enter milestone title..."
              className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-base"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={handleAddMilestone}
              className="bg-purple-600 px-6 py-3 rounded-xl"
              disabled={!newMilestoneTitle.trim()}
            >
              <Text className="text-white font-medium">Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Milestones List */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">All Milestones</Text>
          {milestones.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-4xl mb-3">🎯</Text>
              <Text className="text-gray-500 text-center">No milestones yet</Text>
              <Text className="text-gray-400 text-center text-sm mt-1">
                Add your first milestone above
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {milestones.map((milestone) => (
                <View key={milestone.id} className="bg-gray-50 rounded-xl p-4">
                  {editingMilestone === milestone.id ? (
                    <View className="flex-row items-center gap-3">
                      <TextInput
                        value={editTitle}
                        onChangeText={setEditTitle}
                        className="flex-1 bg-white rounded-lg px-3 py-2 text-base"
                        autoFocus
                      />
                      <TouchableOpacity
                        onPress={handleEditSave}
                        className="bg-green-500 px-3 py-2 rounded-lg"
                      >
                        <Text className="text-white text-sm">✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleEditCancel}
                        className="bg-gray-500 px-3 py-2 rounded-lg"
                      >
                        <Text className="text-white text-sm">✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-3">
                      <TouchableOpacity
                        onPress={() => onToggleMilestone(milestone.id, !milestone.done)}
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          milestone.done 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300'
                        }`}
                      >
                        {milestone.done && (
                          <Text className="text-white text-xs">✓</Text>
                        )}
                      </TouchableOpacity>
                      
                      <View className="flex-1">
                        <Text className={`text-base ${
                          milestone.done ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {milestone.title}
                        </Text>
                        {milestone.dueAt && (
                          <Text className="text-sm text-gray-500 mt-1">
                            Due: {new Date(milestone.dueAt).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                      
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => handleEditStart(milestone)}
                          className="p-2"
                        >
                          <Text className="text-gray-400">✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteMilestone(milestone.id, milestone.title)}
                          className="p-2"
                        >
                          <Text className="text-gray-400">🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
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
