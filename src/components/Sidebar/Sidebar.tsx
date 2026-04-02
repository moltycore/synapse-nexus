import { useState } from "react";
import { X } from "lucide-react";

const CustomHamburger = () => (
  <svg width="24" height="18" viewBox="0 0 28 20" fill="none">
    <rect x="0" y="0" width="10" height="2" rx="1" fill="#EDEFF3" fillOpacity="0.9" />
    <circle cx="17" cy="1" r="1.5" fill="#EDEFF3" fillOpacity="0.9" />
    <rect x="0" y="9" width="18" height="2" rx="1" fill="#EDEFF3" fillOpacity="0.9" />
    <rect x="0" y="18" width="18" height="2" rx="1" fill="#EDEFF3" fillOpacity="0.9" />
  </svg>
);

export default function Sidebar() {
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
        <CustomHamburger />
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-[#0F1115] border-r border-white/5 z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <span className="text-sm font-medium text-foreground/80 tracking-wide">Navigation</span>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 flex-1">
          <p className="text-xs text-white/30 uppercase tracking-widest font-mono">Awaiting Modules...</p>
        </div>
      </div>
    </>
  );
}
