import { taskRunner } from "./taskRunner";
import { planTasks } from "./promptPlanner";
import { UniversalUI } from "./ui";

export async function runOrchestrator() {
    const ui = new UniversalUI();

    while (true) {
        const userPrompt = await ui.getPromptFromUI();
        console.log(`📥 [${userPrompt.medium.toUpperCase()}] ${userPrompt.text}`);

        const { tasks, humanUnderstanding } = await planTasks(userPrompt.text);

        const confirmed = await ui.confirmWithSameMedium(userPrompt, humanUnderstanding);
        if (!confirmed) {
            console.log("❌ Cancelled by user");
            const statusDiv = document.getElementById('status') as HTMLElement;
            if (statusDiv) statusDiv.innerText = "Cancelled. Give me a new instruction.";
            continue;
        }

        console.log("✅ Confirmed - Executing...");
        for (const groupId of [...new Set(tasks.map(t => t.parallelGroup))].sort((a, b) => a - b)) {
            const groupTasks = tasks.filter(t => t.parallelGroup === groupId);
            await Promise.all(groupTasks.map(t => taskRunner.run(t)));
        }

        const statusDiv = document.getElementById('status') as HTMLElement;
        if (statusDiv) statusDiv.innerText = "✅ Done! Report sent. Give me next instruction.";
    }
}

// Keep old export for index.ts compatibility
export const runAgents = runOrchestrator;