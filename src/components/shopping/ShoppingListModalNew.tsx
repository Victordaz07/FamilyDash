import React, { useEffect, useMemo, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ShoppingItem, ShoppingList, ShoppingStore, PriceMode, UnitKey } from "@/types/shopping";
import {
  addItem, cycleStatus, deleteStore, getOrCreateShoppingList, listItems,
  removeItem, updateItem, updateList, upsertStore, loadList
} from "@/services/shopping";
import { findProductByBarcode, upsertProduct } from "@/services/shoppingProducts";
import { recordPriceObservation, lastUnitPriceForStore, lastPriceAnyStore } from "@/services/shoppingPrices";
import { getCurrentPosition, pickNearestStore } from "@/services/stores/currentStore";
import StorePickerModal from "./StorePickerModal";
import BarcodeScannerModal from "./BarcodeScannerModal";
import UnitSelector from "./UnitSelector";
import { displayUnitLabel, lineTotal, atomicUnitPrice } from "./priceMath";

function statusIcon(s: "pending" | "in_cart" | "purchased") {
  if (s === "pending") return <Ionicons name="square-outline" size={22} color="#6b7280" />;
  if (s === "in_cart") return <Ionicons name="checkmark-circle-outline" size={22} color="#f59e0b" />;
  return <Ionicons name="checkmark-done-circle" size={22} color="#16a34a" />;
}

export default function ShoppingListModalNew({
  visible, onClose, taskId, familyId, userId
}: { 
  visible: boolean; 
  onClose: () => void; 
  taskId: string; 
  familyId: string; 
  userId: string;
}) {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [filterStore, setFilterStore] = useState<string | "all">("all");

  // Add item form
  const [productName, setProductName] = useState("");
  const [qty, setQty] = useState("1");
  const [selectedUnit, setSelectedUnit] = useState<UnitKey>("u");
  const [packSize, setPackSize] = useState<number | null>(null);
  const [priceMode, setPriceMode] = useState<PriceMode>("unit");
  const [price, setPrice] = useState("");
  const [adding, setAdding] = useState(false);

  // Modals
  const [storeModal, setStoreModal] = useState<{ open: boolean; editing?: ShoppingStore }>({ open: false });
  const [scanOpen, setScanOpen] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    loadShoppingList();
  }, [visible, taskId, familyId, userId]);

  useEffect(() => {
    if (!list) return;
    checkBudgetAlerts();
  }, [list, filterStore, items]);

  const loadShoppingList = async () => {
    try {
      const l = await getOrCreateShoppingList(taskId, familyId, userId);
      setList(l as any);
      const it = await listItems((l as any).id);
      setItems(it as any);
    } catch (error) {
      console.error("Error loading shopping list:", error);
      Alert.alert("Error", "Failed to load shopping list");
    }
  };

  const checkBudgetAlerts = () => {
    if (!list || filterStore === "all") {
      setBanner(null);
      return;
    }

    const store = list.stores.find(s => s.id === filterStore);
    if (!store || !store.budgetLimit) {
      setBanner(null);
      return;
    }

    const spent = items
      .filter(i => i.storeId === filterStore && i.price)
      .reduce((sum, i) => sum + lineTotal(i), 0);

    if (spent > store.budgetLimit) {
      const overage = spent - store.budgetLimit;
      setBanner(`Budget exceeded by ${list.currency} ${overage.toFixed(2)}`);
    } else {
      setBanner(null);
    }
  };

  const add = async () => {
    if (adding || !list || !productName.trim()) return;
    
    try {
      setAdding(true);
      await Haptics.selectionAsync();

      const priceValue = parseFloat(price) || 0;
      const qtyValue = parseFloat(qty) || 1;

      const newItem: any = {
        name: productName.trim(),
        qty: qtyValue,
        unit: selectedUnit,
        packSize: selectedUnit === "pack" ? packSize : null,
        status: "pending",
        priceMode,
        unitPrice: priceMode === "unit" ? priceValue : null,
        totalPrice: priceMode === "total" ? priceValue : null,
        // Legacy compatibility
        price: priceMode === "unit" ? priceValue : (priceValue / qtyValue),
      };

      if (filterStore !== "all") {
        newItem.storeId = filterStore;
      }

      await addItem(list.id!, newItem);
      
      // Clear form
      setProductName("");
      setQty("1");
      setSelectedUnit("u");
      setPackSize(null);
      setPriceMode("unit");
      setPrice("");
      
      // Refresh items
      const it = await listItems(list.id!);
      setItems(it as any);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error adding item:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to add item");
    } finally {
      setAdding(false);
    }
  };

  const handleScanned = async ({ barcode }: { barcode: string }) => {
    try {
      // Find existing product
      const product = await findProductByBarcode(familyId, barcode);
      
      if (product) {
        setProductName(product.name);
        setSelectedUnit(product.defaultUnit as UnitKey || "u");
        
        // Get current position for store suggestion
        const position = await getCurrentPosition();
        if (position && list) {
          const nearestStore = pickNearestStore(position, list.stores);
          if (nearestStore && filterStore === "all") {
            setFilterStore(nearestStore.id);
          }
        }
        
        // Get last price
        const lastPrice = filterStore !== "all" 
          ? await lastUnitPriceForStore(familyId, barcode, filterStore)
          : await lastPriceAnyStore(familyId, barcode);
          
        if (lastPrice) {
          setPrice(lastPrice.toString());
          setPriceMode("unit");
        }
        
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setProductName(`Product ${barcode}`);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error) {
      console.error("Error handling scanned barcode:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const toggleStatus = async (item: ShoppingItem) => {
    try {
      const newStatus = cycleStatus(item.status);
      await updateItem(item.id, { status: newStatus });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
      await Haptics.selectionAsync();
    } catch (error) {
      console.error("Error updating item status:", error);
    }
  };

  const deleteItem = async (item: ShoppingItem) => {
    try {
      await removeItem(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const stores = useMemo(() => list?.stores ?? [], [list]);
  const visibleItems = useMemo(
    () => filterStore === "all" ? items : items.filter(i => i.storeId === filterStore),
    [items, filterStore]
  );

  const totals = useMemo(() => {
    const storeTotals: { [key: string]: number } = {};
    let grandTotal = 0;

    items.forEach(item => {
      const itemTotal = lineTotal(item);
      grandTotal += itemTotal;
      if (item.storeId) {
        storeTotals[item.storeId] = (storeTotals[item.storeId] || 0) + itemTotal;
      }
    });
    return { storeTotals, total: grandTotal };
  }, [items]);

  const budgets = useMemo(() => {
    const b: { [key: string]: number } = {};
    stores.forEach(s => {
      if (s.budgetLimit) b[s.id] = s.budgetLimit;
    });
    return b;
  }, [stores]);

  // Price preview calculation
  const pricePreview = useMemo(() => {
    if (!price || !qty) return null;
    
    const priceValue = parseFloat(price);
    const qtyValue = parseFloat(qty);
    
    if (priceMode === "unit") {
      const total = priceValue * qtyValue;
      return `${list?.currency} ${total.toFixed(2)} total`;
    } else {
      const unitPrice = priceValue / qtyValue;
      const unitLabel = displayUnitLabel(selectedUnit, packSize);
      return `${list?.currency} ${unitPrice.toFixed(2)}/${unitLabel}`;
    }
  }, [price, qty, priceMode, selectedUnit, packSize, list?.currency]);

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Ionicons name="cart" size={20} color="#fff" />
                </View>
                <Text style={styles.title}>Shopping List</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Store Filter */}
          <View style={styles.storeSection}>
            <Text style={styles.sectionLabel}>Stores</Text>
            <View style={styles.storesRow}>
              <TouchableOpacity
                onPress={() => setFilterStore("all")}
                style={[styles.storeChip, filterStore === "all" && styles.storeChipActive]}
              >
                <Ionicons name="list" size={14} color={filterStore === "all" ? "#fff" : "#6b7280"} />
                <Text style={[styles.storeChipText, filterStore === "all" && styles.storeChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>

              {stores.map(store => (
                <TouchableOpacity
                  key={store.id}
                  onPress={() => setFilterStore(store.id)}
                  style={[styles.storeChip, filterStore === store.id && styles.storeChipActive]}
                >
                  <Ionicons name="storefront" size={14} color={filterStore === store.id ? "#fff" : "#6b7280"} />
                  <Text style={[styles.storeChipText, filterStore === store.id && styles.storeChipTextActive]}>
                    {store.name}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity 
                onPress={() => setStoreModal({ open: true })} 
                style={[styles.storeChip, styles.addStoreChip]}
              >
                <Ionicons name="add" size={14} color="#fff" />
                <Text style={[styles.storeChipText, styles.addStoreChipText]}>+ Store</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Budget Progress */}
          {filterStore !== "all" && budgets[filterStore] && (
            <View style={styles.budgetSection}>
              <View style={styles.budgetHeader}>
                <Text style={styles.budgetLabel}>Budget</Text>
                <Text style={styles.budgetAmount}>
                  {list?.currency} {(totals.storeTotals[filterStore] || 0).toFixed(2)} / {budgets[filterStore].toFixed(2)}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(((totals.storeTotals[filterStore] || 0) / budgets[filterStore]) * 100, 100)}%`,
                      backgroundColor: (totals.storeTotals[filterStore] || 0) > budgets[filterStore] ? "#ef4444" : 
                                     (totals.storeTotals[filterStore] || 0) > budgets[filterStore] * 0.8 ? "#f59e0b" : "#10b981"
                    }
                  ]} 
                />
              </View>
            </View>
          )}

          {/* Budget Alert */}
          {banner && (
            <View style={styles.alertBanner}>
              <Ionicons name="warning" size={20} color="#dc2626" />
              <Text style={styles.alertText}>{banner}</Text>
            </View>
          )}

          {/* Add Product Section */}
          <View style={styles.addSection}>
            <Text style={styles.sectionLabel}>Add Product</Text>
            
            {/* Product Name */}
            <TextInput
              value={productName}
              onChangeText={setProductName}
              placeholder="Product name"
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />

            {/* Quantity and Unit */}
            <View style={styles.qtyUnitRow}>
              <TextInput
                value={qty}
                onChangeText={setQty}
                placeholder="1"
                keyboardType="decimal-pad"
                style={[styles.input, styles.qtyInput]}
                placeholderTextColor="#9ca3af"
              />
              <UnitSelector
                selectedUnit={selectedUnit}
                packSize={packSize}
                onSelect={(unit, size) => {
                  setSelectedUnit(unit);
                  setPackSize(size);
                }}
              />
            </View>

            {/* Price Mode and Input */}
            <View style={styles.priceSection}>
              <View style={styles.priceModeSelector}>
                <TouchableOpacity
                  onPress={() => setPriceMode("unit")}
                  style={[styles.priceModeButton, priceMode === "unit" && styles.priceModeButtonActive]}
                >
                  <Text style={[styles.priceModeText, priceMode === "unit" && styles.priceModeTextActive]}>
                    Unit Price
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPriceMode("total")}
                  style={[styles.priceModeButton, priceMode === "total" && styles.priceModeButtonActive]}
                >
                  <Text style={[styles.priceModeText, priceMode === "total" && styles.priceModeTextActive]}>
                    Total Price
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder={priceMode === "unit" ? "Price per unit" : "Total price"}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholderTextColor="#9ca3af"
              />

              {/* Price Preview */}
              {pricePreview && (
                <Text style={styles.pricePreview}>{pricePreview}</Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={add} 
                style={[styles.addButton, adding && styles.addButtonDisabled]}
                disabled={adding}
              >
                <Ionicons name={adding ? "hourglass-outline" : "add"} size={16} color="#fff" />
                <Text style={styles.addButtonText}>{adding ? "Adding..." : "Add"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setScanOpen(true)} style={styles.scanButton}>
                <Ionicons name="barcode-outline" size={20} color="#fff" />
                <Text style={styles.scanButtonText}>Scan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Items List */}
          <View style={styles.listSection}>
            <Text style={styles.sectionLabel}>
              Products {filterStore === "all" ? "" : `- ${stores.find(s => s.id === filterStore)?.name}`}
            </Text>
            
            <FlatList
              data={visibleItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.itemCard}>
                  <TouchableOpacity onPress={() => toggleStatus(item)} style={styles.statusButton}>
                    {statusIcon(item.status)}
                  </TouchableOpacity>
                  
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>
                      {item.qty} {displayUnitLabel(item.unit || "u", item.packSize)} • {list?.currency} {lineTotal(item).toFixed(2)} total • {list?.currency} {atomicUnitPrice(item).value.toFixed(2)} {atomicUnitPrice(item).suffix}
                      {item.storeId && ` • ${stores.find(s => s.id === item.storeId)?.name}`}
                    </Text>
                  </View>
                  
                  <TouchableOpacity onPress={() => deleteItem(item)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="basket-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyText}>No products in this view</Text>
                  <Text style={styles.emptySubtext}>Add products to start your list</Text>
                </View>
              }
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          </View>

          {/* Totals */}
          <View style={styles.totalsSection}>
            <Text style={styles.sectionLabel}>Totals</Text>
            {Object.entries(totals.storeTotals).map(([storeId, total]) => {
              const store = stores.find(s => s.id === storeId);
              return (
                <View key={storeId} style={styles.storeTotal}>
                  <Text style={styles.storeTotalName}>{store?.name}</Text>
                  <Text style={styles.storeTotalAmount}>
                    {list?.currency} {total.toFixed(2)}
                  </Text>
                </View>
              );
            })}
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalAmount}>
                {list?.currency} {totals.total.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Modals */}
          {list && (
            <StorePickerModal
              visible={storeModal.open}
              onClose={() => setStoreModal({ open: false })}
              initial={storeModal.editing}
              onSave={async (store) => {
                await upsertStore(list.id!, store);
                const fresh = await loadList(list.id!);
                setList(fresh);
                setStoreModal({ open: false });
              }}
              onDelete={storeModal.editing ? async () => {
                await deleteStore(list.id!, storeModal.editing!.id);
                const fresh = await loadList(list.id!);
                setList(fresh);
                setStoreModal({ open: false });
              } : undefined}
            />
          )}

          <BarcodeScannerModal
            visible={scanOpen}
            onClose={() => setScanOpen(false)}
            onScanned={handleScanned}
          />
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    color: "#fff",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  storeSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  storesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  storeChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  storeChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#1d4ed8",
  },
  storeChipText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 11,
  },
  storeChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  addStoreChip: {
    backgroundColor: "#7c3aed",
    borderColor: "#6d28d9",
  },
  addStoreChipText: {
    color: "#fff",
    fontWeight: "600",
  },
  budgetSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
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
  alertText: {
    flex: 1,
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 12,
  },
  addSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
  },
  qtyUnitRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  qtyInput: {
    width: 80,
    marginBottom: 0,
  },
  priceSection: {
    marginBottom: 12,
  },
  priceModeSelector: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 4,
    marginBottom: 8,
  },
  priceModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  priceModeButtonActive: {
    backgroundColor: "#7c3aed",
  },
  priceModeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  priceModeTextActive: {
    color: "#fff",
  },
  pricePreview: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  addButton: {
    flex: 1,
    backgroundColor: "#7c3aed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  addButtonDisabled: {
    backgroundColor: "#a78bfa",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  scanButton: {
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  scanButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  listSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    flex: 1,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
  },
  statusButton: {
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9ca3af",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#d1d5db",
    marginTop: 4,
  },
  totalsSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  storeTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  storeTotalName: {
    fontSize: 14,
    color: "#6b7280",
  },
  storeTotalAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  grandTotalAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10b981",
  },
});




