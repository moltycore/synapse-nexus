import { useState } from "react";
import { X } from "lucide-react";

const NavigationIcon = () => (
  <svg width="24" height="18" viewBox="0 0 28 20" fill="none">
    <rect x="0" y="0" width="10" height="2" rx="1" fill="#EDEFF3" fillOpacity="0.9" />
    <circle cx="17" cy="1" r="1.5" fill="#EDEFF3" fillOpacity="0.9" />
    <rect x="0" y="9" width="18" height="2" rx="1" fill="#EDEFF3" fillOpacity="0.9" />
    <rect x="0" y="18" width="18" height="2" rx="1" fill="#EDEFF3" fillOpacity="0.9" />
  </svg>
);

export default function Sidebar() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsVisible(true)}
        className="flex items-center justify-center min-w-[36px] min-h-[36px] transition-all active:scale-95 active:opacity-70"
      >
        <NavigationIcon />
      </button>

      {isVisible && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
          onClick={() => setIsVisible(false)}
        />
      )}

      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-[#0F1115] border-r border-white/5 z-[80] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <span className="text-sm font-medium text-foreground/80">Navigation</span>
          <button onClick={() => setIsVisible(false)} className="text-white/40 p-1">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 flex-1 font-mono text-[10px] text-white/20">AWAITING_UPLINK...</div>
      </aside>
    </>
  );
}
