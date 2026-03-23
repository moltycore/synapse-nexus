import { useState, useCallback, useRef, useEffect } from "react";
import SynapseAppBar from "@/components/SynapseAppBar";
import BattleTimeline from "@/components/BattleTimeline";
import SynapseInput from "@/components/SynapseInput";

interface HistoryItem {
  id: number;
  soru: string;
  karar: string;
  arastirma?: string;
  denetleme?: string;
  vizyon?: string;
}

export default function Index() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeItem, setActiveItem] = useState<HistoryItem | null>(null);
  const [currentSoru, setCurrentSoru] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isProcessing]);

  const handleSubmit = useCallback(async (text: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setActiveItem(null);
    setCurrentSoru(text);
    setPhase(1);

    try {
      setTimeout(() => setPhase(2), 2000);
      setTimeout(() => setPhase(3), 4000);

      const response = await fetch("https://synapse-api-b8oc.onrender.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errBody}`);
      }

      const data = await response.json();
      const newItem: HistoryItem = {
        id: Date.now(),
        soru: text,
        karar: data.final_karar ?? JSON.stringify(data),
        arastirma: data.arastirma,
        denetleme: data.denetleme,
        vizyon: data.vizyon,
      };
      setHistory((prev) => [...prev, newItem]);
      setActiveItem(newItem);
    } catch (error) {
      const errMsg = `⚠️ ${error instanceof Error ? error.message : "Bağlantı koptu."}`;
      const errItem: HistoryItem = {
        id: Date.now(),
        soru: text,
        karar: errMsg,
      };
      setHistory((prev) => [...prev, errItem]);
      setActiveItem(errItem);
    } finally {
      setIsProcessing(false);
      setPhase(0);
    }
  }, [isProcessing]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SynapseAppBar />

      <main className="flex-1 overflow-y-auto pb-24 pt-2">
        <div className="px-4 space-y-3">

          {history.map((item) => (
            <div key={item.id} className="space-y-2">
              {/* Kullanıcı sorusu — sağda */}
              <div className="flex justify-end">
                <div className="max-w-[78%] bg-synapse-purple/20 border border-synapse-purple/30 rounded-2xl rounded-tr-sm px-4 py-2.5">
                  <p className="text-sm text-foreground/90 leading-relaxed">{item.soru}</p>
                </div>
              </div>

              {/* Synapse cevabı — solda */}
              <div className="flex justify-start">
                <div className="w-full glass border border-white/[0.07] rounded-2xl px-4 py-2.5">
                  <p className="text-sm text-foreground/85 leading-relaxed">{item.karar}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Yükleniyor */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[78%] bg-synapse-purple/20 border border-synapse-purple/30 rounded-2xl rounded-tr-sm px-4 py-2.5">
                  <p className="text-sm text-foreground/90 leading-relaxed">{currentSoru}</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="glass border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-synapse-purple/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-synapse-purple/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-synapse-purple/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Node'lar sadece aktif item varsa */}
        {activeItem && !isProcessing && (
          <div className="mt-4">
            <BattleTimeline
              isActive={true}
              phase={3}
              arastirma={activeItem.arastirma}
              denetleme={activeItem.denetleme}
              vizyon={activeItem.vizyon}
            />
          </div>
        )}
      </main>

      <SynapseInput onSubmit={handleSubmit} isProcessing={isProcessing} />
    </div>
  );
        }
