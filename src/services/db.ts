import {
  collection, doc, setDoc, getDocs,
  query, orderBy, serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { HistoryItem } from "@/hooks/synapse/types";

export interface WorkspaceMeta {
  id: string;
  title: string;
  createdAt: any;
  parentId?: string | null;
}

const getWorkspacesCol = () => collection(db, "workspaces");
const getMessagesCol = (workspaceId: string) =>
  collection(db, `workspaces/${workspaceId}/messages`);

export const dbService = {
  async createWorkspace(
    id: string,
    title: string,
    parentId: string | null = null
  ): Promise<void> {
    const ref = doc(getWorkspacesCol(), id);
    await setDoc(ref, { id, title, parentId, createdAt: serverTimestamp() });
  },

  async getWorkspaces(): Promise<WorkspaceMeta[]> {
    const q = query(getWorkspacesCol(), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as WorkspaceMeta);
  },

  async saveMessage(workspaceId: string, item: HistoryItem): Promise<void> {
    const ref = doc(getMessagesCol(workspaceId), item.id);
    await setDoc(ref, { ...item, savedAt: serverTimestamp() });
  },

  async getMessages(workspaceId: string): Promise<HistoryItem[]> {
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

    // Parallel writes — sequential loop replaced with Promise.all
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
