import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { FamilySchedule, RepeatKind, Weekday } from "../../types/schedule";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Omit<FamilySchedule,"id"|"familyId"|"createdBy"|"createdAt"|"updatedAt">) => void;
  initial?: FamilySchedule;
};

export const ScheduleForm: React.FC<Props> = ({ visible, onClose, onSave, initial }) => {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [timeISO, setTimeISO] = useState(new Date().toISOString());
  const [repeatKind, setRepeatKind] = useState<RepeatKind>("daily");
  const [weekdays, setWeekdays] = useState<Weekday[]>([]);
  const [color, setColor] = useState("#3b82f6");

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? "");
      setNotes(initial.notes ?? "");
      setTimeISO(initial.timeISO ?? new Date().toISOString());
      setRepeatKind(initial.repeat.kind);
      setWeekdays(initial.repeat.weekdays ?? []);
      setColor(initial.color ?? "#3b82f6");
    } else {
      setTitle(""); 
      setNotes(""); 
      setTimeISO(new Date().toISOString());
      setRepeatKind("daily"); 
      setWeekdays([]); 
      setColor("#3b82f6");
    }
  }, [visible, initial]);

  const toggleDay = (d: Weekday) => {
    setWeekdays(w => w.includes(d) ? w.filter(x=>x!==d) : [...w, d]);
  };

  const save = () => {
    if (!title.trim()) {
      return;
    }

    onSave({
      title: title.trim(),
      notes: notes.trim() || undefined,
      timeISO,
      repeat: { 
        kind: repeatKind, 
        weekdays: (repeatKind==="weekly"||repeatKind==="custom") ? weekdays : undefined 
      },
      members: [],
      color,
      isActive: true,
      createdBy: "", // el caller lo sobrescribe
      familyId: "",  // el caller lo sobrescribe
    } as any);
  };

  const formatTimeISO = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{initial ? "Edit Routine" : "New Routine"}</Text>

          <Text style={styles.label}>Title *</Text>
          <TextInput 
            value={title} 
            onChangeText={setTitle} 
            placeholder="Enter routine title" 
            style={styles.input} 
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput 
            value={notes} 
            onChangeText={setNotes} 
            placeholder="Optional notes" 
            style={[styles.input, styles.textArea]} 
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Time</Text>
          <TextInput 
            value={formatTimeISO(timeISO)} 
            onChangeText={(text) => {
              // Simple time input - user can type "7:00 AM" and we'll convert
              try {
                const [time, period] = text.split(' ');
                const [hours, minutes] = time.split(':');
                let hour = parseInt(hours);
                if (period?.toLowerCase() === 'pm' && hour !== 12) hour += 12;
                if (period?.toLowerCase() === 'am' && hour === 12) hour = 0;
                
                const date = new Date();
                date.setHours(hour, parseInt(minutes || '0'), 0, 0);
                setTimeISO(date.toISOString());
              } catch {
                // Keep original value if parsing fails
              }
            }}
            placeholder="e.g., 7:00 AM" 
            style={styles.input} 
          />

          <Text style={styles.label}>Repeat</Text>
          <View style={styles.row}>
            {(["once","daily","weekdays","weekly","custom"] as RepeatKind[]).map(k => (
              <TouchableOpacity 
                key={k} 
                onPress={()=>setRepeatKind(k)} 
                style={[styles.tag, repeatKind===k && styles.tagOn]}
              >
                <Text style={[styles.tagText, repeatKind===k && styles.tagTextOn]}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {(repeatKind==="weekly" || repeatKind==="custom") && (
            <View style={[styles.row,{flexWrap:"wrap"}]}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d,idx)=>(
                <TouchableOpacity 
                  key={d} 
                  onPress={()=>toggleDay(idx as Weekday)} 
                  style={[styles.day, weekdays.includes(idx as Weekday) && styles.dayOn]}
                >
                  <Text style={[styles.dayText, weekdays.includes(idx as Weekday) && styles.dayTextOn]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

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
    maxHeight: '80%'
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
    backgroundColor:"#3b82f6"
  },
  tagText:{
    color:"#111827",
    fontWeight:"600",
    fontSize: 12
  }, 
  tagTextOn:{
    color:"#fff"
  },
  day:{
    paddingHorizontal:10,
    paddingVertical:6,
    borderRadius:8,
    backgroundColor:"#e5e7eb",
    minWidth: 40,
    alignItems: 'center'
  },
  dayOn:{
    backgroundColor:"#10b981"
  }, 
  dayText:{
    color:"#111827",
    fontWeight:"600",
    fontSize: 12
  }, 
  dayTextOn:{
    color:"#fff"
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
    backgroundColor:"#10b981"
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
