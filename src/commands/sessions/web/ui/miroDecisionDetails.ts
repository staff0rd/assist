import type { PreviewSelection } from "../../shared/PreviewDecision";
import type { PrDecisionDetails } from "./PrDecisionDetails";

export function miroDecisionDetails(
	selection?: PreviewSelection,
): PrDecisionDetails {
	return {
		comments: [],
		screenshots: [],
		reviewAfter: false,
		announceAfter: false,
		draft: false,
		autoMerge: false,
		...(selection ? { selection } : {}),
	};
}
