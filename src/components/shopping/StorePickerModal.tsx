import React, { useState } from "react";
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { ShoppingStore } from "../../types/shopping";
import MapPicker from "./MapPicker";
import { openInMaps } from "../../utils/maps";

export default function StorePickerModal({
  visible, onClose, initial, onSave, onDelete
}: {
  visible: boolean;
  onClose: () => void;
  initial?: ShoppingStore;
  onSave: (store: ShoppingStore) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [budget, setBudget] = useState(initial?.budgetLimit ? String(initial.budgetLimit) : "");
  const [pos, setPos] = useState<{ lat?:number; lng?:number }>({ lat: initial?.lat, lng: initial?.lng });

  const save = () => {
    const id = initial?.id ?? `store_${Date.now()}`;
    onSave({ 
      id, 
      name, 
      address, 
      lat: pos.lat, 
      lng: pos.lng,
      budgetLimit: budget ? Number(budget) : undefined
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{initial ? "Editar tienda" : "Nueva tienda"}</Text>
          <ScrollView>
            <TextInput value={name} onChangeText={setName} placeholder="Nombre (ej: Super Mercado)" style={styles.input} />
            <TextInput value={address} onChangeText={setAddress} placeholder="Dirección (opcional)" style={styles.input} />
            <TextInput 
              value={budget} 
              onChangeText={setBudget} 
              placeholder="Presupuesto (opcional)" 
              keyboardType="decimal-pad"
              style={styles.input} 
            />

            <Text style={styles.label}>Location</Text>
            <MapPicker
              initial={initial?.lat && initial?.lng ? { lat: initial.lat, lng: initial.lng } : undefined}
              onPick={(p)=> setPos(p)}
            />

            {!!pos.lat && !!pos.lng && (
              <TouchableOpacity onPress={() => openInMaps(pos.lat!, pos.lng!, name)} style={styles.mapBtn}>
                <Text style={styles.mapBtnTxt}>Abrir en Maps</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {initial && onDelete && (
              <TouchableOpacity onPress={onDelete} style={[styles.btn, { backgroundColor: "#ef4444" }]}>
                <Text style={styles.btnTxt}>Eliminar</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={onClose} style={[styles.btn, styles.ghost]}><Text style={styles.ghostTxt}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity onPress={save} style={[styles.btn, styles.primary]}><Text style={styles.btnTxt}>Guardar</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:{ flex:1, backgroundColor:"#0008", justifyContent:"center", padding:16 },
  card:{ backgroundColor:"#fff", borderRadius:16, padding:12, maxHeight:"90%" },
  title:{ fontWeight:"800", fontSize:16, marginBottom:8 },
  input:{ backgroundColor:"#f3f4f6", borderRadius:10, padding:10, marginBottom:8 },
  label:{ color:"#374151", fontWeight:"700", marginBottom:6 },
  footer:{ flexDirection:"row", gap:8, marginTop:10, alignItems:"center" },
  btn:{ paddingHorizontal:12, paddingVertical:10, borderRadius:12 },
  primary:{ backgroundColor:"#2563eb" }, btnTxt:{ color:"#fff", fontWeight:"800" },
  ghost:{ backgroundColor:"#eef2ff" }, ghostTxt:{ color:"#111827", fontWeight:"800" },
  mapBtn:{ marginTop:8, backgroundColor:"#111827", padding:10, borderRadius:10, alignItems:"center" },
  mapBtnTxt:{ color:"#fff", fontWeight:"800" },
});

