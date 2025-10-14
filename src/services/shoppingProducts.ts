import { addDoc, collection, getDocs, query, where, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { ShoppingProduct } from "../types/shopping";

const COL = "shopping_products";

export async function findProductByBarcode(familyId: string, barcode: string): Promise<ShoppingProduct | null> {
  const q = query(collection(db, COL), where("familyId", "==", familyId), where("barcode", "==", barcode));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as any) };
}

export async function upsertProduct(p: ShoppingProduct) {
  const existing = await findProductByBarcode(p.familyId, p.barcode);
  if (existing) {
    await updateDoc(doc(db, COL, existing.id!), {
      name: p.name || existing.name,
      defaultUnit: p.defaultUnit ?? existing.defaultUnit ?? "u",
      lastPrice: p.lastPrice ?? existing.lastPrice,
      lastStoreId: p.lastStoreId ?? existing.lastStoreId,
      updatedAt: serverTimestamp()
    });
    return existing.id!;
  }
  const ref = await addDoc(collection(db, COL), {
    familyId: p.familyId,
    barcode: p.barcode,
    name: p.name,
    defaultUnit: p.defaultUnit ?? "u",
    lastPrice: p.lastPrice ?? null,
    lastStoreId: p.lastStoreId ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
}

