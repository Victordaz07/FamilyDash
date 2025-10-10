import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import { db, storage } from "../config/firebase";

export type VoiceNote = {
  id?: string;
  familyId: string;
  context: "task" | "safe";
  parentId: string;
  userId: string;
  url: string;
  storagePath: string;
  durationMs: number;
  createdAt?: any;
};

export async function saveVoiceNote(args: {
  familyId: string; 
  context: "task"|"safe"; 
  parentId: string; 
  userId: string;
  fileUri: string; 
  fileBytes: Uint8Array; 
  durationMs: number;
}) {
  const path = `voice/${args.familyId}/${args.context}/${args.parentId}/${Date.now()}.m4a`;
  const r = ref(storage, path);
  await uploadBytes(r, args.fileBytes, { contentType: "audio/m4a" });
  const url = await getDownloadURL(r);
  
  const docRef = await addDoc(collection(db, "voice_notes"), {
    familyId: args.familyId, 
    context: args.context, 
    parentId: args.parentId, 
    userId: args.userId,
    url, 
    storagePath: path, 
    durationMs: args.durationMs, 
    createdAt: serverTimestamp(),
  });
  
  return { id: docRef.id, url, storagePath: path };
}

export function listenVoiceNotes(
  familyId: string, 
  context: "task"|"safe", 
  parentId: string, 
  cb: (notes: VoiceNote[]) => void
) {
  const q = query(
    collection(db, "voice_notes"),
    where("familyId", "==", familyId),
    where("context", "==", context),
    where("parentId", "==", parentId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (snap) => {
    const arr = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as VoiceNote[];
    cb(arr);
  });
}

export async function deleteVoiceNote(note: VoiceNote) {
  if (note.storagePath) {
    await deleteObject(ref(storage, note.storagePath)).catch(() => {});
  }
  if (note.id) {
    await deleteDoc(doc(db, "voice_notes", note.id));
  }
}
