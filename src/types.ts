export type AgentTaskType = "watch" | "subscribe" | "search" | "profile" | "navigate";

export interface AgentProfile {
  emailHint: string;
  displayName: string;
  region: string;
  interests: string[];
}

export interface AgentConfig {
  id: string;
  name: string;
  taskType: AgentTaskType;
  profile: AgentProfile;
  description: string;
  promptText?: string;
}

// Universal Task Type - Added for universal agent
export interface PlannedTask {
  id: string;
  type: string;
  description: string;
  instruction?: string;
  url?: string;
  requiresAuth: boolean;
  parallelGroup: number;
  cron?: string;
  originalInstruction?: string;
  [key: string]: any;
}