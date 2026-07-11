import * as automation from "./browserAutomation.js";

test("browserAutomation exports expected helpers", () => {
    expect(typeof automation.launchBrowser).toBe("function");
    expect(typeof automation.createNewPage).toBe("function");
    expect(typeof automation.searchWeb).toBe("function");
    expect(typeof automation.navigateToUrl).toBe("function");
    expect(typeof automation.normalizeUrlFromPrompt).toBe("function");
});
