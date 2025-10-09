import React, { useEffect, useMemo, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ShoppingItem, ShoppingList, ShoppingStore } from "../../types/shopping";
import {
  addItem, cycleStatus, deleteStore, getOrCreateShoppingList, listItems,
  removeItem, updateItem, upsertStore, loadList
} from "../../services/shopping";
import { findProductByBarcode, upsertProduct } from "../../services/shoppingProducts";
import StorePickerModal from "./StorePickerModal";
import BarcodeScannerFallback from "./BarcodeScannerFallback";

function statusIcon(s: "pending"|"in_cart"|"purchased") {
  if (s === "pending") return <Ionicons name="square-outline" size={22} />;
  if (s === "in_cart") return <Ionicons name="checkmark-circle-outline" size={22} />;
  return <Ionicons name="checkmark-done-circle" size={22} color="#16a34a" />;
}

export default function ShoppingListModal({
  visible, onClose, taskId, familyId, userId
}: { visible: boolean; onClose: () => void; taskId: string; familyId: string; userId: string }) {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [filterStore, setFilterStore] = useState<string | "all">("all");

  const [text, setText] = useState("");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState("u");
  const [price, setPrice] = useState("");

  const [storeModal, setStoreModal] = useState<{ open: boolean; editing?: ShoppingStore }>({ open: false });
  const [scanOpen, setScanOpen] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      const l = await getOrCreateShoppingList(taskId, familyId, userId);
      setList(l as any);
      const it = await listItems((l as any).id);
      setItems(it as any);
    })();
  }, [visible, taskId, familyId, userId]);

  const onScanned = async ({ barcode }: { barcode: string }) => {
    if (!list) return;
    const prod = await findProductByBarcode(familyId, barcode);
    if (prod) {
      setText(prod.name);
      setUnit(prod.defaultUnit || "u");
      if (prod.lastPrice) setPrice(String(prod.lastPrice));
      // opcional: asignar la última tienda
      if (prod.lastStoreId) setFilterStore(prod.lastStoreId as any);
    } else {
      setText(`Producto ${barcode}`);
      setUnit("u");
    }
    await Haptics.selectionAsync();
  };

  const add = async () => {
    if (!list || !text.trim()) return;
    await addItem(list.id!, {
      name: text.trim(),
      qty: parseFloat(qty) || 1,
      unit: unit || "u",
      price: price ? parseFloat(price) : undefined,
      status: "pending",
      storeId: filterStore !== "all" ? filterStore : undefined,
    } as any);
    
    // si proviene de escaneo con nombre "Producto <code>" también registra el producto
    const maybeCode = text.match(/^Producto\s+(\d[\d\- ]*)$/)?.[1];
    if (maybeCode || price) {
      await upsertProduct({
        familyId,
        barcode: maybeCode ?? "", // si no tienes code exacto, puedes omitir
        name: text.replace(/^Producto\s+\d[\d\- ]*\s*/,""),
        defaultUnit: unit,
        lastPrice: price ? parseFloat(price) : undefined,
        lastStoreId: filterStore !== "all" ? filterStore : undefined
      });
    }
    
    const it = await listItems(list.id!);
    setItems(it as any);
    setText(""); setPrice("");
  };

  const toggle = async (item: ShoppingItem) => {
    await updateItem(item.id, { status: cycleStatus(item.status) });
    setItems(prev => prev.map(p => p.id === item.id ? { ...p, status: cycleStatus(item.status) } : p));
    Haptics.selectionAsync();
  };

  const del = async (item: ShoppingItem) => {
    await removeItem(item.id);
    setItems(prev => prev.filter(p => p.id !== item.id));
  };

  const stores = useMemo(() => list?.stores ?? [], [list]);
  const visibleItems = useMemo(
    () => filterStore === "all" ? items : items.filter(i => i.storeId === filterStore),
    [items, filterStore]
  );

  const totals = useMemo(() => {
    const byStore: Record<string, number> = {};
    let total = 0;
    for (const i of items) {
      const line = (i.price || 0) * (i.qty || 1);
      total += line;
      if (i.storeId) byStore[i.storeId] = (byStore[i.storeId] || 0) + line;
    }
    return { total, byStore };
  }, [items]);

  const budgets = useMemo(() => {
    const byStoreBudget: Record<string, number | undefined> = {};
    for (const s of stores) byStoreBudget[s.id] = s.budgetLimit;
    return byStoreBudget;
  }, [stores]);

  useEffect(() => {
    if (!list) return;
    // si hay presupuesto y se sobrepasa el de la tienda filtrada, mostrar banner
    if (filterStore !== "all") {
      const limit = budgets[filterStore];
      const spent = totals.byStore[filterStore] || 0;
      setBanner(limit && spent > limit ? `⚠️ ${stores.find(s=>s.id===filterStore)?.name}: Presupuesto superado (${list.currency} ${spent.toFixed(2)} / ${list.currency} ${limit.toFixed(2)})` : null);
    } else {
      setBanner(null);
    }
  }, [totals, filterStore, budgets, list, stores]);

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={{ flex: 1, padding: 14, backgroundColor: "#fff" }}>
        <View style={styles.header}>
          <Text style={styles.title}>Lista de compras</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} /></TouchableOpacity>
        </View>

        {/* Stores row */}
        <View style={styles.storesRow}>
          <TouchableOpacity
            onPress={() => setFilterStore("all")}
            style={[styles.storeChip, filterStore === "all" && styles.storeChipOn]}
          >
            <Text style={[styles.storeChipTxt, filterStore === "all" && styles.storeChipTxtOn]}>Todas</Text>
          </TouchableOpacity>

          {stores.map(s => (
            <TouchableOpacity
              key={s.id}
              onPress={() => setFilterStore(s.id)}
              style={[styles.storeChip, filterStore === s.id && styles.storeChipOn]}
            >
              <Text style={[styles.storeChipTxt, filterStore === s.id && styles.storeChipTxtOn]}>
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={() => setStoreModal({ open: true })} style={[styles.storeChip, styles.addStore]}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={[styles.storeChipTxt, styles.storeChipTxtOn]}>Tienda</Text>
          </TouchableOpacity>
        </View>

        {/* Budget progress bar */}
        {filterStore !== "all" && (() => {
          const limit = budgets[filterStore];
          if (!limit) return null;
          const spent = totals.byStore[filterStore] || 0;
          const pct = Math.min(1, spent / limit);
          return (
            <View style={{ marginTop: 6, marginBottom: 4 }}>
              <View style={{ height: 8, backgroundColor:"#e5e7eb", borderRadius:6, overflow:"hidden" }}>
                <View style={{ width: `${pct*100}%`, height: 8, backgroundColor: pct < .8 ? "#16a34a" : pct < 1 ? "#f59e0b" : "#ef4444" }} />
              </View>
              <Text style={{ color:"#6b7280", marginTop: 4 }}>
                {stores.find(s=>s.id===filterStore)?.name}: {list?.currency} {spent.toFixed(2)}{limit ? ` / ${list?.currency} ${limit.toFixed(2)}` : ""}
              </Text>
            </View>
          );
        })()}

        {/* Banner de alerta si se supera */}
        {banner && (
          <View style={{ backgroundColor:"#fee2e2", borderRadius:10, padding:10, marginBottom:8 }}>
            <Text style={{ color:"#991b1b", fontWeight:"800" }}>{banner}</Text>
          </View>
        )}

        {/* Add item row */}
        <View style={styles.addRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Ej: Leche descremada"
            style={[styles.input, { flex: 1 }]}
          />
          <TextInput value={qty} onChangeText={setQty} placeholder="1" keyboardType="decimal-pad" style={[styles.input, styles.small]} />
          <TextInput value={unit} onChangeText={setUnit} placeholder="u" style={[styles.input, styles.small]} />
          <TextInput value={price} onChangeText={setPrice} placeholder="$" keyboardType="decimal-pad" style={[styles.input, styles.small]} />
          <TouchableOpacity onPress={add} style={styles.addBtn}><Text style={styles.addBtnTxt}>+</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setScanOpen(true)} style={[styles.addBtn, { backgroundColor:"#7c3aed" }]}>
            <Ionicons name="barcode-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* List */}
        <FlatList
          data={visibleItems}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <TouchableOpacity onPress={() => toggle(item)} style={styles.checkCell}>
                {statusIcon(item.status)}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.qty} {item.unit || "u"}{item.price ? ` • ${list?.currency} ${(item.price * item.qty).toFixed(2)}` : ""}
                  {item.storeId ? ` • ${stores.find(s=>s.id===item.storeId)?.name}` : ""}
                </Text>
              </View>
              <TouchableOpacity onPress={() => del(item)} style={styles.trash}>
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: "#6b7280", textAlign: "center", marginTop: 16 }}>Sin productos en esta vista.</Text>}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />

        {/* Totales */}
        <View style={styles.totals}>
          {Object.entries(totals.byStore).map(([sid, val]) => (
            <Text key={sid} style={styles.totalLine}>
              {stores.find(s => s.id === sid)?.name || "Tienda"}: {list?.currency} {val.toFixed(2)}
            </Text>
          ))}
          <Text style={[styles.totalLine, styles.totalStrong]}>
            Total: {list?.currency} {totals.total.toFixed(2)}
          </Text>
        </View>

        {/* Modales de tienda */}
        {list && (
          <StorePickerModal
            visible={storeModal.open}
            onClose={() => setStoreModal({ open: false })}
            initial={storeModal.editing}
            onSave={async (st) => {
              await upsertStore(list.id!, st);
              const fresh = await loadList(list.id!);
              setList(fresh);
            }}
            onDelete={storeModal.editing ? async () => {
              await deleteStore(list.id!, storeModal.editing!.id);
              const fresh = await loadList(list.id!);
              setList(fresh); setStoreModal({ open: false });
            } : undefined}
          />
        )}

        {/* Modal de escaneo */}
        <BarcodeScannerFallback
          visible={scanOpen}
          onClose={() => setScanOpen(false)}
          onScanned={onScanned}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:8 },
  title:{ fontWeight:"800", fontSize:18 },
  storesRow:{ flexDirection:"row", flexWrap:"wrap", gap:8, marginBottom:10 },
  storeChip:{ paddingHorizontal:10, paddingVertical:8, borderRadius:10, backgroundColor:"#e5e7eb", flexDirection:"row", alignItems:"center", gap:6 },
  storeChipOn:{ backgroundColor:"#2563eb" },
  storeChipTxt:{ color:"#111827", fontWeight:"700" },
  storeChipTxtOn:{ color:"#fff", fontWeight:"800" },
  addStore:{ backgroundColor:"#7c3aed" },

  addRow:{ flexDirection:"row", gap:8, alignItems:"center", marginBottom:10 },
  input:{ backgroundColor:"#f3f4f6", borderRadius:10, paddingHorizontal:10, paddingVertical:10 },
  small:{ width:72 },
  addBtn:{ backgroundColor:"#16a34a", paddingHorizontal:12, paddingVertical:10, borderRadius:10 },
  addBtnTxt:{ color:"#fff", fontWeight:"800" },

  itemRow:{ flexDirection:"row", alignItems:"center", backgroundColor:"#f9fafb", borderRadius:12, padding:10 },
  checkCell:{ width:30, alignItems:"center" },
  itemName:{ fontWeight:"700", color:"#111827" },
  itemMeta:{ color:"#6b7280" },
  trash:{ paddingHorizontal:8, paddingVertical:6 },

  totals:{ marginTop:8, borderTopWidth:1, borderTopColor:"#e5e7eb", paddingTop:8 },
  totalLine:{ color:"#111827", fontWeight:"700" },
  totalStrong:{ fontSize:16 },
});

