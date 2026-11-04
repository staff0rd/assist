import type { HighLevelPaneProgress } from "../useHighLevelReviewPane/loadPersistedHighLevelProgress";
import type { HighLevelChecklistTarget } from "./highLevelChecklistTargets";

export type HighLevelItemState = {
	ticked: boolean;
	comment: string;
};

export function initialHighLevelState(
	targets: HighLevelChecklistTarget[],
	saved: HighLevelPaneProgress | undefined,
): Record<string, HighLevelItemState> {
	return Object.fromEntries(
		targets.map(({ key, check, slice }) => {
			const previous = saved?.items.find(
				(item) => item.id === check.id && item.slice === slice,
			);
			return [
				key,
				{
					ticked: previous?.ticked ?? check.status === "pass",
					comment: previous?.comment ?? "",
				},
			];
		}),
	);
}
