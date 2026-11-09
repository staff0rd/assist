import { sessionFeature } from "../../../../../../../../../shared/harnessAdapters/harnessFeatures";
import type { HarnessKind } from "../../../../../../../../../shared/harnesses";
import { useHarnessCapabilities } from "../../../../../useHarnessCapabilities";
import { harnessChoices } from "./harnessChoices";

export function useSessionHarness(
	node: string | undefined,
	drafted: HarnessKind,
): { harness: HarnessKind; harnesses: HarnessKind[] } {
	const harnesses = harnessChoices(
		useHarnessCapabilities(node),
		sessionFeature.id,
	);
	const harness = harnesses.includes(drafted) ? drafted : harnesses[0];
	return { harness, harnesses };
}
