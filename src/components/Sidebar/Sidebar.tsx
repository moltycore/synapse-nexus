import { X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
          <span className="text-sm font-medium text-foreground/80">Navigation</span>
          <button onClick={onClose} className="text-white/40 p-1 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 flex-1 font-mono text-[10px] text-white/20">AWAITING_UPLINK...</div>
      </aside>
    </>
  );
}
