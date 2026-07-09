import { describe, expect, it } from "vitest";
import { REVIEW_PHASE_NAME } from "../buildPhasePrompt";
import type { BacklogItem } from "../types";
import { withReviewPhase } from "./withReviewPhase";

function makeItem(overrides: Partial<BacklogItem> = {}): BacklogItem {
	return {
		id: 1,
		type: "story",
		name: "Item",
		acceptanceCriteria: ["does the thing"],
		status: "in-progress",
		starred: false,
		origin: "cli",
		...overrides,
	};
}

describe("withReviewPhase", () => {
	it("appends the Review phase to an item with authored phases", () => {
		const item = makeItem({
			plan: [{ name: "Design", tasks: [{ task: "sketch" }] }],
		});

		const result = withReviewPhase(item);

		expect(result.plan?.map((p) => p.name)).toEqual([
			"Design",
			REVIEW_PHASE_NAME,
		]);
	});

	it("leaves a plan-less item unchanged", () => {
		const item = makeItem();

		expect(withReviewPhase(item)).toBe(item);
	});

	it("does not mutate the original plan", () => {
		const item = makeItem({
			plan: [{ name: "Design", tasks: [{ task: "sketch" }] }],
		});

		withReviewPhase(item);

		expect(item.plan?.map((p) => p.name)).toEqual(["Design"]);
	});
});
