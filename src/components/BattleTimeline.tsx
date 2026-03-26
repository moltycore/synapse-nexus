import { useState, useEffect } from "react";
import { Database, Search, ShieldAlert, Gavel } from "lucide-react";

interface BattleTimelineProps {
  isActive: boolean;
  phase: number;
  isProcessing?: boolean; // Bekleme tiyatrosunu tetikleyecek anahtar
  sme?: string;
  arastirma?: string;
  denetleme?: string;
  moderator?: string;
}

const nodeConfig = [
  {
    Icon: Database,
    label: "SME (Teknik Veri)",
    accentClass: "text-slate-400",
    glowColor: "rgba(148,163,184,0.6)",
    borderColor: "border-slate-500/40",
    bgActive: "bg-slate-500/15",
    bgIdle: "bg-white/5",
    strikethrough: false,
  },
  {
    Icon: Search,
    label: "Saha Araştırmacısı",
    accentClass: "text-blue-400",
    glowColor: "rgba(59,130,246,0.6)",
    borderColor: "border-blue-500/40",
    bgActive: "bg-blue-500/15",
    bgIdle: "bg-white/5",
    strikethrough: false,
  },
  {
    Icon: ShieldAlert,
    label: "Denetçi (Siyah Kuğu)",
    accentClass: "text-red-400",
    glowColor: "rgba(239,68,68,0.6)",
    borderColor: "border-red-500/40",
    bgActive: "bg-red-500/15",
    bgIdle: "bg-white/5",
    strikethrough: true, // Denetçi vurdu mu çizer
  },
  {
    Icon: Gavel,
    label: "Moderatör (DeepSeek)",
    accentClass: "text-emerald-400",
    glowColor: "rgba(16,185,129,0.6)",
    borderColor: "border-emerald-500/40",
    bgActive: "bg-emerald-500/15",
    bgIdle: "bg-white/5",
    strikethrough: false,
  },
];

function parseItems(text?: string): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*[\d\-\*\•\·]+[\.\):]?\s*/, "").replace(/\*\*/g, "").trim())
    .filter((line) => line.length > 0);
}

const BattleTimeline = ({ isActive, phase, isProcessing, sme, arastirma, denetleme, moderator }: BattleTimelineProps) => {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  // Veri geldiğinde ilk node'u (SME) otomatik açmak için
  useEffect(() => {
    if (!isProcessing && sme) {
      setActiveNode(0);
    }
  }, [isProcessing, sme]);

  const apiItems = [
    parseItems(sme),
    parseItems(arastirma),
    parseItems(denetleme),
    parseItems(moderator),
  ];

  const handleNode = (i: number) => {
    if (!isActive || isProcessing) return;
    setActiveNode(activeNode === i ? null : i);
  };

  return (
    <div className="px-4 pb-4">
      {/* İkonlar ve Bağlantı Çizgileri */}
      <div className="flex items-center gap-1.5 mb-2">
        {nodeConfig.map((node, i) => {
          const { Icon } = node;
          // Eğer işlem sürüyorsa hepsi potansiyel olarak aktifmiş gibi davransın
          const unlocked = isProcessing || (isActive && apiItems[i].length > 0);
          const selected = activeNode === i;

          return (
            <div key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <div
                  className={`w-4 h-px rounded-full transition-all duration-700 ${isProcessing ? 'animate-pulse' : ''}`}
                  style={{
                    background: unlocked
                      ? `linear-gradient(90deg, ${nodeConfig[i - 1].glowColor}, ${node.glowColor})`
                      : "rgba(255,255,255,0.08)",
                  }}
                />
              )}

              <button
                onClick={() => handleNode(i)}
                disabled={!unlocked || isProcessing}
                className={`
                  relative flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-400
                  ${unlocked ? node.bgActive + " " + node.borderColor : node.bgIdle + " border-white/10"}
                  ${selected && !isProcessing ? "scale-110" : "scale-100"}
                  ${unlocked && !isProcessing ? "cursor-pointer hover:scale-105" : "cursor-default"}
                  ${isProcessing ? "animate-pulse" : ""}
                `}
                style={{
                  boxShadow: unlocked && (selected || isProcessing) ? `0 0 10px ${node.glowColor}` : "none",
                }}
              >
                <Icon
                  size={12}
                  className={`transition-colors duration-300 ${unlocked ? node.accentClass : "text-muted-foreground/30"}`}
                  strokeWidth={1.75}
                />
                {/* İşlem sürüyorsa tüm ikonlar etrafında radar gibi dönen bir ping efekti */}
                {isProcessing && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-30"
                    style={{ border: `1px solid ${node.glowColor}`, animationDuration: '1.5s', animationDelay: `${i * 200}ms` }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bekleme Tiyatrosu (Skeleton UI) */}
      {isProcessing && (
        <div className="glass rounded-2xl p-4 border border-white/10 mt-2">
          <div className="h-3 w-32 bg-white/10 rounded animate-pulse mb-4"></div>
          <div className="space-y-3">
            <div className="h-2 w-full bg-white/5 rounded animate-pulse"></div>
            <div className="h-2 w-5/6 bg-white/5 rounded animate-pulse"></div>
            <div className="h-2 w-4/6 bg-white/5 rounded animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Gerçek Veri Gösterimi */}
      {activeNode !== null && !isProcessing && isActive && (
        <div
          className={`glass rounded-2xl p-4 border transition-all duration-300 ${nodeConfig[activeNode].borderColor} mt-2`}
          style={{ boxShadow: `0 0 18px ${nodeConfig[activeNode].glowColor}18` }}
        >
          <p className={`text-[10px] font-semibold tracking-widest uppercase mb-3 ${nodeConfig[activeNode].accentClass}`}>
            {nodeConfig[activeNode].label}
          </p>
          <div className="space-y-2">
            {apiItems[activeNode].map((item, i) => (
              <div
                key={i}
                className={`text-xs leading-relaxed flex items-start gap-2 ${
                  nodeConfig[activeNode].strikethrough
                    ? "line-through text-red-400/50 decoration-red-400/30"
                    : "text-foreground/75"
                }`}
              >
                <span className="text-muted-foreground/30 mt-px shrink-0">·</span>
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
