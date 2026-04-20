import { create } from 'zustand';
import { HistoryItem, SynapseMode } from "@/hooks/synapse/types";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/firebase";
import { logger } from "@/utils/logger";

interface SynapseStore {
  mode: SynapseMode;
  history: HistoryItem[];
  activeWorkspaceId: string | null;
  pendingForkId: string | null;
  uid: string | null;
  isAuthReady: boolean;

  setMode: (mode: SynapseMode) => void;
  setHistory: (history: HistoryItem[]) => void;
  addHistoryItem: (item: HistoryItem) => void;
  setActiveWorkspaceId: (id: string | null) => void;
  setPendingForkId: (id: string | null) => void;
  initAuth: () => void;
}

export const useSynapseStore = create<SynapseStore>((set) => ({
  mode: "solo",
  history: [],
  activeWorkspaceId: null,
  pendingForkId: null,
  uid: null,
  isAuthReady: false,

  setMode: (mode) => set({ mode }),
  setHistory: (history) => set({ history }),
  addHistoryItem: (item) => set((state) => ({ history: [...state.history, item] })),
  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
  setPendingForkId: (id) => set({ pendingForkId: id }),

  initAuth: () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        set({ uid: user.uid, isAuthReady: true });
      } else {
        signInAnonymously(auth).catch((error) => {
          logger.error("Anonymous auth failed", { error });
        });
      }
    });
  }
}));
