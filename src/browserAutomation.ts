import { Browser, Page } from "playwright";

export async function launchBrowser(): Promise<Browser> {
  const playwright = await import("playwright");
  const headless = process.env.HEADLESS === "true";
  return await playwright.chromium.launch({ headless });
}

export async function createNewPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext();
  return await context.newPage();
}

export async function searchWeb(page: Page, query: string): Promise<void> {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  await page.goto(searchUrl, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2000);
}

export async function navigateToUrl(page: Page, url: string): Promise<void> {
  const normalized = url.trim();
  const target = normalized.startsWith("http") ? normalized : `https://${normalized}`;
  await page.goto(target, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2000);
}

export function normalizeUrlFromPrompt(prompt: string): string | null {
  const urlHint = prompt.match(/\b(?:https?:\/\/|www\.)[^\s]+/i);
  if (urlHint) {
    const raw = urlHint[0];
    return raw.startsWith("http") ? raw : `https://${raw}`;
  }

  const domainHint = prompt.match(/\b[a-z0-9-]+(?:\.(?:com|net|org|io|ai|gov|edu|co|tv|me|app|dev|tech))(?:\/[^\s]*)?/i);
  if (domainHint) {
    const raw = domainHint[0];
    return raw.startsWith("http") ? raw : `https://${raw}`;
  }

  return null;
}
