import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { FamilyReminder } from "../../types/reminder";
import { createReminder, deleteReminder, listReminders, updateReminder, completeReminder } from "../../services/reminders";
import { ReminderForm } from "./ReminderForm";

type Props = { route: any; navigation: any };

export default function FamilyRemindersScreen({ route, navigation }: Props) {
  const { familyId, userId } = route.params;
  const [items, setItems] = useState<FamilyReminder[]>([]);
  const [editing, setEditing] = useState<FamilyReminder | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const data = await listReminders(familyId);
      setItems(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
      Alert.alert('Error', 'Failed to load reminders');
    }
  };

  useEffect(() => { load(); }, [familyId]);

  const onCreate = async (payload: Omit<FamilyReminder,"id"|"createdAt"|"updatedAt">) => {
    try {
      await createReminder(payload);
      setOpen(false);
      await load();
    } catch (error) {
      console.error('Error creating reminder:', error);
      Alert.alert('Error', 'Failed to create reminder');
    }
  };

  const onUpdate = async (patch: FamilyReminder) => {
    try {
      await updateReminder(patch.id!, patch);
      setEditing(null);
      await load();
    } catch (error) {
      console.error('Error updating reminder:', error);
      Alert.alert('Error', 'Failed to update reminder');
    }
  };

  const onComplete = async (id: string) => {
    try {
      await completeReminder(id);
      await load();
    } catch (error) {
      console.error('Error completing reminder:', error);
      Alert.alert('Error', 'Failed to complete reminder');
    }
  };

  const onDelete = (id: string) => {
    Alert.alert("Delete", "Remove this reminder?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { 
        try {
          await deleteReminder(id); 
          await load(); 
        } catch (error) {
          console.error('Error deleting reminder:', error);
          Alert.alert('Error', 'Failed to delete reminder');
        }
      }}
    ]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return 'checkmark-circle';
      case 'event': return 'calendar';
      case 'appointment': return 'medical';
      case 'deadline': return 'time';
      case 'custom': return 'star';
      default: return 'notifications';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#FB923C', '#EF4444']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upcoming Reminders</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <FlatList
          data={items}
          keyExtractor={(it)=>it.id!}
          renderItem={({item}) => (
            <View style={styles.item}>
              <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemTitleRow}>
                    <Ionicons name={getTypeIcon(item.type) as any} size={20} color="#6B7280" />
                    <Text style={styles.itemTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.itemTime}>{item.timeUntilEvent}</Text>
                </View>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <Text style={styles.itemScheduled}>
                  Scheduled for: {new Date(item.scheduledFor).toLocaleString()}
                </Text>
                {item.participants.length > 0 && (
                  <Text style={styles.itemParticipants}>
                    {item.participants.length} participant{item.participants.length > 1 ? 's' : ''}
                  </Text>
                )}
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => onComplete(item.id!)} style={styles.completeBtn}>
                  <Ionicons name="checkmark" size={16} color="white" />
                  <Text style={styles.completeBtnText}>Complete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> setEditing(item)} style={styles.editBtn}>
                  <Ionicons name="create-outline" size={16} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> onDelete(item.id!)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No reminders yet</Text>
              <Text style={styles.emptySubtitle}>Create your first reminder to stay organized</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />

        <TouchableOpacity onPress={()=> setOpen(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addBtnText}>New Reminder</Text>
        </TouchableOpacity>
      </View>

      {/* Crear */}
      <ReminderForm
        visible={open}
        onClose={()=> setOpen(false)}
        onSave={(data) => onCreate({
          ...data,
          familyId,
          createdBy: userId,
          isActive: true,
          isCompleted: false,
        })}
      />
      {/* Editar */}
      {editing && (
        <ReminderForm
          visible={!!editing}
          initial={editing}
          onClose={()=> setEditing(null)}
          onSave={(data)=> onUpdate({ ...editing, ...data })}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60, // Account for status bar
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40, // Same width as back button for centering
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 100, // Space for floating button
  },
  item: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  priorityIndicator: {
    width: 4,
  },
  itemContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  itemTime: {
    fontSize: 12,
    color: '#FB923C',
    fontWeight: '600',
    backgroundColor: '#FEF3F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemScheduled: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  itemParticipants: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 0,
    gap: 8,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  completeBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  editBtn: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 12,
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  addBtn: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FB923C',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  addBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
