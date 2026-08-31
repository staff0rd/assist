import { describe, expect, it } from "vitest";
import { previewTargetLabel } from "./previewTargetLabel";

describe("previewTargetLabel", () => {
	it("labels a github issue", () => {
		expect(previewTargetLabel("github-issue", "story", null, false)).toBe(
			"github issue",
		);
	});

	it("labels a github issue edit", () => {
		expect(previewTargetLabel("github-issue-edit", "story", null, false)).toBe(
			"github issue edit",
		);
	});

	it("labels a github issue comment", () => {
		expect(
			previewTargetLabel("github-issue-comment", "story", null, false),
		).toBe("github issue comment");
	});

	it("labels a miro anchor pick", () => {
		expect(previewTargetLabel("miro-board", "story", null, false)).toBe(
			"miro anchors",
		);
	});

	it("labels a slack post", () => {
		expect(previewTargetLabel("slack-post", "story", null, false)).toBe(
			"slack post",
		);
	});

	it("labels a backlog comment", () => {
		expect(previewTargetLabel("backlog-comment", "story", null, false)).toBe(
			"backlog comment",
		);
	});

	it("labels a pr comment", () => {
		expect(previewTargetLabel("pr-comment", "story", 42, false)).toBe(
			"pr comment",
		);
	});

	it("labels a backlog item by its type", () => {
		expect(previewTargetLabel("backlog-item", "bug", null, false)).toBe(
			"backlog bug",
		);
		expect(previewTargetLabel("backlog-item", "story", null, false)).toBe(
			"backlog story",
		);
	});

	it("labels a PR edit by its number", () => {
		expect(previewTargetLabel("pr", "story", 42, false)).toBe("edit #42");
	});

	it("labels a new PR by its draft state", () => {
		expect(previewTargetLabel("pr", "story", null, false)).toBe("create");
		expect(previewTargetLabel("pr", "story", null, true)).toBe("create draft");
	});
});
