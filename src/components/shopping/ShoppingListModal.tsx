import React, { useEffect, useMemo, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ShoppingItem, ShoppingList, ShoppingStore } from "../../types/shopping";
import {
  addItem, cycleStatus, deleteStore, getOrCreateShoppingList, listItems,
  removeItem, updateItem, updateList, upsertStore, loadList
} from "../../services/shopping";
import { findProductByBarcode, upsertProduct } from "../../services/shoppingProducts";
import StorePickerModal from "./StorePickerModal";
import BudgetProgressBar from "./BudgetProgressBar";
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
  const [budgetModal, setBudgetModal] = useState<{ open: boolean }>({ open: false });
  const [budgetInput, setBudgetInput] = useState("");
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

  // Initialize budget input when modal opens
  useEffect(() => {
    if (budgetModal.open && list?.budgetLimit) {
      setBudgetInput(String(list.budgetLimit));
    } else if (budgetModal.open) {
      setBudgetInput("");
    }
  }, [budgetModal.open, list?.budgetLimit]);

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
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Ionicons name="cart" size={16} color="#fff" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>Lista de compras</Text>
                <Text style={styles.subtitle}>Gestiona tus compras inteligentemente</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

        {/* Total Budget Section */}
        <View style={styles.budgetSection}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetSectionLabel}>Presupuesto Total</Text>
            <TouchableOpacity 
              onPress={() => setBudgetModal({ open: true })}
              style={styles.editBudgetButton}
            >
              <Ionicons name="create-outline" size={16} color="#7c3aed" />
            </TouchableOpacity>
          </View>
          
          {list?.budgetLimit ? (
            <BudgetProgressBar 
              spent={totals.total}
              budget={list.budgetLimit}
              currency={list.currency}
            />
          ) : (
            <View style={styles.noBudgetContainer}>
              <Text style={styles.noBudgetText}>Sin presupuesto establecido</Text>
              <TouchableOpacity 
                onPress={() => setBudgetModal({ open: true })}
                style={styles.setBudgetButton}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.setBudgetText}>Establecer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stores row */}
        <View style={styles.storesContainer}>
          <Text style={styles.storesLabel}>Filtrar por tienda</Text>
          <View style={styles.storesRow}>
            <TouchableOpacity
              onPress={() => setFilterStore("all")}
              style={[styles.storeChip, filterStore === "all" && styles.storeChipOn]}
            >
              <Ionicons name="list" size={16} color={filterStore === "all" ? "#fff" : "#6b7280"} />
              <Text style={[styles.storeChipTxt, filterStore === "all" && styles.storeChipTxtOn]}>Todas</Text>
            </TouchableOpacity>

            {stores.map(s => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setFilterStore(s.id)}
                style={[styles.storeChip, filterStore === s.id && styles.storeChipOn]}
              >
                <Ionicons name="storefront" size={16} color={filterStore === s.id ? "#fff" : "#6b7280"} />
                <Text style={[styles.storeChipTxt, filterStore === s.id && styles.storeChipTxtOn]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={() => setStoreModal({ open: true })} style={[styles.storeChip, styles.addStore]}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={[styles.storeChipTxt, styles.storeChipTxtOn]}>Tienda</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Budget progress bar */}
        {filterStore !== "all" && (() => {
          const limit = budgets[filterStore];
          if (!limit) return null;
          const spent = totals.byStore[filterStore] || 0;
          const pct = Math.min(1, spent / limit);
          const storeName = stores.find(s=>s.id===filterStore)?.name;
          return (
            <View style={styles.budgetContainer}>
              <View style={styles.budgetHeader}>
                <View style={styles.budgetIconContainer}>
                  <Ionicons name="wallet" size={16} color="#6b7280" />
                </View>
                <Text style={styles.budgetLabel}>Presupuesto - {storeName}</Text>
              </View>
              <View style={styles.budgetBar}>
                <View style={styles.budgetBarBackground}>
                  <View style={[
                    styles.budgetBarFill, 
                    { 
                      width: `${pct*100}%`, 
                      backgroundColor: pct < .8 ? "#10b981" : pct < 1 ? "#f59e0b" : "#ef4444" 
                    }
                  ]} />
                </View>
              </View>
              <View style={styles.budgetTextContainer}>
                <Text style={styles.budgetSpent}>
                  {list?.currency} {spent.toFixed(2)}
                </Text>
                <Text style={styles.budgetLimit}>
                  de {list?.currency} {limit.toFixed(2)}
                </Text>
                <Text style={styles.budgetPercentage}>
                  ({Math.round(pct*100)}%)
                </Text>
              </View>
            </View>
          );
        })()}

        {/* Banner de alerta si se supera */}
        {banner && (
          <View style={styles.alertBanner}>
            <View style={styles.alertIcon}>
              <Ionicons name="warning" size={20} color="#dc2626" />
            </View>
            <Text style={styles.alertText}>{banner}</Text>
          </View>
        )}

        {/* Add item section */}
        <View style={styles.addSection}>
          <Text style={styles.addSectionLabel}>Agregar producto</Text>
          <View style={styles.addRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Ej: Leche descremada"
              style={[styles.input, styles.nameInput]}
              placeholderTextColor="#9ca3af"
            />
            <TextInput 
              value={qty} 
              onChangeText={setQty} 
              placeholder="1" 
              keyboardType="decimal-pad" 
              style={[styles.input, styles.smallInput]} 
              placeholderTextColor="#9ca3af"
            />
            <TextInput 
              value={unit} 
              onChangeText={setUnit} 
              placeholder="u" 
              style={[styles.input, styles.smallInput]} 
              placeholderTextColor="#9ca3af"
            />
            <TextInput 
              value={price} 
              onChangeText={setPrice} 
              placeholder="$" 
              keyboardType="decimal-pad" 
              style={[styles.input, styles.smallInput]} 
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.addButtons}>
            <TouchableOpacity onPress={add} style={styles.addBtn}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addBtnTxt}>Agregar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScanOpen(true)} style={styles.scanBtn}>
              <Ionicons name="barcode-outline" size={20} color="#fff" />
              <Text style={styles.scanBtnTxt}>Escanear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List */}
        <View style={styles.listContainer}>
          <Text style={styles.listLabel}>
            Productos {filterStore === "all" ? "" : `- ${stores.find(s => s.id === filterStore)?.name}`}
          </Text>
          <FlatList
            data={visibleItems}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <TouchableOpacity onPress={() => toggle(item)} style={styles.statusButton}>
                  {statusIcon(item.status)}
                </TouchableOpacity>
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemDetails}>
                    <View style={styles.itemDetailItem}>
                      <Ionicons name="layers" size={14} color="#6b7280" />
                      <Text style={styles.itemDetailText}>
                        {item.qty} {item.unit || "u"}
                      </Text>
                    </View>
                    {item.price && (
                      <View style={styles.itemDetailItem}>
                        <Ionicons name="cash" size={14} color="#6b7280" />
                        <Text style={styles.itemDetailText}>
                          {list?.currency} {(item.price * item.qty).toFixed(2)}
                        </Text>
                      </View>
                    )}
                    {item.storeId && (
                      <View style={styles.itemDetailItem}>
                        <Ionicons name="storefront" size={14} color="#6b7280" />
                        <Text style={styles.itemDetailText}>
                          {stores.find(s=>s.id===item.storeId)?.name}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity onPress={() => del(item)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="basket-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>Sin productos en esta vista</Text>
                <Text style={styles.emptySubtext}>Agrega productos para comenzar tu lista</Text>
              </View>
            }
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        </View>

        {/* Totales */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsHeader}>
            <Ionicons name="calculator" size={20} color="#6b7280" />
            <Text style={styles.totalsTitle}>Resumen de gastos</Text>
          </View>
          
          {Object.entries(totals.byStore).length > 0 && (
            <View style={styles.storeTotals}>
              {Object.entries(totals.byStore).map(([sid, val]) => (
                <View key={sid} style={styles.storeTotalItem}>
                  <View style={styles.storeTotalIcon}>
                    <Ionicons name="storefront" size={16} color="#6b7280" />
                  </View>
                  <Text style={styles.storeTotalName}>
                    {stores.find(s => s.id === sid)?.name || "Tienda"}
                  </Text>
                  <Text style={styles.storeTotalAmount}>
                    {list?.currency} {val.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.grandTotal}>
            <View style={styles.grandTotalIcon}>
              <Ionicons name="wallet" size={20} color="#10b981" />
            </View>
            <Text style={styles.grandTotalLabel}>Total general</Text>
            <Text style={styles.grandTotalAmount}>
              {list?.currency} {totals.total.toFixed(2)}
            </Text>
          </View>
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

        {/* Budget Modal */}
        <Modal visible={budgetModal.open} transparent animationType="slide" onRequestClose={() => setBudgetModal({ open: false })}>
          <View style={styles.modalBackdrop}>
            <View style={styles.budgetModalCard}>
              <Text style={styles.budgetModalTitle}>Establecer Presupuesto Total</Text>
              
              <View style={styles.budgetInputContainer}>
                <Text style={styles.budgetInputLabel}>Monto del presupuesto:</Text>
                <TextInput
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  placeholder="Ej: 500.00"
                  keyboardType="decimal-pad"
                  style={styles.budgetInput}
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.budgetCurrency}>{list?.currency}</Text>
              </View>

              <Text style={styles.budgetHelpText}>
                Establece un presupuesto total para esta lista de compras. 
                La barra de progreso te mostrará cuánto has gastado.
              </Text>

              <View style={styles.budgetModalFooter}>
                <TouchableOpacity 
                  onPress={() => setBudgetModal({ open: false })} 
                  style={[styles.budgetModalBtn, styles.budgetModalBtnCancel]}
                >
                  <Text style={styles.budgetModalBtnTextCancel}>Cancelar</Text>
                </TouchableOpacity>
                
                {list?.budgetLimit && (
                  <TouchableOpacity 
                    onPress={async () => {
                      if (list) {
                        await updateList(list.id!, { budgetLimit: undefined });
                        const updatedList = await loadList(list.id!);
                        setList(updatedList);
                      }
                      setBudgetModal({ open: false });
                    }} 
                    style={[styles.budgetModalBtn, styles.budgetModalBtnDelete]}
                  >
                    <Text style={styles.budgetModalBtnTextDelete}>Eliminar</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  onPress={async () => {
                    const numValue = parseFloat(budgetInput) || 0;
                    if (list && numValue >= 0) {
                      await updateList(list.id!, { budgetLimit: numValue });
                      // Reload the list to get updated budget
                      const updatedList = await loadList(list.id!);
                      setList(updatedList);
                    }
                    setBudgetModal({ open: false });
                  }} 
                  style={[styles.budgetModalBtn, styles.budgetModalBtnSave]}
                >
                  <Text style={styles.budgetModalBtnText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        </View>
      </View>
    </Modal>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: "#7c3aed",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
    color: "#fff",
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  storesContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  storesLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  storesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  storeChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  storeChipOn: {
    backgroundColor: "#2563eb",
    borderColor: "#1d4ed8",
  },
  storeChipTxt: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
  },
  storeChipTxtOn: {
    color: "#fff",
    fontWeight: "700",
  },
  addStore: {
    backgroundColor: "#7c3aed",
    borderColor: "#6d28d9",
  },

  budgetContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  budgetBar: {
    marginBottom: 12,
  },
  budgetBarBackground: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
  },
  budgetBarFill: {
    height: 8,
    borderRadius: 6,
  },
  budgetTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetSpent: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  budgetLimit: {
    fontSize: 14,
    color: "#6b7280",
  },
  budgetPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },

  alertBanner: {
    backgroundColor: "#fef2f2",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  alertIcon: {
    marginRight: 12,
  },
  alertText: {
    flex: 1,
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 14,
  },

  addSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addSectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  addRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 14,
    color: "#111827",
  },
  nameInput: {
    flex: 1,
  },
  smallInput: {
    width: 60,
    textAlign: "center",
  },
  addButtons: {
    flexDirection: "row",
    gap: 12,
  },
  addBtn: {
    flex: 1,
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnTxt: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  scanBtn: {
    flex: 1,
    backgroundColor: "#7c3aed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scanBtnTxt: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#111827",
    marginBottom: 6,
  },
  itemDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  itemDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemDetailText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
  },

  totalsContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  totalsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  totalsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginLeft: 8,
  },
  storeTotals: {
    marginBottom: 16,
  },
  storeTotalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  storeTotalIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  storeTotalName: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
  },
  storeTotalAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  grandTotal: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  grandTotalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  grandTotalLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  grandTotalAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#10b981",
  },

  // Budget Section Styles
  budgetSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  budgetSectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  editBudgetButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  noBudgetContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  noBudgetText: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
  setBudgetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7c3aed",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  setBudgetText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Budget Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  budgetModalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  budgetModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  budgetInputContainer: {
    marginBottom: 16,
  },
  budgetInputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  budgetInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 16,
    color: "#111827",
    textAlign: "center",
  },
  budgetCurrency: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
  },
  budgetHelpText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 20,
  },
  budgetModalFooter: {
    flexDirection: "row",
    gap: 12,
  },
  budgetModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  budgetModalBtnCancel: {
    backgroundColor: "#f3f4f6",
  },
  budgetModalBtnSave: {
    backgroundColor: "#7c3aed",
  },
  budgetModalBtnDelete: {
    backgroundColor: "#ef4444",
  },
  budgetModalBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  budgetModalBtnTextCancel: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 14,
  },
  budgetModalBtnTextDelete: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});

