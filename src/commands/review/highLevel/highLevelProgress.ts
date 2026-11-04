import type { PreviewDecision } from "../../sessions/shared/PreviewDecision";
import { isHighLevelSliceCheck } from "./isHighLevelSliceCheck";
import type {
	HighLevelCheckResult,
	HighLevelReviewItem,
	HighLevelReviewProgress,
	HighLevelSlice,
	HighLevelSliceRef,
} from "./types";

function toItem(
	check: HighLevelCheckResult,
	decision: PreviewDecision,
	slice?: HighLevelSliceRef,
): HighLevelReviewItem {
	const ticked = decision.checklist?.find(
		(entry) => entry.id === check.id && entry.slice === slice?.number,
	);
	const comment = ticked?.comment?.trim();
	return {
		id: check.id,
		kind: check.kind,
		title: check.title,
		status: check.status,
		reason: check.reason,
		ticked: ticked?.ticked ?? check.status === "pass",
		...(comment ? { comment } : {}),
		...(slice ? { slice: slice.number, sliceTitle: slice.title } : {}),
	};
}

function itemsOf(
	check: HighLevelCheckResult,
	decision: PreviewDecision,
	slices: HighLevelSlice[] | undefined,
): HighLevelReviewItem[] {
	if (!slices || !isHighLevelSliceCheck(check.id))
		return [toItem(check, decision)];
	return slices.map((slice, index) =>
		toItem(check, decision, { number: index + 1, title: slice.title }),
	);
}

export function highLevelProgress(
	checks: HighLevelCheckResult[],
	decision: PreviewDecision,
	slices?: HighLevelSlice[],
): HighLevelReviewProgress {
	const reviewComments = decision.reviewComments ?? [];
	return {
		items: checks.flatMap((check) => itemsOf(check, decision, slices)),
		...(reviewComments.length > 0 ? { reviewComments } : {}),
	};
}
