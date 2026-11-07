import { describe, expect, it } from "vitest";
import { sanitiseReviewerNames } from "./sanitiseReviewerNames";

describe("sanitiseReviewerNames", () => {
	it("replaces every reviewer harness name as a whole word", () => {
		expect(
			sanitiseReviewerNames("Claude and Opus agreed; Codex did not."),
		).toBe("the reviewer and the reviewer agreed; the reviewer did not.");
	});

	it("leaves words that only contain a name", () => {
		expect(sanitiseReviewerNames("see claudette and codexes")).toBe(
			"see claudette and codexes",
		);
	});
});
