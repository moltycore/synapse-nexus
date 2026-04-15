import { X, Folder, MessageSquare, Plus, ChevronDown, ChevronRight, Loader2, GitFork } from "lucide-react";
import { useState, useEffect } from "react";
import { dbService } from "@/services/db";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkspace: (id: string) => void;
}

interface WorkspaceNode {
  id: string;
  title: string;
  isOpen: boolean;
  isLoadingChildren?: boolean;
  children?: { id: string; title: string }[];
  subWorkspaces?: WorkspaceNode[];
  parentId?: string | null;
}

export default function Sidebar({ isOpen, onClose, onSelectWorkspace }: SidebarProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadWorkspaces();
    }
  }, [isOpen]);

  const loadWorkspaces = async () => {
    try {
      setIsLoading(true);
      const data = await dbService.getWorkspaces();
      
      const nodeMap = new Map<string, WorkspaceNode>();
      
      data.forEach(w => {
        nodeMap.set(w.id, {
          id: w.id,
          title: w.title,
          isOpen: false,
          parentId: w.parentId,
          subWorkspaces: []
        });
      });

      const roots: WorkspaceNode[] = [];
      
      nodeMap.forEach(node => {
        if (node.parentId && nodeMap.has(node.parentId)) {
          nodeMap.get(node.parentId)!.subWorkspaces!.push(node);
        } else {
          roots.push(node);
        }
      });

      setWorkspaces(roots);
    } catch (error) {
      console.error("Workspace telemetry failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    const title = prompt("Yeni Workspace Adı:");
    if (!title?.trim()) return;

    const id = `w-${crypto.randomUUID().slice(0,8)}`;
    await dbService.createWorkspace(id, title.trim());
    await loadWorkspaces();
  };

  const updateNode = (nodes: WorkspaceNode[], id: string, updater: (node: WorkspaceNode) => WorkspaceNode): WorkspaceNode[] => {
    return nodes.map(node => {
      if (node.id === id) return updater(node);
      if (node.subWorkspaces && node.subWorkspaces.length > 0) {
        return { ...node, subWorkspaces: updateNode(node.subWorkspaces, id, updater) };
      }
      return node;
    });
  };

  const findNode = (nodes: WorkspaceNode[], searchId: string): WorkspaceNode | undefined => {
    for (const n of nodes) {
      if (n.id === searchId) return n;
      if (n.subWorkspaces) {
        const found = findNode(n.subWorkspaces, searchId);
        if (found) return found;
      }
    }
    return undefined;
  };

  const toggleWorkspace = async (id: string) => {
    setWorkspaces(prev => updateNode(prev, id, n => ({ ...n, isOpen: !n.isOpen })));

    const target = findNode(workspaces, id);
    if (target && !target.isOpen && !target.children) {
      setWorkspaces(prev => updateNode(prev, id, n => ({ ...n, isLoadingChildren: true })));
      try {
        const messages = await dbService.getMessages(id);
        setWorkspaces(prev => updateNode(prev, id, n => ({ 
          ...n, 
          isLoadingChildren: false,
          children: messages.map(m => ({ id: m.id, title: m.soru })) 
        })));
      } catch (error) {
        setWorkspaces(prev => updateNode(prev, id, n => ({ ...n, isLoadingChildren: false })));
      }
    }
  };

  const renderNode = (node: WorkspaceNode, level: number = 0) => {
    const isRoot = level === 0;
    const paddingLeft = `${level * 16 + 8}px`;

    return (
      <div key={node.id} className="flex flex-col w-full">
        <button 
          onClick={() => {
            toggleWorkspace(node.id);
            onSelectWorkspace(node.id);
          }}
          className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-white/5 transition-colors text-left group"
          style={{ paddingLeft }}
        >
          {node.isLoadingChildren ? (
            <Loader2 size={14} className="text-emerald-500/50 animate-spin shrink-0" />
          ) : node.isOpen ? (
            <ChevronDown size={14} className="text-white/40 group-hover:text-white/70 shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-white/40 group-hover:text-white/70 shrink-0" />
          )}
          
          {isRoot ? (
            <Folder size={14} className="text-white/40 group-hover:text-white/70 shrink-0" />
          ) : (
            <GitFork size={12} className="text-emerald-500/60 shrink-0" />
          )}

          <span className={`text-xs font-medium truncate flex-1 ${isRoot ? 'text-white/70 group-hover:text-white/90' : 'text-emerald-500/70 group-hover:text-emerald-400'}`}>
            {node.title}
          </span>
        </button>
        
        {node.isOpen && (
          <div className="flex flex-col w-full border-l border-white/5 ml-3" style={{ paddingLeft: '4px' }}>
            {node.subWorkspaces?.map(sub => renderNode(sub, level + 1))}

            {node.children && node.children.length === 0 && (!node.subWorkspaces || node.subWorkspaces.length === 0) && (
              <span className="text-[10px] text-white/20 pl-6 py-1 font-mono">EMPTY_UPLINK</span>
            )}
            
            {node.children?.map(child => (
              <button 
                key={child.id}
                className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-white/5 transition-colors text-left group cursor-default"
                style={{ paddingLeft: `${(level + 1) * 12}px` }}
              >
                <MessageSquare size={12} className="text-white/30 group-hover:text-white/60 shrink-0" />
                <span className="text-[11px] text-white/50 group-hover:text-white/80 truncate">
                  {child.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/20 z-[80] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <aside className={`fixed top-0 left-0 h-[100dvh] w-64 bg-[#0F1115] border-r border-white/5 z-[90] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <span className="text-sm font-semibold text-foreground/90 tracking-wide">Workspaces</span>
          <div className="flex items-center gap-2">
            <button onClick={handleCreateWorkspace} className="text-white/40 hover:text-white transition-colors p-1" title="New Workspace">
              <Plus size={16} />
            </button>
            <button onClick={onClose} className="text-white/40 p-1 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 size={16} className="text-emerald-500/50 animate-spin" />
            </div>
          ) : workspaces.length === 0 ? (
            <div className="text-center font-mono text-[10px] text-white/20 pt-4">NO_DIRECTORIES_FOUND</div>
          ) : (
            workspaces.map(workspace => renderNode(workspace))
          )}
        </div>

        <div className="p-4 border-t border-white/5 text-center font-mono text-[10px] text-emerald-500/50 uppercase tracking-widest">
          {isLoading ? "SYNCING..." : "DB_LINK_ESTABLISHED"}
        </div>
      </aside>
    </>
  );
}
