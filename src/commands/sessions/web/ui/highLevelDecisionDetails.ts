import type { PreviewChecklistItem } from "../../shared/PreviewDecision";
import type { PrDecisionDetails } from "./PrDecisionDetails";

export function highLevelDecisionDetails(
	checklist: PreviewChecklistItem[],
): PrDecisionDetails {
	return {
		comments: [],
		screenshots: [],
		reviewAfter: false,
		announceAfter: false,
		draft: false,
		autoMerge: false,
		checklist,
	};
}
