import { activeHarness } from "../../lib/activeHarness";
import { formatUnavailable } from "../../shared/harnessAdapters/formatUnavailable";
import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import { previewAnswerWaitFeature } from "../../shared/harnessAdapters/harnessFeatures";
import { resolveFeature } from "../../shared/harnessAdapters/resolveFeature";
import type { HarnessKind } from "../../shared/harnesses";

export function previewAnswerWaitBlocker(
	harness: HarnessKind | undefined = activeHarness(),
): string | undefined {
	if (!harness) return undefined;
	const { label, capabilities } = harnessAdapter(harness);
	const resolution = resolveFeature(previewAnswerWaitFeature, {
		label,
		capabilities,
	});
	if (resolution.available) return undefined;
	return formatUnavailable(
		previewAnswerWaitFeature.label,
		label,
		resolution.reasons,
	);
}
