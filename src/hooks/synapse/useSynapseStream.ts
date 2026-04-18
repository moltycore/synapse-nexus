import { useReducer, useRef, useCallback } from "react";
import { HistoryItem, SynapseMode, AgentKey, SynapseState, FileData } from "@/hooks/synapse/types";
import { parseSSE, getTurkishTime } from "@/hooks/synapse/utils";
import { API_URL, STREAM_TIMEOUT_MS } from "@/config/constants";
import { logger } from "@/utils/logger";
import { dbService } from "@/services/db";

const initialState: SynapseState = {
  isProcessing: false,
  activeAgent: null,
  streamingData: {},
  error: null
};

type Action =
  | { type: "START" }
  | { type: "SET_AGENT"; payload: AgentKey }
  | { type: "SET_DATA"; payload: any }
  | { type: "ERROR"; payload: string }
  | { type: "FINISH" }
  | { type: "RESET" };

function synapseReducer(state: SynapseState, action: Action): SynapseState {
  switch (action.type) {
    case "START":     return { ...initialState, isProcessing: true };
    case "SET_AGENT": return { ...state, activeAgent: action.payload };
    case "SET_DATA":  return { ...state, streamingData: { ...state.streamingData, ...action.payload } };
    case "ERROR":     return { ...state, isProcessing: false, activeAgent: null, error: action.payload };
    case "FINISH":    return { ...state, isProcessing: false, activeAgent: null };
    case "RESET":     return initialState;
    default:          return state;
  }
}

export function useSynapseStream() {
  const [state, dispatch] = useReducer(synapseReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const submitQuery = useCallback(async (
    text: string,
    mode: SynapseMode,
    workspaceId: string | null,
    files: FileData[] | null | undefined,
    onComplete: (item: HistoryItem) => void,
    onError: (errItem: HistoryItem) => void
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      logger.warn("Previous stream aborted by new request.");
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    dispatch({ type: "START" });

    const pendingId = crypto.randomUUID();
    let currentPayload: any = {};

    logger.info("Stream initialized", { pendingId, mode, workspaceId, fileCount: files?.length || 0 });

    const timeoutId = setTimeout(() => {
      controller.abort();
      logger.warn("Stream aborted (Timeout threshold reached)", { pendingId, timeoutMs: STREAM_TIMEOUT_MS });
    }, STREAM_TIMEOUT_MS);

    try {
      const payloadBody: any = { text, mode };
      if (files && files.length > 0) {
        payloadBody.fileContext = files;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadBody),
        signal: controller.signal
      });

      if (!response.ok) {
        logger.error("Uplink rejected", { status: response.status, statusText: response.statusText });
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) {
        logger.error("No payload stream received");
        throw new Error("Stream connection failed.");
      }

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
            dispatch({ type: "SET_AGENT", payload: eventObj.data });
          } else if (eventObj.event === "done") {
            currentPayload = eventObj.data;
            dispatch({ type: "SET_DATA", payload: currentPayload });
          }
        }
      }

      const displaySoru = files && files.length > 0 
        ? `${text}\n[Eklenen Dosyalar: ${files.map(f => f.name).join(', ')}]` 
        : text;

      const finalItem: HistoryItem = {
        id: pendingId,
        soru: displaySoru,
        prime_result: currentPayload.prime_result || "Payload decoded.",
        timestamp: getTurkishTime(),
        mode,
        ...currentPayload
      };
      
      logger.info("Stream completed successfully", { pendingId, hasPrime: !!currentPayload.prime_result });
      
      if (workspaceId) {
        try {
          await dbService.saveMessage(workspaceId, finalItem);
          logger.info("Payload synced to DB", { pendingId, workspaceId });
        } catch (dbErr: any) {
          logger.error("DB sync failed", { pendingId, workspaceId, error: dbErr.message });
        }
      }

      onComplete(finalItem);

    } catch (error: any) {
      clearTimeout(timeoutId);

      const isTimeout = error.name === "AbortError";
      const errorMessage = isTimeout
        ? "Connection timeout. Server unresponsive."
        : error.message || "Uplink lost.";

      if (!isTimeout) {
        logger.error("Stream execution failed", { pendingId, error: error.message });
      }

      dispatch({ type: "ERROR", payload: errorMessage });

      const displaySoru = files && files.length > 0 
        ? `${text}\n[Eklenen Dosyalar: ${files.map(f => f.name).join(', ')}]` 
        : text;

      const errItem: HistoryItem = {
        id: pendingId,
        soru: displaySoru,
        prime_result: `⚠️ ${isTimeout ? "TIMEOUT" : "CRITICAL_ERROR"}: ${errorMessage}`,
        timestamp: getTurkishTime(),
        mode
      };

      if (workspaceId) {
        try {
          await dbService.saveMessage(workspaceId, errItem);
        } catch (dbErr) {
        }
      }

      onError(errItem);

    } finally {
      clearTimeout(timeoutId);
      dispatch({ type: "FINISH" });
      abortControllerRef.current = null;
    }
  }, []);

  return { ...state, submitQuery };
          }
