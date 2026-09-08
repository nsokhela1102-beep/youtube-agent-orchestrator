import { AGENTS } from "./agents";
import { buildPromptExecutionPlan } from "./promptPlanner";

test("should create 100 agents", () => {
    expect(AGENTS.length).toBe(100);
});

test("should assign each agent a unique id", () => {
    const ids = AGENTS.map((agent) => agent.id);
    expect(new Set(ids).size).toBe(100);
});

test("should assign valid task types", () => {
    const validTypes = new Set(["watch", "subscribe", "search", "profile"]);
    for (const agent of AGENTS) {
        expect(validTypes.has(agent.taskType)).toBe(true);
    }
});

test("should expand complex prompts into a full execution plan", () => {
    const plan = buildPromptExecutionPlan("Watch AI tutorials and subscribe to programming channels");

    expect(plan.actions).toEqual(expect.arrayContaining(["search", "watch", "subscribe"]));
    expect(plan.query).toContain("AI tutorials");
});

test("should capture navigation prompts with a target URL", () => {
    const plan = buildPromptExecutionPlan("Open https://example.com and review the latest updates");

    expect(plan.actions).toContain("navigate");
    expect(plan.url).toBe("https://example.com");
});

test("should detect shell command prompts", () => {
    const plan = buildPromptExecutionPlan("Run npm test and verify the build");

    expect(plan.actions).toContain("command");
    expect(plan.command).toContain("npm test");
});

test("should detect file-oriented prompts", () => {
    const plan = buildPromptExecutionPlan("Create a report file with the latest summary");

    expect(plan.actions).toContain("file");
    expect(plan.filePath).toBeDefined();
});
