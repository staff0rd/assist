import { useEffect, useState } from "react";
import { onSelectHighLevelSlice } from "../selectHighLevelSlice";
import type { HighLevelArea } from "./highLevelAreaCheck";
import type { HighLevelReviewEntry } from "./highLevelReviewEntries";
import { useHighLevelReviewKeys } from "./useHighLevelReviewKeys";

function landingArea(
	entry: HighLevelReviewEntry,
	wanted: HighLevelArea | undefined,
): HighLevelArea | undefined {
	const open = entry.areas.filter((area) => !entry.disabled.has(area));
	return wanted && open.includes(wanted) ? wanted : open[0];
}

export function useHighLevelReviewNav(entries: HighLevelReviewEntry[]) {
	const [position, setPosition] = useState<{
		index: number;
		area: HighLevelArea | undefined;
	}>({ index: 0, area: undefined });
	const index = Math.min(position.index, Math.max(entries.length - 1, 0));
	const entry = entries[index];
	const area = entry && landingArea(entry, position.area);

	const pick = (next: number, wanted: HighLevelArea | undefined = area) => {
		const target = entries[next];
		if (target) setPosition({ index: next, area: landingArea(target, wanted) });
	};
	const step = (by: number) => pick(index + by);
	const pickArea = (wanted: HighLevelArea) => {
		if (entry && landingArea(entry, wanted) === wanted)
			setPosition({ index, area: wanted });
	};

	useHighLevelReviewKeys(entries.length > 0, {
		step,
		pickArea: (n) => {
			const wanted = entry?.areas[n - 1];
			if (wanted) pickArea(wanted);
		},
	});
	useEffect(
		() =>
			onSelectHighLevelSlice((number) =>
				setPosition({ index: number, area: "structure" }),
			),
		[],
	);

	return {
		index,
		entry,
		area,
		pick,
		pickArea,
		onNext: () => step(1),
		hasNext: index < entries.length - 1,
	};
}
