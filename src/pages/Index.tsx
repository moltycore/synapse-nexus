import { useState, useRef, useEffect, useCallback } from "react";
import { Cpu, AlertTriangle, Loader2, GitFork, PlusSquare, XCircle } from "lucide-react";

import SynapseAppBar from "../components/common/SynapseAppBar";
import BattleTimeline from "../components/chat/BattleTimeline";
import SynapseInput from "../components/chat/SynapseInput";
import ChatMessage from "../components/chat/ChatMessage";
import Sidebar from "../components/Sidebar/Sidebar";
import BottomSheet from "../components/BottomSheet/BottomSheet";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import PromptFab from "../components/prompts/PromptFab";

import { useSynapseStream } from "../hooks/synapse/useSynapseStream";
import { HistoryItem, FileData } from "../hooks/synapse/types";
import { dbService } from "../services/db";
import { logger } from "../utils/logger";
import { useSynapseStore } from "../store/synapseStore";

export default function Index() {
  const {
    mode, setMode,
    history, setHistory, addHistoryItem,
    activeWorkspaceId, setActiveWorkspaceId,
    pendingForkId, setPendingForkId
  } = useSynapseStore();

  const [activeItem, setActiveItem] = useState<HistoryItem | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [injectedPrompt, setInjectedPrompt] = useState<string>("");
  const [isInit, setIsInit] = useState(true);
  
  const [uiError, setUiError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const bootGuard = useRef(false);

  const { submitQuery, isProcessing, activeAgent, streamingData, error } = useSynapseStream();

  useEffect(() => {
    if (uiError) {
      const timer = setTimeout(() => setUiError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [uiError]);

  // Boot logic: Ghost Chat initialization
  useEffect(() => {
    if (bootGuard.current) return;
    bootGuard.current = true;

    setActiveWorkspaceId(null);
    setHistory([]);
    setIsInit(false);
  }, [setActiveWorkspaceId, setHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isProcessing, error]);

  const handleSubmit = async (text: string, files?: FileData[] | null) => {
    if (isProcessing) return;

    let targetWorkspaceId = activeWorkspaceId;

    if (pendingForkId) {
      const targetIndex = history.findIndex(item => item.id === pendingForkId);
      setPendingForkId(null);

      if (targetIndex !== -1) {
        try {
          const titleWords = text.trim().split(/\s+/).slice(0, 3).join(" ");
          const newTitle = titleWords ? `${titleWords}...` : "Yeni Dal";
          const messagesToClone = history.slice(0, targetIndex + 1);
          const newWorkspaceId = `w-${crypto.randomUUID().slice(0, 8)}`;

          await dbService.forkWorkspace(newWorkspaceId, newTitle, messagesToClone, activeWorkspaceId);

          targetWorkspaceId = newWorkspaceId;
          setActiveWorkspaceId(newWorkspaceId);
          setHistory(messagesToClone);
          logger.info("Auto-fork created", { originalId: activeWorkspaceId, newWorkspaceId });
        } catch (err) {
          logger.error("Auto-fork failed", { error: err });
          setUiError("Fork process failed. Please try again.");
        }
      }
    } else if (!targetWorkspaceId) {
      try {
        const titleWords = text.trim().split(/\s+/).slice(0, 3).join(" ");
        const newTitle = titleWords ? `${titleWords}...` : "Yeni Sohbet";
        const newWorkspaceId = `w-${crypto.randomUUID().slice(0, 8)}`;

        await dbService.createWorkspace(newWorkspaceId, newTitle);
        
        targetWorkspaceId = newWorkspaceId;
        setActiveWorkspaceId(newWorkspaceId);
        logger.info("Auto-workspace created on first message", { newWorkspaceId });
      } catch (err) {
        logger.error("Failed to create initial workspace", { error: err });
        setUiError("Failed to start chat. Check connection.");
        return; 
      }
    }

    const displayQuery = files && files.length > 0
        ? `${text}\n[Eklenen Dosyalar: ${files.map(f => f.name).join(", ")}]`
        : text;

    setCurrentQuery(displayQuery);
    setActiveItem(null);

    submitQuery(
      text,
      mode,
      targetWorkspaceId,
      files,
      (finalItem) => {
        addHistoryItem(finalItem);
        setActiveItem(finalItem);
      },
      (errItem) => {
        addHistoryItem(errItem);
        setUiError("Network flow interrupted.");
      }
    );
  };

  const handleWorkspaceSelect = async (id: string) => {
    setIsInit(true);
    setSidebarOpen(false);
    try {
      setActiveWorkspaceId(id);
      const messages = await dbService.getMessages(id);
      setHistory(messages);
      setActiveItem(null);
      setPendingForkId(null);
    } catch (err) {
      logger.error("Failed to load workspace messages", { workspaceId: id, error: err });
      setUiError("Failed to load chat history.");
    } finally {
      setIsInit(false);
    }
  };

  const handleStartNewChat = () => {
    setActiveWorkspaceId(null);
    setHistory([]);
    setActiveItem(null);
    setPendingForkId(null);
    setSidebarOpen(false);
  };

  const handleFork = useCallback((messageId: string) => {
    setPendingForkId(messageId);
  }, [setPendingForkId]);

  if (isInit) {
    return (
      <div className="fixed inset-0 bg-[#0F1115] flex flex-col items-center justify-center gap-4 z-[100]">
        <Loader2 size={32} className="text-white/20 animate-spin" />
        <span className="font-mono text-xs text-white/30 tracking-widest uppercase">
          Initializing Core...
        </span>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 bg-background text-foreground overflow-hidden w-full">
        
        {uiError && (
          <div className="fixed top-[env(safe-area-inset-top,0px)] left-1/2 -translate-x-1/2 mt-4 z-[200] bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-200 backdrop-blur-md">
            <XCircle size={14} />
            {uiError}
          </div>
        )}

        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectWorkspace={handleWorkspaceSelect}
        />
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
            {history.length === 0 && !isProcessing && !activeWorkspaceId && (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-80 select-none pb-32 pointer-events-none z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#12141A] border border-white/5 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(160,168,185,0.06)]">
                  <Cpu size={32} className="text-white/50" />
                </div>
                <h1 className="text-xl font-medium tracking-tight text-[#EDEFF3] mb-2">Synapse Nexus AI</h1>
                <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase">System Ready</p>
              </div>
            )}

            <div className="px-4 space-y-3 z-10 relative flex-1 mt-4">
              {history.map(item => (
                <ChatMessage
                  key={item.id}
                  id={item.id}
                  query={item.soru}
                  primeResult={item.prime_result}
                  timestamp={item.timestamp}
                  mode={item.mode}
                  onFork={handleFork}
                />
              ))}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-end relative select-none">
                    <div className="max-w-[95%] w-fit bg-white/8 border border-white/12 rounded-2xl rounded-tr-sm px-4 pt-3 pb-5 relative hover:bg-white/12 transition-colors">
                      {mode === "nexus" && (
                        <Cpu size={14} className="absolute top-2 right-2 text-white/25" />
                      )}
                      <p
                        className={`text-sm text-foreground/90 leading-relaxed break-words select-text whitespace-pre-wrap ${
                          mode === "nexus" ? "pr-5" : ""
                        }`}
                      >
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
                      <p className="text-[11px] font-semibold tracking-wider text-red-400/80 uppercase mb-1">
                        Telemetry Interrupted
                      </p>
                      <p className="text-xs text-white/70 leading-relaxed">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {((isProcessing && mode === "nexus") || activeItem?.mode === "nexus") && !error && (
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

          {activeWorkspaceId && !isProcessing && (
            <button
              onClick={handleStartNewChat}
              className="absolute top-[calc(env(safe-area-inset-top,0px)+80px)] right-4 z-[40] bg-black/50 border border-gray-800 text-gray-400 hover:text-emerald-400 hover:border-gray-700 p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all active:scale-95"
              title="Yeni Sohbet Başlat"
            >
              <PlusSquare size={16} />
            </button>
          )}

          {pendingForkId && (
            <div
              onClick={() => setPendingForkId(null)}
              className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200 z-[60] cursor-pointer hover:bg-emerald-500/20 transition-colors"
            >
              <GitFork size={14} />
              Dallandırma modu devrede. İptal için tıkla.
            </div>
          )}

          <PromptFab onSelect={text => setInjectedPrompt(text)} />

          <SynapseInput
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            injectedPrompt={injectedPrompt}
            clearInjectedPrompt={() => setInjectedPrompt("")}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
                          }
