import { useMemo, useState } from "react";
import type { HighLevelCheckResult } from "../../../review/highLevel/types";
import type { PreviewChecklistItem } from "../../shared/PreviewDecision";

type ItemState = { ticked: boolean; comment: string };

function initialState(
	checks: HighLevelCheckResult[],
): Record<string, ItemState> {
	return Object.fromEntries(
		checks.map((check) => [
			check.id,
			{ ticked: check.status === "pass", comment: "" },
		]),
	);
}

export function useHighLevelChecklist(checks: HighLevelCheckResult[]) {
	const [state, setState] = useState(() => initialState(checks));

	const patch = (id: string, change: Partial<ItemState>) =>
		setState((current) => ({
			...current,
			[id]: { ...current[id], ...change } as ItemState,
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
			const item = state[check.id];
			const comment = item?.comment.trim() ?? "";
			return {
				id: check.id,
				ticked: item?.ticked === true,
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
