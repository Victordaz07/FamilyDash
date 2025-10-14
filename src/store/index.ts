import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthState = {
  user: { uid: string; email?: string } | null;
  setUser: (u: AuthState["user"]) => void;
  logout: () => void;
};

type Task = { id: string; title: string; done: boolean; createdAt: number };
type TasksState = {
  items: Record<string, Task>;
  add: (t: Omit<Task, "id" | "createdAt">) => string;
  toggle: (id: string) => void;
  remove: (id: string) => void;
};

type AppState = AuthState & TasksState;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (u) => set({ user: u }),
      logout: () => set({ user: null, items: {} }),

      items: {},
      add: (t) => {
        const id = (global as any).crypto?.randomUUID?.() ?? String(Date.now());
        const task: Task = { id, title: t.title, done: false, createdAt: Date.now() };
        set({ items: { ...get().items, [id]: task } });
        return id;
      },
      toggle: (id) => {
        const cur = get().items[id];
        if (!cur) return;
        set({ items: { ...get().items, [id]: { ...cur, done: !cur.done } } });
      },
      remove: (id) => {
        const { [id]: _omit, ...rest } = get().items;
        set({ items: rest });
      }
    }),
    { name: "familydash", storage: createJSONStorage(() => AsyncStorage) }
  )
);
