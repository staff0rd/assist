import { describe, expect, it } from "vitest";
import { makeBacklogItemSummary } from "../../../../test/mothers/makeBacklogItemSummary";
import { itemsEqual } from "./itemsEqual";

const first = makeBacklogItemSummary({ id: 1 });
const second = makeBacklogItemSummary({ id: 2 });

describe("itemsEqual", () => {
	it("treats the same reference as equal", () => {
		const items = [first];
		expect(itemsEqual(items, items)).toBe(true);
	});

	it("treats structurally identical lists as equal", () => {
		expect(
			itemsEqual(
				[makeBacklogItemSummary({ id: 1 }), makeBacklogItemSummary({ id: 2 })],
				[makeBacklogItemSummary({ id: 1 }), makeBacklogItemSummary({ id: 2 })],
			),
		).toBe(true);
	});

	it("returns false when lengths differ", () => {
		expect(itemsEqual([first], [first, second])).toBe(false);
	});

	it("returns false when a status differs", () => {
		expect(
			itemsEqual([first], [makeBacklogItemSummary({ id: 1, status: "done" })]),
		).toBe(false);
	});

	it("returns false when a name differs", () => {
		expect(
			itemsEqual([first], [makeBacklogItemSummary({ id: 1, name: "renamed" })]),
		).toBe(false);
	});

	it("returns false when a starred flag differs", () => {
		expect(
			itemsEqual([first], [makeBacklogItemSummary({ id: 1, starred: true })]),
		).toBe(false);
	});

	it("returns false when the incomplete sub-task count differs", () => {
		expect(
			itemsEqual(
				[first],
				[makeBacklogItemSummary({ id: 1, incompleteSubtasks: 2 })],
			),
		).toBe(false);
	});

	it("returns false when order differs", () => {
		expect(itemsEqual([first, second], [second, first])).toBe(false);
	});

	it("returns false when the usage total differs", () => {
		const before = makeBacklogItemSummary({
			id: 1,
			usageTotal: {
				tokensUp: 100,
				tokensDown: 200,
				activeMs: 5000,
				peakContextPct: 40,
			},
		});
		const after = makeBacklogItemSummary({
			id: 1,
			usageTotal: {
				tokensUp: 150,
				tokensDown: 200,
				activeMs: 5000,
				peakContextPct: 40,
			},
		});
		expect(itemsEqual([before], [after])).toBe(false);
	});

	it("returns false when only the peak context differs", () => {
		const before = makeBacklogItemSummary({
			id: 1,
			usageTotal: {
				tokensUp: 100,
				tokensDown: 200,
				activeMs: 5000,
				peakContextPct: 40,
			},
		});
		const after = makeBacklogItemSummary({
			id: 1,
			usageTotal: {
				tokensUp: 100,
				tokensDown: 200,
				activeMs: 5000,
				peakContextPct: 65,
			},
		});
		expect(itemsEqual([before], [after])).toBe(false);
	});

	it("returns false when a usage total appears", () => {
		const after = makeBacklogItemSummary({
			id: 1,
			usageTotal: {
				tokensUp: 100,
				tokensDown: 200,
				activeMs: 5000,
				peakContextPct: 40,
			},
		});
		expect(itemsEqual([first], [after])).toBe(false);
	});

	it("treats matching usage totals as equal", () => {
		const total = {
			tokensUp: 100,
			tokensDown: 200,
			activeMs: 5000,
			peakContextPct: 40,
		};
		expect(
			itemsEqual(
				[makeBacklogItemSummary({ id: 1, usageTotal: total })],
				[makeBacklogItemSummary({ id: 1, usageTotal: total })],
			),
		).toBe(true);
	});
});
