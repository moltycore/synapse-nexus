import Sidebar from "./Sidebar/Sidebar";
import BottomSheet from "./BottomSheet/BottomSheet";

interface SynapseAppBarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: (state: boolean) => void;
}

const SynapseAppBar = ({ isSidebarOpen, onSidebarToggle }: SynapseAppBarProps) => {
  return (
    <header className="sticky top-0 z-[60] flex items-center justify-between px-4 h-[52px] bg-[#0F1115]">
      <Sidebar isOpen={isSidebarOpen} onToggle={onSidebarToggle} />
      <div className="flex flex-col items-center select-none gap-px">
        <span className="font-semibold text-[17px] text-[#EDEFF3] tracking-tight">Synapse</span>
        <span className="text-[11px] text-[#9CA3AF] tracking-[0.5px]">Nexus v1.2</span>
      </div>
      <BottomSheet />
    </header>
  );
};

export default SynapseAppBar;
