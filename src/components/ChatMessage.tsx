import { useState, useRef, useCallback } from "react";
import { Cpu, Copy, Share2, MoreHorizontal, Check } from "lucide-react";

interface ChatMessageProps {
  soru: string;
  nihai_rapor: string;
  timestamp: string;
  mode: "solo" | "nexus";
  vizyon_onerisi?: string;
}

export default function ChatMessage({ soru, nihai_rapor, timestamp, mode, vizyon_onerisi }: ChatMessageProps) {
  const [aiCopied, setAiCopied] = useState(false);
  const [userCopied, setUserCopied] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleAiCopy = async () => {
    try {
      await navigator.clipboard.writeText(nihai_rapor);
      setAiCopied(true);
      setTimeout(() => setAiCopied(false), 2000); 
    } catch (err) {
      console.error("AI veri kopyalama hatası:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Synapse Nihai Rapor',
          text: nihai_rapor,
        });
      } catch (err) {
        console.error("Paylaşım hatası:", err);
      }
    } else {
      alert("Sistem paylaşım protokolünü desteklemiyor.");
    }
  };

  // Kullanıcı mesajı için basılı tutma (Long-Press) hook'u
  const handlePressStart = useCallback(() => {
    pressTimer.current = setTimeout(() => {
      navigator.clipboard.writeText(soru).then(() => {
        setUserCopied(true);
        setTimeout(() => setUserCopied(false), 2000);
      });
    }, 500); 
  }, [soru]);

  const handlePressEnd = useCallback(() => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }, []);

  return (
    <div className="space-y-5 w-full pb-4">
      {/* 1. Kullanıcı Girdisi (Genişletilmiş Balon & Bas-Tut Kopyalama) */}
      <div className="flex justify-end relative select-none">
        <div 
          className="w-fit max-w-[95%] bg-synapse-purple/20 border border-synapse-purple/30 rounded-2xl rounded-tr-sm px-4 pt-3 pb-5 relative cursor-pointer hover:bg-synapse-purple/30 transition-colors"
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
        >
          {mode === "nexus" && (
            <Cpu size={14} className="absolute top-2 right-2 text-synapse-purple/40" />
          )}
          {userCopied && (
            <span className="absolute top-1 left-3 text-[9px] font-medium text-green-400 uppercase tracking-widest">Kopyalandı</span>
          )}
          
          <p className={`text-sm text-foreground/90 leading-relaxed break-words select-text ${mode === "nexus" ? "pr-5" : ""}`}>
            {soru}
          </p>
          <span className="absolute bottom-1 right-3 text-[9px] text-muted-foreground/60">{timestamp}</span>
        </div>
      </div>

      {/* 2. Synapse Çıktısı (Balonsuz, Tam Genişlik, İzole Metin) */}
      <div className="flex flex-col items-start gap-2 w-full select-none pl-1">
        <div className="w-full">
          <p className="text-sm text-foreground/90 leading-relaxed break-words whitespace-pre-wrap select-text">
            {nihai_rapor}
          </p>
          
          {vizyon_onerisi && (
            <div className="mt-4 pt-3 border-t border-white/10 w-full max-w-2xl">
              <p className="text-[10px] text-white/40 uppercase tracking-tighter mb-1 font-bold italic select-none">Sıradaki Hamle:</p>
              <p className="text-xs text-synapse-purple/90 italic select-text">{vizyon_onerisi}</p>
            </div>
          )}
        </div>
        
        {/* Aksiyon Paneli */}
        <div className="flex items-center gap-4 mt-1 text-white/40 select-none">
          <button onClick={handleAiCopy} className="hover:text-white transition-colors" title="Veriyi Kopyala">
            {aiCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} strokeWidth={2} />}
          </button>
          <button onClick={handleShare} className="hover:text-white transition-colors" title="Raporu Paylaş">
            <Share2 size={14} strokeWidth={2} />
          </button>
          <button className="hover:text-white transition-colors" title="Sistem Menüsü">
            <MoreHorizontal size={14} strokeWidth={2} />
          </button>
          <span className="text-[10px] text-muted-foreground/50 ml-2">{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
