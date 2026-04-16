import { useState, useEffect } from "react";
import { APP_VERSION } from "@/config/constants";
import { Code2, X, FileTerminal, Loader2 } from "lucide-react";
import { dbService } from "@/services/db";
import { HistoryItem } from "@/hooks/synapse/types";
import { logger } from "@/utils/logger";

interface SynapseAppBarProps {
  onSidebarToggle: () => void;
  onBottomSheetToggle: () => void;
  activeWorkspaceId?: string | null;
}

const NavigationIcon = () => (
  <svg width="24" height="18" viewBox="0 0 28 20" fill="none">
    <rect x="0" y="0" width="10" height="2" rx="1" fill="#EDEFF3" fillOpacity="0.9" />
    <circle cx="17" cy="1" r="1.5" fill="#EDEFF3" fillOpacity="0.9" />
    <rect x="0" y="9" width="18" height="2" rx="1" fill="#EDEFF3" fillOpacity="0.9" />
    <rect x="0" y="18" width="18" height="2" rx="1" fill="#EDEFF3" fillOpacity="0.9" />
  </svg>
);

const ActionIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="2" r="1.5" fill="#EDEFF3" fillOpacity="0.85" />
    <circle cx="8" cy="8" r="1.5" fill="#EDEFF3" fillOpacity="0.85" />
    <circle cx="8" cy="14" r="1.5" fill="#EDEFF3" fillOpacity="0.85" />
  </svg>
);

const SynapseAppBar = ({
  onSidebarToggle,
  onBottomSheetToggle,
  activeWorkspaceId
}: SynapseAppBarProps) => {
  const [isIslandExpanded, setIsIslandExpanded] = useState(false);
  const [artifacts, setArtifacts] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchArtifacts = async () => {
      if (!isIslandExpanded || !activeWorkspaceId) return;

      try {
        setIsLoading(true);
        const messages = await dbService.getMessages(activeWorkspaceId);
        setArtifacts(messages.filter(m => m.prime_result?.includes("```")));
      } catch (error) {
        logger.error("Artifact extraction failed", { workspaceId: activeWorkspaceId, error });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtifacts();
  }, [isIslandExpanded, activeWorkspaceId]);

  return (
    <>
      <header className="shrink-0 z-[50] flex items-center justify-between px-4 pb-2 pt-[calc(env(safe-area-inset-top,0px)+36px)] bg-[#0F1115] w-full relative">
        <button
          onClick={onSidebarToggle}
          className="flex items-center justify-center min-w-[36px] min-h-[36px] transition-all active:scale-95 active:opacity-70 z-10"
        >
          <NavigationIcon />
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="flex flex-col items-center justify-center w-[120px] h-[40px] bg-black border border-gray-800 rounded-[20px] shadow-lg">
            <span className="font-semibold text-[14px] text-gray-200 tracking-tight leading-none">Synapse</span>
            <span className="text-[9px] text-gray-500 tracking-[0.5px] leading-none mt-1">Nexus {APP_VERSION}</span>
          </div>
          <button
            onClick={() => setIsIslandExpanded(true)}
            className="w-10 h-10 flex items-center justify-center bg-black border border-gray-800 rounded-full shadow-lg text-gray-400 hover:text-emerald-400 hover:border-gray-700 transition-colors"
            title="Artifacts"
          >
            <Code2 size={16} />
          </button>
        </div>

        <button
          onClick={onBottomSheetToggle}
          className="flex items-center justify-center min-w-[36px] min-h-[36px] transition-all active:scale-95 active:opacity-70 z-10"
        >
          <ActionIcon />
        </button>
      </header>

      {isIslandExpanded && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center pt-[calc(env(safe-area-inset-top,0px)+36px)] px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsIslandExpanded(false)}
          />
          <div className="relative w-full max-w-[340px] h-[450px] bg-black border border-gray-800 rounded-[24px] p-4 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200 mt-2">
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3 shrink-0">
              <div className="flex items-center gap-2 px-1">
                <Code2 size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-200">Artifacts Storage</span>
              </div>
              <button
                onClick={() => setIsIslandExpanded(false)}
                className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 bg-gray-900 rounded-full hover:bg-gray-800"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 size={16} className="text-emerald-500/50 animate-spin" />
                </div>
              ) : artifacts.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">Storage_Empty</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pb-2 pr-1" style={{ scrollbarWidth: "none" }}>
                  {artifacts.map(art => (
                    <div
                      key={art.id}
                      className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 flex flex-col gap-1.5 hover:border-gray-700 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <FileTerminal size={12} className="text-emerald-500/70" />
                        <span className="text-[10px] font-mono text-gray-400 truncate">{art.soru}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SynapseAppBar;
