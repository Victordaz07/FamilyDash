import { db, storage } from "../config/firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export type VideoNote = {
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
  thumbnailUrl?: string;
  createdAt?: any;
  reactions?: VideoNoteReaction[];
};

export type VideoNoteReaction = {
  userId: string;
  userDisplayName?: string;
  emoji: string;
  createdAt?: Date | any;
};

export async function saveVideoNote({
  familyId,
  context,
  parentId,
  userId,
  userDisplayName,
  userRole,
  fileUri,
  durationMs,
  thumbnailUri
}: {
  familyId: string;
  context: "task" | "safe";
  parentId: string;
  userId: string;
  userDisplayName?: string;
  userRole?: string;
  fileUri: string;
  durationMs: number;
  thumbnailUri?: string;
}): Promise<VideoNote> {
  try {
    // Upload video file
    const response = await fetch(fileUri);
    const blob = await response.blob();
    
    const timestamp = Date.now();
    const videoFileName = `video_${timestamp}_${Math.random().toString(36).substr(2, 9)}.mp4`;
    const storagePath = `videos/${familyId}/${context}/${parentId}/${videoFileName}`;
    const videoRef = ref(storage, storagePath);
    
    await uploadBytes(videoRef, blob);
    const videoUrl = await getDownloadURL(videoRef);

    // Upload thumbnail if provided
    let thumbnailUrl = null;
    if (thumbnailUri) {
      try {
        const thumbnailResponse = await fetch(thumbnailUri);
        const thumbnailBlob = await thumbnailResponse.blob();
        
        const thumbnailFileName = `thumb_${timestamp}_${Math.random().toString(36).substr(2, 9)}.jpg`;
        const thumbnailStoragePath = `thumbnails/${familyId}/${context}/${parentId}/${thumbnailFileName}`;
        const thumbnailRef = ref(storage, thumbnailStoragePath);
        
        await uploadBytes(thumbnailRef, thumbnailBlob);
        thumbnailUrl = await getDownloadURL(thumbnailRef);
      } catch (error) {
        console.warn('Failed to upload thumbnail:', error);
        thumbnailUrl = null;
      }
    }

    // Save to Firestore
    const videoNoteData: any = {
      familyId,
      context,
      parentId,
      userId,
      userDisplayName,
      userRole,
      url: videoUrl,
      storagePath,
      durationMs,
      createdAt: serverTimestamp(),
      reactions: []
    };

    // Only add thumbnailUrl if it's not null
    if (thumbnailUrl) {
      videoNoteData.thumbnailUrl = thumbnailUrl;
    }

    const docRef = await addDoc(collection(db, "video_notes"), videoNoteData);
    
    return {
      id: docRef.id,
      ...videoNoteData
    };
  } catch (error) {
    console.error('🎥 Error saving video note:', error);
    throw error;
  }
}

export function listenVideoNotes(
  familyId: string,
  context: "task" | "safe",
  parentId: string,
  callback: (notes: VideoNote[]) => void
) {
  const q = query(
    collection(db, "video_notes"),
    where("familyId", "==", familyId),
    where("context", "==", context),
    where("parentId", "==", parentId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as VideoNote[];
    
    callback(notes);
  });
}

export async function deleteVideoNote(noteId: string, storagePath: string) {
  try {
    // Delete from Storage
    const videoRef = ref(storage, storagePath);
    await deleteObject(videoRef);
    
    // Delete from Firestore
    await deleteDoc(doc(db, "video_notes", noteId));
  } catch (error) {
    console.error('🎥 Error deleting video note:', error);
    throw error;
  }
}

export async function addVideoNoteReaction(
  noteId: string,
  reaction: Omit<VideoNoteReaction, 'createdAt'>
) {
  const noteRef = doc(db, "video_notes", noteId);

  try {
    const { updateDoc, getDoc } = await import("firebase/firestore");

    const noteDoc = await getDoc(noteRef);

    if (noteDoc.exists()) {
      const noteData = noteDoc.data();
      const existingReactions = noteData.reactions || [];

      const userExistingReaction = existingReactions.find((r: VideoNoteReaction) => r.userId === reaction.userId);

      let newReactions = [...existingReactions];

      if (userExistingReaction) {
        newReactions = newReactions.filter((r: VideoNoteReaction) => r.userId !== reaction.userId);
      }

      newReactions.push({
        ...reaction,
        createdAt: new Date(),
      });

      await updateDoc(noteRef, {
        reactions: newReactions
      });
    }
  } catch (error) {
    console.error('🎥 Error adding reaction:', error);
    throw error;
  }
}

export async function removeVideoNoteReaction(noteId: string, userId: string) {
  const noteRef = doc(db, "video_notes", noteId);

  try {
    const { updateDoc, getDoc } = await import("firebase/firestore");

    const noteDoc = await getDoc(noteRef);

    if (noteDoc.exists()) {
      const noteData = noteDoc.data();
      const existingReactions = noteData.reactions || [];
      
      const newReactions = existingReactions.filter((r: VideoNoteReaction) => r.userId !== userId);

      await updateDoc(noteRef, {
        reactions: newReactions
      });
    }
  } catch (error) {
    console.error('🎥 Error removing reaction:', error);
    throw error;
  }
}
