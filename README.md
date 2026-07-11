# Sokhela's Agents Prompt UI

[![CI](https://github.com/nsokhela1102-beep/youtube-agent-orchestrator/actions/workflows/ci.yml/badge.svg)](https://github.com/nsokhela1102-beep/youtube-agent-orchestrator/actions/workflows/ci.yml)

This workspace contains a TypeScript scaffold for orchestrating multiple generic prompt-driven automation agents.

## What is included

- `src/agents.ts`: 100 agent definitions with distinct task profiles.
- `src/browserAutomation.ts`: browser automation helpers for generic web navigation and browser tasks.
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

This scaffold is intended for experimentation and learning. Do not use automation to violate website policies, or to create accounts in ways that violate terms of service.

Account creation and sign-in flows may require manual interaction, CAPTCHA solving, or identity verification that cannot be fully automated in a compliant way.

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

Run the prompt-based UI locally:

```powershell
npm run dev:ui
```

Then open `http://localhost:3000` and enter a prompt such as "watch AI tutorials" or "subscribe to programming channels." The UI will launch agents based on your prompt.

CI notes: The provided GitHub Actions workflow includes caching for `npm` and Playwright browser downloads to speed up repeated runs.

## How to merge

1. Review the PR changes on GitHub:
   - https://github.com/nsokhela1102-beep/youtube-agent-orchestrator/pull/1
2. Ensure the CI workflow passes.
3. If the changes are acceptable, merge using `Merge pull request`.
4. Delete the branch if you no longer need it.

## Auto-approve PR instructions

If you want to approve and merge from the command line after CI passes, use:

```powershell
gh pr review 1 --approve
gh pr merge 1 --merge
```
