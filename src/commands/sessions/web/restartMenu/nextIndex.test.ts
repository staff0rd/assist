import { describe, expect, it } from "vitest";
import type { MenuItem } from "./menuItems";
import { firstEnabledIndex, nextIndex } from "./nextIndex";

const items: MenuItem[] = [
	{ label: "a", action: "restart-daemon" },
	{ label: "b", action: "restart-webserver", disabled: true },
	{ label: "c", action: "restart-both" },
];

describe("nextIndex", () => {
	it("moves to the next item going down, including disabled items", () => {
		expect(nextIndex(items, 0, 1)).toBe(1);
		expect(nextIndex(items, 1, 1)).toBe(2);
	});

	it("moves to the previous item going up", () => {
		expect(nextIndex(items, 2, -1)).toBe(1);
		expect(nextIndex(items, 1, -1)).toBe(0);
	});

	it("wraps around the ends", () => {
		expect(nextIndex(items, 2, 1)).toBe(0);
		expect(nextIndex(items, 0, -1)).toBe(2);
	});

	it("stays put for an empty list", () => {
		expect(nextIndex([], 0, 1)).toBe(0);
	});
});

describe("firstEnabledIndex", () => {
	it("returns the first enabled item", () => {
		expect(firstEnabledIndex(items)).toBe(0);
	});

	it("skips a leading disabled item", () => {
		expect(firstEnabledIndex([items[1], items[0], items[2]])).toBe(1);
	});
});
