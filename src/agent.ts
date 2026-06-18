import type { AgentConfig } from "./types.js";
import type { Page } from "playwright";
import { 
  gotoYouTube,
  searchYouTube,
  openVideo,
  watchVideo,
  subscribeToChannel,
  signInYouTube,
  createProfilePlaceholder
} from "./youtubeAutomation.js";

export class Agent {
  constructor(public config: AgentConfig, private page: Page | null) {}

  async run(): Promise<void> {
    if (!this.page) {
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
    }
  }

  private async executeWatchTask(): Promise<void> {
    await searchYouTube(this.page!, `${this.config.interests[0]} ${this.config.interests[1]} trending`);
    const firstVideo = await this.page!.$("ytd-video-renderer a#video-title");
    if (firstVideo) {
      const url = await firstVideo.getAttribute("href");
      if (url) {
        await openVideo(this.page!, `https://www.youtube.com${url}`);
        await watchVideo(this.page!);
      }
    }
  }

  private async executeSubscribeTask(): Promise<void> {
    await searchYouTube(this.page!, `${this.config.interests[0]} ${this.config.interests[1]} channel`);
    const channelLink = await this.page!.$("a#main-link");
    if (channelLink) {
      const url = await channelLink.getAttribute("href");
      if (url) {
        await this.page!.goto(`https://www.youtube.com${url}`, { waitUntil: "domcontentloaded" });
        await subscribeToChannel(this.page!);
      }
    }
  }

  private async executeSearchTask(): Promise<void> {
    await searchYouTube(this.page!, `${this.config.interests[0]} ${this.config.interests[1]} tutorials`);
  }

  private async executeProfileTask(): Promise<void> {
    await signInYouTube(this.page!, this.config);
    await createProfilePlaceholder(this.page!, this.config);
  }
}
