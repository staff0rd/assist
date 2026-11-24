import { useEffect } from "react";
import { onSelectHighLevelSlice } from "../selectHighLevelSlice";
import type { HighLevelArea } from "./highLevelAreaCheck";
import type { HighLevelReviewEntry } from "./highLevelReviewEntries";
import { useHighLevelReviewKeys } from "./useHighLevelReviewKeys";
import {
	type HighLevelReviewHead,
	useHighLevelReviewPosition,
} from "./useHighLevelReviewNav/useHighLevelReviewPosition";
import { landingArea } from "./useHighLevelReviewNav/landingArea";

export function useHighLevelReviewNav(
	entries: HighLevelReviewEntry[],
	head?: HighLevelReviewHead,
) {
	const [position, setPosition] = useHighLevelReviewPosition(head);
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
		[setPosition],
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
