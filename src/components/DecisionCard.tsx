import { useEffect, useState } from "react";

interface DecisionCardProps {
  decision: string | null;
  isActive: boolean;
  isProcessing?: boolean;
}

const loadingSteps = [
  "Araştırıyor",
  "Değerlendiriyor",
  "Sentezliyor",
];

const DecisionCard = ({ decision, isActive, isProcessing = false }: DecisionCardProps) => {
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingVisible, setLoadingVisible] = useState(true);

  // Typewriter effect
  useEffect(() => {
    if (!decision) {
      setDisplayed("");
      return;
    }
    setDisplayed("");
    setTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(decision.slice(0, i));
      if (i >= decision.length) {
        clearInterval(interval);
        setTyping(false);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [decision]);

  // Loading step cycle
  useEffect(() => {
    if (!isProcessing) {
      setLoadingStep(0);
      setLoadingVisible(true);
      return;
    }
    const cycle = setInterval(() => {
      setLoadingVisible(false);
      setTimeout(() => {
        setLoadingStep((s) => (s + 1) % loadingSteps.length);
        setLoadingVisible(true);
      }, 300);
    }, 1800);
    return () => clearInterval(cycle);
  }, [isProcessing]);

  return (
    <div className="px-4 pt-6 pb-4">
      <div
        className={`glass-strong rounded-2xl p-6 transition-all duration-700 ${
          isActive ? "glow-purple-active animate-float-glow" : "glow-purple"
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${
            isActive || isProcessing ? "bg-synapse-purple animate-pulse" : "bg-muted-foreground/30"
          }`} />
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium">
            Sinaptik Yanıt
          </span>
        </div>

        {isProcessing ? (
          <div className="flex items-center gap-2 min-h-[32px]">
            <p
              className={`font-display text-lg text-synapse-purple/80 transition-opacity duration-300 ${
                loadingVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {loadingSteps[loadingStep]}
              <span className="animate-pulse">...</span>
            </p>
          </div>
        ) : displayed ? (
          <p className="font-display text-xl leading-snug text-foreground">
            {displayed}
            {typing && (
              <span className="inline-block w-0.5 h-5 bg-synapse-purple ml-0.5 animate-pulse align-middle" />
            )}
          </p>
        ) : (
          <div className="space-y-2.5">
            <div className="h-5 bg-white/[0.04] rounded-md w-4/5" />
            <div className="h-5 bg-white/[0.03] rounded-md w-3/5" />
            <p className="text-xs text-muted-foreground/50 mt-3 italic">
              Sentez bekleniyor…
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionCard;
