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

	it("gives an issue edit pane screenshots beside its editable body", () => {
		expect(previewPaneCapabilities("github-issue-edit")).toEqual({
			isPr: false,
			screenshots: true,
			editable: true,
			closeOnly: false,
		});
	});

	it("gives an issue comment pane screenshots without making it editable", () => {
		expect(previewPaneCapabilities("github-issue-comment")).toEqual({
			isPr: false,
			screenshots: true,
			editable: false,
			closeOnly: false,
		});
	});
});
