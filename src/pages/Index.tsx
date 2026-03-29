import { useState, useCallback, useRef, useEffect } from "react";
import { Cpu } from "lucide-react";
import SynapseAppBar from "@/components/SynapseAppBar";
import BattleTimeline from "@/components/BattleTimeline";
import SynapseInput from "@/components/SynapseInput";
import ChatMessage from "@/components/ChatMessage"; 

interface YargicData {
  karar: string;
  risk_skoru: number;
  racon: string;
}

interface HistoryItem {
  id: number;
  soru: string;
  racon: string; 
  timestamp: string; 
  sme?: string;
  arastirma?: string;
  denetleme?: string;
  vizyoner_puter?: string;
  yargic?: YargicData;
  mode: "solo" | "nexus";
}

const getTurkishTime = () => {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const p = h >= 12 ? 'ÖS' : 'ÖÖ';
  h = h % 12;
  h = h ? h : 12; 
  return `${p} ${h}:${m}`;
};

export default function Index() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<"solo" | "nexus">("solo");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeItem, setActiveItem] = useState<HistoryItem | null>(null);
  const [currentSoru, setCurrentSoru] = useState<string>("");
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isProcessing]);

  const handleSubmit = useCallback(async (text: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setActiveItem(null);
    setCurrentSoru(text);
    setActiveAgent(null);

    try {
      const response = await fetch("https://synapse-api-b8oc.onrender.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errBody}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("SSE stream not available");

      const decoder = new TextDecoder();
      let buffer = "";
      let finalItem: HistoryItem | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const eventObj = JSON.parse(jsonStr);

            if (eventObj.event === "status") {
              setActiveAgent(eventObj.data ?? null);
            } else if (eventObj.event === "done") {
              const data = eventObj.data;

              let yargicData: YargicData | undefined;
              if (data.yargic) {
                try {
                  const parsed = typeof data.yargic === "string" ? JSON.parse(data.yargic) : data.yargic;
                  yargicData = {
                    karar: parsed.karar ?? "",
                    risk_skoru: parsed.risk_skoru ?? 0,
                    racon: parsed.racon ?? "",
                  };
                } catch (e) {
                  yargicData = undefined;
                }
              }

              if (mode === "solo") {
                finalItem = {
                  id: Date.now(),
                  soru: text,
                  racon: data.solo_cevap ?? "Cevap alınamadı.",
                  timestamp: getTurkishTime(),
                  mode: mode,
                };
              } else {
                finalItem = {
                  id: Date.now(),
                  soru: text,
                  racon: yargicData?.racon ?? "Yargıç mühür basamadı.",
                  timestamp: getTurkishTime(),
                  sme: data.analiz,
                  arastirma: "Birleştirildi.",
                  denetleme: data.denetim,
                  vizyoner_puter: data.vizyon,
                  yargic: yargicData,
                  mode: mode,
                };
              }
            }
          } catch (e) {
            console.error("JSON Parse Hatası:", e);
          }
        }
      }

      if (finalItem) {
        setHistory((prev) => [...prev, finalItem!]);
        setActiveItem(finalItem);
      }
    } catch (error) {
      const errorTime = getTurkishTime();
      const errMsg = `⚠️ ${error instanceof Error ? error.message : "Bağlantı koptu."}`;
      const errItem: HistoryItem = { id: Date.now(), soru: text, racon: errMsg, timestamp: errorTime, mode: mode };
      setHistory((prev) => [...prev, errItem]);
      setActiveItem(errItem);
    } finally {
      setIsProcessing(false);
      setActiveAgent(null);
    }
  }, [isProcessing, mode]);

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <SynapseAppBar />

      <main className="flex-1 overflow-y-auto pb-24 pt-2">
        <div className="px-4 space-y-3">
          {history.map((item) => (
            <ChatMessage 
              key={item.id}
              soru={item.soru}
              racon={item.racon}
              timestamp={item.timestamp}
              mode={item.mode}
            />
          ))}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-end relative">
                <div className="max-w-[78%] bg-synapse-purple/20 border border-synapse-purple/30 rounded-2xl rounded-tr-sm px-4 pt-2 pb-5 overflow-hidden relative">
                  {mode === "nexus" && (
                    <Cpu size={14} className="absolute top-2 right-2 text-synapse-purple/40" />
                  )}
                  <p className={`text-sm text-foreground/90 leading-relaxed break-words ${mode === "nexus" ? "pr-4" : ""}`}>{currentSoru}</p>
                  <span className="absolute bottom-1 right-3 text-[8px] text-muted-foreground/60">{getTurkishTime()}</span>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="glass border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-synapse-purple/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-synapse-purple/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-synapse-purple/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {((isProcessing && mode === "nexus") || (activeItem?.mode === "nexus")) && (
          <div className="mt-4">
            <BattleTimeline
              isActive={true}
              phase={3}
              isProcessing={isProcessing}
              activeAgent={activeAgent}
              sme={activeItem?.sme}
              arastirma={activeItem?.arastirma}
              denetleme={activeItem?.denetleme}
              vizyoner_puter={activeItem?.vizyoner_puter}
              yargic={activeItem?.yargic}
            />
          </div>
        )}
      </main>

      <SynapseInput 
        onSubmit={handleSubmit} 
        isProcessing={isProcessing} 
        mode={mode} 
        setMode={setMode} 
      />
    </div>
  );
}
