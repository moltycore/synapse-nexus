import { X, Folder, MessageSquare, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkspaceNode {
  id: string;
  title: string;
  isOpen: boolean;
  children?: { id: string; title: string }[];
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceNode[]>([
    {
      id: "w-1",
      title: "Synapse Core",
      isOpen: true,
      children: [
        { id: "c-1", title: "Acımasız Karar AI" },
        { id: "c-2", title: "Nexus Protocol" }
      ]
    },
    {
      id: "w-2",
      title: "Doby & MoltyBot",
      isOpen: false,
      children: [
        { id: "c-3", title: "EIC Ranking Logic" }
      ]
    }
  ]);

  const toggleWorkspace = (id: string) => {
    setWorkspaces(prev => 
      prev.map(w => w.id === id ? { ...w, isOpen: !w.isOpen } : w)
    );
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
            <button className="text-white/40 hover:text-white transition-colors p-1" title="New Workspace">
              <Plus size={16} />
            </button>
            <button onClick={onClose} className="text-white/40 p-1 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {workspaces.map(workspace => (
            <div key={workspace.id} className="flex flex-col">
              <button 
                onClick={() => toggleWorkspace(workspace.id)}
                className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-white/5 transition-colors text-left group"
              >
                {workspace.isOpen ? (
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
                  {workspace.children.map(child => (
                    <button 
                      key={child.id}
                      className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-white/5 transition-colors text-left group"
                    >
                      <MessageSquare size={12} className="text-white/30 group-hover:text-white/60" />
                      <span className="text-[11px] text-white/50 group-hover:text-white/80 truncate">
                        {child.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 text-center font-mono text-[10px] text-emerald-500/50 uppercase tracking-widest">
          DB_LINK_ESTABLISHED
        </div>
      </aside>
    </>
  );
}
