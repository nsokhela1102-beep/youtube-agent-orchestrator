import * as taskRunnerMod from "./taskRunner.js";
import { planTasks } from "./promptPlanner.js";
import * as uiMod from "./ui.js";

// handles: export class UniversalUI, export default, or export class UI
const UniversalUI = (uiMod as any).UniversalUI ?? (uiMod as any).default ?? (uiMod as any).UI;

// handles: export function taskRunner, export const taskRunner = { run }, or default
const taskRunner: any = (taskRunnerMod as any).taskRunner ?? (taskRunnerMod as any).default ?? taskRunnerMod;

export async function runOrchestrator() {
    const ui = new UniversalUI();

    while (true) {
        const userPrompt = await ui.getPromptFromUI();
        console.log(` [${userPrompt.medium.toUpperCase()}] ${userPrompt.text}`);

        const { tasks, humanUnderstanding } = await planTasks(userPrompt.text);

        const confirmed = await ui.confirmWithSameMedium(userPrompt, humanUnderstanding);
        if (!confirmed) {
            console.log("❌ Cancelled by user");
            const statusDiv = document.getElementById('status') as HTMLElement;
            if (statusDiv) statusDiv.innerText = "Cancelled. Give me a new instruction.";
            continue;
        }

        console.log("✅ Confirmed - Executing...");

        const groups = [...new Set(tasks.map(t => t.parallelGroup))] as number[];
        for (const groupId of groups.sort((a: number, b: number) => a - b)) {
            const groupTasks = tasks.filter(t => t.parallelGroup === groupId);
            await Promise.all(
                groupTasks.map(t => {
                    if (typeof taskRunner === 'function') return taskRunner(t);
                    if (typeof taskRunner.run === 'function') return taskRunner.run(t);
                    if (typeof taskRunner.execute === 'function') return taskRunner.execute(t);
                    return taskRunner(t);
                })
            );
        }
    }
}