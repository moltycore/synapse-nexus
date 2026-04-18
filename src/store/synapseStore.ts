import { create } from 'zustand';
import { HistoryItem, SynapseMode } from "@/hooks/synapse/types";

interface SynapseStore {
  mode: SynapseMode;
  history: HistoryItem[];
  activeWorkspaceId: string | null;
  pendingForkId: string | null;

  setMode: (mode: SynapseMode) => void;
  setHistory: (history: HistoryItem[]) => void;
  addHistoryItem: (item: HistoryItem) => void;
  setActiveWorkspaceId: (id: string | null) => void;
  setPendingForkId: (id: string | null) => void;
}

export const useSynapseStore = create<SynapseStore>((set) => ({
  mode: "solo",
  history: [],
  activeWorkspaceId: null,
  pendingForkId: null,

  setMode: (mode) => set({ mode }),
  setHistory: (history) => set({ history }),
  addHistoryItem: (item) => set((state) => ({ history: [...state.history, item] })),
  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
  setPendingForkId: (id) => set({ pendingForkId: id }),
}));
