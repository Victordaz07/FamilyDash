import {
  addDoc, collection, getDocs, orderBy, query, serverTimestamp, where
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { PriceObservation, UnitKey } from "../types/shopping";

const COLLECTION = "product_prices";

export async function recordPriceObservation({
  familyId,
  barcode,
  storeId,
  unitPrice,
  totalPrice,
  currency,
  userId,
  qty,
  unit
}: {
  familyId: string;
  barcode: string;
  storeId?: string;
  unitPrice?: number;
  totalPrice?: number;
  currency: string;
  userId: string;
  qty?: number;
  unit?: UnitKey;
}): Promise<string> {
  const payload = {
    familyId,
    barcode,
    storeId: storeId || null,
    unitPrice: unitPrice || null,
    totalPrice: totalPrice || null,
    currency,
    userId,
    qty: qty || null,
    unit: unit || null,
    observedAt: serverTimestamp(),
    // Legacy compatibility
    price: unitPrice || null,
  };
  
  const ref = await addDoc(collection(db, COLLECTION), payload);
  return ref.id;
}

export async function lastUnitPriceForStore(
  familyId: string,
  barcode: string,
  storeId: string
): Promise<number | null> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("familyId", "==", familyId),
      where("barcode", "==", barcode),
      where("storeId", "==", storeId),
      where("unitPrice", "!=", null),
      orderBy("unitPrice"),
      orderBy("observedAt", "desc")
    );
    
    const snap = await getDocs(q);
    if (snap.empty) return null;
    
    const doc = snap.docs[0];
    const data = doc.data();
    return data.unitPrice || null;
  } catch (error) {
    console.warn("Error fetching last unit price for store:", error);
    return null;
  }
}

export async function lastPriceAnyStore(
  familyId: string,
  barcode: string
): Promise<number | null> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("familyId", "==", familyId),
      where("barcode", "==", barcode),
      where("unitPrice", "!=", null),
      orderBy("unitPrice"),
      orderBy("observedAt", "desc")
    );
    
    const snap = await getDocs(q);
    if (snap.empty) return null;
    
    const doc = snap.docs[0];
    const data = doc.data();
    return data.unitPrice || null;
  } catch (error) {
    console.warn("Error fetching last price any store:", error);
    return null;
  }
}
