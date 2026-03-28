import { useState } from "react";
import { Cpu, Copy, Share2, MoreHorizontal, Check } from "lucide-react";

interface ChatMessageProps {
  soru: string;
  racon: string;
  timestamp: string;
  mode: "triage" | "nexus";
}

export default function ChatMessage({ soru, racon, timestamp, mode }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  // --- HANDLER: Kopyalama İşlemi ---
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(racon);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2 saniye sonra ikonu geri düzelt
    } catch (err) {
      console.error("Kopyalama başarısız:", err);
    }
  };

  // --- HANDLER: Paylaşma İşlemi ---
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Synapse Racon',
          text: racon,
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
      {/* Kullanıcı Mesajı */}
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

      {/* AI Cevap Bloğu */}
      <div className="flex flex-col items-start gap-1.5">
        <div className="flex justify-start relative">
          <div className="w-fit max-w-[85%] glass border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 pt-2 pb-5 overflow-hidden relative">
            <p className="text-sm text-foreground/85 leading-relaxed break-words whitespace-pre-wrap">{racon}</p>
            <span className="absolute bottom-1 left-3 text-[8px] text-muted-foreground/60">{timestamp}</span>
          </div>
        </div>
        {/* Aksiyon Çubuğu */}
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
