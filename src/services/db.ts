import { collection, doc, setDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { HistoryItem } from "@/hooks/synapse/types";

export interface WorkspaceMeta {
  id: string;
  title: string;
  createdAt: any;
}

const getWorkspacesCol = () => collection(db, "workspaces");
const getMessagesCol = (workspaceId: string) => collection(db, `workspaces/${workspaceId}/messages`);

export const dbService = {
  async createWorkspace(id: string, title: string): Promise<void> {
    const ref = doc(getWorkspacesCol(), id);
    await setDoc(ref, {
      id,
      title,
      createdAt: serverTimestamp()
    });
  },

  async getWorkspaces(): Promise<WorkspaceMeta[]> {
    const q = query(getWorkspacesCol(), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as WorkspaceMeta);
  },

  async saveMessage(workspaceId: string, item: HistoryItem): Promise<void> {
    const ref = doc(getMessagesCol(workspaceId), item.id);
    await setDoc(ref, {
      ...item,
      savedAt: serverTimestamp()
    });
  },

  async getMessages(workspaceId: string): Promise<HistoryItem[]> {
    const q = query(getMessagesCol(workspaceId), orderBy("savedAt", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as HistoryItem);
  },

  async forkWorkspace(targetWorkspaceId: string, newTitle: string, messagesToClone: HistoryItem[]): Promise<void> {
    await this.createWorkspace(targetWorkspaceId, newTitle);

    for (const item of messagesToClone) {
      const ref = doc(getMessagesCol(targetWorkspaceId), item.id);
      await setDoc(ref, {
        ...item,
        savedAt: serverTimestamp() 
      });
    }
  }
};
