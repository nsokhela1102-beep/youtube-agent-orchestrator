import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { taskRunner } from './taskRunner.js';
import { buildPromptExecutionPlan } from './promptPlanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/voice', (req, res) => {
    res.sendFile(path.join(__dirname, 'voiceUI_wired.html'));
});

app.get('/status', (req, res) => {
    res.json({ online: true });
});

app.get('/', (req, res) => {
    res.send('Voice server running. Go to /voice');
});

app.post('/execute', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log('Got prompt:', prompt);
        const plan: any = await buildPromptExecutionPlan(prompt);
        let tasks = [];
        if (Array.isArray(plan)) tasks = plan;
        else if (plan.tasks) tasks = plan.tasks;
        else if (plan.actions) tasks = plan.actions.map((action: string, i: number) => ({ taskId: `${action}-${i}`, type: action, query: prompt }));
        else tasks = [{ taskId: 'navigate-0', type: 'navigate', query: prompt }];
        const results = await taskRunner(tasks);
        res.json({ status: 'EXECUTED', tasks, results });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.listen(3001, () => {
    console.log('✅ Voice server running on http://localhost:3001/voice');
});