export type AgentKey = "gatekeeper" | "core" | "ghost" | "void" | "core_refine" | "prime";
export type SynapseMode = "solo" | "nexus";

export interface HistoryItem {
  id: string;
  soru: string;
  prime_result: string;
  timestamp: string;
  mode: SynapseMode;
  core_data?: string;
  ghost_data?: string;
  void_data?: string;
}

export interface StreamEvent {
  event: "status" | "done" | "error";
  data: any;
}

export interface SynapseState {
  isProcessing: boolean;
  activeAgent: AgentKey | null;
  streamingData: Partial<HistoryItem>;
  error: string | null;
}
