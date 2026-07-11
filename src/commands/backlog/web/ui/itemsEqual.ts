import type { BacklogItemSummary, PhaseUsageTotal } from "./types";

function usageTotalEqual(a?: PhaseUsageTotal, b?: PhaseUsageTotal): boolean {
	if (a === b) return true;
	if (!a || !b) return false;
	return (
		a.tokensUp === b.tokensUp &&
		a.tokensDown === b.tokensDown &&
		a.activeMs === b.activeMs &&
		a.peakContextPct === b.peakContextPct
	);
}

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
			item.status === other.status &&
			item.starred === other.starred &&
			item.incompleteSubtasks === other.incompleteSubtasks &&
			usageTotalEqual(item.usageTotal, other.usageTotal)
		);
	});
}
