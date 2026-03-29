interface ChatMessageProps {
  soru: string;
  racon: string;
  timestamp: string;
  mode: "solo" | "nexus";
  vizyon_onerisi?: string; // PRIME'dan gelen yeni alan
}

export default function ChatMessage({ soru, racon, timestamp, mode, vizyon_onerisi }: ChatMessageProps) {
  return (
    <div className="space-y-2">
      {/* ... Kullanıcı Mesajı Kısmı Aynı ... */}

      <div className="flex flex-col items-start gap-1.5">
        <div className="w-fit max-w-[95%] glass border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 pt-2 pb-5 relative">
          <p className="text-sm text-foreground/85 leading-relaxed break-words whitespace-pre-wrap">{racon}</p>
          
          {/* VİZYON ÖNERİSİ: Eğer varsa, raconun altına siber bir ipucu kutusu olarak ekle */}
          {vizyon_onerisi && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-[10px] text-white/40 uppercase tracking-tighter mb-1 font-bold italic">Sıradaki Hamle:</p>
              <p className="text-xs text-synapse-purple/80 italic">{vizyon_onerisi}</p>
            </div>
          )}
          
          <span className="absolute bottom-1 left-3 text-[8px] text-muted-foreground/60">{timestamp}</span>
        </div>
        {/* ... Aksiyon Çubuğu ... */}
      </div>
    </div>
  );
}
