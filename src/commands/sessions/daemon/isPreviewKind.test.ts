import { describe, expect, it } from "vitest";
import { isPreviewKind } from "./isPreviewKind";

describe("isPreviewKind", () => {
	it("accepts every preview kind", () => {
		for (const kind of [
			"pr",
			"backlog-item",
			"backlog-comment",
			"pr-comment",
			"github-issue",
			"github-issue-comment",
			"github-issue-edit",
			"miro-board",
			"slack-post",
		]) {
			expect(isPreviewKind(kind)).toBe(true);
		}
	});

	it("rejects anything else", () => {
		expect(isPreviewKind("issue")).toBe(false);
		expect(isPreviewKind(undefined)).toBe(false);
		expect(isPreviewKind(1)).toBe(false);
	});
});
