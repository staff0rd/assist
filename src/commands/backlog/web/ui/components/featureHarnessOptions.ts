import { harnessLabel } from "../../../../../shared/harnessAdapters/harnessLabel";
import type { HarnessKind } from "../../../../../shared/harnesses";
import type { HarnessCapabilities } from "../../../../sessions/web/ui/parseHarnessCapabilities";

export function featureHarnessOptions(
	capabilities: HarnessCapabilities,
	featureId: string,
): { kind: HarnessKind; label: string }[] {
	const resolutions = capabilities.features[featureId] ?? {};
	return (Object.keys(resolutions) as HarnessKind[])
		.filter(
			(kind) =>
				kind !== capabilities.engine && resolutions[kind]?.available === true,
		)
		.map((kind) => ({ kind, label: `with ${harnessLabel(kind)}` }));
}
