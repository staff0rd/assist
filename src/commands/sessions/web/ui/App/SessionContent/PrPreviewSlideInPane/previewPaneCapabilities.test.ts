import { describe, expect, it } from "vitest";
import { previewPaneCapabilities } from "./previewPaneCapabilities";

describe("previewPaneCapabilities", () => {
	it("keeps a show pane close-only", () => {
		expect(previewPaneCapabilities("show").closeOnly).toBe(true);
	});

	it("gives an ask pane approve and reject", () => {
		expect(previewPaneCapabilities("ask")).toEqual({
			isPr: false,
			screenshots: false,
			editable: false,
			closeOnly: false,
		});
	});
});
