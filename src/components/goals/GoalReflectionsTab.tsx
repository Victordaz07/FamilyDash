import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, StyleSheet } from 'react-native';
import { Reflection } from '@/types/goals';
import { Ionicons } from '@expo/vector-icons';

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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Add New Reflection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Reflection</Text>
          
          <TextInput
            value={newReflection}
            onChangeText={setNewReflection}
            placeholder="Share your thoughts about this goal..."
            style={styles.reflectionInput}
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />

          {/* Mood Selection */}
          <View style={styles.moodSection}>
            <Text style={styles.moodLabel}>How are you feeling?</Text>
            <View style={styles.moodContainer}>
              {moods.map((mood) => (
                <TouchableOpacity
                  key={mood.key}
                  onPress={() => setSelectedMood(mood.key)}
                  style={[
                    styles.moodButton,
                    selectedMood === mood.key ? styles.moodButtonSelected : styles.moodButtonUnselected
                  ]}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodText,
                    selectedMood === mood.key ? styles.moodTextSelected : styles.moodTextUnselected
                  ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleAddReflection}
            style={[styles.addButton, { 
              backgroundColor: newReflection.trim() ? '#3B82F6' : '#9CA3AF' 
            }]}
            disabled={!newReflection.trim()}
          >
            <Text style={styles.addButtonText}>Add Reflection</Text>
          </TouchableOpacity>
        </View>

        {/* Reflections List */}
        <View style={styles.card}>
          <View style={styles.reflectionsHeader}>
            <Text style={styles.cardTitle}>Reflections</Text>
            <Text style={styles.reflectionsCount}>{reflections.length} total</Text>
          </View>
          
          {reflections.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💭</Text>
              <Text style={styles.emptyText}>No reflections yet</Text>
              <Text style={styles.emptySubtext}>
                Share your thoughts about this goal
              </Text>
            </View>
          ) : (
            <View style={styles.reflectionsList}>
              {reflections.map((reflection) => (
                <View key={reflection.id} style={styles.reflectionItem}>
                  {editingReflection === reflection.id ? (
                    <View style={styles.editSection}>
                      <TextInput
                        value={editContent}
                        onChangeText={setEditContent}
                        style={styles.editInput}
                        multiline
                        textAlignVertical="top"
                        autoFocus
                      />
                      <View style={styles.editButtons}>
                        <TouchableOpacity
                          onPress={handleEditSave}
                          style={styles.saveButton}
                        >
                          <Text style={styles.editButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleEditCancel}
                          style={styles.cancelButton}
                        >
                          <Text style={styles.editButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.reflectionHeader}>
                        <View style={styles.reflectionMeta}>
                          <Text style={styles.moodEmojiLarge}>{getMoodEmoji(reflection.mood)}</Text>
                          <Text style={styles.reflectionDate}>
                            {formatTimestamp(reflection.createdAt)}
                          </Text>
                        </View>
                        <View style={styles.reflectionActions}>
                          <TouchableOpacity
                            onPress={() => handleEditStart(reflection)}
                            style={styles.actionButton}
                          >
                            <Ionicons name="pencil" size={16} color="#64748B" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteReflection(reflection.id, reflection.content)}
                            style={styles.actionButton}
                          >
                            <Ionicons name="trash" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.reflectionContent}>{reflection.content}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  reflectionInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  moodSection: {
    marginBottom: 16,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  moodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 60,
  },
  moodButtonSelected: {
    backgroundColor: '#3B82F620',
    borderColor: '#3B82F6',
  },
  moodButtonUnselected: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  moodEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  moodText: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  moodTextSelected: {
    color: '#3B82F6',
  },
  moodTextUnselected: {
    color: '#64748B',
  },
  addButton: {
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  reflectionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reflectionsCount: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  reflectionsList: {
    gap: 16,
  },
  reflectionItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editSection: {
    gap: 12,
  },
  editInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#64748B',
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reflectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodEmojiLarge: {
    fontSize: 24,
  },
  reflectionDate: {
    fontSize: 14,
    color: '#64748B',
  },
  reflectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  reflectionContent: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
  },
});




