import { useState, useEffect } from "react";
import { Database, ShieldAlert, Eye, Gavel } from "lucide-react";

interface YargicData {
  karar: string;
  risk_skoru: number;
  racon: string;
}

interface BattleTimelineProps {
  isActive: boolean;
  phase: number;
  isProcessing?: boolean;
  activeAgent?: string | null;
  sme?: string;
  arastirma?: string;
  denetleme?: string;
  vizyoner_puter?: string;
  yargic?: YargicData;
}

const AGENT_KEYS = ["analizci", "denetci", "vizyoner", "yargic"];

const nodeConfig = [
  { Icon: Database, label: "ANALİZCİ", key: "analizci", accentClass: "text-slate-400", glowColor: "rgba(148,163,184,0.6)", borderColor: "border-slate-500/40", bgActive: "bg-slate-500/15" },
  { Icon: ShieldAlert, label: "DENETÇİ", key: "denetci", accentClass: "text-red-400", glowColor: "rgba(239,68,68,0.6)", borderColor: "border-red-500/40", bgActive: "bg-red-500/15", strikethrough: true },
  { Icon: Eye, label: "VİZYONER", key: "vizyoner", accentClass: "text-amber-400", glowColor: "rgba(245,158,11,0.6)", borderColor: "border-amber-500/40", bgActive: "bg-amber-500/15" },
  { Icon: Gavel, label: "YARGIÇ", key: "yargic", accentClass: "text-emerald-400", glowColor: "rgba(16,185,129,0.6)", borderColor: "border-emerald-500/40", bgActive: "bg-emerald-500/15" },
];

const PLACEHOLDER_VALUES = ["uykuda.", "pas geçildi.", "gerekli görülmedi.", "pas.", "pas", "uykuda", "gerekli görülmedi"];

function isPlaceholder(text?: string): boolean {
  if (!text) return true;
  return PLACEHOLDER_VALUES.includes(text.trim().toLowerCase());
}

function parseItems(text?: string): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*[\d\-\*\•\·]+[\.\):]?\s*/, "").replace(/\*\*/g, "").trim())
    .filter((line) => line.length > 0);
}

const BattleTimeline = ({
  isActive, isProcessing, activeAgent,
  sme, denetleme, vizyoner_puter, yargic,
}: BattleTimelineProps) => {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  useEffect(() => {
    if (!isProcessing && yargic) {
      setActiveNode(3);
    } else if (!isProcessing && sme && activeNode === null) {
      setActiveNode(0);
    }
  }, [isProcessing, yargic, sme, activeNode]);

  const rawTexts: (string | undefined)[] = [sme, denetleme, vizyoner_puter, undefined];
  const apiItems = rawTexts.map((t) => parseItems(t));

  const handleNode = (oi: number) => {
    if (!isActive || isProcessing) return;
    setActiveNode(activeNode === oi ? null : oi);
  };

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-1.5 mb-2">
        {nodeConfig.map((node, oi) => {
          const { Icon } = node;
          const isAgentActive = isProcessing && activeAgent === AGENT_KEYS[oi];
          
          const unlocked = isProcessing || (isActive && (
            (apiItems[oi]?.length > 0) || 
            (rawTexts[oi] && !isPlaceholder(rawTexts[oi])) || 
            (oi === 3 && !!yargic)
          ));
          
          const selected = activeNode === oi;

          return (
            <div key={oi} className="flex items-center gap-1.5 relative">
              {oi > 0 && (
                <div
                  className="w-4 h-px rounded-full transition-all duration-700"
                  style={{
                    background: unlocked
                      ? `linear-gradient(90deg, ${nodeConfig[oi - 1].glowColor}, ${node.glowColor})`
                      : "rgba(255,255,255,0.08)", 
                  }}
                />
              )}
              
              <button
                onClick={() => handleNode(oi)}
                disabled={!unlocked || isProcessing}
                className={`
                  relative flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-400
                  ${unlocked ? node.bgActive + " " + node.borderColor : "bg-white/5 border-white/10"}
                  ${selected && !isProcessing ? "scale-110" : "scale-100"}
                  ${unlocked && !isProcessing ? "cursor-pointer hover:scale-105" : "cursor-default"}
                `}
                style={{
                  boxShadow: isAgentActive ? `0 0 14px ${node.glowColor}` : (unlocked && selected ? `0 0 10px ${node.glowColor}` : "none"),
                }}
              >
                <Icon
                  size={12}
                  className={`transition-colors duration-300 ${isAgentActive ? node.accentClass : (unlocked ? node.accentClass : "text-white opacity-30")}`} 
                  strokeWidth={1.75}
                />
                
                {isAgentActive && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-40"
                    style={{ border: `1.5px solid ${node.glowColor}`, animationDuration: "1.2s" }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {isProcessing && (
        <div className="glass rounded-2xl p-4 border border-white/10 mt-2">
          <div className="h-3 w-32 bg-white/10 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="h-2 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-2 w-5/6 bg-white/5 rounded animate-pulse" />
            <div className="h-2 w-4/6 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      )}

      {activeNode !== null && !isProcessing && isActive && (() => {
        const node = nodeConfig[activeNode];

        if (activeNode === 3 && yargic) {
          return (
            <div
              className={`glass rounded-2xl p-4 border transition-all duration-300 ${node.borderColor} mt-2 overflow-hidden relative`}
              style={{ boxShadow: `0 0 18px ${node.glowColor}18` }}
            >
              <p className={`text-[10px] font-semibold tracking-widest uppercase mb-4 ${node.accentClass}`}>
                {node.label}
              </p>

              <p className="text-sm italic leading-relaxed text-foreground/80 break-words whitespace-pre-wrap">
                "{yargic.racon}"
              </p>
            </div>
          );
        }

        return (
          <div
            className={`glass rounded-2xl p-4 border transition-all duration-300 ${node.borderColor} mt-2 overflow-hidden`}
            style={{ boxShadow: `0 0 18px ${node.glowColor}18` }}
          >
            <p className={`text-[10px] font-semibold tracking-widest uppercase mb-3 ${node.accentClass}`}>
              {node.label}
            </p>
            <div className="space-y-2">
              {rawTexts[activeNode] ? (
                <p className="text-xs leading-relaxed text-foreground/75 whitespace-pre-wrap break-words">
                  {rawTexts[activeNode]}
                </p>
              ) : (
                apiItems[activeNode]?.map((item, i) => (
                  <div
                    key={i}
                    className={`text-xs leading-relaxed flex items-start gap-2 ${
                      node.strikethrough ? "line-through text-red-400/50 decoration-red-400/30" : "text-foreground/75"
                    }`}
                  >
                    <span className="text-muted-foreground/30 mt-px shrink-0">·</span>
                    <span className="break-words">{item}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default BattleTimeline;
