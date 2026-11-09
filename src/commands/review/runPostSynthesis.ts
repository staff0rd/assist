import { handlePostSynthesis } from "./handlePostSynthesis";
import type { PrDiffRef } from "./postReviewToPr";
import type { ReviewPrOptions } from "./ReviewPrOptions";

export function runPostSynthesis(
	synthesisPath: string,
	prInfo: PrDiffRef,
	options: ReviewPrOptions,
): Promise<void> {
	return handlePostSynthesis(synthesisPath, prInfo, {
		refine: options.refine ?? false,
		apply: options.apply ?? false,
		backlog: options.backlog ?? false,
		prompt: options.prompt ?? true,
		submit: options.submit ?? false,
		addressComments: options.addressComments ?? false,
		announce: options.announce ?? false,
		harness: options.harness,
	});
}
