import { APP_VERSION } from "@/config/constants";

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
  return (
    <header className="shrink-0 z-[40] flex items-center justify-between px-4 pb-2 pt-[calc(env(safe-area-inset-top,0px)+36px)] bg-[#0F1115] w-full">
      <button
        onClick={onSidebarToggle}
        className="flex items-center justify-center min-w-[36px] min-h-[36px] transition-all active:scale-95 active:opacity-70"
      >
        <NavigationIcon />
      </button>

      <div className="flex flex-col items-center select-none gap-px mt-1">
        <span className="font-semibold text-[17px] text-[#EDEFF3] tracking-tight">Synapse</span>
        <span className="text-[11px] text-[#9CA3AF] tracking-[0.5px]">Nexus {APP_VERSION}</span>
      </div>

      <button
        onClick={onBottomSheetToggle}
        className="flex items-center justify-center min-w-[36px] min-h-[36px] transition-all active:scale-95 active:opacity-70"
      >
        <ActionIcon />
      </button>
    </header>
  );
};

export default SynapseAppBar;
