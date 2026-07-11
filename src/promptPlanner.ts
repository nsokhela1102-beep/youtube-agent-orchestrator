export interface PromptExecutionPlan {
  query: string;
  actions: Array<"search" | "watch" | "subscribe" | "navigate" | "profile" | "command" | "file">;
  url?: string;
  command?: string;
  filePath?: string;
}

export function buildPromptExecutionPlan(prompt: string): PromptExecutionPlan {
  const normalized = prompt.trim();
  const lower = normalized.toLowerCase();

  const actions: PromptExecutionPlan["actions"] = [];
  const queryParts: string[] = [];

  if (lower.includes("subscribe") || lower.includes("channel")) {
    actions.push("subscribe");
    queryParts.push(normalized.replace(/\b(subscribe|to|channel|channels)\b/gi, "").trim());
  }

  if (lower.includes("watch") || lower.includes("tutorial") || lower.includes("video") || lower.includes("show")) {
    actions.push("watch");
    queryParts.push(normalized.replace(/\b(watch|video|videos|tutorial|tutorials|show|shows)\b/gi, "").trim());
  }

  if (lower.includes("search") || lower.includes("find") || lower.includes("discover") || lower.includes("look for")) {
    actions.push("search");
    queryParts.push(normalized.replace(/\b(search|find|discover|look for)\b/gi, "").trim());
  }

  if (lower.includes("profile") || lower.includes("sign in") || lower.includes("login") || lower.includes("account")) {
    actions.push("profile");
  }

  const commandMatch = normalized.match(/\b(?:run|execute|start|launch|npm|pnpm|yarn|python|node|git)\b[^\n]+/i);
  if (commandMatch) {
    actions.push("command");
    return {
      query: queryParts.filter(Boolean).join(" ") || normalized,
      actions: Array.from(new Set(actions)),
      command: commandMatch[0].trim()
    };
  }

  const fileMatch = normalized.match(/\b(?:create|write|save|make)\b.+\b(file|report|summary|note|log)\b/i);
  if (fileMatch) {
    actions.push("file");
    const filePath = normalized.match(/([A-Za-z0-9_./-]+\.(?:md|txt|json|csv|log))/i)?.[1] || "output.txt";
    return {
      query: normalized,
      actions: Array.from(new Set(actions)),
      filePath
    };
  }

  const urlMatch = normalized.match(/\b(?:https?:\/\/|www\.)[^\s]+/i);
  if (urlMatch) {
    actions.push("navigate");
    return {
      query: queryParts.filter(Boolean).join(" ") || normalized,
      actions: Array.from(new Set(actions)),
      url: urlMatch[0].startsWith("http") ? urlMatch[0] : `https://${urlMatch[0]}`
    };
  }

  if (actions.length === 0) {
    actions.push("search", "watch");
  } else if ((actions.includes("watch") || actions.includes("subscribe")) && !actions.includes("search")) {
    actions.unshift("search");
  }

  return {
    query: queryParts.filter(Boolean).join(" ") || normalized,
    actions: Array.from(new Set(actions))
  };
}
