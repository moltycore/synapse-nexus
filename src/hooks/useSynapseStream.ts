import { useState, useRef, useCallback } from "react";

export interface HistoryItem {
  id: string; // Date.now() yerine çakışmaları önlemek için string (UUID)
  soru: string;
  prime_result: string;
  timestamp: string;
  core_data?: string;
  ghost_data?: string;
  void_data?: string;
  mode: "solo" | "nexus";
}

export function useSynapseStream() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  
  // Nexus tartışırken Timeline'a canlı veri basmak için geçici state
  const [streamingData, setStreamingData] = useState<Partial<HistoryItem>>({}); 
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const getTurkishTime = () => {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    return `${h >= 12 ? 'ÖS' : 'ÖÖ'} ${h % 12 || 12}:${m}`;
  };

  const submitQuery = useCallback(async (
    text: string, 
    mode: "solo" | "nexus", 
    onComplete: (item: HistoryItem) => void,
    onError: (errItem: HistoryItem) => void
  ) => {
    // Eğer halihazırda çalışan bir istek varsa, onu iptal et (Sistemi şişirmemek için)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessing(true);
    setActiveAgent(null);
    setStreamingData({}); // Önceki kalıntıları temizle

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
      if (!reader) throw new Error("Stream koptu veya alınamadı.");

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
              currentData = { ...currentData, ...eventObj.data };
              // Nexus akarken Timeline dolsun diye anlık state'e atıyoruz
              setStreamingData(currentData); 
            }
          } catch (e) { /* Parçalı JSON gelirse sessizce geç */ }
        }
      }

      // Döngü bitti, nihai nesneyi oluştur ve Index'e fırlat
      const finalItem: HistoryItem = {
        id: pendingId,
        soru: text,
        prime_result: currentData.prime_result || "İşlem tamamlandı.",
        timestamp: getTurkishTime(),
        mode: mode,
        ...currentData
      };

      onComplete(finalItem);

    } catch (error: any) {
      if (error.name === 'AbortError') return; // Kullanıcı bilerek iptal ettiyse hata basma
      
      const errItem: HistoryItem = {
        id: pendingId,
        soru: text,
        prime_result: `⚠️ Hata: ${error.message || "Sunucuya ulaşılamıyor."}`,
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
