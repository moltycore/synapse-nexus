import { useState, useCallback } from "react";
import SynapseAppBar from "@/components/SynapseAppBar";
import DecisionCard from "@/components/DecisionCard";
import BattleTimeline from "@/components/BattleTimeline";
import SynapseInput from "@/components/SynapseInput";

export default function Index() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState(0);
  const [decision, setDecision] = useState<string | null>(null);
  const [isDecisionActive, setIsDecisionActive] = useState(false);
  const [arastirma, setArastirma] = useState<string | undefined>();
  const [denetleme, setDenetleme] = useState<string | undefined>();
  const [vizyon, setVizyon] = useState<string | undefined>();

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
      setDecision(data.final_karar ?? JSON.stringify(data));
      setIsDecisionActive(true);
    } catch (error) {
      console.error("Hata:", error);
      setDecision(`⚠️ ${error instanceof Error ? error.message : "Bağlantı koptu."}`);
      setIsDecisionActive(true);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SynapseAppBar />

      <main className="flex-1 overflow-y-auto pb-20">
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
      </main>

      <SynapseInput onSubmit={handleSubmit} isProcessing={isProcessing} />
    </div>
  );
}
