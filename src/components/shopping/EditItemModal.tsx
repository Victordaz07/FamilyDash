import React, { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShoppingItem, ShoppingStore } from "../../types/shopping";

type Props = {
  visible: boolean;
  onClose: () => void;
  item: ShoppingItem;
  stores: ShoppingStore[];
  onSave: (itemId: string, updates: Partial<ShoppingItem>) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
};

export default function EditItemModal({ visible, onClose, item, stores, onSave, onDelete }: Props) {
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(item.qty.toString());
  const [unit, setUnit] = useState(item.unit || "u");
  const [price, setPrice] = useState(item.price ? item.price.toString() : "");
  const [selectedStoreId, setSelectedStoreId] = useState(item.storeId || "none");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(item.name);
      setQty(item.qty.toString());
      setUnit(item.unit || "u");
      setPrice(item.price ? item.price.toString() : "");
      setSelectedStoreId(item.storeId || "none");
    }
  }, [visible, item]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updates: Partial<ShoppingItem> = {
        name: name.trim(),
        qty: parseFloat(qty) || 1,
        unit: unit || "u",
        price: price ? parseFloat(price) : undefined,
        storeId: selectedStoreId !== "none" ? selectedStoreId : undefined,
      };

      await onSave(item.id, updates);
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await onDelete(item.id);
      onClose();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Editar Producto</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Product Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del producto</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ej: Leche de coco"
                style={styles.input}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Quantity and Unit Row */}
            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cantidad</Text>
                <TextInput
                  value={qty}
                  onChangeText={setQty}
                  placeholder="1"
                  keyboardType="decimal-pad"
                  style={[styles.input, styles.smallInput]}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Unidad</Text>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="u"
                  style={[styles.input, styles.smallInput]}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Precio (opcional)</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
                style={styles.input}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Store Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tienda</Text>
              <View style={styles.storeOptions}>
                <TouchableOpacity
                  onPress={() => setSelectedStoreId("none")}
                  style={[
                    styles.storeOption,
                    selectedStoreId === "none" && styles.storeOptionSelected
                  ]}
                >
                  <Text style={[
                    styles.storeOptionText,
                    selectedStoreId === "none" && styles.storeOptionTextSelected
                  ]}>
                    Sin tienda específica
                  </Text>
                </TouchableOpacity>
                {stores.map(store => (
                  <TouchableOpacity
                    key={store.id}
                    onPress={() => setSelectedStoreId(store.id)}
                    style={[
                      styles.storeOption,
                      selectedStoreId === store.id && styles.storeOptionSelected
                    ]}
                  >
                    <Text style={[
                      styles.storeOptionText,
                      selectedStoreId === store.id && styles.storeOptionTextSelected
                    ]}>
                      {store.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.button, styles.deleteButton]}
              disabled={saving}
            >
              <Ionicons name="trash" size={20} color="#fff" />
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
            
            <View style={styles.spacer} />
            
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, styles.cancelButton]}
              disabled={saving}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.button, styles.saveButton]}
              disabled={saving}
            >
              <Ionicons name={saving ? "hourglass" : "checkmark"} size={20} color="#fff" />
              <Text style={styles.buttonText}>{saving ? "Guardando..." : "Guardar"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    maxWidth: 500,
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
    fontSize: 18,
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
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 16,
    color: "#111827",
  },
  smallInput: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  storeOptions: {
    gap: 8,
  },
  storeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  storeOptionSelected: {
    backgroundColor: "#7c3aed",
    borderColor: "#6d28d9",
  },
  storeOptionText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
  },
  storeOptionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  saveButton: {
    backgroundColor: "#10b981",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButtonText: {
    color: "#374151",
  },
  spacer: {
    flex: 1,
  },
});
