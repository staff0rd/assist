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
		incompleteSubtasks: 0,
	};
}

describe("backlogItemsCache", () => {
	it("returns undefined on a miss", () => {
		expect(backlogItemsCache.get("/miss", "todo")).toBeUndefined();
	});

	it("returns stored items on a hit", () => {
		const items = [item(1), item(2)];
		backlogItemsCache.set("/repo", "todo", items);
		expect(backlogItemsCache.get("/repo", "todo")).toBe(items);
	});

	it("isolates entries by filter", () => {
		backlogItemsCache.set("/repo-f", "todo", [item(1)]);
		backlogItemsCache.set("/repo-f", "done", [item(2), item(3)]);
		backlogItemsCache.set("/repo-f", "all", [item(1), item(2), item(3)]);
		expect(backlogItemsCache.get("/repo-f", "todo")).toEqual([item(1)]);
		expect(backlogItemsCache.get("/repo-f", "done")).toEqual([
			item(2),
			item(3),
		]);
		expect(backlogItemsCache.get("/repo-f", "all")).toEqual([
			item(1),
			item(2),
			item(3),
		]);
	});

	it("isolates entries by cwd", () => {
		backlogItemsCache.set("/repo-a", "todo", [item(1)]);
		backlogItemsCache.set("/repo-b", "todo", [item(2)]);
		expect(backlogItemsCache.get("/repo-a", "todo")).toEqual([item(1)]);
		expect(backlogItemsCache.get("/repo-b", "todo")).toEqual([item(2)]);
	});

	it("treats an undefined cwd as a distinct key from an empty string", () => {
		backlogItemsCache.set(undefined, "todo", [item(9)]);
		expect(backlogItemsCache.get(undefined, "todo")).toEqual([item(9)]);
		expect(backlogItemsCache.get("", "todo")).toBeUndefined();
	});

	it("overwrites an existing entry", () => {
		backlogItemsCache.set("/repo-ow", "todo", [item(1)]);
		backlogItemsCache.set("/repo-ow", "todo", [item(2)]);
		expect(backlogItemsCache.get("/repo-ow", "todo")).toEqual([item(2)]);
	});
});
