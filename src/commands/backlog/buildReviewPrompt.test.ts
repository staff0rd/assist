import { describe, expect, it } from "vitest";
import { buildReviewPrompt } from "./buildReviewPrompt";
import type { BacklogItem } from "./types";

function makeItem(overrides: Partial<BacklogItem> = {}): BacklogItem {
	return {
		id: 474,
		type: "story",
		name: "Test item",
		acceptanceCriteria: ["Criterion one", "Criterion two"],
		starred: false,
		status: "in-progress",
		...overrides,
	};
}

describe("buildReviewPrompt", () => {
	it("instructs the agent to complete after approval plus commit", () => {
		const prompt = buildReviewPrompt(makeItem(), 2);

		expect(prompt).toContain(
			"User approval plus a successful commit means the work is complete",
		);
	});

	it("treats completing as the default when the implementation diverges from approved criteria", () => {
		const prompt = buildReviewPrompt(makeItem(), 2);

		expect(prompt).toContain(
			"diverged from the recorded acceptance criteria but the user has approved it",
		);
		expect(prompt).toContain("stale criteria are not a reason to rewind");
	});

	it("requires explicit user confirmation before any rewind", () => {
		const prompt = buildReviewPrompt(makeItem(), 2);

		expect(prompt).toContain("get explicit confirmation first");
		expect(prompt).toContain("Never rewind silently");
	});

	it("frames rewind as a confirm-first exception rather than an automatic response", () => {
		const prompt = buildReviewPrompt(makeItem(), 2);

		expect(prompt).toContain(
			"Rewinding is a confirm-first exception, not the normal path",
		);
		expect(prompt).toContain("assist backlog rewind 474 <phase>");
	});
});
