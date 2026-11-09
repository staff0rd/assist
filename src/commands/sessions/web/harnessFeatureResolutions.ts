import { detectHarness } from "../../../shared/harnessAdapters/detectHarness";
import { harnessCapabilityDeclarations } from "../../../shared/harnessAdapters/harnessCapabilityDeclarations";
import { harnessFeatures } from "../../../shared/harnessAdapters/harnessFeatures";
import { resolveFeature } from "../../../shared/harnessAdapters/resolveFeature";
import type {
	CapabilityStatus,
	FeatureResolution,
} from "../../../shared/harnessAdapters/types";
import { harnessLabel } from "../../../shared/harnessLabel";
import { type HarnessKind, harnesses } from "../../../shared/harnesses";
import type { AssistConfig } from "../../../shared/types";
import { harnessOffSwitch } from "./harnessOffSwitch";

type PerHarness<T> = Record<HarnessKind, T>;

export function harnessFeatureResolutions(config: AssistConfig["harness"]): {
	detected: PerHarness<boolean>;
	features: Record<string, PerHarness<FeatureResolution>>;
} {
	const kinds = Object.keys(harnesses) as HarnessKind[];
	const detection = new Map<HarnessKind, CapabilityStatus>();
	for (const kind of kinds)
		if (!harnessOffSwitch(kind, config))
			detection.set(kind, detectHarness(kind));
	const resolve = (feature: (typeof harnessFeatures)[number]) =>
		Object.fromEntries(
			kinds.map((kind) => [
				kind,
				harnessOffSwitch(kind, config) ??
					resolveFeature(feature, {
						label: harnessLabel(kind),
						capabilities: harnessCapabilityDeclarations[kind],
						detect: () => detection.get(kind) ?? { supported: true },
					}),
			]),
		) as PerHarness<FeatureResolution>;
	return {
		detected: Object.fromEntries(
			kinds.map((kind) => [kind, detection.get(kind)?.supported === true]),
		) as PerHarness<boolean>,
		features: Object.fromEntries(
			harnessFeatures.map((feature) => [feature.id, resolve(feature)]),
		),
	};
}
