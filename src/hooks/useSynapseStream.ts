import { useState, useRef, useCallback } from "react";

export interface HistoryItem {
  id: string; 
  query: string;
  primeResult: string;
  timestamp: string;
  coreData?: string;
  ghostData?: string;
  voidData?: string;
  mode: "solo" | "nexus";
}

export function useSynapseStream() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [streamingData, setStreamingData] = useState<Partial<HistoryItem>>({}); 
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const getTurkishTime = () => {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    return `${h >= 12 ? 'PM' : 'AM'} ${h % 12 || 12}:${m}`;
  };

  const submitQuery = useCallback(async (
    text: string, 
    mode: "solo" | "nexus", 
    onComplete: (item: HistoryItem) => void,
    onError: (errItem: HistoryItem) => void
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessing(true);
    setActiveAgent(null);
    setStreamingData({}); 

    const pendingId = crypto.randomUUID();
    let currentData: Partial<HistoryItem> = {};

    try {
      const response = await fetch("https://synapse-api-b8oc.onrender.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
        signal: controller.signal
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream connection failed.");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim().startsWith("data:")) continue;
          
          try {
            const eventObj = JSON.parse(line.replace("data:", "").trim());
            
            if (eventObj.event === "status") {
              setActiveAgent(eventObj.data);
            } else if (eventObj.event === "done") {
              // Map backend snake_case to frontend camelCase
              const payload = eventObj.data;
              currentData = { 
                ...currentData, 
                primeResult: payload.prime_result,
                coreData: payload.core_data,
                ghostData: payload.ghost_data,
                voidData: payload.void_data
              };
              setStreamingData(currentData); 
            }
          } catch (e) { /* Silent ignore for partial chunks */ }
        }
      }

      const finalItem: HistoryItem = {
        id: pendingId,
        query: text,
        primeResult: currentData.primeResult || "Process completed.",
        timestamp: getTurkishTime(),
        mode: mode,
        ...currentData
      };

      onComplete(finalItem);

    } catch (error: any) {
      if (error.name === 'AbortError') return; 
      
      const errItem: HistoryItem = {
        id: pendingId,
        query: text,
        primeResult: `⚠️ Error: ${error.message || "Server unreachable."}`,
        timestamp: getTurkishTime(),
        mode: mode
      };
      onError(errItem);
    } finally {
      setIsProcessing(false);
      setActiveAgent(null);
      setStreamingData({});
      abortControllerRef.current = null;
    }
  }, []);

  return { submitQuery, isProcessing, activeAgent, streamingData };
}
