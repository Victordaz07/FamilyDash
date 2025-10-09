import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { FamilySchedule } from "../types/schedule";

const COL = "family_schedules";

export async function listSchedules(familyId: string) {
  const q = query(
    collection(db, COL),
    where("familyId", "==", familyId),
    orderBy("timeISO", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as FamilySchedule[];
}

export async function createSchedule(data: FamilySchedule) {
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COL), payload);
  return ref.id;
}

export async function updateSchedule(id: string, patch: Partial<FamilySchedule>) {
  await updateDoc(doc(db, COL, id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteSchedule(id: string) {
  await deleteDoc(doc(db, COL, id));
}
