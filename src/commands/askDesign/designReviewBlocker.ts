import { activeHarness } from "../../lib/activeHarness";
import { formatUnavailable } from "../../shared/harnessAdapters/formatUnavailable";
import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import { designReviewFeature } from "../../shared/harnessAdapters/harnessFeatures";
import { resolveFeature } from "../../shared/harnessAdapters/resolveFeature";

export function designReviewBlocker(): string | undefined {
	const harness = activeHarness();
	if (!harness) return undefined;
	const { label, capabilities } = harnessAdapter(harness);
	const resolution = resolveFeature(designReviewFeature, {
		label,
		capabilities,
	});
	if (resolution.available) return undefined;
	return formatUnavailable(
		designReviewFeature.label,
		label,
		resolution.reasons,
	);
}
