import { describe, expect, it } from "vitest";
import { reviewModeArgs } from "./reviewModeArgs";

describe("reviewModeArgs", () => {
	it("maps review to the plain review command", () => {
		expect(reviewModeArgs("review")).toEqual(["review"]);
	});

	it("maps review-comments to the review-comments command", () => {
		expect(reviewModeArgs("review-comments")).toEqual(["review-comments"]);
	});

	it("maps review-post to a non-interactive auto-submitting review", () => {
		expect(reviewModeArgs("review-post")).toEqual([
			"review",
			"--no-prompt",
			"--submit",
		]);
	});
});
