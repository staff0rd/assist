import { useState } from "react";
import { buildFeature } from "../../../../../../shared/harnessAdapters/harnessFeatures";
import type { HarnessKind } from "../../../../../../shared/harnesses";
import { harnessChoices } from "../../App/AppShell/AppOverlays/NewSessionLayer/NewSessionDialog/harnessChoices";
import { useHarnessCapabilities } from "../../useHarnessCapabilities";

export function usePhoneHarness(node?: string, featureId = buildFeature.id) {
	const capabilities = useHarnessCapabilities(node);
	const [picked, setPicked] = useState<HarnessKind>();
	const harnesses = harnessChoices(capabilities, featureId);
	const fallback = harnesses.includes(capabilities.runHarness)
		? capabilities.runHarness
		: harnesses[0];
	const harness = picked && harnesses.includes(picked) ? picked : fallback;
	const harnessArgs =
		harness === capabilities.runHarness ? [] : ["--harness", harness];
	return {
		harness,
		setHarness: setPicked,
		harnesses,
		harnessArgs,
		capabilities,
	};
}
