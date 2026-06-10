import type { BacklogItemSummary } from "./types";

export function itemsEqual(
	a: BacklogItemSummary[],
	b: BacklogItemSummary[],
): boolean {
	if (a === b) return true;
	if (a.length !== b.length) return false;
	return a.every((item, i) => {
		const other = b[i];
		return (
			item.id === other.id &&
			item.type === other.type &&
			item.name === other.name &&
			item.status === other.status
		);
	});
}
