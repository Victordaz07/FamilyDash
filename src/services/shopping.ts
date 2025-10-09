import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query,
  serverTimestamp, updateDoc, where
} from "firebase/firestore";
import { db } from "../config/firebase";
import { ShoppingItem, ShoppingList, ShoppingStatus, ShoppingStore } from "../types/shopping";

const LISTS = "shopping_lists";
const ITEMS = "shopping_items";

export async function getOrCreateShoppingList(taskId: string, familyId: string, userId: string) {
  const q = query(collection(db, LISTS), where("taskId", "==", taskId));
  const snap = await getDocs(q);
  if (!snap.empty) return { id: snap.docs[0].id, ...(snap.docs[0].data() as any) } as ShoppingList;

  const payload: ShoppingList = {
    familyId, taskId, title: "Shopping list", stores: [], currency: "USD",
    createdBy: userId, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, LISTS), payload);
  return { ...payload, id: ref.id };
}

export async function listItems(listId: string) {
  try {
    // Try with orderBy first (requires composite index)
    const q = query(collection(db, ITEMS), where("listId", "==", listId), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as (ShoppingItem & { listId: string })[];
  } catch (error) {
    // Fallback: query without orderBy (no index needed)
    console.warn("Composite index missing, using fallback query:", error);
    const q = query(collection(db, ITEMS), where("listId", "==", listId));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as (ShoppingItem & { listId: string })[];
    
    // Sort manually by createdAt
    return items.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return aTime - bTime;
    });
  }
}

export async function addItem(listId: string, item: Omit<ShoppingItem, "id">) {
  const payload = { ...item, status: item.status ?? "pending", listId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  const ref = await addDoc(collection(db, ITEMS), payload);
  return ref.id;
}

export async function updateItem(itemId: string, patch: Partial<ShoppingItem>) {
  await updateDoc(doc(db, ITEMS, itemId), { ...patch, updatedAt: serverTimestamp() });
}

export async function removeItem(itemId: string) {
  await deleteDoc(doc(db, ITEMS, itemId));
}

export async function loadList(listId: string): Promise<ShoppingList | null> {
  const d = await getDoc(doc(db, LISTS, listId));
  return d.exists() ? ({ id: d.id, ...(d.data() as any) }) : null;
}

export async function updateList(listId: string, patch: Partial<ShoppingList>) {
  await updateDoc(doc(db, LISTS, listId), { ...patch, updatedAt: serverTimestamp() });
}

export async function upsertStore(listId: string, store: ShoppingStore) {
  const list = await loadList(listId);
  if (!list) throw new Error("List not found");
  const stores = [...(list.stores || [])];
  const idx = stores.findIndex(s => s.id === store.id);
  if (idx >= 0) stores[idx] = { ...stores[idx], ...store };
  else stores.push(store);
  await updateList(listId, { stores });
}

export async function deleteStore(listId: string, storeId: string) {
  const list = await loadList(listId);
  if (!list) return;
  const stores = (list.stores || []).filter(s => s.id !== storeId);
  await updateList(listId, { stores });
  // Opcional: limpiar storeId en ítems que apuntaban a esa tienda
  const all = await listItems(listId);
  const affected = all.filter(i => i.storeId === storeId);
  await Promise.all(affected.map(i => updateItem(i.id, { storeId: undefined })));
}

export function cycleStatus(current: ShoppingStatus): ShoppingStatus {
  if (current === "pending") return "in_cart";
  if (current === "in_cart") return "purchased";
  return "pending";
}

