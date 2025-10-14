import { useAppStore } from "@/store";

type Penalty = { id: string; title: string; amount?: number; paid?: boolean; createdAt?: number };

type Compat = {
  items: Record<string, Penalty>;
  addPenalty: (p: Omit<Penalty, "id" | "createdAt">) => string | void;
  togglePaid: (id: string) => void;
  removePenalty: (id: string) => void;
};

export const usePenaltiesStore = <T = Compat>(selector?: (s: Compat) => T): T => {
  const base: any = (useAppStore as any).getState?.() ?? {};
  const slice = base.penalties ?? {};
  const compat: Compat = {
    items: slice.items ?? {},
    addPenalty: slice.addPenalty ?? (() => undefined),
    togglePaid: slice.togglePaid ?? (() => {}),
    removePenalty: slice.removePenalty ?? (() => {}),
  };
  return selector ? selector(compat) : (compat as unknown as T);
};

export default usePenaltiesStore;




