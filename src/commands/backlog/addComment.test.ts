import { describe, expect, it } from "vitest";
import { addComment, addPhaseSummary } from "./addComment";
import type { BacklogItem } from "./types";

function makeItem(): BacklogItem {
	return {
		id: 1,
		type: "story",
		name: "Test item",
		acceptanceCriteria: [],
		status: "in-progress",
	};
}

describe("addComment", () => {
	it("should initialise comments array and append a comment", () => {
		const item = makeItem();
		addComment(item, "Found an issue");
		expect(item.comments).toHaveLength(1);
		expect(item.comments?.[0]).toMatchObject({
			text: "Found an issue",
			type: "comment",
		});
		expect(item.comments?.[0].timestamp).toBeDefined();
		expect(item.comments?.[0].phase).toBeUndefined();
	});

	it("should include phase when provided", () => {
		const item = makeItem();
		addComment(item, "Phase note", 2);
		expect(item.comments?.[0].phase).toBe(2);
	});

	it("should append to existing comments", () => {
		const item = makeItem();
		addComment(item, "First");
		addComment(item, "Second");
		expect(item.comments).toHaveLength(2);
	});
});

describe("addPhaseSummary", () => {
	it("should append a summary entry with phase", () => {
		const item = makeItem();
		addPhaseSummary(item, "Phase 0 complete", 0);
		expect(item.comments).toHaveLength(1);
		expect(item.comments?.[0]).toMatchObject({
			text: "Phase 0 complete",
			type: "summary",
			phase: 0,
		});
	});
});
