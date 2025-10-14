import {
  addDoc, collection, getDocs, orderBy, query, serverTimestamp, where
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { ShoppingHistory } from "@/types/shopping";

const COLLECTION = "shopping_history";

export async function saveShoppingHistory(history: ShoppingHistory): Promise<string> {
  const payload = {
    ...history,
    completedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };
  
  const ref = await addDoc(collection(db, COLLECTION), payload);
  return ref.id;
}

export async function getShoppingHistory(
  familyId: string,
  limit: number = 50
): Promise<ShoppingHistory[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("familyId", "==", familyId),
      orderBy("completedAt", "desc")
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    })) as ShoppingHistory[];
  } catch (error) {
    console.warn("Error fetching shopping history:", error);
    return [];
  }
}

export async function getShoppingHistoryByTask(
  familyId: string,
  taskId: string
): Promise<ShoppingHistory[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("familyId", "==", familyId),
      where("taskId", "==", taskId),
      orderBy("completedAt", "desc")
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    })) as ShoppingHistory[];
  } catch (error) {
    console.warn("Error fetching shopping history by task:", error);
    return [];
  }
}




