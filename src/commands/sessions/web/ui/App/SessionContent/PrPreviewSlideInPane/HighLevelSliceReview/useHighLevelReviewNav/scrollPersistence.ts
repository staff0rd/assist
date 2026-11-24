import type { HighLevelArea } from "../highLevelAreaCheck";
import type { useHighLevelReviewPosition } from "./useHighLevelReviewPosition";

export function scrollPersistence(
	position: { index: number; area: HighLevelArea | undefined },
	{
		saveScroll,
		loadSaved,
	}: Pick<
		ReturnType<typeof useHighLevelReviewPosition>,
		"saveScroll" | "loadSaved"
	>,
) {
	return {
		saveScroll: (scrollTop: number) => saveScroll(position, scrollTop),
		restoreScroll: () => {
			const saved = loadSaved();
			return saved.index === position.index && saved.area === position.area
				? saved.scrollTop
				: undefined;
		},
	};
}
