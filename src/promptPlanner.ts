export function buildPromptExecutionPlan(prompt: any) {
  if (!prompt || typeof prompt !== 'string') prompt = String(prompt || '');
  const lower = prompt.toLowerCase();
  const actions: string[] = [];
  if (lower.includes("open") || lower.includes("go to") || lower.includes("navigate") || lower.includes("website") || lower.match(/https?:\/\//)) {
    actions.push("navigate");
  }
  if (lower.includes("search") || lower.includes("find")) {
    if (!actions.includes("navigate")) actions.push("navigate");
  }
  return {
    prompt,
    query: prompt,
    actions: actions.length ? [...new Set(actions)] : ["navigate"],
    url: prompt.match(/https?:\/\/[^\s]+/)?.[0],
    targetUrl: prompt.match(/https?:\/\/[^\s]+/)?.[0],
  };
}

export async function planTasks(userInstruction: any) {
  if (!userInstruction || typeof userInstruction !== 'string') userInstruction = String(userInstruction || '');
  const plan = buildPromptExecutionPlan(userInstruction);
  const tasks = plan.actions.map((type, i) => ({
    id: `${type}-${i}`,
    title: userInstruction,
    group: 1,
    parallelGroup: 1,
    type,
    payload: { instruction: userInstruction, query: userInstruction, url: plan.url },
  }));
  return { tasks, humanUnderstanding: userInstruction };
}