import { useState, useEffect } from "react";
import { Cpu, Fingerprint, Zap, Gavel, Search } from "lucide-react";

// Agent anahtarlarını engine ile senkronize ediyoruz.
const AGENT_KEYS = ["gatekeeper", "core", "ghost", "void", "core_refine", "prime"];

const nodeConfig = [
  { Icon: Search, label: "GATEKEEPER", key: "gatekeeper" },
  { Icon: Cpu, label: "CORE", key: "core" },
  { Icon: Fingerprint, label: "GHOST", key: "ghost" },
  { Icon: Zap, label: "VOID", key: "void" },
  { Icon: Gavel, label: "PRIME", key: "prime" },
];

interface BattleTimelineProps {
  isActive: boolean;
  isProcessing: boolean;
  activeAgent: string | null;
  sme: any;
  denetleme: any;
  vizyoner_puter: any;
  yargic: any;
}

const BattleTimeline = ({
  isActive, isProcessing, activeAgent,
  sme, denetleme, vizyoner_puter, yargic,
}: BattleTimelineProps) => {

  // UI'da Core Refine olduğunda CORE simgesini parlatmaya devam etmesi için ufak bir trick:
  const getAgentStatus = (key: string) => {
    if (activeAgent === key) return true;
    if (key === "core" && activeAgent === "core_refine") return true; // Refine sırasında CORE parlasın
    return false;
  };

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-1.5 mb-2">
        {nodeConfig.map((node, oi) => {
          const isAgentActive = getAgentStatus(node.key);
          const hasData = (oi === 0 && activeAgent) || 
                          (oi === 1 && sme) || 
                          (oi === 2 && denetleme) || 
                          (oi === 3 && vizyoner_puter) || 
                          (oi === 4 && yargic);
          
          return (
            <div key={oi} className="flex items-center gap-1.5 relative">
              {oi > 0 && (
                <div className="w-4 h-px transition-all duration-700"
                     style={{ background: hasData || isAgentActive ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)" }} />
              )}
              <button className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${isAgentActive ? "bg-white/15 border-white/40" : "bg-white/5 border-white/10"}`}>
                <node.Icon size={12} className={isAgentActive || hasData ? "text-white" : "text-white/20"} />
              </button>
            </div>
          );
        })}
      </div>
      {/* Kart içerikleri burada devam ediyor */}
    </div>
  );
};

export default BattleTimeline;
