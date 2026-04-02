import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { CornerDownLeft, Zap, Cpu } from "lucide-react";

interface SynapseInputProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
  mode: "solo" | "nexus";
  setMode: (mode: "solo" | "nexus") => void;
}

const SynapseInput = ({ onSubmit, isProcessing, mode, setMode }: SynapseInputProps) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !isProcessing) {
      onSubmit(text.trim());
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Reserved for keybind overrides
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 px-2 pt-4 pb-6 bg-gradient-to-t from-background via-background/95 to-transparent z-50">
      <div className="max-w-3xl mx-auto relative w-full">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end gap-1.5 glass border border-white/10 rounded-3xl p-1.5 transition-all duration-300 focus-within:border-synapse-purple/50 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.15)] w-full"
        >
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => setMode(mode === "nexus" ? "solo" : "nexus")}
            className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors mb-0.5 ${
              mode === "nexus" 
                ? "bg-synapse-purple/10 text-synapse-purple hover:bg-synapse-purple/20" 
                : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
            }`}
            title={mode === "nexus" ? "Nexus Mode" : "Solo Mode"}
          >
            {mode === "nexus" ? <Cpu size={18} /> : <Zap size={18} />}
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            placeholder="Awaiting payload..."
            className="flex-1 max-h-[120px] min-h-[40px] bg-transparent border-none focus:ring-0 resize-none text-sm text-foreground/90 placeholder:text-white/30 py-2.5 px-2 outline-none overflow-y-auto w-full"
            rows={1}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          />
          <style dangerouslySetInnerHTML={{__html: `
            textarea::-webkit-scrollbar { display: none; }
          `}} />
          
          <button
            type="submit"
            disabled={!text.trim() || isProcessing}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-synapse-purple/10 text-synapse-purple hover:bg-synapse-purple/20 transition-colors disabled:opacity-50 disabled:hover:bg-synapse-purple/10 mb-0.5"
          >
            <CornerDownLeft size={18} className={isProcessing ? "animate-pulse" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SynapseInput;
