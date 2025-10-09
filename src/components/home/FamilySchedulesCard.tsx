import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FamilySchedule } from "../../types/schedule";
import { listSchedules } from "../../services/schedules";

type Props = {
  familyId: string;
  onManagePress: () => void;   // navega a pantalla de gestión
};

export const FamilySchedulesCard: React.FC<Props> = ({ familyId, onManagePress }) => {
  const [items, setItems] = useState<FamilySchedule[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await listSchedules(familyId);
        setItems(data.slice(0, 3)); // las 3 primeras
      } catch (error) {
        console.error('Error loading schedules:', error);
        setItems([]);
      }
    })();
  }, [familyId]);

  return (
    <View style={[styles.card, { backgroundColor: "#2563eb" }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Family Schedules</Text>
        <Text style={styles.icon}>🕒</Text>
      </View>

      {items.length === 0 ? (
        <Text style={styles.empty}>No routines yet. Create your first one!</Text>
      ) : (
        items.map((it) => (
          <View key={it.id} style={styles.row}>
            <Text style={styles.rowTitle}>{it.title}</Text>
            <Text style={styles.rowMeta}>
              {formatRepeat(it)} • {formatTime(it.timeISO)}
            </Text>
          </View>
        ))
      )}

      <TouchableOpacity onPress={onManagePress} style={styles.btn}>
        <Text style={styles.btnText}>Manage Schedules</Text>
      </TouchableOpacity>
    </View>
  );
};

function formatRepeat(s: FamilySchedule) {
  const k = s.repeat.kind;
  if (k === "daily") return "Daily";
  if (k === "weekdays") return "Weekdays";
  if (k === "once") return "Once";
  if ((k === "weekly" || k === "custom") && s.repeat.weekdays?.length) {
    const map = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    return s.repeat.weekdays.map(w => map[w]).join(", ");
  }
  return "Custom";
}

function formatTime(timeISO: string) {
  try {
    const date = new Date(timeISO);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return "Invalid time";
  }
}

const styles = StyleSheet.create({
  card: { 
    padding: 14, 
    borderRadius: 18, 
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 8 
  },
  title: { 
    color: "#fff", 
    fontWeight: "800", 
    fontSize: 16 
  },
  icon: { 
    fontSize: 18, 
    color: "#fff" 
  },
  row: { 
    backgroundColor: "rgba(255,255,255,0.16)", 
    padding: 10, 
    borderRadius: 12, 
    marginTop: 8 
  },
  rowTitle: { 
    color: "#fff", 
    fontWeight: "700" 
  },
  rowMeta: { 
    color: "#e5e7eb" 
  },
  empty: { 
    color: "#e5e7eb", 
    marginVertical: 8 
  },
  btn: { 
    marginTop: 12, 
    backgroundColor: "rgba(0,0,0,0.2)", 
    padding: 10, 
    borderRadius: 12, 
    alignItems: "center" 
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "700" 
  }
});
