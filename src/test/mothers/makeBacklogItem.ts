import type { BacklogItem } from "../../commands/backlog/types";

export function makeBacklogItem(
	overrides: Partial<BacklogItem> = {},
): BacklogItem {
	return {
		id: 1,
		type: "story",
		name: "Item",
		acceptanceCriteria: [],
		status: "todo",
		starred: false,
		...overrides,
	};
}
