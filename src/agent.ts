import type { AgentConfig } from "./types.js";
import type { Page } from "playwright";
import { searchWeb, navigateToUrl, normalizeUrlFromPrompt } from "./browserAutomation.js";
import { buildPromptExecutionPlan } from "./promptPlanner.js";

export class Agent {
  constructor(public config: AgentConfig, private page: Page | null) { }

  async run(): Promise<void> {
    if (!this.page) {
      return;
    }

    if (this.config.promptText) {
      await this.executePromptSequence();
      return;
    }

    switch (this.config.taskType) {
      case "watch":
        await this.executeWatchTask();
        break;
      case "subscribe":
        await this.executeSubscribeTask();
        break;
      case "search":
        await this.executeSearchTask();
        break;
      case "profile":
        await this.executeProfileTask();
        break;
      case "navigate":
        await this.executeNavigateTask();
        break;
    }
  }

  private getPromptQuery(defaultQuery: string): string {
    return this.config.promptText?.trim() || defaultQuery;
  }

  private async executePromptSequence(): Promise<void> {
    const promptText = this.getPromptQuery(this.config.description);
    const plan = buildPromptExecutionPlan(promptText);

    if (plan.url) {
      await navigateToUrl(this.page!, plan.url);
      return;
    }

    if (plan.actions.includes("search") || plan.actions.includes("watch") || plan.actions.includes("subscribe")) {
      await searchWeb(this.page!, plan.query || this.config.profile.interests.join(" "));
    }

    if (plan.actions.includes("profile")) {
      const profileTarget = normalizeUrlFromPrompt(promptText) || "https://example.com/profile";
      await navigateToUrl(this.page!, profileTarget);
    }
  }

  private async executeWatchTask(): Promise<void> {
    await searchWeb(this.page!, this.getPromptQuery(this.config.profile.interests.join(" ")));
  }

  private async executeSubscribeTask(): Promise<void> {
    await searchWeb(this.page!, this.getPromptQuery(this.config.profile.interests.join(" ")));
  }

  private async executeSearchTask(): Promise<void> {
    await searchWeb(this.page!, this.getPromptQuery(this.config.profile.interests.join(" ")));
  }

  private async executeNavigateTask(): Promise<void> {
    const prompt = this.getPromptQuery("");
    const url = normalizeUrlFromPrompt(prompt);
    if (!url) {
      throw new Error(`No URL found in prompt: "${prompt}"`);
    }
    await navigateToUrl(this.page!, url);
  }

  private async executeProfileTask(): Promise<void> {
    const profileTarget = normalizeUrlFromPrompt(this.getPromptQuery("")) || "https://example.com/profile";
    await navigateToUrl(this.page!, profileTarget);
  }
}
