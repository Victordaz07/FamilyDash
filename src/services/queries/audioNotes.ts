/**
 * Audio Notes Queries - Context-separated queries
 * Ensures Task audio and SafeRoom audio are completely separate
 */

import { 
  collection, 
  getDocs, 
  orderBy, 
  query, 
  where,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { AudioNoteDoc } from "@/types/entries";

/**
 * Get audio notes for a specific Task
 * Only returns audio notes that belong to the task context
 */
export async function getTaskAudioNotes(
  familyId: string, 
  taskId: string
): Promise<AudioNoteDoc[]> {
  try {
    console.log(`🔍 Fetching task audio notes for family: ${familyId}, task: ${taskId}`);
    
    const q = query(
      collection(db, "audio_notes"),
      where("familyId", "==", familyId),
      where("context", "==", "task"),
      where("taskId", "==", taskId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const audioNotes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AudioNoteDoc));

    console.log(`✅ Found ${audioNotes.length} task audio notes`);
    return audioNotes;

  } catch (error) {
    console.error("❌ Error fetching task audio notes:", error);
    throw new Error(`Failed to fetch task audio notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get audio notes for a specific SafeRoom
 * Only returns audio notes that belong to the safe context
 */
export async function getSafeAudioNotes(
  familyId: string, 
  safeRoomId: string
): Promise<AudioNoteDoc[]> {
  try {
    console.log(`🔍 Fetching safe room audio notes for family: ${familyId}, safe: ${safeRoomId}`);
    
    const q = query(
      collection(db, "audio_notes"),
      where("familyId", "==", familyId),
      where("context", "==", "safe"),
      where("safeRoomId", "==", safeRoomId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const audioNotes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AudioNoteDoc));

    console.log(`✅ Found ${audioNotes.length} safe room audio notes`);
    return audioNotes;

  } catch (error) {
    console.error("❌ Error fetching safe room audio notes:", error);
    throw new Error(`Failed to fetch safe room audio notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all audio notes for a family (for admin/debugging purposes)
 * Returns both task and safe room audio notes
 */
export async function getAllFamilyAudioNotes(
  familyId: string
): Promise<AudioNoteDoc[]> {
  try {
    console.log(`🔍 Fetching all family audio notes for family: ${familyId}`);
    
    const q = query(
      collection(db, "audio_notes"),
      where("familyId", "==", familyId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const audioNotes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AudioNoteDoc));

    console.log(`✅ Found ${audioNotes.length} total family audio notes`);
    return audioNotes;

  } catch (error) {
    console.error("❌ Error fetching family audio notes:", error);
    throw new Error(`Failed to fetch family audio notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get audio notes by user (across all contexts)
 * Useful for user activity tracking
 */
export async function getUserAudioNotes(
  familyId: string,
  userId: string
): Promise<AudioNoteDoc[]> {
  try {
    console.log(`🔍 Fetching user audio notes for family: ${familyId}, user: ${userId}`);
    
    const q = query(
      collection(db, "audio_notes"),
      where("familyId", "==", familyId),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const audioNotes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AudioNoteDoc));

    console.log(`✅ Found ${audioNotes.length} user audio notes`);
    return audioNotes;

  } catch (error) {
    console.error("❌ Error fetching user audio notes:", error);
    throw new Error(`Failed to fetch user audio notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}




