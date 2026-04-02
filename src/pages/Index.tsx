import { useState, useRef, useEffect } from "react";
import { Cpu } from "lucide-react";
import SynapseAppBar from "@/components/SynapseAppBar";
import BattleTimeline from "@/components/BattleTimeline";
import SynapseInput from "@/components/SynapseInput";
import ChatMessage from "@/components/ChatMessage"; 
import Sidebar from "@/components/Sidebar/Sidebar";
import BottomSheet from "@/components/BottomSheet/BottomSheet";

import { useSynapseStream } from "@/hooks/synapse/useSynapseStream";
import { HistoryItem, SynapseMode } from "@/hooks/synapse/types";

export default function Index() {
  const [mode, setMode] = useState<SynapseMode>("solo");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeItem, setActiveItem] = useState<HistoryItem | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  
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
    <div className="fixed inset-0 bg-background text-foreground overflow-hidden w-full">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <BottomSheet isOpen={isBottomSheetOpen} onClose={() => setBottomSheetOpen(false)} />

      <div 
        className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-64" : "translate-x-0"
        }`}
      >
        <SynapseAppBar 
          onSidebarToggle={() => setSidebarOpen(true)} 
          onBottomSheetToggle={() => setBottomSheetOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto pb-24 pt-2 relative flex flex-col">
          {history.length === 0 && !isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-80 select-none pb-32 pointer-events-none z-10">
              <div className="w-16 h-16 rounded-2xl bg-[#12141A] border border-white/5 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.07)]">
                <Cpu size={32} className="text-synapse-purple/80" />
              </div>
              <h1 className="text-xl font-medium tracking-tight text-[#EDEFF3] mb-2">Synapse Nexus AI</h1>
              <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase">System Ready</p>
            </div>
          )}

          <div className="px-4 space-y-3 z-10 relative flex-1">
            {history.map((item) => (
              <ChatMessage 
                key={item.id}
                query={item.soru} 
                primeResult={item.prime_result} 
                timestamp={item.timestamp}
                mode={item.mode}
              />
            ))}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-end relative select-none">
                  <div className="max-w-[95%] w-fit bg-synapse-purple/20 border border-synapse-purple/30 rounded-2xl rounded-tr-sm px-4 pt-3 pb-5 relative hover:bg-synapse-purple/30 transition-colors">
                    {mode === "nexus" && <Cpu size={14} className="absolute top-2 right-2 text-synapse-purple/40" />}
                    <p className={`text-sm text-foreground/90 leading-relaxed break-words select-text ${mode === "nexus" ? "pr-5" : ""}`}>
                      {currentQuery}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {((isProcessing && mode === "nexus") || (activeItem?.mode === "nexus")) && (
            <div className="mt-4 z-10 relative">
              <BattleTimeline
                isActive={true}
                phase={isProcessing ? 2 : 3}
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
    </div>
  );
}
