import type { AgentConfig } from "./types.js";

const regions = ["US", "UK", "CA", "AU", "IN", "DE", "FR", "BR", "JP", "ZA"];
const interests = [
  "technology",
  "music",
  "gaming",
  "cooking",
  "fitness",
  "travel",
  "science",
  "education",
  "movies",
  "sports"
];

const descriptions = {
  watch: "Find and watch trending YouTube videos for engagement testing.",
  subscribe: "Subscribe to relevant channels on YouTube.",
  search: "Search YouTube for subject matter and explore results.",
  profile: "Open YouTube profile and configuration flows." 
};

function getRandomInterests(index: number): string[] {
  return [interests[index % interests.length], interests[(index + 3) % interests.length]];
}

export const AGENTS: AgentConfig[] = Array.from({ length: 100 }, (_, i) => {
  const taskType = i % 4 === 0 ? "watch" : i % 4 === 1 ? "subscribe" : i % 4 === 2 ? "search" : "profile";
  return {
    id: `agent-${String(i + 1).padStart(3, "0")}`,
    name: `YouTube Agent ${i + 1}`,
    taskType,
    profile: {
      emailHint: `user${i + 1}@example.com`,
      displayName: `Agent ${i + 1}`,
      region: regions[i % regions.length],
      interests: getRandomInterests(i)
    },
    description: descriptions[taskType]
  };
});
