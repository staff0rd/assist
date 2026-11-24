import { describe, expect, it } from "vitest";
import { makeBacklogItemSummary } from "../../../../../test/mothers/makeBacklogItemSummary";
import { newestFirstDrop } from "./newestFirstDrop";

const list = [3, 2, 1].map((id) =>
	makeBacklogItemSummary({ id, origin: "/repo" }),
);

const ids = (drop: ReturnType<typeof newestFirstDrop>) =>
	drop?.reordered.map((item) => item.id);

describe("newestFirstDrop", () => {
	it("places an item dragged down the list before its target in the order", () => {
		const drop = newestFirstDrop(list, 3, 1);
		expect(drop?.placement).toEqual({ side: "before", targetId: 1 });
		expect(ids(drop)).toEqual([2, 1, 3]);
	});

	it("places an item dragged up the list after its target in the order", () => {
		const drop = newestFirstDrop(list, 1, 2);
		expect(drop?.placement).toEqual({ side: "after", targetId: 2 });
		expect(ids(drop)).toEqual([3, 1, 2]);
	});

	it("ignores a drop onto the item itself", () => {
		expect(newestFirstDrop(list, 2, 2)).toBeUndefined();
	});

	it("ignores a drop onto an item from another repo", () => {
		const mixed = [
			...list,
			makeBacklogItemSummary({ id: 9, origin: "/other" }),
		];
		expect(newestFirstDrop(mixed, 1, 9)).toBeUndefined();
	});
});
