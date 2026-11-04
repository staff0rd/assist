import type { PreviewChecklistItem } from "../../../../../../../shared/PreviewDecision";
import type { HighLevelChecklistTarget } from "./highLevelChecklistTargets";
import type { HighLevelItemState } from "./initialHighLevelState";

export function highLevelChecklistItems(
	targets: HighLevelChecklistTarget[],
	state: Record<string, HighLevelItemState>,
): PreviewChecklistItem[] {
	return targets.map(({ key, check, slice, locked }) => {
		const comment = state[key]?.comment.trim() ?? "";
		return {
			id: check.id,
			ticked: locked || state[key]?.ticked === true,
			...(comment ? { comment } : {}),
			...(slice === undefined ? {} : { slice }),
		};
	});
}
