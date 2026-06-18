import type { AgentConfig } from "./types.js";
import type { Page } from "playwright";
import { Agent } from "./agent.js";

export async function runAgents(agentConfigs: AgentConfig[], page: Page, concurrency = 1): Promise<void> {
    if (concurrency <= 1) {
        for (const config of agentConfigs) {
            const agent = new Agent(config, page);
            console.log(`Starting ${config.id} (${config.taskType})`);
            try {
                await agent.run();
                console.log(`Completed ${config.id}`);
            } catch (error) {
                console.error(`Agent ${config.id} failed:`, error);
            }
            await page.waitForTimeout(1000);
        }
        return;
    }

    for (let i = 0; i < agentConfigs.length; i += concurrency) {
        const batch = agentConfigs.slice(i, i + concurrency);
        await Promise.all(batch.map(async (config) => {
            const agent = new Agent(config, page);
            console.log(`Starting ${config.id} (${config.taskType})`);
            try {
                await agent.run();
                console.log(`Completed ${config.id}`);
            } catch (error) {
                console.error(`Agent ${config.id} failed:`, error);
            }
        }));
        await page.waitForTimeout(1000);
    }
}
