import { describe, expect, it } from "vitest";
import { markOrderEnds } from "./markOrderEnds";
import type { BacklogItemSummary } from "./types";

const summary = (id: number, origin: string): BacklogItemSummary => ({
	id,
	origin,
	type: "story",
	name: `Item ${id}`,
	status: "todo",
	starred: false,
});

describe("markOrderEnds", () => {
	it("flags the first and last item of each origin", () => {
		const marked = markOrderEnds([
			summary(1, "a"),
			summary(2, "a"),
			summary(3, "a"),
			summary(4, "b"),
		]);

		expect(
			marked.map(({ id, firstInOrder, lastInOrder }) => ({
				id,
				firstInOrder,
				lastInOrder,
			})),
		).toEqual([
			{ id: 1, firstInOrder: true, lastInOrder: undefined },
			{ id: 2, firstInOrder: undefined, lastInOrder: undefined },
			{ id: 3, firstInOrder: undefined, lastInOrder: true },
			{ id: 4, firstInOrder: true, lastInOrder: true },
		]);
	});
});
