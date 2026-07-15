export type BacklogFilter = "todo" | "done" | "all";

const validFilters = new Set<BacklogFilter>(["todo", "done", "all"]);

export function parseBacklogFilter(
	value: string | null | undefined,
): BacklogFilter {
	return value && validFilters.has(value as BacklogFilter)
		? (value as BacklogFilter)
		: "todo";
}
