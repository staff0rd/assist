import { highLevelItemKey } from "../HighLevelReviewPane/useHighLevelChecklist/highLevelChecklistTargets";
import { type HighLevelArea, highLevelAreaCheck } from "./highLevelAreaCheck";
import type { HighLevelReviewEntry } from "./highLevelReviewEntries";

export type HighLevelTick = { area: HighLevelArea; on: boolean };

export function highLevelAreaKey(
	entry: HighLevelReviewEntry,
	area: HighLevelArea,
): string | undefined {
	const id = highLevelAreaCheck(area);
	return id && highLevelItemKey(id, entry.view?.number);
}

export function highLevelEntryTicks(
	entry: HighLevelReviewEntry,
	ticked: (key: string) => boolean,
): HighLevelTick[] {
	return entry.areas.flatMap((area) => {
		const key = highLevelAreaKey(entry, area);
		if (!key || entry.disabled.has(area)) return [];
		return [{ area, on: ticked(key) }];
	});
}
