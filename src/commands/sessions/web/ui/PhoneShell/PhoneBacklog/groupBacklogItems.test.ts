import { describe, expect, it } from "vitest";
import type { BacklogItemSummary } from "../../../../../backlog/web/ui/types";
import { groupBacklogItems } from "./groupBacklogItems";

const item = (
	id: number,
	name: string,
	status: BacklogItemSummary["status"],
): BacklogItemSummary => ({ id, name, status, type: "story", starred: false });

const items = [
	item(1, "Daemon log rotation", "todo"),
	item(2, "Capacitor iOS app", "in-progress"),
	item(3, "Diff tree scroll", "todo"),
];

describe("groupBacklogItems", () => {
	it("puts in-progress items in their own group", () => {
		const { inProgress, todo } = groupBacklogItems(items, "");
		expect(inProgress.map((i) => i.id)).toEqual([2]);
		expect(todo.map((i) => i.id)).toEqual([1, 3]);
	});

	it("filters by name or item id", () => {
		expect(groupBacklogItems(items, "diff").todo.map((i) => i.id)).toEqual([3]);
		expect(groupBacklogItems(items, "a1").todo.map((i) => i.id)).toEqual([1]);
	});
});
