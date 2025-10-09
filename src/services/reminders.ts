import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { FamilyReminder } from "../types/reminder";

const COL = "family_reminders";

export async function listReminders(familyId: string) {
  try {
    // First try with orderBy (requires composite index)
    const q = query(
      collection(db, COL),
      where("familyId", "==", familyId),
      where("isActive", "==", true),
      orderBy("scheduledFor", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as FamilyReminder[];
  } catch (error: any) {
    // If composite index error, fallback to simple query and sort in memory
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      console.warn('Composite index not found, using fallback query for reminders');
      const q = query(
        collection(db, COL),
        where("familyId", "==", familyId),
        where("isActive", "==", true)
      );
      const snap = await getDocs(q);
      const reminders = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as FamilyReminder[];
      // Sort by scheduledFor in memory
      return reminders.sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
    }
    throw error;
  }
}

export async function createReminder(data: FamilyReminder) {
  // Clean the data to remove undefined values
  const cleanData = {
    ...data,
    // Remove undefined values that Firestore doesn't accept
    participants: data.participants || [],
    description: data.description || null,
    location: data.location || null,
    isCompleted: data.isCompleted || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const ref = await addDoc(collection(db, COL), cleanData);
  return ref.id;
}

export async function updateReminder(id: string, patch: Partial<FamilyReminder>) {
  // Clean the patch data to remove undefined values
  const cleanPatch: any = { ...patch };
  
  // Replace undefined with null for Firestore
  Object.keys(cleanPatch).forEach(key => {
    if (cleanPatch[key] === undefined) {
      cleanPatch[key] = null;
    }
  });
  
  cleanPatch.updatedAt = serverTimestamp();
  
  await updateDoc(doc(db, COL, id), cleanPatch);
}

export async function deleteReminder(id: string) {
  await deleteDoc(doc(db, COL, id));
}

export async function completeReminder(id: string) {
  await updateDoc(doc(db, COL, id), { 
    isCompleted: true, 
    isActive: false,
    updatedAt: serverTimestamp() 
  });
}
