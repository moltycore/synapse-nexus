import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BottomSheet({ isOpen, onClose }: BottomSheetProps) {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/20 z-[80] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div 
        className={`fixed bottom-0 left-0 right-0 z-[90] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-[#12141A] border-t border-white/5 rounded-t-3xl shadow-2xl flex flex-col min-h-[30vh] pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <span className="text-sm font-medium text-foreground/80">Telemetry</span>
            <button onClick={onClose} className="text-white/40 p-1 bg-white/5 rounded-full hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="p-6 text-center font-mono text-[10px] text-white/20 flex-1">AWAITING_UPLINK...</div>
        </div>
      </div>
    </>
  );
}
