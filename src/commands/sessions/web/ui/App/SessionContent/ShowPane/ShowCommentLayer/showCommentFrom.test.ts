import { describe, expect, it } from "vitest";
import { showCommentFrom } from "./showCommentFrom";

const preview = { title: "Links", body: "Intro line\n\nSee the docs here" };

describe("showCommentFrom", () => {
	it("labels the comment with the show's title and the quote's line", () => {
		const comment = showCommentFrom(preview, "the docs", "why?");

		expect(comment.path).toBe('Shown "Links"');
		expect(comment.startLine).toBe(3);
		expect(comment.quote).toBe("the docs");
		expect(comment.note).toContain("not a decision on the preview");
		expect(comment.note).toContain("why?");
	});

	it("falls back to line 1 when the quote is not in the source", () => {
		expect(showCommentFrom(preview, "nowhere", "why?").startLine).toBe(1);
	});
});
