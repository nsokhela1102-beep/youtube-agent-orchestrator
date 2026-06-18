import { Browser, Page } from "playwright";
import type { AgentConfig } from "./types.js";

export async function launchBrowser(): Promise<Browser> {
  const playwright = await import("playwright");
  const headless = process.env.HEADLESS === "true";
  return await playwright.chromium.launch({ headless });
}

export async function createNewPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext();
  return await context.newPage();
}

export async function gotoYouTube(page: Page): Promise<void> {
  await page.goto("https://www.youtube.com", { waitUntil: "domcontentloaded" });
}

export async function searchYouTube(page: Page, query: string): Promise<void> {
  await gotoYouTube(page);
  await page.waitForSelector("input#search");
  await page.fill("input#search", query);
  await page.keyboard.press("Enter");
  await page.waitForLoadState("networkidle");
}

export async function subscribeToChannel(page: Page): Promise<boolean> {
  const subscribeButton = await page.$("yt-formatted-string#subscribe-button-text, tp-yt-paper-button#subscribe-button");
  if (!subscribeButton) {
    return false;
  }
  const text = (await subscribeButton.innerText()).toLowerCase();
  if (text.includes("subscribed") || text.includes("subscribed")) {
    return false;
  }
  await subscribeButton.click();
  return true;
}

export async function watchVideo(page: Page, durationSeconds = 15): Promise<void> {
  await page.waitForSelector("video", { timeout: 15000 });
  await page.waitForTimeout(durationSeconds * 1000);
}

export async function openVideo(page: Page, videoUrl: string): Promise<void> {
  await page.goto(videoUrl, { waitUntil: "load" });
  await page.waitForSelector("video", { timeout: 15000 });
}

export async function signInYouTube(page: Page, agent: AgentConfig): Promise<boolean> {
  await gotoYouTube(page);
  const signInLink = await page.$("a[href*='ServiceLogin']");
  if (!signInLink) {
    return false;
  }
  await signInLink.click();
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("input[type='email'], input[type='text']", { timeout: 10000 });
  await page.fill("input[type='email'], input[type='text']", agent.profile.emailHint);
  await page.keyboard.press("Enter");
  return true;
}

export async function createProfilePlaceholder(page: Page, agent: AgentConfig): Promise<boolean> {
  await gotoYouTube(page);
  await page.waitForTimeout(3000);
  return true;
}
