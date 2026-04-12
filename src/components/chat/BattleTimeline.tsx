import { useState } from "react";
import { Cpu, Fingerprint, Zap, Gavel, Search } from "lucide-react";
import { AgentKey } from "@/hooks/synapse/types";

const AGENT_KEYS: AgentKey[] = ["gatekeeper", "core", "ghost", "void", "core_refine", "prime"];

const nodeConfig: { Icon: any; label: string; key: AgentKey }[] = [
  { Icon: Search,      label: "GATEKEEPER", key: "gatekeeper" },
  { Icon: Cpu,         label: "CORE",       key: "core"       },
  { Icon: Fingerprint, label: "GHOST",      key: "ghost"      },
  { Icon: Zap,         label: "VOID",       key: "void"       },
  { Icon: Gavel,       label: "PRIME",      key: "prime"      },
];

interface BattleTimelineProps {
  isActive: boolean;
  isProcessing: boolean;
  activeAgent: AgentKey | null;
  coreData?: string;
  ghostData?: string;
  voidData?: string;
  primeResult?: string;
}

const BattleTimeline = ({
  isActive, 
  isProcessing, 
  activeAgent,
  coreData, 
  ghostData, 
  voidData, 
  primeResult,
}: BattleTimelineProps) => {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  const safeParse = (data?: string) => {
    if (!data) return null;
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return null;
    }
  };

  const getAgentStatus = (key: AgentKey) => {
    if (activeAgent === key) return true;
    if (key === "core" && activeAgent === "core_refine") return true; 
    return false;
  };

  const isNodePassed = (key: AgentKey) => {
    if (!isProcessing || !activeAgent) return false;
    return AGENT_KEYS.indexOf(activeAgent) > AGENT_KEYS.indexOf(key);
  };

  const parsedCore = safeParse(coreData);
  const parsedGhost = safeParse(ghostData);
  const parsedVoid = safeParse(voidData);

  const nodeData: string[][] = [
    ["Intent analysis finalized."],
    parsedCore
      ? [
          ...(parsedCore.assumptions_destroyed || []),
          ...(parsedCore.fundamental_truths || []),
          ...(parsedCore.pure_mechanics || []),
        ]
      : [],
    parsedGhost
      ? (parsedGhost.vulnerabilities || []).map(
          (v: { type: string; detail: string }) => v.detail || "Unknown vulnerability"
        )
      : [],
    parsedVoid ? [...(parsedVoid.directives || [])] : [],
    primeResult ? [primeResult] : [],
  ];

  const handleNode = (i: number) => {
    if (!isActive) return;
    setActiveNode(activeNode === i ? null : i);
  };

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-1.5 mb-3">
        {nodeConfig.map((node, i) => {
          const { Icon } = node;
          const isAgentActive = getAgentStatus(node.key);
          const hasData = nodeData[i]?.length > 0 || isNodePassed(node.key);
          const selected = activeNode === i;

          return (
            <div key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <div
                  className="w-4 h-px transition-all duration-700"
                  style={{
                    background: hasData || isAgentActive ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)",
                  }}
                />
              )}
              <button
                onClick={() => handleNode(i)}
                disabled={!hasData && !isAgentActive}
                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  isAgentActive ? "bg-white/15 border-white/40 scale-110" : selected ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10"
                } ${(hasData || isAgentActive) ? "cursor-pointer" : "cursor-default"}`}
                style={{
                  boxShadow: isAgentActive ? `0 0 10px rgba(255,255,255,0.2)` : "none",
                }}
              >
                <Icon size={12} className={isAgentActive || hasData ? "text-white" : "text-white/20"} />
              </button>
            </div>
          );
        })}
        
        {isProcessing && (
          <div className="flex gap-0.5 ml-2">
            <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>

      {activeNode !== null && nodeData[activeNode]?.length > 0 && (
        <div className="glass rounded-2xl p-4 border border-white/[0.1] transition-all duration-300 mt-2">
          <p className="text-[10px] font-semibold tracking-widest uppercase mb-3 text-white/50">
            {nodeConfig[activeNode].label}
          </p>
          <div className="space-y-2">
            {nodeData[activeNode].map((item, idx) => (
              <div
                key={idx}
                className={`text-xs leading-relaxed flex items-start gap-2 ${
                  activeNode === 2
                    ? "text-red-400/70 italic"
                    : activeNode === 4
                    ? "text-synapse-purple/80"
                    : "text-foreground/75"
                }`}
              >
                <span className="text-white/20 mt-px shrink-0">·</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleTimeline;
