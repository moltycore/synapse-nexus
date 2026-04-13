import { X, Folder, MessageSquare, Plus, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { dbService } from "@/services/db";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkspaceNode {
  id: string;
  title: string;
  isOpen: boolean;
  isLoadingChildren?: boolean;
  children?: { id: string; title: string }[];
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
      setWorkspaces(data.map(w => ({
        id: w.id,
        title: w.title,
        isOpen: false
      })));
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

  const toggleWorkspace = async (id: string) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === id ? { ...w, isOpen: !w.isOpen } : w
    ));

    const target = workspaces.find(w => w.id === id);
    if (target && !target.isOpen && !target.children) {
      try {
        setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, isLoadingChildren: true } : w));
        const messages = await dbService.getMessages(id);
        
        setWorkspaces(prev => prev.map(w => w.id === id ? { 
          ...w, 
          isLoadingChildren: false,
          children: messages.map(m => ({ id: m.id, title: m.soru })) 
        } : w));
      } catch (error) {
        console.error("Payload extraction failed:", error);
        setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, isLoadingChildren: false } : w));
      }
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/20 z-[80] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside 
        className={`fixed top-0 left-0 h-[100dvh] w-64 bg-[#0F1115] border-r border-white/5 z-[90] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 size={16} className="text-emerald-500/50 animate-spin" />
            </div>
          ) : workspaces.length === 0 ? (
            <div className="text-center font-mono text-[10px] text-white/20 pt-4">NO_DIRECTORIES_FOUND</div>
          ) : (
            workspaces.map(workspace => (
              <div key={workspace.id} className="flex flex-col">
                <button 
                  onClick={() => toggleWorkspace(workspace.id)}
                  className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-white/5 transition-colors text-left group"
                >
                  {workspace.isLoadingChildren ? (
                    <Loader2 size={14} className="text-emerald-500/50 animate-spin" />
                  ) : workspace.isOpen ? (
                    <ChevronDown size={14} className="text-white/40 group-hover:text-white/70" />
                  ) : (
                    <ChevronRight size={14} className="text-white/40 group-hover:text-white/70" />
                  )}
                  <Folder size={14} className="text-white/40 group-hover:text-white/70" />
                  <span className="text-xs font-medium text-white/70 group-hover:text-white/90 truncate flex-1">
                    {workspace.title}
                  </span>
                </button>
                
                {workspace.isOpen && workspace.children && (
                  <div className="ml-6 pl-2 border-l border-white/10 mt-1 flex flex-col gap-1">
                    {workspace.children.length === 0 ? (
                      <span className="text-[10px] text-white/20 pl-2 font-mono">EMPTY_UPLINK</span>
                    ) : (
                      workspace.children.map(child => (
                        <button 
                          key={child.id}
                          className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-white/5 transition-colors text-left group"
                        >
                          <MessageSquare size={12} className="text-white/30 group-hover:text-white/60 shrink-0" />
                          <span className="text-[11px] text-white/50 group-hover:text-white/80 truncate">
                            {child.title}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/5 text-center font-mono text-[10px] text-emerald-500/50 uppercase tracking-widest">
          {isLoading ? "SYNCING..." : "DB_LINK_ESTABLISHED"}
        </div>
      </aside>
    </>
  );
}
