import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, StyleSheet } from 'react-native';
import { Milestone } from '@/types/goals';
import { Ionicons } from '@expo/vector-icons';

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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Progress Summary */}
        <View style={styles.card}>
          <View style={styles.progressHeader}>
            <Text style={styles.cardTitle}>Milestones</Text>
            <Text style={styles.progressText}>
              {completedCount}/{milestones.length} completed
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[styles.progressBar, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.progressPercentage}>
            {Math.round(progress)}% Complete
          </Text>
        </View>

        {/* Add New Milestone */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Milestone</Text>
          <View style={styles.addMilestoneRow}>
            <TextInput
              value={newMilestoneTitle}
              onChangeText={setNewMilestoneTitle}
              placeholder="Enter milestone title..."
              style={styles.textInput}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={handleAddMilestone}
              style={[styles.addButton, { 
                backgroundColor: newMilestoneTitle.trim() ? '#3B82F6' : '#9CA3AF' 
              }]}
              disabled={!newMilestoneTitle.trim()}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Milestones List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>All Milestones</Text>
          {milestones.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={styles.emptyText}>No milestones yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first milestone above
              </Text>
            </View>
          ) : (
            <View style={styles.milestonesList}>
              {milestones.map((milestone) => (
                <View key={milestone.id} style={styles.milestoneItem}>
                  {editingMilestone === milestone.id ? (
                    <View style={styles.editRow}>
                      <TextInput
                        value={editTitle}
                        onChangeText={setEditTitle}
                        style={styles.editInput}
                        autoFocus
                      />
                      <TouchableOpacity
                        onPress={handleEditSave}
                        style={styles.saveButton}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleEditCancel}
                        style={styles.cancelButton}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.milestoneRow}>
                      <TouchableOpacity
                        onPress={() => onToggleMilestone(milestone.id, !milestone.done)}
                        style={[
                          styles.checkbox,
                          milestone.done ? styles.checkboxChecked : styles.checkboxUnchecked
                        ]}
                      >
                        {milestone.done && (
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                      
                      <View style={styles.milestoneContent}>
                        <Text style={[
                          styles.milestoneTitle,
                          milestone.done ? styles.milestoneTitleCompleted : styles.milestoneTitleActive
                        ]}>
                          {milestone.title}
                        </Text>
                        {milestone.dueAt && (
                          <Text style={styles.milestoneDueDate}>
                            Due: {new Date(milestone.dueAt).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                      
                      <View style={styles.milestoneActions}>
                        <TouchableOpacity
                          onPress={() => handleEditStart(milestone)}
                          style={styles.actionButton}
                        >
                          <Ionicons name="pencil" size={16} color="#64748B" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteMilestone(milestone.id, milestone.title)}
                          style={styles.actionButton}
                        >
                          <Ionicons name="trash" size={16} color="#EF4444" />
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
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
  progressPercentage: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
  },
  addMilestoneRow: {
    flexDirection: 'row',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
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
  milestonesList: {
    gap: 12,
  },
  milestoneItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#64748B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxUnchecked: {
    backgroundColor: 'transparent',
    borderColor: '#D1D5DB',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  milestoneTitleActive: {
    color: '#1E293B',
  },
  milestoneTitleCompleted: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  milestoneDueDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  milestoneActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});




