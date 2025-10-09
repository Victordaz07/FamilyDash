import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";

export default function MapPickerFallback({
  initial, onPick
}: { initial?: {lat:number; lng:number}; onPick: (p:{lat:number; lng:number}) => void }) {
  const [lat, setLat] = useState(initial?.lat?.toString() ?? "18.48");
  const [lng, setLng] = useState(initial?.lng?.toString() ?? "-69.91");

  const save = () => {
    onPick({ lat: parseFloat(lat), lng: parseFloat(lng) });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Coordenadas (Latitud, Longitud)</Text>
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Latitud:</Text>
          <TextInput
            style={styles.input}
            value={lat}
            onChangeText={setLat}
            placeholder="18.48"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Longitud:</Text>
          <TextInput
            style={styles.input}
            value={lng}
            onChangeText={setLng}
            placeholder="-69.91"
            keyboardType="numeric"
          />
        </View>
      </View>
      <TouchableOpacity style={styles.save} onPress={save}>
        <Text style={styles.saveTxt}>Usar estas coordenadas</Text>
      </TouchableOpacity>
      <Text style={styles.note}>
        Nota: Mapa deshabilitado temporalmente. Usa coordenadas manuales.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f3f4f6", borderRadius: 12 },
  label: { color: "#374151", fontWeight: "700", marginBottom: 8 },
  inputRow: { flexDirection: "row", gap: 12 },
  inputContainer: { flex: 1 },
  inputLabel: { color: "#6b7280", fontSize: 12, marginBottom: 4 },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "#d1d5db" },
  save: { backgroundColor: "#111827", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, alignItems: "center", marginTop: 12 },
  saveTxt: { color: "#fff", fontWeight: "800" },
  note: { color: "#6b7280", fontSize: 12, textAlign: "center", marginTop: 8, fontStyle: "italic" }
});
