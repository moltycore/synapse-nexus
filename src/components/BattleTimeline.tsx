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

// Renk cümbüşü iptal edildi. Tamamı sönük/parlak beyaz tonlarında çalışacak.
const nodeConfig = [
  { Icon: Database, label: "ANALİZCİ", key: "analizci", strikethrough: false },
  { Icon: ShieldAlert, label: "DENETÇİ", key: "denetci", strikethrough: true },
  { Icon: Eye, label: "VİZYONER", key: "vizyoner", strikethrough: false },
  { Icon: Gavel, label: "YARGIÇ", key: "yargic", strikethrough: false },
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
    // Otomatik kart açma komutları kaldırıldı.
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
          
          const hasData = (apiItems[oi]?.length > 0) || (rawTexts[oi] && !isPlaceholder(rawTexts[oi])) || (oi === 3 && !!yargic);
          const selected = activeNode === oi;

          // DİSİPLİN KURALI: Pavyon renkleri yasak. Aktifken parlak beyaz, inaktifken sönük beyaz.
          const isHighlighted = isAgentActive || (selected && hasData);
          const iconColorClass = isHighlighted ? "text-white" : "text-white/30";
          const buttonBgClass = isHighlighted ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10";
          
          // Ufak bir parlama (Glow) efekti, ama o da beyaz.
          const glowBoxShadow = isAgentActive ? `0 0 10px rgba(255,255,255,0.3)` : (isHighlighted ? `0 0 6px rgba(255,255,255,0.15)` : "none");

          return (
            <div key={oi} className="flex items-center gap-1.5 relative">
              {oi > 0 && (
                <div
                  className="w-4 h-px rounded-full transition-all duration-700"
                  style={{
                    // Çizgiler artık renkli gradyan değil. Veri varsa belirgin beyaz, yoksa çok şeffaf beyaz.
                    background: hasData || isAgentActive ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)", 
                  }}
                />
              )}
              
              <button
                onClick={() => handleNode(oi)}
                disabled={!hasData || isProcessing}
                className={`
                  relative flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-400
                  ${buttonBgClass}
                  ${selected && !isProcessing ? "scale-110" : "scale-100"}
                  ${hasData && !isProcessing ? "cursor-pointer hover:scale-105 hover:bg-white/15" : "cursor-default"}
                `}
                style={{ boxShadow: glowBoxShadow }}
              >
                <Icon
                  size={12}
                  className={`transition-colors duration-300 ${iconColorClass}`} 
                  strokeWidth={1.75}
                />
                
                {isAgentActive && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-40"
                    style={{ border: `1.5px solid rgba(255,255,255,0.4)`, animationDuration: "1.2s" }}
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
              className={`glass rounded-2xl p-4 border transition-all duration-300 border-white/20 mt-2 overflow-hidden relative`}
              style={{ boxShadow: `0 0 15px rgba(255,255,255,0.05)` }}
            >
              <p className={`text-[10px] font-semibold tracking-widest uppercase mb-4 text-white/70`}>
                {node.label}
              </p>

              <p className="text-sm italic leading-relaxed text-white/90 break-words whitespace-pre-wrap">
                "{yargic.racon}"
              </p>
            </div>
          );
        }

        return (
          <div
            className={`glass rounded-2xl p-4 border transition-all duration-300 border-white/20 mt-2 overflow-hidden`}
            style={{ boxShadow: `0 0 15px rgba(255,255,255,0.05)` }}
          >
            <p className={`text-[10px] font-semibold tracking-widest uppercase mb-3 text-white/70`}>
              {node.label}
            </p>
            <div className="space-y-2">
              {rawTexts[activeNode] ? (
                <p className="text-xs leading-relaxed text-white/80 whitespace-pre-wrap break-words">
                  {rawTexts[activeNode]}
                </p>
              ) : (
                apiItems[activeNode]?.map((item, i) => (
                  <div
                    key={i}
                    className={`text-xs leading-relaxed flex items-start gap-2 ${
                      node.strikethrough ? "line-through text-white/40 decoration-white/30" : "text-white/80"
                    }`}
                  >
                    <span className="text-white/20 mt-px shrink-0">·</span>
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
