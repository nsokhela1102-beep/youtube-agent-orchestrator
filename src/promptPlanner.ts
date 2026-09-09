import type { PlannedTask } from "./types.js";

function extractUrl(text: string): string | undefined {
  const parts = text.split(/\s+/);
  const found = parts.find(p => p.startsWith("http://") || p.startsWith("https://"));
  if (!found) return undefined;
  return found.replace(/[),.;!]+$/, "");
}

function extractCommand(text: string): string {
  const m = text.match(/npm\s+[^\n]+/i);
  return m ? m[0] : text;
}

export function buildPromptExecutionPlan(prompt: string) {
  const lower = prompt.toLowerCase();
  const actions: string[] = [];

  if (lower.includes("watch") || lower.includes("tutorial") || lower.includes("channel") || lower.includes("programming")) {
    actions.push("search");
  }
  if (lower.includes("watch")) actions.push("watch");
  if (lower.includes("subscribe")) actions.push("subscribe");
  if (lower.includes("search") && !actions.includes("search")) actions.push("search");

  if (lower.includes("open") || lower.includes("navigate") || lower.includes("http") || lower.includes("example.com")) {
    actions.push("navigate");
  }
  if (lower.includes("run") || lower.includes("npm") || lower.includes("command") || lower.includes("build")) {
    actions.push("command");
  }
  if (lower.includes("file") || lower.includes("report") || lower.includes("create")) {
    actions.push("file");
  }

  const url = extractUrl(prompt);
  const hasCommand = actions.includes("command");
  const hasFile = actions.includes("file");

  return {
    prompt,
    query: prompt,
    actions: [...new Set(actions)],
    url,
    targetUrl: url,
    command: hasCommand ? extractCommand(prompt) : undefined,
    filePath: hasFile ? "report.md" : undefined,
  };
}

export async function planTasks(userInstruction: string) {
  const plan = buildPromptExecutionPlan(userInstruction);
  const tasks: PlannedTask[] = plan.actions.map((type, i) => ({
    id: `${type}-${i}`,
    title: userInstruction,
    parallelGroup: i + 1,
    type,
    payload: {
      instruction: userInstruction,
      url: plan.url,
      command: plan.command,
      filePath: plan.filePath,
    },
  }));

  if (tasks.length === 0) {
    tasks.push({
      id: "generic-1",
      title: userInstruction,
      parallelGroup: 1,
      type: "generic",
      payload: { instruction: userInstruction },
    });
  }

  return { tasks, humanUnderstanding: userInstruction };
}