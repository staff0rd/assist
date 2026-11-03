import { describe, expect, it } from "vitest";
import { manualTestingCommentFrom } from "./manualTestingCommentFrom";

const manualTesting = {
	setup: ["Restart the web server"],
	steps: [
		{ action: "Open the review", expect: "The checklist shows" },
		{ action: "Pick slice 2", expect: "Only slice 2 shows" },
	],
};

describe("manualTestingCommentFrom", () => {
	it("anchors a quote to the step it came from", () => {
		expect(
			manualTestingCommentFrom(manualTesting, "Only slice 2 shows", "Why?"),
		).toEqual({
			path: "Manual testing step",
			startLine: 2,
			endLine: 2,
			quote: "Only slice 2 shows",
			note: "Why?",
		});
	});

	it("anchors a quote spanning action and expected text to that step", () => {
		expect(
			manualTestingCommentFrom(manualTesting, "review→The", "x").startLine,
		).toBe(1);
	});

	it("anchors a setup quote to its setup entry", () => {
		expect(
			manualTestingCommentFrom(manualTesting, "web server", "x"),
		).toMatchObject({ path: "Manual testing setup", startLine: 1 });
	});
});
