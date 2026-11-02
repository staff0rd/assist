import { useMemo, useState } from "react";
import type { HighLevelCheckResult } from "../../../../../../../review/highLevel/types";
import type { HighLevelItemState } from "./useHighLevelChecklist/initialHighLevelState";
import { initialHighLevelState } from "./useHighLevelChecklist/initialHighLevelState";
import { highLevelChecklistItems } from "./useHighLevelChecklist/highLevelChecklistItems";
import type { HighLevelPaneProgress } from "./useHighLevelReviewPane/loadPersistedHighLevelProgress";

export function useHighLevelChecklist(
	checks: HighLevelCheckResult[],
	saved?: HighLevelPaneProgress,
) {
	const [state, setState] = useState(() =>
		initialHighLevelState(checks, saved),
	);

	const patch = (id: string, change: Partial<HighLevelItemState>) =>
		setState((current) => ({
			...current,
			[id]: { ...current[id], ...change } as HighLevelItemState,
		}));

	const outstanding = useMemo(
		() =>
			checks.filter(
				(check) => check.kind === "manual" && !state[check.id]?.ticked,
			).length,
		[checks, state],
	);

	const items = useMemo(
		() => highLevelChecklistItems(checks, state),
		[checks, state],
	);

	return {
		ticked: (id: string) => state[id]?.ticked === true,
		comment: (id: string) => state[id]?.comment ?? "",
		onTick: (id: string, ticked: boolean) => patch(id, { ticked }),
		onComment: (id: string, comment: string) => patch(id, { comment }),
		outstanding,
		items,
		checklist: () => items,
	};
}
