import { resolveHarness } from "../../../../../../../../../shared/harnessAdapters/harnessLabel";
import type { HarnessKind } from "../../../../../../../../../shared/harnesses";
import type { HarnessCapabilities } from "../../../../../parseHarnessCapabilities";

export function harnessChoices(
	capabilities: Pick<HarnessCapabilities, "features">,
	featureId: string,
): HarnessKind[] {
	const resolutions = capabilities.features[featureId] ?? {};
	const available = (Object.keys(resolutions) as HarnessKind[]).filter(
		(kind) => resolutions[kind]?.available === true,
	);
	return available.length > 0 ? available : [resolveHarness(undefined)];
}
