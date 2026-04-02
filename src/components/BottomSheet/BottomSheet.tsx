import { useState } from "react";
import { X } from "lucide-react";

const ActionIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="2" r="1.5" fill="#EDEFF3" fillOpacity="0.85" />
    <circle cx="8" cy="8" r="1.5" fill="#EDEFF3" fillOpacity="0.85" />
    <circle cx="8" cy="14" r="1.5" fill="#EDEFF3" fillOpacity="0.85" />
  </svg>
);

export default function BottomSheet() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsVisible(true)}
        className="flex items-center justify-center min-w-[36px] min-h-[36px] transition-all active:scale-95 active:opacity-70"
      >
        <ActionIcon />
      </button>

      {isVisible && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          onClick={() => setIsVisible(false)}
        />
      )}

      <div 
        className={`fixed bottom-0 left-0 right-0 min-h-[30vh] bg-[#12141A] border-t border-white/5 rounded-t-3xl z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <span className="text-sm font-medium text-foreground/80">Telemetry</span>
          <button onClick={() => setIsVisible(false)} className="text-white/40 p-1 bg-white/5 rounded-full">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 text-center font-mono text-[10px] text-white/20">
          SYSTEM_TELEMETRY_OFFLINE
        </div>
      </div>
    </>
  );
}
