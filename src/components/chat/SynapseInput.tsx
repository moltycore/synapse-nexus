import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { CornerDownLeft, Zap, Cpu } from "lucide-react";
import { SynapseMode } from "@/hooks/synapse/types";

interface SynapseInputProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
  mode: SynapseMode;
  setMode: (mode: SynapseMode) => void;
}

const SynapseInput = ({ onSubmit, isProcessing, mode, setMode }: SynapseInputProps) => {
  const [text, setText] = useState("");
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      const offset = window.innerHeight - viewport.height;
      setKeyboardOffset(offset > 0 ? offset : 0);
    };

    viewport.addEventListener("resize", handleResize);
    return () => viewport.removeEventListener("resize", handleResize);
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => adjustHeight(), [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !isProcessing) {
      onSubmit(text.trim());
      setText("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="absolute left-0 right-0 z-50 pointer-events-none transition-all duration-150 ease-out"
      style={{ bottom: `${keyboardOffset}px` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent h-[140%] -bottom-10 pointer-events-none" />

      <div className="max-w-3xl mx-auto relative w-full px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pointer-events-auto">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-1.5 bg-background border rounded-3xl p-1.5 shadow-2xl transition-all duration-300 w-full z-10 border-white/10 focus-within:border-white/25 focus-within:shadow-[0_0_20px_rgba(160,168,185,0.10)]"
        >
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => setMode(mode === "nexus" ? "solo" : "nexus")}
            className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors mb-0.5 ${
              mode === "nexus"
                ? "bg-white/8 text-white/60 hover:bg-white/12 hover:text-white/80"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
            }`}
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
            style={{ scrollbarWidth: "none" }}
          />
          <style dangerouslySetInnerHTML={{ __html: `textarea::-webkit-scrollbar { display: none; }` }} />

          <button
            type="submit"
            disabled={!text.trim() || isProcessing}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/8 text-white/60 hover:bg-white/15 hover:text-white/90 transition-colors disabled:opacity-30 mb-0.5"
          >
            <CornerDownLeft size={18} className={isProcessing ? "animate-pulse" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SynapseInput;
