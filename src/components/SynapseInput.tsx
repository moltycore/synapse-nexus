import { useState } from "react";
import { SendHorizontal } from "lucide-react";

interface SynapseInputProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
}

const SynapseInput = ({ onSubmit, isProcessing }: SynapseInputProps) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() && !isProcessing) {
      onSubmit(text);
      setText("");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-white/[0.05]">
      <div className="max-w-2xl mx-auto relative flex items-center gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Analiz için bir metin girin..."
          className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-synapse-purple/50 transition-all resize-none h-12 flex items-center"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={isProcessing || !text.trim()}
          className="absolute right-2 p-2 text-synapse-purple disabled:opacity-30 disabled:grayscale transition-all"
        >
          <SendHorizontal size={20} />
        </button>
      </div>
    </div>
  );
};

export default SynapseInput;
