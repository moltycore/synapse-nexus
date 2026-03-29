import { useState } from "react";
import { Cpu, Copy, Share2, MoreHorizontal, Check } from "lucide-react";

interface ChatMessageProps {
  soru: string;
  nihai_rapor: string;
  timestamp: string;
  mode: "solo" | "nexus";
  vizyon_onerisi?: string;
}

export default function ChatMessage({ soru, nihai_rapor, timestamp, mode, vizyon_onerisi }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(nihai_rapor);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); 
    } catch (err) {
      console.error("Kopyalama başarısız:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Synapse Raporu',
          text: nihai_rapor,
        });
      } catch (err) {
        console.error("Paylaşım hatası:", err);
      }
    } else {
      alert("Tarayıcınız paylaşım özelliğini desteklemiyor.");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end relative">
        <div className="max-w-[78%] bg-synapse-purple/20 border border-synapse-purple/30 rounded-2xl rounded-tr-sm px-4 pt-2 pb-5 overflow-hidden relative">
          {mode === "nexus" && (
            <Cpu size={14} className="absolute top-2 right-2 text-synapse-purple/40" />
          )}
          <p className={`text-sm text-foreground/90 leading-relaxed break-words ${mode === "nexus" ? "pr-4" : ""}`}>
            {soru}
          </p>
          <span className="absolute bottom-1 right-3 text-[8px] text-muted-foreground/60">{timestamp}</span>
        </div>
      </div>

      <div className="flex flex-col items-start gap-1.5">
        <div className="w-fit max-w-[95%] glass border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 pt-2 pb-5 relative">
          <p className="text-sm text-foreground/85 leading-relaxed break-words whitespace-pre-wrap">{nihai_rapor}</p>
          
          {vizyon_onerisi && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-[10px] text-white/40 uppercase tracking-tighter mb-1 font-bold italic">Sıradaki Hamle:</p>
              <p className="text-xs text-synapse-purple/80 italic">{vizyon_onerisi}</p>
            </div>
          )}
          
          <span className="absolute bottom-1 left-3 text-[8px] text-muted-foreground/60">{timestamp}</span>
        </div>
        <div className="flex items-center gap-3 pl-3 text-white/30">
          <button onClick={handleCopy} className="hover:text-white transition-colors" title="Kopyala">
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} strokeWidth={2} />}
          </button>
          <button onClick={handleShare} className="hover:text-white transition-colors" title="Paylaş">
            <Share2 size={13} strokeWidth={2} />
          </button>
          <button className="hover:text-white transition-colors" title="Daha Fazla">
            <MoreHorizontal size={13} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
