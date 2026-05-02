import { create } from 'zustand';
import { HistoryItem, SynapseMode } from "@/hooks/synapse/types";
import { signInAnonymously, onAuthStateChanged, linkWithPopup, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/services/firebase";
import { logger } from "@/utils/logger";

interface UserProfile {
  name: string | null;
  photo: string | null;
}

interface SynapseStore {
  mode: SynapseMode;
  history: HistoryItem[];
  activeWorkspaceId: string | null;
  pendingForkId: string | null;
  uid: string | null;
  isAnonymous: boolean;
  profile: UserProfile | null;
  isAuthReady: boolean;

  setMode: (mode: SynapseMode) => void;
  setHistory: (history: HistoryItem[]) => void;
  addHistoryItem: (item: HistoryItem) => void;
  setActiveWorkspaceId: (id: string | null) => void;
  setPendingForkId: (id: string | null) => void;
  initAuth: () => void;
  upgradeAuth: () => Promise<void>;
  logoutSession: () => Promise<void>;
}

export const useSynapseStore = create<SynapseStore>((set) => ({
  mode: "solo",
  history: [],
  activeWorkspaceId: null,
  pendingForkId: null,
  uid: null,
  isAnonymous: true,
  profile: null,
  isAuthReady: false,

  setMode: (mode) => set({ mode }),
  setHistory: (history) => set({ history }),
  addHistoryItem: (item) => set((state) => ({ history: [...state.history, item] })),
  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
  setPendingForkId: (id) => set({ pendingForkId: id }),

  initAuth: () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        set({ 
          uid: user.uid, 
          isAnonymous: user.isAnonymous,
          profile: user.isAnonymous ? null : { name: user.displayName, photo: user.photoURL },
          isAuthReady: true 
        });
      } else {
        signInAnonymously(auth).catch((error) => {
          logger.error("Anonymous auth failed", { error });
        });
      }
    });
  },

  upgradeAuth: async () => {
    try {
      if (auth.currentUser?.isAnonymous) {
        await linkWithPopup(auth.currentUser, googleProvider);
        logger.info("Session elevated to Google Auth");
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      logger.error("Auth upgrade failed", { error });
    }
  },

  logoutSession: async () => {
    try {
      await signOut(auth);
      set({ history: [], activeWorkspaceId: null, uid: null, isAnonymous: true, profile: null });
      logger.info("Session terminated");
    } catch (error) {
      logger.error("Signout failed", { error });
    }
  }
}));
