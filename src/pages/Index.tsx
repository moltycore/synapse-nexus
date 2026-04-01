import { useState, useRef, useEffect } from "react";
import { Cpu } from "lucide-react";
import SynapseAppBar from "@/components/SynapseAppBar";
import BattleTimeline from "@/components/BattleTimeline";
import SynapseInput from "@/components/SynapseInput";
import ChatMessage from "@/components/ChatMessage"; 
import { useSynapseStream, HistoryItem } from "@/hooks/useSynapseStream";

export default function Index() {
  const [mode, setMode] = useState<"solo" | "nexus">("solo");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeItem, setActiveItem] = useState<HistoryItem | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { submitQuery, isProcessing, activeAgent, streamingData } = useSynapseStream();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isProcessing]);

  const handleSubmit = (text: string) => {
    if (isProcessing) return;
    setCurrentQuery(text);
    setActiveItem(null);

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
    <div className="min-h-screen flex flex-col bg-background relative text-foreground">
      <SynapseAppBar />

      <main className="flex-1 overflow-y-auto pb-24 pt-2">
        <div className="px-4 space-y-3">
          {history.map((item) => (
            <ChatMessage 
              key={item.id}
              query={item.query} 
              primeResult={item.primeResult} 
              timestamp={item.timestamp}
              mode={item.mode}
              visionSuggest={item.voidData ? "Deep analysis complete." : undefined}
            />
          ))}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-end relative select-none">
                <div className="max-w-[95%] w-fit bg-synapse-purple/20 border border-synapse-purple/30 rounded-2xl rounded-tr-sm px-4 pt-3 pb-5 relative">
                  {mode === "nexus" && <Cpu size={14} className="absolute top-2 right-2 text-synapse-purple/40" />}
                  <p className="text-sm text-foreground/90 leading-relaxed pr-4">{currentQuery}</p>
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
              phase={isProcessing ? 2 : 3}
              isProcessing={isProcessing}
              activeAgent={activeAgent}
              coreData={isProcessing ? streamingData.coreData : activeItem?.coreData}
              ghostData={isProcessing ? streamingData.ghostData : activeItem?.ghostData}
              voidData={isProcessing ? streamingData.voidData : activeItem?.voidData}
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
