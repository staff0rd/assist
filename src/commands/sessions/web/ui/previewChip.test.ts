import { describe, expect, it } from "vitest";
import type { PrPreview } from "../../shared/SessionInfoBase";
import { previewChip } from "./previewChip";

function preview(overrides: Partial<PrPreview> = {}): PrPreview {
	return {
		requestId: "req-1",
		title: "Add feature",
		body: "## What\n\nstuff",
		prNumber: null,
		...overrides,
	};
}

describe("previewChip", () => {
	it("labels a backlog bug", () => {
		expect(
			previewChip(preview({ kind: "backlog-item", itemType: "bug" }), false),
		).toEqual({ label: "Bug", color: "warning" });
	});

	it("labels a backlog story", () => {
		expect(
			previewChip(preview({ kind: "backlog-item", itemType: "story" }), false),
		).toEqual({ label: "Story", color: "info" });
	});

	it("labels a miro board pick", () => {
		expect(previewChip(preview({ kind: "miro-board" }), false)).toEqual({
			label: "Miro boxes",
			color: "info",
		});
	});

	it("labels a slack post", () => {
		expect(previewChip(preview({ kind: "slack-post" }), false)).toEqual({
			label: "Slack post",
			color: "success",
		});
	});

	it("labels a backlog comment neutrally", () => {
		expect(previewChip(preview({ kind: "backlog-comment" }), false)).toEqual({
			label: "Comment",
			color: "default",
		});
	});

	it("labels a PR comment neutrally", () => {
		expect(previewChip(preview({ kind: "pr-comment" }), false)).toEqual({
			label: "Comment",
			color: "default",
		});
	});

	it("keeps a PR comment neutral even when it carries a PR number", () => {
		expect(
			previewChip(preview({ kind: "pr-comment", prNumber: 42 }), false),
		).toEqual({ label: "Comment", color: "default" });
	});

	it("labels a GitHub issue comment neutrally", () => {
		expect(
			previewChip(preview({ kind: "github-issue-comment" }), false),
		).toEqual({ label: "Comment", color: "default" });
	});

	it("labels a GitHub issue as one being created", () => {
		expect(previewChip(preview({ kind: "github-issue" }), false)).toEqual({
			label: "New issue",
			color: "success",
		});
	});

	it("labels an edit to an existing GitHub issue", () => {
		expect(previewChip(preview({ kind: "github-issue-edit" }), false)).toEqual({
			label: "Edit issue",
			color: "warning",
		});
	});

	it("labels an update to an existing PR", () => {
		expect(previewChip(preview({ prNumber: 42 }), false)).toEqual({
			label: "Update #42",
			color: "info",
		});
	});

	it("labels a new PR that is not a draft", () => {
		expect(previewChip(preview(), false)).toEqual({
			label: "New PR",
			color: "success",
		});
	});

	it("labels a new draft PR as a draft", () => {
		expect(previewChip(preview(), true)).toEqual({
			label: "New draft PR",
			color: "success",
		});
	});

	it("follows the live draft state rather than the resolved snapshot", () => {
		expect(previewChip(preview({ draft: true }), false)).toEqual({
			label: "New PR",
			color: "success",
		});
		expect(previewChip(preview({ draft: false }), true)).toEqual({
			label: "New draft PR",
			color: "success",
		});
	});

	it("ignores draft state on an update", () => {
		expect(previewChip(preview({ prNumber: 7 }), true)).toEqual({
			label: "Update #7",
			color: "info",
		});
	});
});
