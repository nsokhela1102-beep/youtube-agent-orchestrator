import { launchBrowser, createNewPage } from "./youtubeAutomation.js";
import { AGENTS } from "./agents.js";
import { runAgents } from "./orchestrator.js";

async function main() {
  const countArg = process.argv[2];
  const agentCount = countArg ? Math.max(1, Math.min(100, Number(countArg))) : 5;
  const concurrencyEnv = process.env.MAX_CONCURRENCY || process.argv[3];
  const concurrency = concurrencyEnv ? Math.max(1, Number(concurrencyEnv)) : 1;

  const browser = await launchBrowser();
  const page = await createNewPage(browser);

  await runAgents(AGENTS.slice(0, agentCount), page, concurrency);

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
