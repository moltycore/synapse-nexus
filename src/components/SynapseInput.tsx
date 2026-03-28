import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface SynapseInputProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
}

const SynapseInput = ({ onSubmit, isProcessing }: SynapseInputProps) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Yazı yazdıkça kutunun boyunu otomatik ayarlar (Maksimum 120px)
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
    // Enter'ın gönderme yetkisi alındı. 
    // Artık Enter'a basınca sadece alt satıra geçer, handleSubmit tetiklenmez.
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent pb-6 z-50">
      <div className="max-w-3xl mx-auto relative">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 glass border border-white/10 rounded-3xl p-2 transition-all duration-300 focus-within:border-synapse-purple/50 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.15)]"
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            placeholder="Synapse'a yaz..."
            className="flex-1 max-h-[120px] min-h-[40px] bg-transparent border-none focus:ring-0 resize-none text-sm text-foreground/90 placeholder:text-muted-foreground/15 py-2.5 px-4 outline-none overflow-y-auto"
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
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-synapse-purple/10 text-synapse-purple hover:bg-synapse-purple/20 transition-colors disabled:opacity-50 disabled:hover:bg-synapse-purple/10 mb-0.5 mr-0.5"
          >
            <Send size={18} className={isProcessing ? "animate-pulse" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SynapseInput;
