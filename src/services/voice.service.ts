import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import { db, storage } from "@/config/firebase";

export type VoiceNote = {
  id?: string;
  familyId: string;
  context: "task" | "safe";
  parentId: string;
  userId: string;
  userDisplayName?: string;
  userRole?: string;
  url: string;
  storagePath: string;
  durationMs: number;
  createdAt?: any;
  reactions?: VoiceNoteReaction[];
};

export type VoiceNoteReaction = {
  userId: string;
  userDisplayName?: string;
  emoji: string;
  createdAt?: Date | any; // Support both Date and Firestore timestamp
};

export async function saveVoiceNote(args: {
  familyId: string; 
  context: "task"|"safe"; 
  parentId: string; 
  userId: string;
  userDisplayName?: string;
  userRole?: string;
  fileUri: string; 
  fileBytes?: Uint8Array; 
  durationMs: number;
}) {
  // console.log('🎤 saveVoiceNote called with:', args);
  
  const path = `voice/${args.familyId}/${args.context}/${args.parentId}/${Date.now()}.m4a`;
  // console.log('🎤 Storage path:', path);
  
  const r = ref(storage, path);
  
  // Use file URI directly instead of converting to bytes
  if (args.fileBytes) {
    // console.log('🎤 Uploading with fileBytes');
    await uploadBytes(r, args.fileBytes, { contentType: "audio/m4a" });
  } else {
    // console.log('🎤 Uploading with fetch blob');
    // Fallback: upload the file directly from URI
    const response = await fetch(args.fileUri);
    const blob = await response.blob();
    await uploadBytes(r, blob, { contentType: "audio/m4a" });
  }
  
  const url = await getDownloadURL(r);
  // console.log('🎤 File uploaded, URL:', url);
  
  const voiceNoteData = {
    familyId: args.familyId, 
    context: args.context, 
    parentId: args.parentId, 
    userId: args.userId,
    userDisplayName: args.userDisplayName,
    userRole: args.userRole,
    url, 
    storagePath: path, 
    durationMs: args.durationMs, 
    createdAt: serverTimestamp(),
    reactions: [],
  };
  
  // console.log('🎤 Saving to Firestore:', voiceNoteData);
  
  const docRef = await addDoc(collection(db, "voice_notes"), voiceNoteData);
  
  // console.log('🎤 Voice note document created with ID:', docRef.id);
  
  return { id: docRef.id, url, storagePath: path };
}

export function listenVoiceNotes(
  familyId: string, 
  context: "task"|"safe", 
  parentId: string, 
  cb: (notes: VoiceNote[]) => void
) {
  // console.log('🎤 Setting up voice notes listener with query params:', { familyId, context, parentId });
  
  const q = query(
    collection(db, "voice_notes"),
    where("familyId", "==", familyId),
    where("context", "==", context),
    where("parentId", "==", parentId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (snap) => {
    // console.log('🎤 Firestore snapshot received:', snap.docs.length, 'documents');
    const arr = snap.docs.map(d => {
      const data = d.data() as any;
      // console.log('🎤 Voice note document:', { id: d.id, ...data });
      return { id: d.id, ...data };
    }) as VoiceNote[];
    // console.log('🎤 Final voice notes array:', arr);
    cb(arr);
  }, (error) => {
    console.error('🎤 Error in voice notes listener:', error);
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

export async function addVoiceNoteReaction(
  noteId: string, 
  reaction: Omit<VoiceNoteReaction, 'createdAt'>
) {
  const noteRef = doc(db, "voice_notes", noteId);
  
  try {
    const { updateDoc, arrayUnion, getDoc } = await import("firebase/firestore");
    
    // First get the current document to check existing reactions
    const noteDoc = await getDoc(noteRef);
    
    if (noteDoc.exists()) {
      const noteData = noteDoc.data();
      const existingReactions = noteData.reactions || [];
      
      // Check if user already has a reaction
      const userExistingReaction = existingReactions.find((r: VoiceNoteReaction) => r.userId === reaction.userId);
      
      let newReactions = [...existingReactions];
      
      if (userExistingReaction) {
        // Remove existing reaction
        newReactions = newReactions.filter((r: VoiceNoteReaction) => r.userId !== reaction.userId);
      }
      
      // Add new reaction with current timestamp
      newReactions.push({
        ...reaction,
        createdAt: new Date(),
      });
      
      // Update the document with the new reactions array
      await updateDoc(noteRef, {
        reactions: newReactions
      });
    }
  } catch (error) {
    console.error('🎤 Error adding reaction:', error);
    throw error;
  }
}

export async function removeVoiceNoteReaction(
  noteId: string, 
  userId: string
) {
  const noteRef = doc(db, "voice_notes", noteId);
  
  try {
    const { updateDoc, getDoc } = await import("firebase/firestore");
    const noteDoc = await getDoc(noteRef);
    
    if (noteDoc.exists()) {
      const noteData = noteDoc.data();
      const reactions = noteData.reactions || [];
      
      // Filter out the user's reaction
      const newReactions = reactions.filter((r: VoiceNoteReaction) => r.userId !== userId);
      
      // Update the document with the filtered reactions array
      await updateDoc(noteRef, {
        reactions: newReactions
      });
    }
  } catch (error) {
    console.error('🎤 Error removing reaction:', error);
    throw error;
  }
}
