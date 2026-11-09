import { sessionFeature } from "../../../../../../../../../shared/harnessAdapters/harnessFeatures";
import type { HarnessKind } from "../../../../../../../../../shared/harnesses";
import { useHarnessCapabilities } from "../../../../../useHarnessCapabilities";
import { harnessFeatureFor, type NewSessionMode } from "../newSessionModes";
import { harnessChoices } from "./harnessChoices";

export function useSessionHarness(
	node: string | undefined,
	drafted: HarnessKind,
	mode: NewSessionMode,
): { harness: HarnessKind; harnesses: HarnessKind[] } {
	const harnesses = harnessChoices(
		useHarnessCapabilities(node),
		harnessFeatureFor(mode) ?? sessionFeature.id,
	);
	const harness = harnesses.includes(drafted) ? drafted : harnesses[0];
	return { harness, harnesses };
}
