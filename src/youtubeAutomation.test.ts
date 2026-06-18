import * as automation from "./youtubeAutomation.js";

test("youtubeAutomation exports expected helpers", () => {
    expect(typeof automation.launchBrowser).toBe("function");
    expect(typeof automation.createNewPage).toBe("function");
    expect(typeof automation.gotoYouTube).toBe("function");
    expect(typeof automation.searchYouTube).toBe("function");
    expect(typeof automation.openVideo).toBe("function");
    expect(typeof automation.watchVideo).toBe("function");
    expect(typeof automation.subscribeToChannel).toBe("function");
    expect(typeof automation.signInYouTube).toBe("function");
    expect(typeof automation.createProfilePlaceholder).toBe("function");
});
