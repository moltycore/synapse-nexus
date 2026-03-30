import { useState, useCallback, useRef, useEffect } from "react";
import { Cpu } from "lucide-react";
import SynapseAppBar from "@/components/SynapseAppBar";
import BattleTimeline from "@/components/BattleTimeline";
import SynapseInput from "@/components/SynapseInput";
import ChatMessage from "@/components/ChatMessage"; 

interface YargicData {
  karar: string;
  risk_skoru: number;
  nihai_rapor: string;
  vizyon_onerisi?: string; 
}

interface HistoryItem {
  id: number;
  soru: string;
  nihai_rapor: string; 
  timestamp: string; 
  core_data?: string;   // Siber terminolojiye güncellendi
  ghost_data?: string;  // Siber terminolojiye güncellendi
  void_data?: string;   // Siber terminolojiye güncellendi
  vizyon_onerisi?: string; 
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
                    nihai_rapor: parsed.nihai_rapor ?? "",
                    vizyon_onerisi: parsed.vizyon_onerisi ?? "" 
                  };
                } catch (e) {
                  yargicData = undefined;
                }
              }

              finalItem = {
                id: Date.now(),
                soru: text,
                nihai_rapor: yargicData?.nihai_rapor ?? data.nihai_rapor ?? "İşlem tamamlandı.",
                timestamp: getTurkishTime(),
                mode: mode,
                core_data: data.analiz,      
                ghost_data: data.denetim, 
                void_data: data.vizyon,  
                vizyon_onerisi: yargicData?.vizyon_onerisi,
                yargic: yargicData,
              };
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
      const errMsg = `⚠️ Hata oluştu: ${error instanceof Error ? error.message : "Bağlantı koptu."}`;
      const errItem: HistoryItem = { id: Date.now(), soru: text, nihai_rapor: errMsg, timestamp: errorTime, mode: mode };
      setHistory((prev) => [...prev, errItem]);
    } finally {
      setIsProcessing(false);
      setActiveAgent(null);
    }
  }, [isProcessing, mode]);

  return (
    // select-none ile global metin seçimi kapatıldı, sadece izin verilen alt bileşenler seçilebilecek
    <div className="min-h-screen flex flex-col bg-background relative select-none">
      <SynapseAppBar />

      <main className="flex-1 overflow-y-auto pb-24 pt-2">
        <div className="px-4 space-y-3">
          {history.map((item) => (
            <ChatMessage 
              key={item.id}
              soru={item.soru}
              nihai_rapor={item.nihai_rapor}
              timestamp={item.timestamp}
              mode={item.mode}
              vizyon_onerisi={item.vizyon_onerisi} 
            />
          ))}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-end relative select-none">
                <div className="max-w-[95%] w-fit bg-synapse-purple/20 border border-synapse-purple/30 rounded-2xl rounded-tr-sm px-4 pt-2 pb-5 relative">
                  {mode === "nexus" && <Cpu size={14} className="absolute top-2 right-2 text-synapse-purple/40" />}
                  <p className="text-sm text-foreground/90 leading-relaxed pr-4">{currentSoru}</p>
                  <span className="absolute bottom-1 right-3 text-[8px] text-muted-foreground/60">{getTurkishTime()}</span>
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
              core_data={activeItem?.core_data}
              ghost_data={activeItem?.ghost_data}
              void_data={activeItem?.void_data}
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
