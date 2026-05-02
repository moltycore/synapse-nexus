import { X, Plus, Loader2, PlusSquare, LogOut, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { dbService } from "@/services/db";
import { logger } from "@/utils/logger";
import { useSynapseStore } from "@/store/synapseStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkspace: (id: string) => void;
  onNewChat: () => void;
  activeWorkspaceId: string | null;
}

interface WorkspaceNode {
  id: string;
  title: string;
  parentId: string | null;
  children: WorkspaceNode[];
  createdAt: any;
}

const NODE_SIZE = 7;
const H_LINE = 12;
const V_LINE_X = 9;
const LEVEL_WIDTH = 20;

const NodeSquare = ({ active }: { active: boolean }) => (
  <span style={{
    display: "inline-block",
    width: NODE_SIZE,
    height: NODE_SIZE,
    border: `1px solid ${active ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.22)"}`,
    backgroundColor: "transparent",
    borderRadius: 1,
    flexShrink: 0,
  }} />
);

const HLine = ({ active }: { active: boolean }) => (
  <span style={{
    display: "inline-block",
    width: H_LINE,
    height: 1,
    backgroundColor: active ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.10)",
    flexShrink: 0,
  }} />
);

export default function Sidebar({ isOpen, onClose, onSelectWorkspace, onNewChat, activeWorkspaceId }: SidebarProps) {
  const [roots, setRoots] = useState<WorkspaceNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const { isAnonymous, profile, upgradeAuth, logoutSession } = useSynapseStore();

  useEffect(() => { if (isOpen) loadTree(); }, [isOpen]);

  const loadTree = async () => {
    try {
      setIsLoading(true);
      const flat = await dbService.getWorkspaces();
      const map = new Map<string, WorkspaceNode>();
      flat.forEach(w => map.set(w.id, { id: w.id, title: w.title, parentId: w.parentId ?? null, children: [], createdAt: w.createdAt }));

      const rootNodes: WorkspaceNode[] = [];
      map.forEach(node => {
        if (node.parentId && map.has(node.parentId)) {
          map.get(node.parentId)!.children.push(node);
        } else {
          rootNodes.push(node);
        }
      });

      if (activeWorkspaceId) {
        const toOpen = new Set<string>();
        const findAncestors = (nodes: WorkspaceNode[], id: string): boolean => {
          for (const n of nodes) {
            if (n.id === id) return true;
            if (findAncestors(n.children, id)) { toOpen.add(n.id); return true; }
          }
          return false;
        };
        findAncestors(rootNodes, activeWorkspaceId);
        setOpenIds(toOpen);
      }

      setRoots(rootNodes);
    } catch (error) {
      logger.error("Tree load failed", { error });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOpen = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderNode = (node: WorkspaceNode, level: number, isLastSibling: boolean) => {
    const isActive = node.id === activeWorkspaceId;
    const isOpen = openIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const lineColor = "rgba(255,255,255,0.09)";

    return (
      <div key={node.id} style={{ position: "relative", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", height: 30 }}>

          {/* Connector columns */}
          {Array.from({ length: level }).map((_, i) => {
            const isLast = i === level - 1;
            return (
              <div key={i} style={{ width: LEVEL_WIDTH, flexShrink: 0, position: "relative", alignSelf: "stretch" }}>
                {/* Vertical pass-through line for ancestor levels */}
                {!isLast && (
                  <div style={{ position: "absolute", left: V_LINE_X, top: 0, bottom: 0, width: 1, backgroundColor: lineColor }} />
                )}

                {/* L-bend for immediate parent level */}
                {isLast && (
                  <>
                    {/* Vertical — stops at mid if last sibling */}
                    <div style={{
                      position: "absolute", left: V_LINE_X, top: 0,
                      height: isLastSibling ? "50%" : "100%",
                      width: 1, backgroundColor: lineColor
                    }} />
                    {/* Horizontal — connects to node */}
                    <div style={{
                      position: "absolute", left: V_LINE_X, top: "50%",
                      width: LEVEL_WIDTH - V_LINE_X, height: 1, backgroundColor: lineColor
                    }} />
                  </>
                )}
              </div>
            );
          })}

          {/* Node row: ○── title */}
          <button
            onClick={() => { if (hasChildren) toggleOpen(node.id); onSelectWorkspace(node.id); onClose(); }}
            style={{
              display: "flex", alignItems: "center", gap: 0, flex: 1,
              padding: "4px 8px 4px 0", background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
              border: "none", borderRadius: 5, cursor: "pointer", textAlign: "left", minWidth: 0,
            }}
          >
            <NodeSquare active={isActive} />
            <HLine active={isActive} />
            <span style={{
              fontSize: 11,
              color: isActive ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.42)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              flex: 1, lineHeight: 1.3,
            }}>
              {node.title}
            </span>
          </button>
        </div>

        {/* Vertical line continuing downward from this node if it has children and is open */}
        {isOpen && hasChildren && (
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute",
              left: level * LEVEL_WIDTH + V_LINE_X,
              top: 0, bottom: 0, width: 1, backgroundColor: lineColor
            }} />
            {node.children.map((child, i) =>
              renderNode(child, level + 1, i === node.children.length - 1)
            )}
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

        <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top,0px)+36px)] pb-3 border-b border-white/5 shrink-0">
          <span className="text-sm font-semibold text-white/80 tracking-wide">Sohbetler</span>
          <div className="flex items-center gap-2">
            <button onClick={() => { onNewChat(); onClose(); }} className="text-white/40 hover:text-white transition-colors p-1" title="Yeni Sohbet">
              <PlusSquare size={16} />
            </button>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={16} className="text-white/20 animate-spin" />
            </div>
          ) : roots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <p className="text-[10px] text-white/20 tracking-wider uppercase font-mono">Henüz sohbet yok</p>
              <button onClick={() => { onNewChat(); onClose(); }} className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors">
                <Plus size={12} />Yeni sohbet başlat
              </button>
            </div>
          ) : (
            roots.map((node, i) => renderNode(node, 0, i === roots.length - 1))
          )}
        </div>

        {/* YENİ EKLENEN PROFİL / AUTH BÖLÜMÜ */}
        <div className="px-4 py-3 border-t border-white/5 shrink-0 flex items-center justify-between">
          {isAnonymous ? (
            <button 
              onClick={upgradeAuth}
              className="flex items-center gap-2 text-[11px] font-medium text-emerald-400/80 hover:text-emerald-400 transition-colors w-full bg-emerald-500/10 hover:bg-emerald-500/20 py-1.5 px-3 rounded-md border border-emerald-500/20"
            >
              <ShieldCheck size={14} />
              <span>Bulut Senkronizasyonu Kapalı</span>
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 overflow-hidden">
                {profile?.photo ? (
                  <img src={profile.photo} alt="Profile" className="w-6 h-6 rounded-full opacity-80" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                    {profile?.name?.charAt(0) || "U"}
                  </div>
                )}
                <span className="text-[11px] text-white/60 truncate max-w-[100px]">{profile?.name}</span>
              </div>
              <button onClick={logoutSession} className="text-red-400/60 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors" title="Sistemi Kapat">
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
                        }
