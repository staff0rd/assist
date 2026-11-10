import type { HarnessKind } from "../../../../../shared/harnesses";
import type { ReviewButtonMode } from "../../../../../shared/reviewButtonModes";
import type { HarnessCapabilities } from "../useHarnessCapabilities";

export function reviewHarnessChoices(
	capabilities: HarnessCapabilities,
	modes: ReviewButtonMode[],
): HarnessKind[] {
	const others = new Set<HarnessKind>();
	for (const { featureId } of modes) {
		const resolutions = featureId
			? capabilities.features[featureId]
			: undefined;
		for (const [kind, resolution] of Object.entries(resolutions ?? {}))
			if (kind !== capabilities.engine && resolution?.available)
				others.add(kind as HarnessKind);
	}
	return [capabilities.engine, ...others];
}
