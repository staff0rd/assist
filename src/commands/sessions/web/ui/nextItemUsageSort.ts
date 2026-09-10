import type {
	ItemUsageSort,
	ItemUsageSortField,
} from "../../../../shared/db/parseItemUsageSort";

export function nextItemUsageSort(
	current: ItemUsageSort,
	field: ItemUsageSortField,
): ItemUsageSort {
	if (current.field !== field) return { field, direction: "desc" };
	return {
		field,
		direction: current.direction === "desc" ? "asc" : "desc",
	};
}
