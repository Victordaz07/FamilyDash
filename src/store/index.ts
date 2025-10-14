import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pushTaskCreate, pushTaskUpdate, pushTaskDelete } from "@/services/tasksSync";

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
        void pushTaskCreate(id);
        return id;
      },
      toggle: (id) => {
        const cur = get().items[id];
        if (!cur) return;
        set({ items: { ...get().items, [id]: { ...cur, done: !cur.done } } });
        void pushTaskUpdate(id);
      },
      remove: (id) => {
        const { [id]: _omit, ...rest } = get().items;
        set({ items: rest });
        void pushTaskDelete(id);
      }
    }),
    { name: "familydash", storage: createJSONStorage(() => AsyncStorage) }
  )
);
