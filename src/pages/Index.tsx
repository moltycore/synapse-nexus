import { useState, useRef, useEffect } from "react";
import { Cpu, AlertTriangle } from "lucide-react";

import SynapseAppBar from "../components/common/SynapseAppBar";
import BattleTimeline from "../components/chat/BattleTimeline";
import SynapseInput from "../components/chat/SynapseInput";
import ChatMessage from "../components/chat/ChatMessage"; 
import Sidebar from "../components/Sidebar/Sidebar";
import BottomSheet from "../components/BottomSheet/BottomSheet";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import PromptFab from "../components/prompts/PromptFab";

import { useSynapseStream } from "../hooks/synapse/useSynapseStream";
import { HistoryItem, SynapseMode } from "../hooks/synapse/types";

export default function Index() {
  const [mode, setMode] = useState<SynapseMode>("solo");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeItem, setActiveItem] = useState<HistoryItem | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  
  const [injectedPrompt, setInjectedPrompt] = useState<string>("");
  
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const { submitQuery, isProcessing, activeAgent, streamingData, error } = useSynapseStream();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isProcessing, error]);

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
    <ErrorBoundary>
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
                <div className="w-16 h-16 rounded-2xl bg-[#12141A] border border-white/5 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(160,168,185,0.06)]">
                  <Cpu size={32} className="text-white/50" />
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
                    <div className="max-w-[95%] w-fit bg-white/8 border border-white/12 rounded-2xl rounded-tr-sm px-4 pt-3 pb-5 relative hover:bg-white/12 transition-colors">
                      {mode === "nexus" && (
                        <Cpu size={14} className="absolute top-2 right-2 text-white/25" />
                      )}
                      <p className={`text-sm text-foreground/90 leading-relaxed break-words select-text ${mode === "nexus" ? "pr-5" : ""}`}>
                        {currentQuery}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && !isProcessing && (
                <div className="flex justify-start relative select-none mt-2">
                  <div className="max-w-[95%] w-fit bg-red-500/10 border border-red-500/20 rounded-2xl rounded-tl-sm px-4 py-3 flex items-start gap-3">
                    <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-semibold tracking-wider text-red-400/80 uppercase mb-1">Telemetry Interrupted</p>
                      <p className="text-xs text-white/70 leading-relaxed">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {((isProcessing && mode === "nexus") || (activeItem?.mode === "nexus")) && !error && (
              <div className="mt-4 z-10 relative">
                <BattleTimeline
                  isActive={true}
                  isProcessing={isProcessing}
                  activeAgent={activeAgent}
                  coreData={isProcessing ? streamingData.core_data : activeItem?.core_data}
                  ghostData={isProcessing ? streamingData.ghost_data : activeItem?.ghost_data}
                  voidData={isProcessing ? streamingData.void_data : activeItem?.void_data}
                  primeResult={isProcessing ? undefined : activeItem?.prime_result}
                />
              </div>
            )}
          </main>

          <PromptFab onSelect={(text) => setInjectedPrompt(text)} />

          <SynapseInput 
            onSubmit={handleSubmit} 
            isProcessing={isProcessing} 
            mode={mode} 
            setMode={setMode}
            injectedPrompt={injectedPrompt}
            clearInjectedPrompt={() => setInjectedPrompt("")}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
