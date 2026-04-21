import {
  collection, doc, setDoc, getDocs,
  query, where, serverTimestamp
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
    const q = query(getWorkspacesCol(), where("ownerId", "==", uid));
    const snap = await getDocs(q);
    
    const workspaces = snap.docs.map(d => d.data() as WorkspaceMeta);
    return workspaces.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
  },

  async saveMessage(workspaceId: string, item: HistoryItem): Promise<void> {
    requireAuth();
    const ref = doc(getMessagesCol(workspaceId), item.id);
    await setDoc(ref, { ...item, savedAt: serverTimestamp() });
  },

  async getMessages(workspaceId: string): Promise<HistoryItem[]> {
    requireAuth();
    const q = query(getMessagesCol(workspaceId));
    const snap = await getDocs(q);
    
    const messages = snap.docs.map(d => d.data() as HistoryItem);
    return messages.sort((a, b) => {
      const timeA = a.savedAt?.toMillis?.() || 0;
      const timeB = b.savedAt?.toMillis?.() || 0;
      return timeA - timeB;
    });
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
