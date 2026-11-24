import type { HighLevelArea } from "../highLevelAreaCheck";
import type { HighLevelReviewEntry } from "../highLevelReviewEntries";

export function landingArea(
	entry: HighLevelReviewEntry,
	wanted: HighLevelArea | undefined,
): HighLevelArea | undefined {
	const open = entry.areas.filter((area) => !entry.disabled.has(area));
	return wanted && open.includes(wanted) ? wanted : open[0];
}
