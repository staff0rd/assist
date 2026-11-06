import { describe, expect, it } from "vitest";
import { buildReviewBody } from "./buildReviewBody";

const markdown = "## Summary\nClaude found one issue.\n";

describe("buildReviewBody", () => {
	it("sanitises reviewer names in the summary", () => {
		const body = buildReviewBody(markdown, []);

		expect(body).toContain("the reviewer found one issue.");
		expect(body).not.toContain("Claude");
	});
});
