import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { FamilySchedule } from "../../types/schedule";
import { createSchedule, deleteSchedule, listSchedules, updateSchedule } from "../../services/schedules";
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
    <View style={{ flex:1, padding: 14 }}>
      <Text style={styles.title}>Family Schedules</Text>

      <FlatList
        data={items}
        keyExtractor={(it)=>it.id!}
        renderItem={({item}) => (
          <View style={styles.item}>
            <View style={{ flex:1 }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemMeta}>
                {item.repeat.kind.toUpperCase()} • {new Date(item.timeISO).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
              </Text>
              {item.notes && (
                <Text style={styles.itemNotes}>{item.notes}</Text>
              )}
            </View>
            <TouchableOpacity onPress={()=> setEditing(item)} style={styles.smallBtn}>
              <Text style={styles.smallBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> onDelete(item.id!)} style={[styles.smallBtn,{backgroundColor:"#ef4444"}]}>
              <Text style={styles.smallBtnText}>Del</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{color:"#6b7280"}}>No routines yet.</Text>}
      />

      <TouchableOpacity onPress={()=> setOpen(true)} style={styles.addBtn}>
        <Text style={styles.addBtnText}>+ New Routine</Text>
      </TouchableOpacity>

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
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight:"800", fontSize:18, marginBottom:10 },
  item: { 
    flexDirection:"row", 
    alignItems:"center", 
    gap:8, 
    padding:12, 
    borderRadius:12, 
    backgroundColor:"#f3f4f6", 
    marginBottom:8 
  },
  itemTitle: { fontWeight:"700", color:"#111827" },
  itemMeta: { color:"#6b7280", fontSize: 12 },
  itemNotes: { color:"#6b7280", fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  smallBtn: { 
    backgroundColor:"#3b82f6", 
    paddingHorizontal:10, 
    paddingVertical:8, 
    borderRadius:10 
  },
  smallBtnText: { color:"#fff", fontWeight:"700", fontSize: 12 },
  addBtn: { 
    backgroundColor:"#10b981", 
    padding:14, 
    borderRadius:14, 
    alignItems:"center", 
    marginTop:8 
  },
  addBtnText: { color:"#fff", fontWeight:"800" },
});
