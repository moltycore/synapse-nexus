import { useState, useCallback, useRef, useEffect } from "react";
import SynapseAppBar from "@/components/SynapseAppBar";
import BattleTimeline from "@/components/BattleTimeline";
import SynapseInput from "@/components/SynapseInput";

interface YargicData {
  karar: string;
  risk_skoru: number;
  racon: string;
}

interface HistoryItem {
  id: number;
  soru: string;
  karar: string;
  sme?: string;
  arastirma?: string;
  denetleme?: string;
  vizyoner_puter?: string;
  moderator?: string;
  yargic?: YargicData;
}

export default function Index() {
  const [isProcessing, setIsProcessing] = useState(false);
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
        body: JSON.stringify({ text }),
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
            const eventObj = JSON.parse(jsonStr); // Backend'den gelen objeyi aldık

            // HATA BURADAYDI: event.type değil, eventObj.event olmalı!
            if (eventObj.event === "status") {
              // HATA 2: event.agent değil, eventObj.data içinde ajan ismi geliyor
              setActiveAgent(eventObj.data ?? null);
            } else if (eventObj.event === "done") {
              const data = eventObj.data; // Asıl veriler burada!

              let yargicData: YargicData | undefined;
              if (data.yargic) {
                try {
                  const parsed = typeof data.yargic === "string" ? JSON.parse(data.yargic) : data.yargic;
                  yargicData = {
                    karar: parsed.karar ?? "",
                    risk_skoru: parsed.risk_skoru ?? 0,
                    racon: parsed.racon ?? "",
                  };
                } catch {
                  yargicData = undefined;
                }
              }

              // Backend'den artık 'sme', 'denetleme' gelmiyor; 'analiz', 'denetim', 'vizyon' geliyor.
              finalItem = {
                id: Date.now(),
                soru: text,
                karar: yargicData?.karar ? `KARAR: ${yargicData.karar}` : "Karar alınamadı.",
                sme: data.analiz, 
                arastirma: "Birleştirildi.", 
                denetleme: data.denetim,
                vizyoner_puter: data.vizyon,
                moderator: "",
                yargic: yargicData,
              };
            }
          } catch {
            // skip malformed JSON
                    }

              finalItem = {
                id: Date.now(),
                soru: text,
                karar: data.final_karar ?? yargicData?.karar ?? "Karar alınamadı.",
                sme: data.sme,
                arastirma: data.arastirma,
                denetleme: data.denetleme,
                vizyoner_puter: data.vizyoner_puter,
                moderator: data.moderator,
                yargic: yargicData,
              };
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      if (finalItem) {
        setHistory((prev) => [...prev, finalItem!]);
        setActiveItem(finalItem);
      }
    } catch (error) {
      const errMsg = `⚠️ ${error instanceof Error ? error.message : "Bağlantı koptu."}`;
      const errItem: HistoryItem = { id: Date.now(), soru: text, karar: errMsg };
      setHistory((prev) => [...prev, errItem]);
      setActiveItem(errItem);
    } finally {
      setIsProcessing(false);
      setActiveAgent(null);
    }
  }, [isProcessing]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SynapseAppBar />

      <main className="flex-1 overflow-y-auto pb-24 pt-2">
        <div className="px-4 space-y-3">
          {history.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[78%] bg-synapse-purple/20 border border-synapse-purple/30 rounded-2xl rounded-tr-sm px-4 py-2.5 overflow-hidden">
                  <p className="text-sm text-foreground/90 leading-relaxed break-words [overflow-wrap:break-word]">{item.soru}</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="w-full glass border border-white/[0.07] rounded-2xl px-4 py-2.5 overflow-hidden">
                  <p className="text-sm text-foreground/85 leading-relaxed break-words [overflow-wrap:break-word]">{item.karar}</p>
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[78%] bg-synapse-purple/20 border border-synapse-purple/30 rounded-2xl rounded-tr-sm px-4 py-2.5 overflow-hidden">
                  <p className="text-sm text-foreground/90 leading-relaxed break-words [overflow-wrap:break-word]">{currentSoru}</p>
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

        {(activeItem || isProcessing) && (
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
              moderator={activeItem?.moderator}
              yargic={activeItem?.yargic}
            />
          </div>
        )}
      </main>

      <SynapseInput onSubmit={handleSubmit} isProcessing={isProcessing} />
    </div>
  );
}
