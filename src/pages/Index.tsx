import { useState, useRef, useEffect } from "react";
import { Cpu } from "lucide-react";
import SynapseAppBar from "@/components/SynapseAppBar";
import BattleTimeline from "@/components/BattleTimeline";
import SynapseInput from "@/components/SynapseInput";
import ChatMessage from "@/components/ChatMessage"; 
import { useSynapseStream, HistoryItem } from "@/hooks/useSynapseStream"; // Hook'u çağırdık

export default function Index() {
  const [mode, setMode] = useState<"solo" | "nexus">("solo");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeItem, setActiveItem] = useState<HistoryItem | null>(null);
  const [currentSoru, setCurrentSoru] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Bütün yükü hook'a yıktık
  const { submitQuery, isProcessing, activeAgent, streamingData } = useSynapseStream();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isProcessing]);

  const handleSubmit = (text: string) => {
    if (isProcessing) return;
    setCurrentSoru(text);
    setActiveItem(null);

    // Hook'u ateşle, sonucu callback ile history'e ekle
    submitQuery(
      text, 
      mode, 
      (finalItem) => {
        setHistory((prev) => [...prev, finalItem]);
        setActiveItem(finalItem);
      },
      (errItem) => {
        setHistory((prev) => [...prev, errItem]);
      }
    );
  };

  return (
    // DİKKAT: select-none sınıfını sadece UI elemanlarına bırak, genelden kaldır (UX için)
    <div className="min-h-screen flex flex-col bg-background relative text-foreground">
      <SynapseAppBar />

      <main className="flex-1 overflow-y-auto pb-24 pt-2">
        <div className="px-4 space-y-3">
          {history.map((item) => (
            <ChatMessage 
              key={item.id}
              soru={item.soru}
              nihai_rapor={item.prime_result}
              timestamp={item.timestamp}
              mode={item.mode}
            />
          ))}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-end relative select-none">
                <div className="max-w-[95%] w-fit bg-synapse-purple/20 border border-synapse-purple/30 rounded-2xl rounded-tr-sm px-4 pt-2 pb-5 relative">
                  {mode === "nexus" && <Cpu size={14} className="absolute top-2 right-2 text-synapse-purple/40" />}
                  <p className="text-sm text-foreground/90 leading-relaxed pr-4">{currentSoru}</p>
                  {/* Zaman damgası anlık gösterilebilir ama şimdilik bekliyor efekti yeterli */}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Timeline artık canlı streamingData'dan besleniyor, işlem bitince activeItem'dan! */}
        {((isProcessing && mode === "nexus") || (activeItem?.mode === "nexus")) && (
          <div className="mt-4">
            <BattleTimeline
              isActive={true}
              phase={isProcessing ? 2 : 3} // İşlem sürüyorsa 2. faz (tartışma), bittiyse 3. faz (sonuç)
              isProcessing={isProcessing}
              activeAgent={activeAgent}
              core_data={isProcessing ? streamingData.core_data : activeItem?.core_data}
              ghost_data={isProcessing ? streamingData.ghost_data : activeItem?.ghost_data}
              void_data={isProcessing ? streamingData.void_data : activeItem?.void_data}
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
