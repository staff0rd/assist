import { describe, expect, it } from "vitest";
import { backlogItemsCache } from "./backlogItemsCache";
import type { BacklogItemSummary } from "./types";

function item(id: number): BacklogItemSummary {
	return {
		id,
		type: "story",
		name: `item ${id}`,
		status: "todo",
		starred: false,
	};
}

describe("backlogItemsCache", () => {
	it("returns undefined on a miss", () => {
		expect(backlogItemsCache.get("/miss", false)).toBeUndefined();
	});

	it("returns stored items on a hit", () => {
		const items = [item(1), item(2)];
		backlogItemsCache.set("/repo", false, items);
		expect(backlogItemsCache.get("/repo", false)).toBe(items);
	});

	it("isolates entries by showCompleted", () => {
		backlogItemsCache.set("/repo-sc", false, [item(1)]);
		backlogItemsCache.set("/repo-sc", true, [item(2), item(3)]);
		expect(backlogItemsCache.get("/repo-sc", false)).toEqual([item(1)]);
		expect(backlogItemsCache.get("/repo-sc", true)).toEqual([item(2), item(3)]);
	});

	it("isolates entries by cwd", () => {
		backlogItemsCache.set("/repo-a", false, [item(1)]);
		backlogItemsCache.set("/repo-b", false, [item(2)]);
		expect(backlogItemsCache.get("/repo-a", false)).toEqual([item(1)]);
		expect(backlogItemsCache.get("/repo-b", false)).toEqual([item(2)]);
	});

	it("treats an undefined cwd as a distinct key from an empty string", () => {
		backlogItemsCache.set(undefined, false, [item(9)]);
		expect(backlogItemsCache.get(undefined, false)).toEqual([item(9)]);
		expect(backlogItemsCache.get("", false)).toBeUndefined();
	});

	it("overwrites an existing entry", () => {
		backlogItemsCache.set("/repo-ow", false, [item(1)]);
		backlogItemsCache.set("/repo-ow", false, [item(2)]);
		expect(backlogItemsCache.get("/repo-ow", false)).toEqual([item(2)]);
	});
});
