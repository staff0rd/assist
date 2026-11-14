import { describe, expect, it } from "vitest";
import type { HighLevelOverlaySubject } from "./HighLevelOverlaySubject";
import { highLevelPreviewPayload } from "./highLevelPreviewPayload";

const subject: HighLevelOverlaySubject = {
	repo: "org/repo",
	prNumber: 7,
	title: "A change",
	headRef: "feat/thing",
	headSha: "abc123",
	body: "## What\nAdds a thing.",
	checks: [],
	structure: {
		tree: [],
		added: 0,
		removed: 0,
		modified: 0,
		additions: 0,
		deletions: 0,
	},
	criticalDiffs: [],
	criticalPaths: [],
	tests: [],
	testPaths: [],
	collapsedPaths: [],
};

describe("highLevelPreviewPayload", () => {
	it("carries the PR body into the preview payload", () => {
		expect(highLevelPreviewPayload(subject).body).toBe(
			"## What\nAdds a thing.",
		);
	});

	it("drops the overlay-only title and head ref", () => {
		const payload = highLevelPreviewPayload(subject);
		expect(payload).not.toHaveProperty("title");
		expect(payload).not.toHaveProperty("headRef");
	});
});
