import { useMemo, useState } from "react";
import type {
	HighLevelCheckResult,
	HighLevelReviewRecord,
} from "../../../../../../../review/highLevel/types";
import type { HighLevelItemState } from "./useHighLevelChecklist/initialHighLevelState";
import { initialHighLevelState } from "./useHighLevelChecklist/initialHighLevelState";
import { highLevelChecklistItems } from "./useHighLevelChecklist/highLevelChecklistItems";

export function useHighLevelChecklist(
	checks: HighLevelCheckResult[],
	saved?: HighLevelReviewRecord,
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

	const checklist = () => highLevelChecklistItems(checks, state);

	return {
		ticked: (id: string) => state[id]?.ticked === true,
		comment: (id: string) => state[id]?.comment ?? "",
		onTick: (id: string, ticked: boolean) => patch(id, { ticked }),
		onComment: (id: string, comment: string) => patch(id, { comment }),
		note: (id: string, noteId: string) => state[id]?.notes[noteId] ?? "",
		onNote: (id: string, noteId: string, note: string) =>
			patch(id, { notes: { ...state[id]?.notes, [noteId]: note } }),
		outstanding,
		checklist,
	};
}
