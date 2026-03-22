import { useState, useCallback } from "react";
import SynapseAppBar from "@/components/SynapseAppBar";
import DecisionCard from "@/components/DecisionCard";
import BattleTimeline from "@/components/BattleTimeline";
import SynapseInput from "@/components/SynapseInput";

const DEMO_DECISION =
  "Build the open integration protocol — not the product. License the ecosystem, capture the 10x TAM, and let competitors build on your rails.";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState(0);
  const [decision, setDecision] = useState<string | null>(null);
  const [isDecisionActive, setIsDecisionActive] = useState(false);

  const handleSubmit = useCallback((text: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setDecision(null);
    setIsDecisionActive(false);
    setPhase(0);

    // Simulate the cross-examination flow
    setTimeout(() => setPhase(1), 400);
    setTimeout(() => setPhase(2), 1200);
    setTimeout(() => setPhase(3), 2000);
    setTimeout(() => {
      setDecision(DEMO_DECISION);
      setIsDecisionActive(true);
      setIsProcessing(false);
    }, 2800);
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
};

export default Index;
