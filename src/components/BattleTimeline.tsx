import { useState, useEffect, useRef } from "react";
import { Database, Search, ShieldAlert, Gavel, Check } from "lucide-react";

interface BattleTimelineProps {
  isActive: boolean;
  phase: number; // 0=idle, 1=SME, 2=Araştırma, 3=Denetleme, 4=Moderatör
  isProcessing?: boolean;
  sme?: string;
  arastirma?: string;
  denetleme?: string;
  moderator?: string;
}

const nodeConfig = [
  {
    Icon: Database,
    label: "SME",
    provider: "Openrouter",
    accentClass: "text-slate-400",
    glowColor: "rgba(148,163,184,0.6)",
    borderColor: "border-slate-500/40",
    bgActive: "bg-slate-500/15",
    bgIdle: "bg-white/5",
    strikethrough: false,
    statusMessages: [
      "Teknik veri topluyor...",
      "Modelleri karşılaştırıyor...",
      "Planlıyor...",
    ],
    thoughtBubbles: [
      "Veri kaynakları taranıyor",
      "Teknik analiz yapılıyor",
      "Sonuçlar derleniyor",
    ],
  },
  {
    Icon: Search,
    label: "Araştırmacı",
    provider: "Groq",
    accentClass: "text-blue-400",
    glowColor: "rgba(59,130,246,0.6)",
    borderColor: "border-blue-500/40",
    bgActive: "bg-blue-500/15",
    bgIdle: "bg-white/5",
    strikethrough: false,
    statusMessages: [
      "Haber tarıyor...",
      "Kaynakları doğruluyor...",
      "Saha verisi derliyor...",
    ],
    thoughtBubbles: [
      "Güncel haberler kontrol ediliyor",
      "Kaynak güvenilirliği analizi",
      "Bulgular özetleniyor",
    ],
  },
  {
    Icon: ShieldAlert,
    label: "Denetçi",
    provider: "Groq",
    accentClass: "text-red-400",
    glowColor: "rgba(239,68,68,0.6)",
    borderColor: "border-red-500/40",
    bgActive: "bg-red-500/15",
    bgIdle: "bg-white/5",
    strikethrough: true,
    statusMessages: [
      "Hataları ayıklıyor...",
      "Riskleri tarıyor...",
      "Çelişkileri buluyor...",
    ],
    thoughtBubbles: [
      "Mantık hataları aranıyor",
      "Siyah kuğu senaryoları",
      "Zayıf noktalar işaretleniyor",
    ],
  },
  {
    Icon: Gavel,
    label: "Moderatör",
    provider: "DeepSeek",
    accentClass: "text-emerald-400",
    glowColor: "rgba(16,185,129,0.6)",
    borderColor: "border-emerald-500/40",
    bgActive: "bg-emerald-500/15",
    bgIdle: "bg-white/5",
    strikethrough: false,
    statusMessages: [
      "Sentezliyor...",
      "Nihai karar yazılıyor...",
      "Ağırlıkları hesaplıyor...",
    ],
    thoughtBubbles: [
      "Tüm görüşler tartılıyor",
      "Karar matrisi oluşturuluyor",
      "Final sentez hazırlanıyor",
    ],
  },
];

function parseItems(text?: string): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) =>
      line.replace(/^\s*[\d\-\*\•\·]+[\.\):]?\s*/, "").replace(/\*\*/g, "").trim()
    )
    .filter((line) => line.length > 0);
}

const BattleTimeline = ({
  isActive,
  phase,
  isProcessing,
  sme,
  arastirma,
  denetleme,
  moderator,
}: BattleTimelineProps) => {
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [statusIndices, setStatusIndices] = useState([0, 0, 0, 0]);
  const [thoughtVisible, setThoughtVisible] = useState<number | null>(null);
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Veri geldiğinde ilk node'u otomatik aç
  useEffect(() => {
    if (!isProcessing && sme) {
      setActiveNode(0);
    }
  }, [isProcessing, sme]);

  // Aktif fazın durum mesajlarını ve düşünce balonlarını döndür
  useEffect(() => {
    if (!isProcessing) {
      setThoughtVisible(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const activePhaseNode = phase > 0 ? phase - 1 : null;
    setThoughtVisible(activePhaseNode);
    setThoughtIndex(0);

    intervalRef.current = setInterval(() => {
      setStatusIndices((prev) => {
        const next = [...prev];
        if (activePhaseNode !== null) {
          next[activePhaseNode] =
            (next[activePhaseNode] + 1) %
            nodeConfig[activePhaseNode].statusMessages.length;
        }
        return next;
      });
      setThoughtIndex((prev) => (prev + 1) % 3);
    }, 2200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isProcessing, phase]);

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

  // Aktif faz node indeksi (0-indexed)
  const activePhaseIdx = phase > 0 ? phase - 1 : -1;

  return (
    <div className="px-4 pb-4">
      {/* Node'lar - Yatay düzen */}
      <div className="flex items-start justify-between gap-1 mb-2">
        {nodeConfig.map((node, i) => {
          const { Icon } = node;
          const unlocked = isProcessing || (isActive && apiItems[i].length > 0);
          const selected = activeNode === i;
          const isCurrentPhase = isProcessing && activePhaseIdx === i;
          const isPastPhase = isProcessing && activePhaseIdx > i;
          // Groq nodes (index 1,2) blink; others pulse
          const isGroq = node.provider === "Groq";

          return (
            <div key={i} className="flex flex-col items-center relative" style={{ flex: 1 }}>
              {/* Bağlantı çizgisi (node'ların arasında) */}
              <div className="flex items-center w-full justify-center">
                {i > 0 && (
                  <div
                    className={`h-px flex-1 rounded-full transition-all duration-700 -mr-1 ${
                      isProcessing && activePhaseIdx >= i ? "opacity-100" : ""
                    }`}
                    style={{
                      background:
                        unlocked || (isProcessing && activePhaseIdx >= i)
                          ? `linear-gradient(90deg, ${nodeConfig[i - 1].glowColor}, ${node.glowColor})`
                          : "rgba(255,255,255,0.06)",
                      height: isProcessing && activePhaseIdx >= i ? "2px" : "1px",
                    }}
                  />
                )}

                {/* İkon düğümü */}
                <button
                  onClick={() => handleNode(i)}
                  disabled={!unlocked || isProcessing}
                  className={`
                    relative flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-400 shrink-0
                    ${unlocked ? node.bgActive + " " + node.borderColor : node.bgIdle + " border-white/10"}
                    ${selected && !isProcessing ? "scale-110" : "scale-100"}
                    ${unlocked && !isProcessing ? "cursor-pointer hover:scale-105" : "cursor-default"}
                    ${isCurrentPhase && !isGroq ? "animate-[heartbeat_1s_ease-in-out_infinite]" : ""}
                    ${isCurrentPhase && isGroq ? "animate-[blink_0.6s_ease-in-out_infinite]" : ""}
                    ${isPastPhase ? "" : ""}
                  `}
                  style={{
                    boxShadow:
                      isCurrentPhase
                        ? `0 0 16px ${node.glowColor}, 0 0 32px ${node.glowColor}40`
                        : unlocked && selected
                        ? `0 0 10px ${node.glowColor}`
                        : isPastPhase
                        ? `0 0 8px rgba(16,185,129,0.3)`
                        : "none",
                    borderColor: isPastPhase ? "rgba(16,185,129,0.5)" : undefined,
                    background: isPastPhase ? "rgba(16,185,129,0.12)" : undefined,
                  }}
                >
                  <Icon
                    size={14}
                    className={`transition-colors duration-300 ${
                      unlocked ? node.accentClass : "text-muted-foreground/30"
                    }`}
                    strokeWidth={1.75}
                  />
                  {isCurrentPhase && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping opacity-20"
                      style={{
                        border: `1.5px solid ${node.glowColor}`,
                        animationDuration: "1.5s",
                      }}
                    />
                  )}
                </button>

                {i < nodeConfig.length - 1 && (
                  <div
                    className={`h-px flex-1 rounded-full transition-all duration-700 -ml-1`}
                    style={{
                      background:
                        unlocked || (isProcessing && activePhaseIdx > i)
                          ? `linear-gradient(90deg, ${node.glowColor}, ${nodeConfig[i + 1].glowColor})`
                          : "rgba(255,255,255,0.06)",
                      height: isProcessing && activePhaseIdx > i ? "2px" : "1px",
                    }}
                  />
                )}
              </div>

              {/* Durum etiketi - ikon altı */}
              <div className="mt-1.5 text-center h-8 flex flex-col items-center overflow-hidden">
                <span
                  className={`text-[9px] font-medium tracking-wide transition-colors duration-300 ${
                    isCurrentPhase ? node.accentClass : "text-muted-foreground/40"
                  }`}
                >
                  {node.label}
                </span>
                {isCurrentPhase && (
                  <span
                    className={`text-[8px] mt-0.5 truncate max-w-[72px] transition-opacity duration-500 ${node.accentClass} opacity-60`}
                  >
                    {node.provider}: {node.statusMessages[statusIndices[i]]}
                  </span>
                )}
                {!isProcessing && isPastPhase === false && apiItems[i].length > 0 && (
                  <span className="text-[8px] mt-0.5 text-muted-foreground/30">
                    Tamamlandı ✓
                  </span>
                )}
              </div>

              {/* Düşünce Balonu */}
              {thoughtVisible === i && isProcessing && (
                <div
                  className="absolute -top-12 left-1/2 -translate-x-1/2 animate-fade-in z-10"
                  style={{ filter: `drop-shadow(0 0 8px ${node.glowColor}40)` }}
                >
                  <div
                    className={`relative px-2.5 py-1 rounded-lg border text-[8px] whitespace-nowrap ${node.borderColor} ${node.bgActive} ${node.accentClass}`}
                    style={{ opacity: 0.85 }}
                  >
                    {node.thoughtBubbles[thoughtIndex]}
                    {/* Balon kuyruğu */}
                    <div
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-b border-r ${node.borderColor} ${node.bgActive}`}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bekleme Skeleton */}
      {isProcessing && (
        <div className="glass rounded-2xl p-4 border border-white/10 mt-2 overflow-hidden">
          <div className="h-3 w-32 bg-white/10 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="h-2 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-2 w-5/6 bg-white/5 rounded animate-pulse" />
            <div className="h-2 w-4/6 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      )}

      {/* Gerçek Veri */}
      {activeNode !== null && !isProcessing && isActive && (
        <div
          className={`glass rounded-2xl p-4 border transition-all duration-300 overflow-hidden ${nodeConfig[activeNode].borderColor} mt-2`}
          style={{ boxShadow: `0 0 18px ${nodeConfig[activeNode].glowColor}18` }}
        >
          <p
            className={`text-[10px] font-semibold tracking-widest uppercase mb-3 ${nodeConfig[activeNode].accentClass}`}
          >
            {nodeConfig[activeNode].label}
          </p>
          <div className="space-y-2">
            {apiItems[activeNode].map((item, i) => (
              <div
                key={i}
                className={`text-xs leading-relaxed flex items-start gap-2 break-words [overflow-wrap:break-word] ${
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
