import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/config/firebase";
import { FamilySchedule } from "@/types/schedule";

const COL = "family_schedules";

export async function listSchedules(familyId: string) {
  try {
    // First try with orderBy (requires composite index)
    const q = query(
      collection(db, COL),
      where("familyId", "==", familyId),
      orderBy("timeISO", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as FamilySchedule[];
  } catch (error: any) {
    // If composite index error, fallback to simple query and sort in memory
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      console.warn('Composite index not found, using fallback query');
      const q = query(
        collection(db, COL),
        where("familyId", "==", familyId)
      );
      const snap = await getDocs(q);
      const schedules = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as FamilySchedule[];
      // Sort by timeISO in memory
      return schedules.sort((a, b) => new Date(a.timeISO).getTime() - new Date(b.timeISO).getTime());
    }
    throw error;
  }
}

export async function createSchedule(data: FamilySchedule) {
  // Clean the data to remove undefined values
  const cleanData = {
    ...data,
    // Remove undefined values that Firestore doesn't accept
    repeat: data.repeat ? {
      kind: data.repeat.kind,
      ...(data.repeat.weekdays && data.repeat.weekdays.length > 0 && { weekdays: data.repeat.weekdays })
    } : { kind: 'daily' },
    members: data.members || [],
    notes: data.notes || null, // Use null instead of undefined
    color: data.color || '#3b82f6',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const ref = await addDoc(collection(db, COL), cleanData);
  return ref.id;
}

export async function updateSchedule(id: string, patch: Partial<FamilySchedule>) {
  // Clean the patch data to remove undefined values
  const cleanPatch: any = { ...patch };
  
  // Handle repeat object specially
  if (patch.repeat) {
    cleanPatch.repeat = {
      kind: patch.repeat.kind,
      ...(patch.repeat.weekdays && patch.repeat.weekdays.length > 0 && { weekdays: patch.repeat.weekdays })
    };
  }
  
  // Replace undefined with null for Firestore
  Object.keys(cleanPatch).forEach(key => {
    if (cleanPatch[key] === undefined) {
      cleanPatch[key] = null;
    }
  });
  
  cleanPatch.updatedAt = serverTimestamp();
  
  await updateDoc(doc(db, COL, id), cleanPatch);
}

export async function deleteSchedule(id: string) {
  await deleteDoc(doc(db, COL, id));
}
