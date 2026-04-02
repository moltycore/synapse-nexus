import { useState } from "react";
import { X } from "lucide-react";

const KebabMenu = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="2" r="1.5" fill="#EDEFF3" fillOpacity="0.85" />
    <circle cx="8" cy="8" r="1.5" fill="#EDEFF3" fillOpacity="0.85" />
    <circle cx="8" cy="14" r="1.5" fill="#EDEFF3" fillOpacity="0.85" />
  </svg>
);

export default function BottomSheet() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center"
        style={{
          minWidth: "36px",
          minHeight: "36px",
          transition: "opacity 120ms ease, transform 120ms ease",
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = "scale(0.95)";
          e.currentTarget.style.opacity = "0.7";
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.opacity = "1";
        }}
      >
        <KebabMenu />
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div 
        className={`fixed bottom-0 left-0 right-0 min-h-[30vh] max-h-[80vh] bg-[#12141A] border-t border-white/5 rounded-t-3xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <span className="text-sm font-medium text-foreground/80 tracking-wide">Telemetry</span>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white/40 hover:text-white transition-colors p-1 bg-white/5 rounded-full"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <p className="text-xs text-white/30 uppercase tracking-widest font-mono text-center mt-4">System Telemetry Offline</p>
        </div>
      </div>
    </>
  );
}
