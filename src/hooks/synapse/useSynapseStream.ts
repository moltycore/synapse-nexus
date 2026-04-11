import { useReducer, useRef, useCallback } from "react";
import { HistoryItem, SynapseMode, AgentKey, SynapseState } from "@/hooks/synapse/types";
import { parseSSE, getTurkishTime } from "@/hooks/synapse/utils";

const initialState: SynapseState = {
  isProcessing: false,
  activeAgent: null,
  streamingData: {},
  error: null
};

type Action = 
  | { type: 'START' }
  | { type: 'SET_AGENT', payload: AgentKey }
  | { type: 'SET_DATA', payload: any }
  | { type: 'ERROR', payload: string }
  | { type: 'FINISH' }
  | { type: 'RESET' };

function synapseReducer(state: SynapseState, action: Action): SynapseState {
  switch (action.type) {
    case 'START': return { ...initialState, isProcessing: true };
    case 'SET_AGENT': return { ...state, activeAgent: action.payload };
    case 'SET_DATA': return { ...state, streamingData: { ...state.streamingData, ...action.payload } };
    case 'ERROR': return { ...state, isProcessing: false, activeAgent: null, error: action.payload };
    case 'FINISH': return { ...state, isProcessing: false, activeAgent: null };
    case 'RESET': return initialState;
    default: return state;
  }
}

export function useSynapseStream() {
  const [state, dispatch] = useReducer(synapseReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const submitQuery = useCallback(async (
    text: string, 
    mode: SynapseMode, 
    onComplete: (item: HistoryItem) => void,
    onError: (errItem: HistoryItem) => void
  ) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    dispatch({ type: 'START' });

    const pendingId = crypto.randomUUID();
    let currentPayload: any = {};

    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
        signal: controller.signal
      });

      if (!response.body) throw new Error("Stream connection failed.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const eventObj = parseSSE(line);
          if (!eventObj) continue;

          if (eventObj.event === "status") {
            dispatch({ type: 'SET_AGENT', payload: eventObj.data });
          } else if (eventObj.event === "done") {
            currentPayload = eventObj.data;
            dispatch({ type: 'SET_DATA', payload: currentPayload });
          }
        }
      }

      const finalItem: HistoryItem = {
        id: pendingId,
        soru: text,
        prime_result: currentPayload.prime_result || "Payload decoded.",
        timestamp: getTurkishTime(),
        mode,
        ...currentPayload
      };
      onComplete(finalItem);

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      const isTimeout = error.name === 'AbortError';
      const errorMessage = isTimeout 
        ? "Connection timeout. Server unresponsive." 
        : error.message || "Uplink lost.";
        
      dispatch({ type: 'ERROR', payload: errorMessage });
      
      onError({
        id: pendingId,
        soru: text,
        prime_result: `⚠️ ${isTimeout ? "TIMEOUT" : "CRITICAL_ERROR"}: ${errorMessage}`,
        timestamp: getTurkishTime(),
        mode
      });
    } finally {
      clearTimeout(timeoutId);
      dispatch({ type: 'FINISH' });
      abortControllerRef.current = null;
    }
  }, []);

  return { ...state, submitQuery };
}
