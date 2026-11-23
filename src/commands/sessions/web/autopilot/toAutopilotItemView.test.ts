import { describe, expect, it } from "vitest";
import type { BacklogItem } from "../../../backlog/types";
import { toAutopilotItemView } from "./toAutopilotItemView";

const recorded = { id: 7, startedAt: "2026-11-23T01:00:00Z", sessionId: "b1" };
const diff = { insertions: 12, deletions: 3 };
const phase = (name: string) => ({ name, tasks: [] });

function item(overrides: Partial<BacklogItem>): BacklogItem {
	return {
		id: 7,
		type: "story",
		name: "Fresh agent",
		acceptanceCriteria: [],
		starred: false,
		status: "in-progress",
		plan: [phase("One"), phase("Two"), phase("Three"), phase("Review")],
		...overrides,
	};
}

describe("toAutopilotItemView", () => {
	it("gives a running item's why, progress and the phases still to come", () => {
		const view = toAutopilotItemView(
			item({
				currentPhase: 2,
				comments: [{ text: "Predicts +3k/h", timestamp: "t", type: "why" }],
			}),
			recorded,
			diff,
		);
		expect(view).toMatchObject({
			why: "Predicts +3k/h",
			phase: 2,
			totalPhases: 3,
			donePhases: 1,
			remaining: [
				{ number: 3, name: "Three" },
				{ number: null, name: "Review" },
			],
		});
	});

	it("gives a done item's delivered and result lines, commits and diff", () => {
		const view = toAutopilotItemView(
			item({
				status: "done",
				currentPhase: 5,
				comments: [
					{ text: "Cache is live", timestamp: "t1", type: "delivered" },
					{
						text: "predicted +1k, measured +1.5k",
						timestamp: "t2",
						type: "result",
					},
				],
				gitRefs: [
					{ kind: "commit", ref: "a" },
					{ kind: "commit", ref: "b" },
					{ kind: "branch", ref: "main" },
				],
			}),
			recorded,
			diff,
		);
		expect(view).toMatchObject({
			delivered: "Cache is live",
			result: "predicted +1k, measured +1.5k",
			finishedAt: "t1",
			remaining: [],
			donePhases: 3,
			commits: 2,
			insertions: 12,
			deletions: 3,
		});
	});
});
