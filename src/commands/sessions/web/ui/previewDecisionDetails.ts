import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "./PrDecisionDetails";
import type { PrPreviewChain } from "./PrPreviewChain";

export function previewDecisionDetails(
	approved: boolean,
	comments: PrPreviewComment[],
	chain: PrPreviewChain,
	screenshots: string[],
	body: string | undefined,
): PrDecisionDetails {
	return {
		comments,
		screenshots,
		reviewAfter: approved && chain.reviewAfter,
		announceAfter: approved && chain.announceAfter,
		draft: chain.draft,
		autoMerge: approved && chain.autoMerge,
		...(body === undefined ? {} : { body }),
	};
}
