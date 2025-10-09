/**
 * Audio Storage Service - Context-aware audio upload
 * Separates Task audio from SafeRoom audio with validation
 */

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../firebaseConfig";
import { EntryCtx, AudioNoteDoc } from "../../types/entries";

/**
 * Convert local URI to blob for upload
 */
async function toBlob(localUri: string): Promise<Blob> {
  const response = await fetch(localUri);
  if (!response.ok) {
    throw new Error(`Failed to fetch audio file: ${response.statusText}`);
  }
  return await response.blob();
}

/**
 * Upload audio note with strict context validation
 * Ensures Task audio goes to Tasks and SafeRoom audio goes to SafeRoom
 */
export async function uploadAudioAndCreateDoc(
  localUri: string, 
  ctx: EntryCtx
): Promise<string> {
  // Context validation - prevents mixing contexts
  if (ctx.context === "task" && !ctx.taskId) {
    throw new Error("taskId is required for task context");
  }
  if (ctx.context === "safe" && !ctx.safeRoomId) {
    throw new Error("safeRoomId is required for safe context");
  }

  console.log(`🎵 Uploading audio for ${ctx.context} context:`, {
    taskId: ctx.context === "task" ? ctx.taskId : undefined,
    safeRoomId: ctx.context === "safe" ? ctx.safeRoomId : undefined,
    familyId: ctx.familyId,
    userId: ctx.userId
  });

  try {
    // Convert local URI to blob
    const blob = await toBlob(localUri);
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `voice_${timestamp}_${Math.random().toString(36).substring(7)}.m4a`;

    // Separate storage paths by context
    const folder = ctx.context === "task"
      ? `audio/${ctx.familyId}/tasks/${ctx.taskId}`
      : `audio/${ctx.familyId}/safe/${ctx.safeRoomId}`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, `${folder}/${filename}`);
    await uploadBytes(storageRef, blob, { contentType: "audio/m4a" });
    const downloadUrl = await getDownloadURL(storageRef);

    console.log(`✅ Audio uploaded to: ${folder}/${filename}`);

    // Create Firestore document with context separation
    const docData: Omit<AudioNoteDoc, 'id'> = {
      context: ctx.context,
      familyId: ctx.familyId,
      // Explicitly set one context field and null the other
      taskId: ctx.context === "task" ? ctx.taskId! : null,
      safeRoomId: ctx.context === "safe" ? ctx.safeRoomId! : null,
      userId: ctx.userId,
      url: downloadUrl,
      kind: "audio",
      createdAt: serverTimestamp(),
    };

    // Add to Firestore with context validation
    const docRef = await addDoc(collection(db, "audio_notes"), docData);
    
    console.log(`📝 Audio note created with ID: ${docRef.id}`);
    console.log(`📊 Context: ${ctx.context}, Task: ${docData.taskId}, Safe: ${docData.safeRoomId}`);

    return downloadUrl;

  } catch (error) {
    console.error("❌ Error uploading audio:", error);
    throw new Error(`Failed to upload audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload text entry with context separation (for future use)
 */
export async function uploadTextAndCreateDoc(
  text: string,
  ctx: EntryCtx
): Promise<string> {
  // Context validation
  if (ctx.context === "task" && !ctx.taskId) {
    throw new Error("taskId is required for task context");
  }
  if (ctx.context === "safe" && !ctx.safeRoomId) {
    throw new Error("safeRoomId is required for safe context");
  }

  const docData = {
    context: ctx.context,
    familyId: ctx.familyId,
    taskId: ctx.context === "task" ? ctx.taskId! : null,
    safeRoomId: ctx.context === "safe" ? ctx.safeRoomId! : null,
    userId: ctx.userId,
    text,
    kind: "text" as const,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "text_entries"), docData);
  return docRef.id;
}
