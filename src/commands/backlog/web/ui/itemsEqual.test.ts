import { describe, expect, it } from "vitest";
import { itemsEqual } from "./itemsEqual";
import type { BacklogItemSummary } from "./types";

function item(
	id: number,
	overrides: Partial<BacklogItemSummary> = {},
): BacklogItemSummary {
	return {
		id,
		type: "story",
		name: `item ${id}`,
		status: "todo",
		starred: false,
		incompleteSubtasks: 0,
		...overrides,
	};
}

describe("itemsEqual", () => {
	it("treats the same reference as equal", () => {
		const items = [item(1)];
		expect(itemsEqual(items, items)).toBe(true);
	});

	it("treats structurally identical lists as equal", () => {
		expect(itemsEqual([item(1), item(2)], [item(1), item(2)])).toBe(true);
	});

	it("returns false when lengths differ", () => {
		expect(itemsEqual([item(1)], [item(1), item(2)])).toBe(false);
	});

	it("returns false when a status differs", () => {
		expect(itemsEqual([item(1)], [item(1, { status: "done" })])).toBe(false);
	});

	it("returns false when a name differs", () => {
		expect(itemsEqual([item(1)], [item(1, { name: "renamed" })])).toBe(false);
	});

	it("returns false when a starred flag differs", () => {
		expect(itemsEqual([item(1)], [item(1, { starred: true })])).toBe(false);
	});

	it("returns false when the incomplete sub-task count differs", () => {
		expect(itemsEqual([item(1)], [item(1, { incompleteSubtasks: 2 })])).toBe(
			false,
		);
	});

	it("returns false when order differs", () => {
		expect(itemsEqual([item(1), item(2)], [item(2), item(1)])).toBe(false);
	});

	it("returns false when the usage total differs", () => {
		const before = item(1, {
			usageTotal: { tokensUp: 100, tokensDown: 200, activeMs: 5000 },
		});
		const after = item(1, {
			usageTotal: { tokensUp: 150, tokensDown: 200, activeMs: 5000 },
		});
		expect(itemsEqual([before], [after])).toBe(false);
	});

	it("returns false when a usage total appears", () => {
		const after = item(1, {
			usageTotal: { tokensUp: 100, tokensDown: 200, activeMs: 5000 },
		});
		expect(itemsEqual([item(1)], [after])).toBe(false);
	});

	it("treats matching usage totals as equal", () => {
		const total = { tokensUp: 100, tokensDown: 200, activeMs: 5000 };
		expect(
			itemsEqual(
				[item(1, { usageTotal: total })],
				[item(1, { usageTotal: total })],
			),
		).toBe(true);
	});
});
