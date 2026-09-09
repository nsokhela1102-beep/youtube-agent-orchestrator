import * as readline from "readline/promises";
import * as fs from "fs";
import { buildPromptExecutionPlan, planTasks } from "./promptPlanner.js";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const HISTORY_FILE = "src/voiceHistory.json";
let history: { text: string; medium: "voice" | "text"; time: string }[] = [];
if (fs.existsSync(HISTORY_FILE)) {
    try { history = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8")); } catch { }
}
function saveHistory() {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

console.log("🎤 VOICE + TEXT MODE");
console.log(`📜 Remembered ${history.length} prompts`);
console.log(" Type normally = text");
console.log(" Type 'voice:...' or 'say...' = voice (typed simulation)");
console.log(" For REAL mic, open src/voiceUI.html in Chrome\n");

async function loop() {
    while (true) {
        const raw = await rl.question("👤 YOU: ");
        if (raw.toLowerCase() === "exit") break;
        if (raw.toLowerCase() === "history") {
            history.forEach((h, i) => console.log(`${i + 1}. [${h.medium}] ${h.text}`));
            continue;
        }
        if (!raw.trim()) continue;

        // FIX: Trim quotes and spaces first
        let promptText = raw.trim().replace(/^['"`]+|['"`]+$/g, "").trim();
        let medium: "voice" | "text" = "text";

        const lower = promptText.toLowerCase();
        if (lower.startsWith("voice:") || lower.startsWith("say ")) {
            medium = "voice";
            promptText = promptText.replace(/^voice:/i, "").replace(/^say /i, "").trim().replace(/^['"`]+|['"`]+$/g, "");
            console.log(`🎤 VOICE -> "${promptText}"`);
        }

        if (!promptText) continue;

        history.push({ text: promptText, medium, time: new Date().toISOString() });
        saveHistory();

        console.log("\n---");
        const plan = buildPromptExecutionPlan(promptText);
        console.log(`MEDIUM: ${medium}`);
        console.log("PLAN:", JSON.stringify(plan, null, 2));
        const { tasks, humanUnderstanding } = await planTasks(promptText);
        console.log("UNDERSTOOD:", humanUnderstanding);
        console.log("TASKS:", tasks.map(t => t.type).join(", "));
        console.log("---\n");
    }
    rl.close();
}
loop();