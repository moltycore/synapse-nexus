import { useState, useCallback, useRef, useEffect } from "react";
import SynapseAppBar from "@/components/SynapseAppBar";
import DecisionCard from "@/components/DecisionCard";
import BattleTimeline from "@/components/BattleTimeline";
import SynapseInput from "@/components/SynapseInput";

interface HistoryItem {
  id: number;
  soru: string;
  karar: string;
}

export default function Index() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState(0);
  const [decision, setDecision] = useState<string | null>(null);
  const [isDecisionActive, setIsDecisionActive] = useState(false);
  const [arastirma, setArastirma] = useState<string | undefined>();
  const [denetleme, setDenetleme] = useState<string | undefined>();
  const [vizyon, setVizyon] = useState<string | undefined>();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, decision]);

  const handleSubmit = useCallback(async (text: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setDecision(null);
    setIsDecisionActive(false);
    setArastirma(undefined);
    setDenetleme(undefined);
    setVizyon(undefined);
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
      setArastirma(data.arastirma);
      setDenetleme(data.denetleme);
      setVizyon(data.vizyon);
      const karar = data.final_karar ?? JSON.stringify(data);
      setDecision(karar);
      setIsDecisionActive(true);
      setHistory((prev) => [...prev, { id: Date.now(), soru: text, karar }]);
    } catch (error) {
      console.error("Hata:", error);
      const errMsg = `⚠️ ${error instanceof Error ? error.message : "Bağlantı koptu."}`;
      setDecision(errMsg);
      setIsDecisionActive(true);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SynapseAppBar />

      <main className="flex-1 overflow-y-auto pb-20">
        {/* Geçmiş */}
        {history.length > 0 && (
          <div className="px-4 pt-4 space-y-3">
            {history.map((item) => (
              <div key={item.id} className="glass rounded-2xl p-4 border border-white/[0.06]">
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1">
                  {item.soru.length > 60 ? item.soru.slice(0, 60) + "…" : item.soru}
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">{item.karar}</p>
              </div>
            ))}
          </div>
        )}

        {/* Aktif sonuç */}
        <DecisionCard
          decision={decision}
          isActive={isDecisionActive}
          isProcessing={isProcessing}
        />
        <BattleTimeline
          isActive={phase > 0}
          phase={phase}
          arastirma={arastirma}
          denetleme={denetleme}
          vizyon={vizyon}
        />
        <div ref={bottomRef} />
      </main>

      <SynapseInput onSubmit={handleSubmit} isProcessing={isProcessing} />
    </div>
  );
      }
