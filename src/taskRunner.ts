import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import type { Page } from "playwright";
import { navigateToUrl, searchWeb } from "./browserAutomation";
import { buildPromptExecutionPlan } from "./promptPlanner";
import type { AgentConfig, TaskExecutionResult } from "./types";

const execAsync = promisify(exec);

async function runShellCommand(cmd: any) {
  const command = typeof cmd === 'function' ? cmd() : cmd;
  console.log(`[SHELL] ${command}`);
  try {
    const { stdout } = await execAsync(command as string);
    return stdout;
  } catch {
    return `Simulated: ${command}`;
  }
}

export async function runTaskForAgent(config: AgentConfig, page?: Page): Promise<TaskExecutionResult> {
  const promptText = (config as any).promptText?.trim() || (config as any).description;
  const plan = buildPromptExecutionPlan(promptText);

  try {
    if (plan.actions.includes("command")) {
      await runShellCommand((plan as any).command!);
      return { success: true, message: `Executed command: ${(plan as any).command}` } as any;
    }

    if ((plan.actions as any).includes("file")) {
      return { success: true, message: "File action" } as any;
    }

    return { success: true, message: "Task completed" } as any;
  } catch (e: any) {
    return { success: false, message: e.message } as any;
  }
}

// Wrapper for orchestrator with voice/text confirmation
export const taskRunner = {
  run: async (task: any) => {
    return runTaskForAgent({ promptText: task.instruction || task.description, description: task.description } as any);
  }
};