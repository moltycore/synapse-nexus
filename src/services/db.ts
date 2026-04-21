import {
  collection, doc, setDoc, getDocs,
  query, where, orderBy, serverTimestamp
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { HistoryItem } from "@/hooks/synapse/types";

export interface WorkspaceMeta {
  id: string;
  title: string;
  createdAt: any;
  parentId?: string | null;
  ownerId: string;
}

const requireAuth = (): string => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("UNAUTHORIZED_ACCESS");
  return uid;
};

const getWorkspacesCol = () => collection(db, "workspaces");
const getMessagesCol = (workspaceId: string) =>
  collection(db, `workspaces/${workspaceId}/messages`);

export const dbService = {
  async createWorkspace(
    id: string,
    title: string,
    parentId: string | null = null
  ): Promise<void> {
    const uid = requireAuth();
    const ref = doc(getWorkspacesCol(), id);
    await setDoc(ref, { 
      id, 
      title, 
      parentId, 
      ownerId: uid, 
      createdAt: serverTimestamp() 
    });
  },

  async getWorkspaces(): Promise<WorkspaceMeta[]> {
    const uid = requireAuth();
    // Sıralama Firestore'a bırakıldı (Composite Index gerektirecek)
    const q = query(getWorkspacesCol(), where("ownerId", "==", uid), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as WorkspaceMeta);
  },

  async saveMessage(workspaceId: string, item: HistoryItem): Promise<void> {
    requireAuth();
    const ref = doc(getMessagesCol(workspaceId), item.id);
    await setDoc(ref, { ...item, savedAt: serverTimestamp() });
  },

  async getMessages(workspaceId: string): Promise<HistoryItem[]> {
    requireAuth();
    const q = query(getMessagesCol(workspaceId), orderBy("savedAt", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as HistoryItem);
  },

  async forkWorkspace(
    targetWorkspaceId: string,
    newTitle: string,
    messagesToClone: HistoryItem[],
    parentId: string | null = null
  ): Promise<void> {
    await this.createWorkspace(targetWorkspaceId, newTitle, parentId);

    await Promise.all(
      messagesToClone.map(item =>
        setDoc(doc(getMessagesCol(targetWorkspaceId), item.id), {
          ...item,
          savedAt: serverTimestamp()
        })
      )
    );
  }
};
