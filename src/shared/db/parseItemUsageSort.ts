const sortFields = [
	"phases",
	"active",
	"tokens",
	"peakContext",
	"lastPhase",
] as const;

export type ItemUsageSortField = (typeof sortFields)[number];

export type ItemUsageSort = {
	field: ItemUsageSortField;
	direction: "asc" | "desc";
};

export const defaultItemUsageSort: ItemUsageSort = {
	field: "lastPhase",
	direction: "desc",
};

export function parseItemUsageSort(
	field: string | null,
	direction: string | null,
): ItemUsageSort {
	return {
		field:
			sortFields.find((known) => known === field) ?? defaultItemUsageSort.field,
		direction: direction === "asc" ? "asc" : "desc",
	};
}
