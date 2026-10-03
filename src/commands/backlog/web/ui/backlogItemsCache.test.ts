import { describe, expect, it } from "vitest";
import { makeBacklogItemSummary } from "../../../../test/mothers/makeBacklogItemSummary";
import { backlogItemsCache } from "./backlogItemsCache";

describe("backlogItemsCache", () => {
	it("returns undefined on a miss", () => {
		expect(backlogItemsCache.get("/miss", "todo")).toBeUndefined();
	});

	it("returns stored items on a hit", () => {
		const items = [
			makeBacklogItemSummary({ id: 1 }),
			makeBacklogItemSummary({ id: 2 }),
		];
		backlogItemsCache.set("/repo", "todo", items);
		expect(backlogItemsCache.get("/repo", "todo")).toBe(items);
	});

	it("isolates entries by filter", () => {
		backlogItemsCache.set("/repo-f", "todo", [
			makeBacklogItemSummary({ id: 1 }),
		]);
		backlogItemsCache.set("/repo-f", "done", [
			makeBacklogItemSummary({ id: 2 }),
			makeBacklogItemSummary({ id: 3 }),
		]);
		backlogItemsCache.set("/repo-f", "all", [
			makeBacklogItemSummary({ id: 1 }),
			makeBacklogItemSummary({ id: 2 }),
			makeBacklogItemSummary({ id: 3 }),
		]);
		expect(backlogItemsCache.get("/repo-f", "todo")).toEqual([
			makeBacklogItemSummary({ id: 1 }),
		]);
		expect(backlogItemsCache.get("/repo-f", "done")).toEqual([
			makeBacklogItemSummary({ id: 2 }),
			makeBacklogItemSummary({ id: 3 }),
		]);
		expect(backlogItemsCache.get("/repo-f", "all")).toEqual([
			makeBacklogItemSummary({ id: 1 }),
			makeBacklogItemSummary({ id: 2 }),
			makeBacklogItemSummary({ id: 3 }),
		]);
	});

	it("isolates entries by cwd", () => {
		backlogItemsCache.set("/repo-a", "todo", [
			makeBacklogItemSummary({ id: 1 }),
		]);
		backlogItemsCache.set("/repo-b", "todo", [
			makeBacklogItemSummary({ id: 2 }),
		]);
		expect(backlogItemsCache.get("/repo-a", "todo")).toEqual([
			makeBacklogItemSummary({ id: 1 }),
		]);
		expect(backlogItemsCache.get("/repo-b", "todo")).toEqual([
			makeBacklogItemSummary({ id: 2 }),
		]);
	});

	it("treats an undefined cwd as a distinct key from an empty string", () => {
		backlogItemsCache.set(undefined, "todo", [
			makeBacklogItemSummary({ id: 9 }),
		]);
		expect(backlogItemsCache.get(undefined, "todo")).toEqual([
			makeBacklogItemSummary({ id: 9 }),
		]);
		expect(backlogItemsCache.get("", "todo")).toBeUndefined();
	});

	it("overwrites an existing entry", () => {
		backlogItemsCache.set("/repo-ow", "todo", [
			makeBacklogItemSummary({ id: 1 }),
		]);
		backlogItemsCache.set("/repo-ow", "todo", [
			makeBacklogItemSummary({ id: 2 }),
		]);
		expect(backlogItemsCache.get("/repo-ow", "todo")).toEqual([
			makeBacklogItemSummary({ id: 2 }),
		]);
	});
});
