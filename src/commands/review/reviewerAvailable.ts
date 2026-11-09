import { formatUnavailable } from "../../shared/harnessAdapters/formatUnavailable";
import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import { resolveFeature } from "../../shared/harnessAdapters/resolveFeature";
import { reviewerFeature } from "../../shared/harnessAdapters/reviewFeatures";
import type { ReviewerSlot } from "./reviewerSlots";

export async function reviewerAvailable(slot: ReviewerSlot): Promise<boolean> {
	const adapter = harnessAdapter(slot.harness);
	const resolution = resolveFeature(reviewerFeature, adapter);
	if (resolution.available) return true;
	const onlyUndetected = resolution.reasons.every(
		(r) => r.capability === "harness.detected",
	);
	if (onlyUndetected && adapter.offerInstall)
		return (
			(await adapter.offerInstall()) &&
			resolveFeature(reviewerFeature, adapter).available
		);
	console.log(
		formatUnavailable(
			`The ${slot.name} reviewer`,
			adapter.label,
			resolution.reasons,
		),
	);
	return false;
}
