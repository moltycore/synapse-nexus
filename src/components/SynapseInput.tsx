import { ArrowUp, Mic, Plus } from "lucide-react";
import { useState } from "react";

interface SynapseInputProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
}

const SynapseInput = ({ onSubmit, isProcessing }: SynapseInputProps) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim() || isProcessing) return;
    onSubmit(text.trim());
    setText("");
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="sticky bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 bg-background/30 backdrop-blur-xl border-t border-white/[0.05]">
      <div className="glass-strong rounded-2xl flex items-end gap-1 p-1.5">
        <button className="p-2.5 rounded-xl text-muted-foreground hover:bg-white/[0.06] active:scale-95 transition-all shrink-0">
          <Plus className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask Synapse to synthesize"
            rows={1}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 resize-none py-2.5 px-1 focus:outline-none overflow-wrap-break-word"
            style={{ maxHeight: "120px" }}
            disabled={isProcessing}
          />
        </div>

        <button className="p-2.5 rounded-xl text-muted-foreground hover:bg-white/[0.06] active:scale-95 transition-all shrink-0">
          <Mic className="w-5 h-5" />
        </button>

        <button
          onClick={handleSubmit}
          disabled={!hasText || isProcessing}
          className={`p-2.5 rounded-xl shrink-0 transition-all active:scale-95 ${
            hasText && !isProcessing
              ? "bg-synapse-purple text-primary-foreground animate-pulse-send"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SynapseInput;
