import type { AgentConfig } from "./types.js";
import type { Browser, Page } from "playwright";
import { createNewPage } from "./browserAutomation.js";
import { runTaskForAgent } from "./taskRunner.js";

export type LogCallback = (message: string) => void;

export async function runAgents(agentConfigs: AgentConfig[], browser: Browser, concurrency = 1, onLog: LogCallback = () => { }): Promise<void> {
    const workers = Math.max(1, concurrency);
    const queue = [...agentConfigs];

    async function runNextBatch(): Promise<void> {
        if (queue.length === 0) {
            return;
        }

        const batch = queue.splice(0, workers);
        await Promise.all(batch.map(async (config) => {
            const page = await createNewPage(browser);
            const startMessage = `Starting ${config.id} (${config.taskType})`;
            console.log(startMessage);
            onLog(startMessage);
            try {
                const result = await runTaskForAgent(config, page);
                const outcomeMessage = result.success
                    ? `SUCCESS: Agent ${config.id} ${result.message}`
                    : `FAILED: Agent ${config.id} ${result.message}`;
                console.log(outcomeMessage);
                onLog(outcomeMessage);
            } catch (error) {
                const errorMessage = `FAILED: Agent ${config.id} could not complete the task. ${error}`;
                console.error(errorMessage);
                onLog(errorMessage);
            } finally {
                await page.close();
            }
        }));

        if (queue.length > 0) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await runNextBatch();
        }
    }

    await runNextBatch();
}
