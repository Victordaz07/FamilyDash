/**
 * Entry Types - Context separation for Tasks vs SafeRoom
 * Prevents mixing contexts with discriminated unions
 */

export type EntryContext = "task" | "safe";

export type BaseEntry = {
  familyId: string;
  userId: string;
};

// Task context - requires taskId, prohibits safeRoomId
export type TaskCtx = BaseEntry & {
  context: "task";
  taskId: string;          // required in task context
  safeRoomId?: never;      // explicitly prohibited
};

// Safe context - requires safeRoomId, prohibits taskId  
export type SafeCtx = BaseEntry & {
  context: "safe";
  safeRoomId: string;      // required in safe context
  taskId?: never;          // explicitly prohibited
};

// Union type that enforces context separation
export type EntryCtx = TaskCtx | SafeCtx;

// Audio note document structure
export type AudioNoteDoc = {
  id?: string;
  context: EntryContext;
  familyId: string;
  taskId: string | null;
  safeRoomId: string | null;
  userId: string;
  url: string;
  kind: "audio";
  createdAt: any; // Firestore timestamp
};

// Text entry types (for future use)
export type TextEntryDoc = {
  id?: string;
  context: EntryContext;
  familyId: string;
  taskId: string | null;
  safeRoomId: string | null;
  userId: string;
  text: string;
  kind: "text";
  createdAt: any;
};




