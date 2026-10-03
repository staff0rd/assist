import type { BacklogItemSummary } from "../../commands/backlog/types";

export function makeBacklogItemSummary(
	overrides: Partial<BacklogItemSummary> = {},
): BacklogItemSummary {
	return {
		id: 1,
		type: "story",
		name: "Item",
		status: "todo",
		starred: false,
		incompleteSubtasks: 0,
		...overrides,
	};
}
