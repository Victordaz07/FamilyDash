import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pushTaskCreate, pushTaskUpdate, pushTaskDelete } from "@/services/tasksSync";
import { createAchievementsSlice, AchievementsState } from "./achievementsSlice";

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

type AppState = AuthState & TasksState & AchievementsState;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      setUser: (u) => set({ user: u }),
      logout: () => set({ user: null, items: {}, achievements: {}, points: 0 }),

      // Tasks
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
        const wasDone = cur.done;
        const newDone = !cur.done;
        set({ items: { ...get().items, [id]: { ...cur, done: newDone } } });
        void pushTaskUpdate(id);
        
        // Trigger achievement check if task was completed
        if (!wasDone && newDone) {
          get().checkAndAward({ type: 'task_completed', payload: { id } });
        }
      },
      remove: (id) => {
        const { [id]: _omit, ...rest } = get().items;
        set({ items: rest });
        void pushTaskDelete(id);
      },
      
      // Achievements (from slice)
      ...createAchievementsSlice(set, get),
    }),
    { name: "familydash", storage: createJSONStorage(() => AsyncStorage) }
  )
);
