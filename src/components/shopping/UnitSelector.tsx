import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UnitKey } from "../../types/shopping";

type Props = {
  selectedUnit: UnitKey;
  packSize?: number | null;
  onSelect: (unit: UnitKey, packSize?: number | null) => void;
};

export default function UnitSelector({ selectedUnit, packSize, onSelect }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempPackSize, setTempPackSize] = useState(packSize?.toString() || "");

  const unitSections = [
    {
      title: "Weight",
      units: [
        { key: "lb", label: "Pound (lb)", icon: "📏" },
        { key: "kg", label: "Kilogram (kg)", icon: "⚖️" },
        { key: "g", label: "Gram (g)", icon: "⚖️" },
      ],
    },
    {
      title: "Count/Packs",
      units: [
        { key: "u", label: "Unit", icon: "🔢" },
        { key: "dozen", label: "Dozen", icon: "🥚" },
        { key: "half_dozen", label: "Half Dozen", icon: "🥚" },
        { key: "pack_4", label: "Pack of 4", icon: "📦" },
        { key: "pack_6", label: "Pack of 6", icon: "📦" },
        { key: "pack_12", label: "Pack of 12", icon: "📦" },
        { key: "pack", label: "Custom Pack", icon: "📦" },
      ],
    },
    {
      title: "Volume",
      units: [
        { key: "L", label: "Liter (L)", icon: "🥤" },
        { key: "mL", label: "Milliliter (mL)", icon: "🥤" },
      ],
    },
  ];

  const handleSelect = (unit: UnitKey) => {
    if (unit === "pack") {
      // For custom pack, show pack size input
      const size = parseInt(tempPackSize) || 1;
      onSelect(unit, size);
    } else {
      onSelect(unit, null);
    }
    setModalVisible(false);
  };

  const getDisplayText = (unit: UnitKey, packSize?: number | null): string => {
    switch (unit) {
      case "u": return "unit";
      case "dozen": return "dozen";
      case "half_dozen": return "half dozen";
      case "pack_4": return "pack of 4";
      case "pack_6": return "pack of 6";
      case "pack_12": return "pack of 12";
      case "pack": return packSize ? `pack of ${packSize}` : "custom pack";
      case "lb": return "lb";
      case "kg": return "kg";
      case "g": return "g";
      case "L": return "L";
      case "mL": return "mL";
      default: return "unit";
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorText}>
          {getDisplayText(selectedUnit, packSize)}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#6b7280" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity 
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>Select Unit</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              {unitSections.map((section, sectionIndex) => (
                <View key={section.title} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.units.map((unit) => (
                    <TouchableOpacity
                      key={unit.key}
                      style={[
                        styles.unitOption,
                        selectedUnit === unit.key && styles.unitOptionSelected
                      ]}
                      onPress={() => handleSelect(unit.key as UnitKey)}
                    >
                      <Text style={styles.unitIcon}>{unit.icon}</Text>
                      <Text style={[
                        styles.unitLabel,
                        selectedUnit === unit.key && styles.unitLabelSelected
                      ]}>
                        {unit.label}
                      </Text>
                      {selectedUnit === unit.key && (
                        <Ionicons name="checkmark" size={20} color="#7c3aed" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              {/* Custom Pack Size Input */}
              {selectedUnit === "pack" && (
                <View style={styles.packSizeSection}>
                  <Text style={styles.sectionTitle}>Pack Size</Text>
                  <View style={styles.packSizeInput}>
                    <Text style={styles.inputLabel}>Items per pack:</Text>
                    <TextInput
                      value={tempPackSize}
                      onChangeText={setTempPackSize}
                      placeholder="1"
                      keyboardType="number-pad"
                      style={styles.numberInput}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)} 
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleSelect(selectedUnit)} 
                style={[styles.button, styles.selectButton]}
              >
                <Text style={styles.selectButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minWidth: 100,
  },
  selectorText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  unitOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  unitOptionSelected: {
    backgroundColor: "#f3f4f6",
  },
  unitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  unitLabel: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  unitLabelSelected: {
    color: "#7c3aed",
    fontWeight: "600",
  },
  packSizeSection: {
    paddingVertical: 16,
  },
  packSizeInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  inputLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginRight: 12,
  },
  numberInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
  },
  selectButton: {
    backgroundColor: "#7c3aed",
  },
  selectButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
