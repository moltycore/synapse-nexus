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

  const handleSubmit = useCallback(async (text: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setDecision(null);
    setIsDecisionActive(false);
    setPhase(1);

    try {
      setTimeout(() => setPhase(2), 2000);
      setTimeout(() => setPhase(3), 4000);

      const response = await fetch("https://synapse-api-b8oc.onrender.com/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Sunucu patladı.");

      const data = await response.json();
      setDecision(data.final_karar);
      setIsDecisionActive(true);
    } catch (error) {
      console.error("Hata:", error);
      setDecision("⚠️ Bağlantı koptu. Motor cevap vermiyor.");
      setIsDecisionActive(true);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SynapseAppBar />

      <main className="flex-1 overflow-y-auto pb-20">
        <DecisionCard decision={decision} isActive={isDecisionActive} />
        <BattleTimeline isActive={phase > 0} phase={phase} />
      </main>

      <SynapseInput onSubmit={handleSubmit} isProcessing={isProcessing} />
    </div>
  );
}
