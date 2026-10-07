import type { HighLevelCheckResult } from "../../../../../../../../review/highLevel/types";
import type { PreviewChecklistItem } from "../../../../../../../shared/PreviewDecision";
import type { HighLevelItemState } from "./initialHighLevelState";

export function highLevelChecklistItems(
	checks: HighLevelCheckResult[],
	state: Record<string, HighLevelItemState>,
): PreviewChecklistItem[] {
	return checks.map((check) => {
		const comment = state[check.id]?.comment.trim() ?? "";
		const notes = Object.entries(state[check.id]?.notes ?? {}).flatMap(
			([id, note]) => (note.trim() ? [{ id, comment: note.trim() }] : []),
		);
		return {
			id: check.id,
			ticked: state[check.id]?.ticked === true,
			...(comment ? { comment } : {}),
			...(notes.length > 0 ? { notes } : {}),
		};
	});
}
