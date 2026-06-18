export type AgentTaskType = "watch" | "subscribe" | "search" | "profile";

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
}
