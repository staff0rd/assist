import { useMemo, useState } from "react";
import type { HighLevelCheckResult } from "../../../../../../../review/highLevel/types";
import type { HighLevelItemState } from "./useHighLevelChecklist/initialHighLevelState";
import { initialHighLevelState } from "./useHighLevelChecklist/initialHighLevelState";
import { highLevelChecklistItems } from "./useHighLevelChecklist/highLevelChecklistItems";
import {
	type HighLevelSlicing,
	highLevelChecklistTargets,
} from "./useHighLevelChecklist/highLevelChecklistTargets";
import {
	highLevelLockedKeys,
	highLevelOutstanding,
} from "./useHighLevelChecklist/highLevelOutstanding";
import type { HighLevelPaneProgress } from "./useHighLevelReviewPane/loadPersistedHighLevelProgress";

export function useHighLevelChecklist(
	checks: HighLevelCheckResult[],
	saved?: HighLevelPaneProgress,
	slicing?: HighLevelSlicing,
) {
	const targets = useMemo(
		() => highLevelChecklistTargets(checks, slicing),
		[checks, slicing],
	);
	const [state, setState] = useState(() =>
		initialHighLevelState(targets, saved),
	);
	const locked = useMemo(() => highLevelLockedKeys(targets), [targets]);
	const patch = (key: string, change: Partial<HighLevelItemState>) =>
		setState((current) => ({
			...current,
			[key]: { ...current[key], ...change } as HighLevelItemState,
		}));
	const items = useMemo(
		() => highLevelChecklistItems(targets, state),
		[targets, state],
	);

	return {
		ticked: (key: string) => locked.has(key) || state[key]?.ticked === true,
		comment: (key: string) => state[key]?.comment ?? "",
		onTick: (key: string, value: boolean) => patch(key, { ticked: value }),
		onComment: (key: string, comment: string) => patch(key, { comment }),
		outstanding: highLevelOutstanding(targets, state),
		items,
		checklist: () => items,
	};
}
