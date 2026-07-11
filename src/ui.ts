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
    pre { background: #111827; color: #f8fafc; padding: 16px; border-radius: 10px; min-height: 180px; overflow-x: auto; }
    .row { display: grid; gap: 12px; }
    .panels { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 16px; }
    .panel { background: #ffffff; border: 1px solid #d1d5db; border-radius: 12px; padding: 16px; }
    .panel h2 { margin: 0 0 12px; font-size: 1rem; color: #111827; }
    .panel-list { list-style: none; padding: 0; margin: 0; max-height: 280px; overflow-y: auto; }
    .panel-item { padding: 10px 12px; border-radius: 8px; margin-bottom: 10px; background: #f8fafc; border: 1px solid #e5e7eb; }
    .panel-item.success { border-color: #22c55e; background: #ecfdf5; }
    .panel-item.failure { border-color: #ef4444; background: #fef2f2; }
    .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
    .summary-card { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; min-width: 0; }
    .summary-card strong { display: block; font-size: 1.6rem; margin-bottom: 6px; }
    .summary-status { margin-top: 14px; font-weight: 600; color: #1d4ed8; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Sokhela's Agents Prompt UI</h1>
    <p>Enter a prompt and launch a batch of automation agents. The output screen shows successes, failures, and task execution details in separate panels.</p>
    <div class="row">
      <input id="agentCount" type="number" min="1" max="20" value="3" placeholder="Agent count" />
      <input id="concurrency" type="number" min="1" max="5" value="1" placeholder="Concurrency" />
      <textarea id="prompt" rows="4" placeholder="Example: Watch AI tutorials and subscribe to learning channels."></textarea>
      <button id="runButton">Run Agents</button>
      <div id="status" style="font-weight: 600; margin-bottom: 12px; color: #1f2937;">Ready to execute prompt.</div>
    </div>
    <div class="summary">
      <div class="summary-card">
        <strong id="totalCount">0</strong>
        Total events
      </div>
      <div class="summary-card">
        <strong id="successCount">0</strong>
        Successes
      </div>
      <div class="summary-card">
        <strong id="failureCount">0</strong>
        Failures
      </div>
    </div>
    <div id="summaryMessage" class="summary-status">Waiting for agents to start.</div>
    <div class="panels">
      <div class="panel">
        <h2>Successes</h2>
        <ul class="panel-list" id="successList"></ul>
      </div>
      <div class="panel">
        <h2>Failures</h2>
        <ul class="panel-list" id="failureList"></ul>
      </div>
    </div>
    <div class="panel" style="margin-top: 16px;">
      <h2>Event log</h2>
      <pre id="output"></pre>
    </div>
  </div>
  <script>

    let totalEvents = 0;
    let successEvents = 0;
    let failureEvents = 0;

    function appendLog(message) {
      const output = document.getElementById('output');
      if (!output) return;
      output.textContent += message + '\n';
      output.scrollTop = output.scrollHeight;
    }

    function updateCounters() {
      const totalCount = document.getElementById('totalCount');
      const successCount = document.getElementById('successCount');
      const failureCount = document.getElementById('failureCount');
      if (totalCount) totalCount.textContent = String(totalEvents);
      if (successCount) successCount.textContent = String(successEvents);
      if (failureCount) failureCount.textContent = String(failureEvents);
    }

    function addPanelEntry(listId, message, type) {
      const list = document.getElementById(listId);
      if (!list) return;
      const item = document.createElement('li');
      item.textContent = message;
      item.className = 'panel-item ' + type;
      list.prepend(item);
    }

    function setStatus(message) {
      const status = document.getElementById('status');
      if (status) {
        status.textContent = message;
      }
    }

    function setSummary(message, isError = false) {
      const summary = document.getElementById('summaryMessage');
      if (!summary) return;
      summary.textContent = message;
      summary.style.color = isError ? '#b91c1c' : '#1d4ed8';
    }
    let eventSource = null;

    function createEventSource(prompt, agentCount, concurrency) {
      const url = '/events?prompt=' + encodeURIComponent(prompt) + '&agentCount=' + agentCount + '&concurrency=' + concurrency;
      const source = new EventSource(url);

      source.onopen = () => {
        setStatus('Agents are executing the prompt...');
        appendLog('Connected to agent stream...');
        setSummary('Agents are running. Results will appear here as they complete.');
      };

      source.onmessage = (event) => {
        const payload = event.data;
        totalEvents += 1;
        appendLog(payload);

        if (payload.includes('SUCCESS:')) {
          successEvents += 1;
          const message = payload.replace('SUCCESS: ', '');
          addPanelEntry('successList', message, 'success');
          setSummary(message);
        } else if (payload.includes('FAILED:')) {
          failureEvents += 1;
          const message = payload.replace('FAILED: ', '');
          addPanelEntry('failureList', message, 'failure');
          setSummary(message, true);
        } else {
          setSummary(payload);
        }

        updateCounters();
      };

      source.addEventListener('end', () => {
        appendLog('Agent execution completed.');
        setStatus('Agent execution completed.');
        setSummary('Execution completed. Review the log and panels for task outcomes.');
        const button = document.getElementById('runButton');
        if (button) button.disabled = false;
        source.close();
      });

      source.onerror = () => {
        appendLog('Agent execution stream ended with an error.');
        setStatus('Agent execution failed.');
        setSummary('The stream ended unexpectedly. Some agents may not have finished.', true);
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
      setSummary('Starting execution...');
      totalEvents = 0;
      successEvents = 0;
      failureEvents = 0;
      updateCounters();
      const successList = document.getElementById('successList');
      const failureList = document.getElementById('failureList');
      const output = document.getElementById('output');
      if (successList) successList.textContent = '';
      if (failureList) failureList.textContent = '';
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

function chooseTaskType(prompt: string): "watch" | "subscribe" | "search" | "profile" | "navigate" {
    const normalized = prompt.toLowerCase();
    if (normalized.includes("subscribe") || normalized.includes("channel")) {
        return "subscribe";
    }
    if (normalized.includes("search") || normalized.includes("find") || normalized.includes("discover") || normalized.includes("tutorial")) {
        return "search";
    }
    if (normalized.includes("profile") || normalized.includes("sign in") || normalized.includes("login") || normalized.includes("account")) {
        return "profile";
    }
    const urlPattern = /\b(?:https?:\/\/|www\.)[^\s]+/i;
    const domainPattern = /\b[a-z0-9-]+(?:\.(?:com|net|org|io|ai|gov|edu|co|tv|me|app|dev|tech))(?:\/[^\s]*)?/i;
    if (urlPattern.test(normalized) || domainPattern.test(normalized)) {
        return "navigate";
    }
    return "watch";
}

function createPromptAgents(prompt: string, count: number): AgentConfig[] {
    const taskType = chooseTaskType(prompt);
    return AGENTS.slice(0, count).map((agent, index) => ({
        ...agent,
        taskType,
        promptText: prompt,
        id: `prompt-agent-${index + 1}`,
        description: `Prompt-driven ${taskType} agent`
    }));
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
