import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";

type Props = {
  initial?: { lat: number; lng: number };
  onPick: (position: { lat: number; lng: number }) => void;
};

export default function MapPickerFallback({ initial, onPick }: Props) {
  const [lat, setLat] = useState(initial?.lat?.toString() ?? "18.48");
  const [lng, setLng] = useState(initial?.lng?.toString() ?? "-69.91");

  const handleSave = () => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      onPick({ lat: parsedLat, lng: parsedLng });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Manual Location Input</Text>
      <Text style={styles.subtitle}>Enter coordinates manually (GPS coordinates)</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Latitude:</Text>
          <TextInput
            value={lat}
            onChangeText={setLat}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholder="18.48"
            placeholderTextColor="#9ca3af"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Longitude:</Text>
          <TextInput
            value={lng}
            onChangeText={setLng}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholder="-69.91"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>
      
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Use These Coordinates</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    fontSize: 14,
    color: "#111827",
  },
  saveButton: {
    backgroundColor: "#7c3aed",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});