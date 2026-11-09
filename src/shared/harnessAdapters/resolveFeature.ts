import { resolveCapability } from "./resolveCapability";
import type {
	CapabilityStatus,
	FeatureResolution,
	HarnessCapabilitySource,
	HarnessFeature,
	Unavailability,
} from "./types";

export function resolveFeature(
	feature: HarnessFeature,
	harness: HarnessCapabilitySource,
): FeatureResolution {
	const detected = harness.detect?.();
	if (detected && !detected.supported)
		return {
			available: false,
			reasons: [unavailability("harness.detected", detected)],
		};
	const reasons: Unavailability[] = [];
	for (const capability of feature.requires) {
		const status = resolveCapability(harness.capabilities, capability);
		if (!status.supported) reasons.push(unavailability(capability, status));
	}
	return reasons.length ? { available: false, reasons } : { available: true };
}

function unavailability(
	capability: Unavailability["capability"],
	status: Extract<CapabilityStatus, { supported: false }>,
): Unavailability {
	const { supported: _supported, ...rest } = status;
	return { capability, ...rest };
}
