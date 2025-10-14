import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FamilyReminder, ReminderType, ReminderPriority } from "@/types/reminder";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Omit<FamilyReminder,"id"|"familyId"|"createdBy"|"createdAt"|"updatedAt">) => void;
  initial?: FamilyReminder;
};

export const ReminderForm: React.FC<Props> = ({ visible, onClose, onSave, initial }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledFor, setScheduledFor] = useState(new Date().toISOString());
  const [timeUntilEvent, setTimeUntilEvent] = useState("in 1 hour");
  const [type, setType] = useState<ReminderType>("custom");
  const [priority, setPriority] = useState<ReminderPriority>("medium");
  const [location, setLocation] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? "");
      setDescription(initial.description ?? "");
      setScheduledFor(initial.scheduledFor ?? new Date().toISOString());
      setTimeUntilEvent(initial.timeUntilEvent ?? "in 1 hour");
      setType(initial.type ?? "custom");
      setPriority(initial.priority ?? "medium");
      setLocation(initial.location ?? "");
      setParticipants(initial.participants ?? []);
    } else {
      setTitle(""); 
      setDescription(""); 
      setScheduledFor(new Date().toISOString());
      setTimeUntilEvent("in 1 hour");
      setType("custom"); 
      setPriority("medium");
      setLocation("");
      setParticipants([]);
    }
  }, [visible, initial]);

  const save = () => {
    if (!title.trim()) {
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      priority,
      scheduledFor,
      timeUntilEvent,
      location: location.trim() || undefined,
      participants,
      isActive: true,
      isCompleted: false,
      createdBy: "", // el caller lo sobrescribe
      familyId: "",  // el caller lo sobrescribe
    } as any);
  };

  const formatDateTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleString();
    } catch {
      return iso;
    }
  };

  const getPriorityColor = (p: ReminderPriority) => {
    switch (p) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (t: ReminderType) => {
    switch (t) {
      case 'task': return 'checkmark-circle';
      case 'event': return 'calendar';
      case 'appointment': return 'medical';
      case 'deadline': return 'time';
      case 'custom': return 'star';
      default: return 'notifications';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{initial ? "Edit Reminder" : "New Reminder"}</Text>

          <Text style={styles.label}>Title *</Text>
          <TextInput 
            value={title} 
            onChangeText={setTitle} 
            placeholder="Enter reminder title" 
            style={styles.input} 
          />

          <Text style={styles.label}>Description</Text>
          <TextInput 
            value={description} 
            onChangeText={setDescription} 
            placeholder="Optional description" 
            style={[styles.input, styles.textArea]} 
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Scheduled For</Text>
          <TextInput 
            value={formatDateTime(scheduledFor)} 
            onChangeText={(text) => {
              try {
                const date = new Date(text);
                if (!isNaN(date.getTime())) {
                  setScheduledFor(date.toISOString());
                }
              } catch {
                // Keep original value if parsing fails
              }
            }}
            placeholder="e.g., 2024-01-15 18:00" 
            style={styles.input} 
          />

          <Text style={styles.label}>Time Until Event</Text>
          <View style={styles.row}>
            {["in 30 min", "in 1 hour", "in 2 hours", "in 4 hours", "in 1 day"].map(time => (
              <TouchableOpacity 
                key={time} 
                onPress={() => setTimeUntilEvent(time)} 
                style={[styles.tag, timeUntilEvent === time && styles.tagOn]}
              >
                <Text style={[styles.tagText, timeUntilEvent === time && styles.tagTextOn]}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Type</Text>
          <View style={styles.row}>
            {(["task", "event", "appointment", "deadline", "custom"] as ReminderType[]).map(t => (
              <TouchableOpacity 
                key={t} 
                onPress={() => setType(t)} 
                style={[styles.typeTag, type === t && styles.typeTagOn]}
              >
                <Ionicons 
                  name={getTypeIcon(t) as any} 
                  size={16} 
                  color={type === t ? "white" : "#6B7280"} 
                />
                <Text style={[styles.typeTagText, type === t && styles.typeTagTextOn]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Priority</Text>
          <View style={styles.row}>
            {(["low", "medium", "high", "urgent"] as ReminderPriority[]).map(p => (
              <TouchableOpacity 
                key={p} 
                onPress={() => setPriority(p)} 
                style={[styles.priorityTag, { backgroundColor: priority === p ? getPriorityColor(p) : '#E5E7EB' }]}
              >
                <Text style={[styles.priorityTagText, { color: priority === p ? "white" : "#6B7280" }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Location (Optional)</Text>
          <TextInput 
            value={location} 
            onChangeText={setLocation} 
            placeholder="e.g., Home, Office, School" 
            style={styles.input} 
          />

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, styles.btnGhost]}>
              <Text style={styles.btnGhostText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={save} style={[styles.btn, styles.btnPrimary]}>
              <Text style={styles.btnText}>{initial ? "Save" : "Create"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop:{
    flex:1,
    backgroundColor:"rgba(0,0,0,0.5)",
    justifyContent:"center",
    padding:16
  },
  card:{
    backgroundColor:"#fff",
    borderRadius:16,
    padding:20,
    maxHeight: '90%'
  },
  title:{
    fontWeight:"800",
    fontSize:18,
    marginBottom:16,
    textAlign: 'center'
  },
  label:{
    marginTop:12,
    color:"#374151",
    fontWeight:"700",
    fontSize: 14
  },
  input:{
    backgroundColor:"#f3f4f6",
    borderRadius:10,
    padding:12,
    marginTop:6,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  row:{
    flexDirection:"row",
    gap:8,
    marginTop:8,
    flexWrap: 'wrap'
  },
  tag:{
    paddingHorizontal:12,
    paddingVertical:8,
    borderRadius:10,
    backgroundColor:"#e5e7eb"
  },
  tagOn:{
    backgroundColor:"#FB923C"
  },
  tagText:{
    color:"#111827",
    fontWeight:"600",
    fontSize: 12
  }, 
  tagTextOn:{
    color:"#fff"
  },
  typeTag:{
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:12,
    paddingVertical:8,
    borderRadius:10,
    backgroundColor:"#e5e7eb",
    gap: 6
  },
  typeTagOn:{
    backgroundColor:"#3B82F6"
  },
  typeTagText:{
    color:"#111827",
    fontWeight:"600",
    fontSize: 12
  }, 
  typeTagTextOn:{
    color:"#fff"
  },
  priorityTag:{
    paddingHorizontal:12,
    paddingVertical:8,
    borderRadius:10,
  },
  priorityTagText:{
    fontWeight:"600",
    fontSize: 12
  },
  footer:{
    flexDirection:"row",
    justifyContent:"flex-end",
    gap:12,
    marginTop:20
  },
  btn:{
    paddingHorizontal:16,
    paddingVertical:12,
    borderRadius:12,
    minWidth: 80,
    alignItems: 'center'
  },
  btnPrimary:{
    backgroundColor:"#FB923C"
  }, 
  btnText:{
    color:"#fff",
    fontWeight:"700",
    fontSize: 14
  },
  btnGhost:{
    backgroundColor:"#f3f4f6",
    borderWidth: 1,
    borderColor: '#e5e7eb'
  }, 
  btnGhostText:{
    color:"#111827",
    fontWeight:"600",
    fontSize: 14
  },
});
