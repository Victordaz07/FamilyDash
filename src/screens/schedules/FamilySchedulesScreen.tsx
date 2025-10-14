import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { FamilySchedule } from "@/types/schedule";
import { createSchedule, deleteSchedule, listSchedules, updateSchedule } from "@/services/schedules";
import { ScheduleForm } from "./ScheduleForm";

type Props = { route: any; navigation: any };
// navega con params: { familyId, userId }
export default function FamilySchedulesScreen({ route, navigation }: Props) {
  const { familyId, userId } = route.params;
  const [items, setItems] = useState<FamilySchedule[]>([]);
  const [editing, setEditing] = useState<FamilySchedule | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const data = await listSchedules(familyId);
      setItems(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
      Alert.alert('Error', 'Failed to load schedules');
    }
  };

  useEffect(() => { load(); }, [familyId]);

  const onCreate = async (payload: Omit<FamilySchedule,"id"|"createdAt"|"updatedAt">) => {
    try {
      await createSchedule(payload);
      setOpen(false);
      await load();
    } catch (error) {
      console.error('Error creating schedule:', error);
      Alert.alert('Error', 'Failed to create schedule');
    }
  };

  const onUpdate = async (patch: FamilySchedule) => {
    try {
      await updateSchedule(patch.id!, patch);
      setEditing(null);
      await load();
    } catch (error) {
      console.error('Error updating schedule:', error);
      Alert.alert('Error', 'Failed to update schedule');
    }
  };

  const onDelete = (id: string) => {
    Alert.alert("Delete", "Remove this routine?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { 
        try {
          await deleteSchedule(id); 
          await load(); 
        } catch (error) {
          console.error('Error deleting schedule:', error);
          Alert.alert('Error', 'Failed to delete schedule');
        }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Schedules</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <FlatList
          data={items}
          keyExtractor={(it)=>it.id!}
          renderItem={({item}) => (
            <View style={styles.item}>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>
                  {item.repeat.kind.toUpperCase()} • {new Date(item.timeISO).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                </Text>
                {item.notes && (
                  <Text style={styles.itemNotes}>{item.notes}</Text>
                )}
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={()=> setEditing(item)} style={styles.editBtn}>
                  <Ionicons name="create-outline" size={16} color="white" />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> onDelete(item.id!)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={16} color="white" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No routines yet</Text>
              <Text style={styles.emptySubtitle}>Create your first family routine to get started</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />

        <TouchableOpacity onPress={()=> setOpen(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addBtnText}>New Routine</Text>
        </TouchableOpacity>
      </View>

      {/* Crear */}
      <ScheduleForm
        visible={open}
        onClose={()=> setOpen(false)}
        onSave={(data) => onCreate({
          ...data,
          familyId,
          createdBy: userId,
          isActive: true,
        })}
      />
      {/* Editar */}
      {editing && (
        <ScheduleForm
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
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemNotes: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  editBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  deleteBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
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
    backgroundColor: '#10B981',
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
