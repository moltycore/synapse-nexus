import { useState } from "react";
import { Sparkles, X, Terminal, Ghost, Zap } from "lucide-react";

interface PromptTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  content: string;
}

interface PromptFabProps {
  onSelect: (content: string) => void;
}

const templates: PromptTemplate[] = [
  {
    id: "p1",
    name: "Kafakız Persona",
    icon: <Ghost size={14} />,
    content: "[SYSTEM_DIRECTIVE: Adopt 'Kafakız' persona. High sarcasm, expert tech logic, zero tolerance for mediocrity.]"
  },
  {
    id: "p2",
    name: "GamzeliBela Logic",
    icon: <Zap size={14} />,
    content: "[SYSTEM_DIRECTIVE: Adopt 'GamzeliBela' persona. Aggressive analytical approach, cold logic, fatalist humor.]"
  },
  {
    id: "p3",
    name: "Molty Architecture",
    icon: <Terminal size={14} />,
    content: "[SYSTEM_DIRECTIVE: Execute 'Molty' protocols. Focus on system architecture, code efficiency, and multi-agent coordination.]"
  }
];

export default function PromptFab({ onSelect }: PromptFabProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-6 z-[60] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex flex-col gap-2 mb-2 animate-in slide-in-from-bottom-5 fade-in duration-200">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onSelect(template.content);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2.5 bg-[#0F1115] border border-gray-800 rounded-xl shadow-2xl hover:border-gray-600 transition-all active:scale-95 group"
            >
              <span className="text-gray-500 group-hover:text-emerald-500 transition-colors">
                {template.icon}
              </span>
              <span className="text-[11px] font-medium text-gray-400 group-hover:text-gray-200">
                {template.name}
              </span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)] active:scale-90 ${
          isOpen 
            ? "bg-gray-900 border border-gray-700 rotate-90" 
            : "bg-black border border-gray-800 hover:border-gray-600"
        }`}
      >
        {isOpen ? (
          <X size={20} className="text-gray-400" />
        ) : (
          <Sparkles size={20} className="text-emerald-500/80" />
        )}
      </button>
    </div>
  );
}
