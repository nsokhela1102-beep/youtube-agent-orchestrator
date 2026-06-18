# YouTube AI Agent Orchestrator

This workspace contains a TypeScript scaffold for orchestrating multiple automation agents designed to interact with YouTube.

## What is included

- `src/agents.ts`: 100 agent definitions with distinct task profiles.
- `src/youtubeAutomation.ts`: browser automation helpers for YouTube navigation, watch, subscribe, and sign-in workflows.
- `src/agent.ts`: agent orchestration layer.
- `src/index.ts`: example entrypoint to boot a subset of agents.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Install Playwright browsers:
   ```bash
   npm run prepare
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```
4. Build and run:
   ```bash
   npm run build
   npm run start
   ```

5. Run tests:
   ```bash
   npm run test
   ```

## Node Installation

If `node` or `npm` are not installed, install Node.js from https://nodejs.org/ or use a Windows package manager such as `winget` or `chocolatey`.

Example with winget:
```powershell
winget install OpenJS.NodeJS
```

## Important

This scaffold is intended for experimentation and learning. Do not use automation to violate YouTube or Google policies, or to create accounts in ways that violate terms of service.

YouTube account creation and sign-in flows may require manual interaction, CAPTCHA solving, or identity verification that cannot be fully automated in a compliant way.

## Concurrency & Headless Examples

Run the orchestrator headless (uses the `HEADLESS` env):

```powershell
# Run 5 agents headless
cross-env HEADLESS=true node dist/index.js 5
```

Run with concurrency (use `MAX_CONCURRENCY`):

```powershell
# Run 20 agents with concurrency of 5 (5 agents in parallel)
cross-env MAX_CONCURRENCY=5 HEADLESS=true node dist/index.js 20
```

Development (ts-node) headless:

```powershell
npx cross-env HEADLESS=true ts-node src/index.ts 5
```

CI notes: The provided GitHub Actions workflow includes caching for `npm` and Playwright browser downloads to speed up repeated runs.
