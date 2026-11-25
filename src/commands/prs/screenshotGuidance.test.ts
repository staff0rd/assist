import { describe, expect, it } from "vitest";
import { editHelpText } from "./editHelpText";
import { raiseHelpText } from "./raiseHelpText";
import { screenshotGuidance } from "./screenshotGuidance";

describe("screenshotGuidance", () => {
	it("asks the user how to get screenshots before using a browser or capture tool", () => {
		expect(screenshotGuidance).toContain(
			"ask the user with\n'assist ask-question' how to get them before using any browser or capture tool",
		);
		expect(screenshotGuidance).toContain("drive their Chrome");
		expect(screenshotGuidance).toContain("/screenshot");
		expect(screenshotGuidance).toContain(
			"drop images into\nthe PR preview pane",
		);
	});

	it("forbids retrying a browser or capture call the user stopped", () => {
		expect(screenshotGuidance).toContain(
			"If the user stops a browser or capture call, do not retry\nit; ask again instead.",
		);
	});

	it("is carried by the raise and edit help", () => {
		expect(raiseHelpText(false)).toContain(screenshotGuidance);
		expect(editHelpText()).toContain(screenshotGuidance);
	});
});
