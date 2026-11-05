import { highLevelEntryTicks } from "./highLevelEntryTicks";
import type { HighLevelReviewEntry } from "./highLevelReviewEntries";

export function highLevelApproveBlocker(
	entries: HighLevelReviewEntry[],
	ticked: (key: string) => boolean,
): string | undefined {
	const left = entries.flatMap((entry) => {
		const count = highLevelEntryTicks(entry, ticked).filter(
			(tick) => !tick.on,
		).length;
		if (count === 0) return [];
		const name = entry.view ? `slice ${entry.view.number}` : "Overview";
		return [`${name} (${count})`];
	});
	return left.length > 0
		? `Approve unlocks once every area is ticked — left: ${left.join(", ")}`
		: undefined;
}
