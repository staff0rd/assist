import type { BacklogFilter } from "../../parseBacklogFilter";
import type { TypeFilterValue } from "./TypeFilter";

export function isReorderable(
	filter: BacklogFilter,
	query: string,
	typeFilter: TypeFilterValue,
): boolean {
	return filter === "todo" && query.trim() === "" && typeFilter === "all";
}
