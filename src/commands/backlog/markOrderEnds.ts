import type { BacklogItemSummary } from "./types";

export function markOrderEnds(
	summaries: BacklogItemSummary[],
): BacklogItemSummary[] {
	return summaries.map((item, i) => {
		const ends: Partial<BacklogItemSummary> = {};
		if (summaries[i - 1]?.origin !== item.origin) ends.firstInOrder = true;
		if (summaries[i + 1]?.origin !== item.origin) ends.lastInOrder = true;
		return { ...item, ...ends };
	});
}
