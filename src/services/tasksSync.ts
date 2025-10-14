// src/services/tasksSync.ts
import { app } from "@/services/firebase";
import {
  getFirestore, collection, doc, onSnapshot,
  getDocs, setDoc, deleteDoc, serverTimestamp
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAppStore } from "@/store";

const db = getFirestore(app);

let unsubscribeTasks: (() => void) | null = null;
let unsubscribeAuth: (() => void) | null = null;

/** Arranca/renueva el sync cuando haya usuario logueado. */
export function startTasksSync() {
  const auth = getAuth(app);

  // Evitar múltiples suscripciones duplicadas
  if (unsubscribeAuth) unsubscribeAuth();
  unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    // Limpia listener anterior
    if (unsubscribeTasks) { unsubscribeTasks(); unsubscribeTasks = null; }

    if (!user) return; // Sin usuario, no sincroniza
    const uid = user.uid;
    const tasksCol = collection(db, "users", uid, "tasks");

    // Pull inicial (one-shot)
    const snap = await getDocs(tasksCol);
    const serverItems: Record<string, any> = {};
    snap.forEach((d) => {
      const data = d.data();
      serverItems[d.id] = { id: d.id, title: data.title, done: !!data.done, createdAt: data.createdAt ?? Date.now() };
    });
    // Merge suave: respeta local si existe; prioridad a server para consistencia
    const local = useAppStore.getState().items;
    useAppStore.setState({ items: { ...serverItems, ...local } });

    // Live updates
    unsubscribeTasks = onSnapshot(tasksCol, (q) => {
      const next = { ...useAppStore.getState().items };
      q.docChanges().forEach((c) => {
        if (c.type === "added" || c.type === "modified") {
          const data = c.doc.data() as any;
          next[c.doc.id] = { id: c.doc.id, title: data.title, done: !!data.done, createdAt: data.createdAt ?? Date.now() };
        } else if (c.type === "removed") {
          delete next[c.doc.id];
        }
      });
      useAppStore.setState({ items: next });
    });
  });

  // Devuelve función de limpieza
  return () => {
    if (unsubscribeTasks) { unsubscribeTasks(); unsubscribeTasks = null; }
    if (unsubscribeAuth) { unsubscribeAuth(); unsubscribeAuth = null; }
  };
}

/** Push helpers: no lanzan error a UI; ejecutan en segundo plano. */
export async function pushTaskCreate(id: string) {
  try {
    const auth = getAuth(app);
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const item = useAppStore.getState().items[id];
    if (!item) return;
    await setDoc(doc(db, "users", uid, "tasks", id), {
      title: item.title,
      done: !!item.done,
      createdAt: item.createdAt ?? Date.now(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch {}
}

export async function pushTaskUpdate(id: string) { return pushTaskCreate(id); }

export async function pushTaskDelete(id: string) {
  try {
    const auth = getAuth(app);
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "tasks", id));
  } catch {}
}




