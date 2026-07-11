import express, { type Request, type Response } from "express";
import { launchBrowser } from "./browserAutomation.js";
import { AGENTS } from "./agents.js";
import { runAgents } from "./orchestrator.js";
import type { AgentConfig } from "./types.js";
import type { LogCallback } from "./orchestrator.js";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sokhela's Agents Prompt UI</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f1f4f9; }
    .container { max-width: 900px; margin: 40px auto; padding: 24px; background: white; border-radius: 12px; box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
    h1 { margin: 0 0 16px; }
    textarea, input { width: 100%; font-size: 1rem; padding: 10px; margin-bottom: 12px; }
    button { background: #2563eb; color: white; border: none; padding: 12px 18px; border-radius: 8px; cursor: pointer; font-size: 1rem; }
    button:hover { background: #1d4ed8; }
    pre { background: #111827; color: #f8fafc; padding: 16px; border-radius: 10px; min-height: 220px; overflow-x: auto; white-space: pre-wrap; }
    .row { display: grid; gap: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Sokhela's Agents Prompt UI</h1>
    <div class="row">
      <input id="agentCount" type="number" min="1" max="20" value="3" placeholder="Agent count" />
      <input id="concurrency" type="number" min="1" max="5" value="1" placeholder="Concurrency" />
      <textarea id="prompt" rows="4" placeholder="Example: Check the weather in Alberton and search jobs at Standard Bank and FNB."></textarea>
      <button id="runButton">Run Agents</button>
      <div id="status" style="font-weight: 600; margin-bottom: 12px; color: #1f2937;">Ready to execute prompt.</div>
    </div>
    <div style="margin-top: 16px;">
      <pre id="output"></pre>
    </div>
  </div>
  <script>

    function appendLog(message) {
      const output = document.getElementById('output');
      if (!output) return;
      output.textContent += message + '\n';
      output.scrollTop = output.scrollHeight;
    }

    function setStatus(message) {
      const status = document.getElementById('status');
      if (status) {
        status.textContent = message;
      }
    }

    let eventSource = null;

    function createEventSource(prompt, agentCount, concurrency) {
      const url = '/events?prompt=' + encodeURIComponent(prompt) + '&agentCount=' + agentCount + '&concurrency=' + concurrency;
      const source = new EventSource(url);

      source.onopen = () => {
        setStatus('Agents are executing the prompt...');
        appendLog('Connected to agent stream...');
      };

      source.onmessage = (event) => {
        const payload = event.data;
        appendLog(payload);
      };

      source.addEventListener('end', () => {
        appendLog('Agent execution completed.');
        setStatus('Agent execution completed.');
        const button = document.getElementById('runButton');
        if (button) button.disabled = false;
        source.close();
      });

      source.onerror = () => {
        appendLog('Agent execution stream ended with an error.');
        setStatus('Agent execution failed.');
        const button = document.getElementById('runButton');
        if (button) button.disabled = false;
        source.close();
      };

      return source;
    }

    function handleRunClick() {
      const promptElement = document.getElementById('prompt');
      const agentCountElement = document.getElementById('agentCount');
      const concurrencyElement = document.getElementById('concurrency');
      const button = document.getElementById('runButton');

      const prompt = promptElement ? promptElement.value.trim() : '';
      const agentCount = agentCountElement ? Number(agentCountElement.value) : 1;
      const concurrency = concurrencyElement ? Number(concurrencyElement.value) : 1;

      if (!prompt) {
        alert('Enter a prompt to continue.');
        return;
      }

      if (eventSource) {
        eventSource.close();
      }

      if (button) {
        button.disabled = true;
      }

      setStatus('Launching agents...');
      const output = document.getElementById('output');
      if (output) {
        output.textContent = '';
      }
      appendLog('Prompt: ' + prompt);
      appendLog('Agents: ' + agentCount + ', Concurrency: ' + concurrency);

      eventSource = createEventSource(prompt, agentCount, concurrency);
    }

    const button = document.getElementById('runButton');
    if (button) {
      button.addEventListener('click', handleRunClick);
    }
  </script>
</body>
</html>`);
});

function chooseTaskType(prompt: string): "search" | "profile" | "navigate" {
    const normalized = prompt.toLowerCase();
    if (normalized.includes("profile") || normalized.includes("sign in") || normalized.includes("login") || normalized.includes("account")) {
        return "profile";
    }
    const urlPattern = /\b(?:https?:\/\/|www\.)[^\s]+/i;
    const domainPattern = /\b[a-z0-9-]+(?:\.(?:com|net|org|io|ai|gov|edu|co|tv|me|app|dev|tech))(?:\/[^"]*)?/i;
    if (urlPattern.test(normalized) || domainPattern.test(normalized)) {
        return "navigate";
    }
    return "search";
}

function splitPromptIntoAgentTasks(prompt: string): string[] {
    const separators = /(?:\b1 agent must\b|\b2 agent must\b|\b3 agent must\b|\bfirst agent must\b|\bsecond agent must\b|\bthird agent must\b|,\s*another agent must\b|\banother agent must\b|\banother must\b|\bthen\b|\band then\b|\badditionally\b|\balso\b|\bnext\b|\b;\b)/gi;
    const parts = prompt
        .split(separators)
        .map((part) => part.trim())
        .filter(Boolean);

    if (parts.length === 0) {
        return [prompt.trim()];
    }

    return parts;
}

function createPromptAgents(prompt: string, count: number): AgentConfig[] {
    const clauses = splitPromptIntoAgentTasks(prompt);
    return Array.from({ length: count }, (_, index) => {
        const clause = clauses[index] || clauses[clauses.length - 1] || prompt;
        const taskType = chooseTaskType(clause);
        return {
            ...AGENTS[index % AGENTS.length],
            taskType,
            promptText: clause,
            id: `prompt-agent-${index + 1}`,
            description: `Prompt-driven ${taskType} agent for: ${clause}`
        };
    });
}

app.get("/events", async (req: Request, res: Response) => {
    const prompt = String(req.query.prompt || "");
    const count = Math.max(1, Math.min(20, Number(req.query.agentCount) || 1));
    const parallel = Math.max(1, Math.min(5, Number(req.query.concurrency) || 1));

    if (!prompt) {
        res.status(400).json({ error: "Prompt is required." });
        return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendEvent = (message: string) => {
        res.write(`data: ${message}\n\n`);
    };

    const browser = await launchBrowser();
    try {
        sendEvent(`Planning prompt: ${prompt}`);
        await runAgents(createPromptAgents(prompt, count), browser, parallel, sendEvent);
        sendEvent(`Finished prompt execution for: ${prompt}`);
        res.write(`event: end\ndata: completed\n\n`);
    } catch (error) {
        console.error(error);
        sendEvent(`Error: ${error}`);
        res.write(`event: end\ndata: failed\n\n`);
    } finally {
        await browser.close();
        res.end();
    }
});

app.listen(port, () => {
    console.log(`Prompt UI available at http://localhost:${port}`);
});
