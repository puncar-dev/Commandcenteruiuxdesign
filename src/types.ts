export type AgentStatus = "idle" | "working" | "error";

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  avatar: string; 
  color: string;
}

export type RunStatus = "running" | "completed" | "partial" | "failed";

export interface Run {
  id: string;
  timestamp: number;
  prompt: string;
  agentIds: string[];
  status: RunStatus;
  outputs: Record<string, string>; 
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  runId?: string;
}

export interface Chat {
  id: string;
  title: string;
  lastActivity: number;
  messages: Message[];
  runs: Run[];
  selectedAgentIds: string[];
}

export type TabType = "market" | "agent" | "doc" | "empty";

export interface Tab {
  id: string;
  type: TabType;
  title: string;
  data: any;
}
