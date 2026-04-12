import { useState } from "react";
import { APP_VERSION } from "@/config/constants";
import { Code2, X } from "lucide-react";

interface SynapseAppBarProps {
  onSidebarToggle: () => void;
  onBottomSheetToggle: () => void;
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

const SynapseAppBar = ({ onSidebarToggle, onBottomSheetToggle }: SynapseAppBarProps) => {
  const [isIslandExpanded, setIsIslandExpanded] = useState(false);

  return (
    <>
      {isIslandExpanded && (
        <div 
          className="fixed inset-0 z-[45] bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsIslandExpanded(false)}
        />
      )}
      
      <header className="shrink-0 z-[50] flex items-center justify-between px-4 pb-2 pt-[calc(env(safe-area-inset-top,0px)+36px)] bg-[#0F1115] w-full relative">
        <button
          onClick={onSidebarToggle}
          className="flex items-center justify-center min-w-[36px] min-h-[36px] transition-all active:scale-95 active:opacity-70 z-10"
        >
          <NavigationIcon />
        </button>

        <div className="flex flex-col items-center select-none relative w-[140px] h-[44px]">
          <div
            onClick={() => !isIslandExpanded && setIsIslandExpanded(true)}
            className={`absolute top-0 left-1/2 -translate-x-1/2 flex flex-col overflow-hidden bg-black border border-gray-800 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-[0_0_40px_rgba(0,0,0,0.8)] ${
              isIslandExpanded
                ? "w-[320px] h-[420px] rounded-[24px] p-4 cursor-default mt-2" 
                : "w-[140px] h-[44px] rounded-[22px] items-center justify-center cursor-pointer hover:border-gray-600"
            }`}
          >
            {!isIslandExpanded ? (
              <div className="flex flex-col items-center justify-center h-full w-full gap-[2px]">
                <span className="font-semibold text-[15px] text-gray-200 tracking-tight leading-none">Synapse</span>
                <span className="text-[10px] text-gray-500 tracking-[0.5px] leading-none">Nexus {APP_VERSION}</span>
              </div>
            ) : (
              <div className="flex flex-col h-full w-full opacity-100 animate-in fade-in duration-300 delay-100">
                <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2 px-1">
                    <Code2 size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-200">Artifacts Storage</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsIslandExpanded(false);
                    }}
                    className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 bg-gray-900 rounded-full hover:bg-gray-800"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center">
                  <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">Storage_Empty</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onBottomSheetToggle}
          className="flex items-center justify-center min-w-[36px] min-h-[36px] transition-all active:scale-95 active:opacity-70 z-10"
        >
          <ActionIcon />
        </button>
      </header>
    </>
  );
};

export default SynapseAppBar;
