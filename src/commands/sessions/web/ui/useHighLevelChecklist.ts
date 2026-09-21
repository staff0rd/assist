import { useMemo, useState } from "react";
import type {
	HighLevelCheckResult,
	HighLevelReviewRecord,
} from "../../../review/highLevel/types";
import type { PreviewChecklistItem } from "../../shared/PreviewDecision";
import type { HighLevelItemState } from "./initialHighLevelState";
import { initialHighLevelState } from "./initialHighLevelState";

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

	const checklist = (): PreviewChecklistItem[] =>
		checks.map((check) => {
			const comment = state[check.id]?.comment.trim() ?? "";
			return {
				id: check.id,
				ticked: state[check.id]?.ticked === true,
				...(comment ? { comment } : {}),
			};
		});

	return {
		ticked: (id: string) => state[id]?.ticked === true,
		comment: (id: string) => state[id]?.comment ?? "",
		onTick: (id: string, ticked: boolean) => patch(id, { ticked }),
		onComment: (id: string, comment: string) => patch(id, { comment }),
		outstanding,
		checklist,
	};
}
