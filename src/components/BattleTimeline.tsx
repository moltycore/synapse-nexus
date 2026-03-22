import { useState } from "react";
import { Search, Scale, Lightbulb } from "lucide-react";

interface BattleTimelineProps {
  isActive: boolean;
  phase: number;
  arastirma?: string;
  denetleme?: string;
  vizyon?: string;
}

const nodeConfig = [
  {
    Icon: Search,
    label: "Araştırmacı",
    accentClass: "text-blue-400",
    glowColor: "rgba(59,130,246,0.6)",
    borderColor: "border-blue-500/40",
    bgActive: "bg-blue-500/15",
    bgIdle: "bg-white/5",
    strikethrough: false,
  },
  {
    Icon: Scale,
    label: "Eleştirici",
    accentClass: "text-red-400",
    glowColor: "rgba(239,68,68,0.6)",
    borderColor: "border-red-500/40",
    bgActive: "bg-red-500/15",
    bgIdle: "bg-white/5",
    strikethrough: true,
  },
  {
    Icon: Lightbulb,
    label: "Vizyoner",
    accentClass: "text-yellow-400",
    glowColor: "rgba(234,179,8,0.6)",
    borderColor: "border-yellow-500/40",
    bgActive: "bg-yellow-500/15",
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

const BattleTimeline = ({ isActive, phase, arastirma, denetleme, vizyon }: BattleTimelineProps) => {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  const apiItems = [
    parseItems(arastirma),
    parseItems(denetleme),
    parseItems(vizyon),
  ];

  const handleNode = (i: number) => {
    if (!isActive || phase < i + 1) return;
    setActiveNode(activeNode === i ? null : i);
  };

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center gap-2 mb-3">
        {nodeConfig.map((node, i) => {
          const { Icon } = node;
          const unlocked = isActive && phase >= i + 1;
          const selected = activeNode === i;

          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className="w-6 h-px rounded-full transition-all duration-700"
                  style={{
                    background: unlocked
                      ? `linear-gradient(90deg, ${nodeConfig[i - 1].glowColor}, ${node.glowColor})`
                      : "rgba(255,255,255,0.08)",
                  }}
                />
              )}

              <button
                onClick={() => handleNode(i)}
                disabled={!unlocked}
                className={`
                  relative flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-400
                  ${unlocked ? node.bgActive + " " + node.borderColor : node.bgIdle + " border-white/10"}
                  ${selected ? "scale-110" : "scale-100"}
                  ${unlocked ? "cursor-pointer hover:scale-105" : "cursor-default opacity-30"}
                `}
                style={{
                  boxShadow: unlocked && selected ? `0 0 16px ${node.glowColor}` : "none",
                }}
              >
                <Icon
                  size={16}
                  className={`transition-colors duration-300 ${unlocked ? node.accentClass : "text-muted-foreground/30"}`}
                  strokeWidth={1.75}
                />
                {unlocked && !selected && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-20"
                    style={{ border: `1.5px solid ${node.glowColor}` }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {activeNode !== null && isActive && (
        <div
          className={`glass rounded-2xl p-4 border transition-all duration-300 ${nodeConfig[activeNode].borderColor}`}
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
