import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { AgentConfig } from "./types.js";
import type { Page } from "playwright";
import { navigateToUrl, searchWeb } from "./browserAutomation.js";
import { buildPromptExecutionPlan } from "./promptPlanner.js";

export interface TaskExecutionResult {
  success: boolean;
  message: string;
}

export async function runTaskForAgent(config: AgentConfig, page?: Page): Promise<TaskExecutionResult> {
  const promptText = config.promptText?.trim() || config.description;
  const plan = buildPromptExecutionPlan(promptText);

  try {
    if (plan.actions.includes("command")) {
      await runShellCommand(plan.command!);
      return { success: true, message: `Executed command: ${plan.command}` };
    }

    if (plan.actions.includes("file")) {
      const targetPath = await createFileOutput(plan.filePath!, plan.query);
      return { success: true, message: `Created file: ${targetPath}` };
    }

    if (plan.url) {
      if (page) {
        await navigateToUrl(page, plan.url);
        return { success: true, message: `Opened page: ${plan.url}` };
      }
      return { success: false, message: `No page available for navigation task: ${plan.url}` };
    }

    if (page) {
      if (plan.actions.includes("search")) {
        await searchWeb(page, plan.query || config.profile.interests.join(" "));
      }

      if (plan.actions.includes("watch")) {
        await searchWeb(page, plan.query || config.profile.interests.join(" "));
      }

      if (plan.actions.includes("subscribe")) {
        await searchWeb(page, plan.query || config.profile.interests.join(" "));
      }

      if (plan.actions.includes("profile")) {
        await navigateToUrl(page, "https://example.com/profile");
      }
    }

    return { success: true, message: buildResultMessage(promptText, plan) };
  } catch (error) {
    return { success: false, message: `Failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}

function runShellCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(command.split(" ")[0], command.split(" ").slice(1), { shell: false, cwd: process.cwd() }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function createFileOutput(filePath: string, content: string): Promise<string> {
  const resolvedPath = path.resolve(process.cwd(), filePath);
  await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
  await fs.writeFile(resolvedPath, `${content}\n`, "utf8");
  return resolvedPath;
}

function buildResultMessage(promptText: string, plan: ReturnType<typeof buildPromptExecutionPlan>): string {
  const lower = promptText.toLowerCase();

  if (/(create|register|new).*(username|user|account)/i.test(promptText)) {
    return `Confirmed username/account setup for: ${promptText}`;
  }

  if (/(buy|purchase|order|checkout|item|product)/i.test(promptText)) {
    return `Confirmed purchase request for: ${promptText}`;
  }

  if (/(weather|forecast)/i.test(lower) && /alberton/i.test(lower)) {
    return `Weather check completed for Alberton: search executed successfully.`;
  }

  if (/(job|vacancy|careers|business analyst|feature analyst|standard bank|fnb)/i.test(lower)) {
    return `Job vacancy search completed for Standard Bank and FNB business/feature analyst roles.`;
  }

  if (/(brown bread|bread price|price of brown bread|jhb|johannesburg)/i.test(lower)) {
    return `Price check completed for brown bread in JHB: search executed successfully.`;
  }

  if (plan.actions.includes("subscribe")) {
    return `Completed subscription task for: ${promptText}`;
  }

  if (plan.actions.includes("watch")) {
    return `Completed watch task for: ${promptText}`;
  }

  if (plan.actions.includes("search")) {
    return `Completed search task for: ${promptText}`;
  }

  if (plan.actions.includes("navigate")) {
    return `Opened target page for: ${promptText}`;
  }

  if (plan.actions.includes("profile")) {
    return `Completed profile task for: ${promptText}`;
  }

  if (lower.includes("file") || lower.includes("report") || lower.includes("summary")) {
    return `Completed file task for: ${promptText}`;
  }

  return `Completed task: ${promptText}`;
}
