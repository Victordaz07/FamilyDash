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
import EditItemModal from "./EditItemModal";
import ShoppingHistoryModal from "./ShoppingHistoryModal";
import CompletePurchaseModal from "./CompletePurchaseModal";

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
  const [adding, setAdding] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; item?: ShoppingItem }>({ open: false });
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [completeModal, setCompleteModal] = useState(false);
  const [showTotalPrice, setShowTotalPrice] = useState(false);

  // Available unit options
  const unitOptions = [
    { value: "u", label: "Unit" },
    { value: "kg", label: "Kilogram" },
    { value: "lb", label: "Pound" },
    { value: "g", label: "Gram" },
    { value: "oz", label: "Ounce" },
    { value: "L", label: "Liter" },
    { value: "gal", label: "Gallon" },
    { value: "dozen", label: "Dozen" },
    { value: "half_dozen", label: "Half Dozen" },
    { value: "pack_4", label: "Pack of 4" },
    { value: "pack_6", label: "Pack of 6" },
    { value: "pack_12", label: "Pack of 12" },
    { value: "pack", label: "Custom Pack" },
  ];

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
    if (adding) return; // Prevent multiple clicks
    
    try {
      if (!list || !text.trim()) {
        // Show feedback for empty name
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      setAdding(true);
      // Show loading feedback
      await Haptics.selectionAsync();

      const newItem: any = {
        name: text.trim(),
        qty: parseFloat(qty) || 1,
        unit: unit || "u",
        status: "pending" as const,
      };

      // Only add price if it exists
      if (price && !isNaN(parseFloat(price))) {
        newItem.price = parseFloat(price);
      }

      // Only add storeId if a specific store is selected
      if (filterStore !== "all") {
        newItem.storeId = filterStore;
      }

      await addItem(list.id!, newItem);
      
      // si proviene de escaneo con nombre "Producto <code>" también registra el producto
      const maybeCode = text.match(/^Producto\s+(\d[\d\- ]*)$/)?.[1];
      if (maybeCode || (price && !isNaN(parseFloat(price)))) {
        const productData: any = {
          familyId,
          barcode: maybeCode || "",
          name: text.replace(/^Producto\s+\d[\d\- ]*\s*/,""),
          defaultUnit: unit,
        };

        // Only add lastPrice if it exists and is valid
        if (price && !isNaN(parseFloat(price))) {
          productData.lastPrice = parseFloat(price);
        }

        // Only add lastStoreId if a specific store is selected
        if (filterStore !== "all") {
          productData.lastStoreId = filterStore;
        }

        await upsertProduct(productData);
      }
      
      // Refresh items list
      const it = await listItems(list.id!);
      setItems(it as any);
      
      // Clear form fields
      setText(""); 
      setQty("1"); 
      setUnit("u"); 
      setPrice("");

      // Show success feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
    } catch (error) {
      console.error("Error adding item:", error);
      // Show error feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // You could also show an alert here if needed
      // Alert.alert("Error", "No se pudo agregar el producto. Inténtalo de nuevo.");
    } finally {
      setAdding(false);
    }
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

  const handleEditItem = async (itemId: string, updates: Partial<ShoppingItem>) => {
    await updateItem(itemId, updates);
    
    // Refresh items list
    if (list) {
      const it = await listItems(list.id!);
      setItems(it as any);
    }
    
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteItem = async (itemId: string) => {
    await removeItem(itemId);
    setItems(prev => prev.filter(p => p.id !== itemId));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
                  <View style={styles.headerLeft}>
                    <View style={styles.headerIcon}>
                      <Ionicons name="cart" size={20} color="#fff" />
                    </View>
                    <Text style={styles.title}>Shopping List</Text>
                  </View>
                  <View style={styles.headerRight}>
                    <TouchableOpacity onPress={() => setHistoryModal(true)} style={styles.historyButton}>
                      <Ionicons name="time" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <Ionicons name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
          </View>

        {/* Budget & Totals Section - Compact with Store Filters */}
        <View style={styles.budgetTotalsSection}>
          <View style={styles.budgetTotalsHeader}>
            <Text style={styles.budgetTotalsLabel}>Summary</Text>
            <TouchableOpacity 
              onPress={() => setBudgetModal({ open: true })}
              style={styles.editBudgetButton}
            >
              <Ionicons name="create-outline" size={14} color="#7c3aed" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.budgetTotalsContent}>
            {/* Budget Row */}
            <View style={styles.budgetRow}>
              <View style={styles.budgetInfo}>
                <Ionicons name="wallet" size={16} color="#6b7280" />
                <Text style={styles.budgetLabel}>Budget</Text>
              </View>
              <View style={styles.budgetValues}>
                {list?.budgetLimit ? (
                  <>
                    <Text style={styles.budgetSpent}>
                      {list.currency} {totals.total.toFixed(2)}
                    </Text>
                    <Text style={styles.budgetLimit}>
                      / {list.currency} {list.budgetLimit.toFixed(2)}
                    </Text>
                    <Text style={styles.budgetPercentage}>
                      ({Math.round((totals.total / list.budgetLimit) * 100)}%)
                    </Text>
                  </>
                ) : (
                  <TouchableOpacity 
                    onPress={() => setBudgetModal({ open: true })}
                    style={styles.setBudgetButtonSmall}
                  >
                    <Ionicons name="add" size={12} color="#fff" />
                    <Text style={styles.setBudgetTextSmall}>Set</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Total Row */}
            <View style={styles.totalRow}>
              <View style={styles.totalInfo}>
                <Ionicons name="calculator" size={16} color="#6b7280" />
                <Text style={styles.totalLabel}>Total</Text>
              </View>
              <Text style={styles.totalAmount}>
                {list?.currency} {totals.total.toFixed(2)}
              </Text>
            </View>

            {/* Store Filters Row - Inside Budget Section */}
            <View style={styles.storeFiltersRow}>
              <Text style={styles.storeFiltersLabel}>Stores:</Text>
              <View style={styles.storesRow}>
                <TouchableOpacity
                  onPress={() => setFilterStore("all")}
                  style={[styles.storeChip, filterStore === "all" && styles.storeChipOn]}
                >
                  <Ionicons name="list" size={14} color={filterStore === "all" ? "#fff" : "#6b7280"} />
                  <Text style={[styles.storeChipTxt, filterStore === "all" && styles.storeChipTxtOn]}>All</Text>
                </TouchableOpacity>

                {stores.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setFilterStore(s.id)}
                    style={[styles.storeChip, filterStore === s.id && styles.storeChipOn]}
                  >
                    <Ionicons name="storefront" size={14} color={filterStore === s.id ? "#fff" : "#6b7280"} />
                    <Text style={[styles.storeChipTxt, filterStore === s.id && styles.storeChipTxtOn]}>
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity onPress={() => setStoreModal({ open: true })} style={[styles.storeChip, styles.addStore]}>
                  <Ionicons name="add" size={14} color="#fff" />
                  <Text style={[styles.storeChipTxt, styles.storeChipTxtOn]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
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
          <Text style={styles.addSectionLabel}>Add Product</Text>
          <View style={styles.addRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Ex: Skim milk"
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
            <TouchableOpacity 
              style={[styles.input, styles.smallInput, styles.unitSelector]}
              onPress={() => setShowUnitPicker(true)}
            >
              <Text style={styles.unitText}>{unit}</Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
            <TextInput 
              value={price} 
              onChangeText={setPrice} 
              placeholder="Price/unit" 
              keyboardType="decimal-pad" 
              style={[styles.input, styles.smallInput]} 
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.addButtons}>
            <TouchableOpacity 
              onPress={add} 
              style={[styles.addBtn, adding && styles.addBtnDisabled]}
              disabled={adding}
            >
              <Ionicons name={adding ? "hourglass-outline" : "add"} size={16} color="#fff" />
              <Text style={styles.addBtnTxt}>{adding ? "Adding..." : "Add"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScanOpen(true)} style={styles.scanBtn}>
              <Ionicons name="barcode-outline" size={20} color="#fff" />
              <Text style={styles.scanBtnTxt}>Scan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List */}
        <View style={styles.listContainer}>
          <Text style={styles.listLabel}>
            Products {filterStore === "all" ? "" : `- ${stores.find(s => s.id === filterStore)?.name}`}
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
                      <TouchableOpacity 
                        style={styles.itemDetailItem}
                        onPress={() => setShowTotalPrice(!showTotalPrice)}
                      >
                        <Ionicons name="cash" size={14} color="#6b7280" />
                        <Text style={styles.itemDetailText}>
                          {showTotalPrice 
                            ? `${list?.currency} ${(item.price * item.qty).toFixed(2)} total`
                            : `${list?.currency} ${item.price.toFixed(2)}/${item.unit || "u"}`
                          }
                        </Text>
                        <Ionicons 
                          name="swap-horizontal" 
                          size={12} 
                          color="#9ca3af" 
                          style={{ marginLeft: 4 }}
                        />
                      </TouchableOpacity>
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
                <View style={styles.itemActions}>
                  <TouchableOpacity 
                    onPress={() => setEditModal({ open: true, item })} 
                    style={styles.editButton}
                  >
                    <Ionicons name="create-outline" size={18} color="#7c3aed" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => del(item)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
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

        {/* Complete Purchase Button */}
        {items.length > 0 && (
          <View style={styles.completePurchaseSection}>
            <TouchableOpacity 
              style={styles.completePurchaseButton}
              onPress={() => setCompleteModal(true)}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.completePurchaseText}>Complete Purchase</Text>
            </TouchableOpacity>
          </View>
        )}

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
                    <Text style={styles.budgetModalTitle}>Set Total Budget</Text>
              
              <View style={styles.budgetInputContainer}>
                <Text style={styles.budgetInputLabel}>Budget amount:</Text>
                <TextInput
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  placeholder="Ex: 500.00"
                  keyboardType="decimal-pad"
                  style={styles.budgetInput}
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.budgetCurrency}>{list?.currency}</Text>
              </View>

              <Text style={styles.budgetHelpText}>
                Set a total budget for this shopping list. 
                The progress bar will show how much you've spent.
              </Text>

              <View style={styles.budgetModalFooter}>
                <TouchableOpacity 
                  onPress={() => setBudgetModal({ open: false })} 
                  style={[styles.budgetModalBtn, styles.budgetModalBtnCancel]}
                >
                  <Text style={styles.budgetModalBtnTextCancel}>Cancel</Text>
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
                    <Text style={styles.budgetModalBtnTextDelete}>Delete</Text>
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
                  <Text style={styles.budgetModalBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Item Modal */}
        {editModal.item && (
          <EditItemModal
            visible={editModal.open}
            onClose={() => setEditModal({ open: false })}
            item={editModal.item}
            stores={stores}
            onSave={handleEditItem}
            onDelete={handleDeleteItem}
          />
        )}

        {/* Unit Picker Modal */}
        <Modal visible={showUnitPicker} transparent animationType="fade" onRequestClose={() => setShowUnitPicker(false)}>
          <TouchableOpacity 
            style={styles.unitPickerBackdrop}
            activeOpacity={1}
            onPress={() => setShowUnitPicker(false)}
          >
            <View style={styles.unitPickerCard}>
              <Text style={styles.unitPickerTitle}>Select Unit</Text>
              <ScrollView style={styles.unitPickerList} showsVerticalScrollIndicator={false}>
                {unitOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.unitPickerOption,
                      unit === option.value && styles.unitPickerOptionSelected
                    ]}
                    onPress={() => {
                      setUnit(option.value);
                      setShowUnitPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.unitPickerOptionText,
                      unit === option.value && styles.unitPickerOptionTextSelected
                    ]}>
                      {option.label} ({option.value})
                    </Text>
                    {unit === option.value && (
                      <Ionicons name="checkmark" size={20} color="#7c3aed" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Shopping History Modal */}
        <ShoppingHistoryModal
          visible={historyModal}
          onClose={() => setHistoryModal(false)}
          familyId={familyId}
        />

        {/* Complete Purchase Modal */}
        {list && (
          <CompletePurchaseModal
            visible={completeModal}
            onClose={() => setCompleteModal(false)}
            list={list}
            items={items}
            estimatedTotal={totals.total}
            storeName={filterStore !== "all" ? stores.find(s => s.id === filterStore)?.name : undefined}
            onComplete={() => {
              // Refresh the list after completing purchase
              setCompleteModal(false);
            }}
            familyId={familyId}
            userId={userId}
          />
        )}
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  historyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  addSectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  addRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 13,
    color: "#111827",
  },
  nameInput: {
    flex: 1,
  },
  smallInput: {
    width: 50,
    textAlign: "center",
  },
  unitSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  unitText: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
  },
  addButtons: {
    flexDirection: "row",
    gap: 8,
  },
  addBtn: {
    flex: 1,
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addBtnTxt: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  addBtnDisabled: {
    backgroundColor: "#9ca3af",
    opacity: 0.7,
  },
  scanBtn: {
    flex: 1,
    backgroundColor: "#7c3aed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scanBtnTxt: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  completePurchaseSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  completePurchaseButton: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  completePurchaseText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
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
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
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


  // Budget & Totals Section - Compact Styles
  budgetTotalsSection: {
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
  budgetTotalsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  budgetTotalsLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  editBudgetButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  budgetTotalsContent: {
    gap: 8,
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  budgetInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  budgetLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  budgetValues: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  totalInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#10b981",
  },
  setBudgetButtonSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7c3aed",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 2,
  },
  setBudgetTextSmall: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  storeFiltersRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 8,
  },
  storeFiltersLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    minWidth: 60,
  },
  storesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  storeChipOn: {
    backgroundColor: "#2563eb",
    borderColor: "#1d4ed8",
  },
  storeChipTxt: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 11,
  },
  storeChipTxtOn: {
    color: "#fff",
    fontWeight: "600",
  },
  addStore: {
    backgroundColor: "#7c3aed",
    borderColor: "#6d28d9",
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

  // Unit Picker Styles
  unitPickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  unitPickerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "80%",
    maxWidth: 400,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  unitPickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  unitPickerList: {
    maxHeight: 400,
  },
  unitPickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  unitPickerOptionSelected: {
    backgroundColor: "#f8fafc",
  },
  unitPickerOptionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  unitPickerOptionTextSelected: {
    color: "#7c3aed",
    fontWeight: "600",
  },
});

