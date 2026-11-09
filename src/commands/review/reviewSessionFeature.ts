import { isAgentHarness } from "../../lib/isAgentHarness";
import {
	highLevelReviewFeature,
	reviewCheckoutFeature,
} from "../../shared/harnessAdapters/reviewFeatures";
import type { HarnessFeature } from "../../shared/harnessAdapters/types";
import { postSynthesisSession } from "./postSynthesisSession";
import type { ReviewOptions } from "./ReviewOptions";

export function reviewSessionFeature(
	options: ReviewOptions,
): HarnessFeature | undefined {
	if (options.checkoutOnly) return reviewCheckoutFeature;
	if (options.highLevel)
		return options.number && !isAgentHarness()
			? highLevelReviewFeature
			: undefined;
	return postSynthesisSession(options)?.feature;
}
