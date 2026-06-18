import { AGENTS } from "./agents.js";

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
