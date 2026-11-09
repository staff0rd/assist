import {
	harnessLabel,
	legacyDefaultHarness,
} from "../../../../../../../../shared/harnessLabel";
import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import type { HarnessCapabilities } from "../../../../useHarnessCapabilities";

export type InboxHarnessOption = { kind: HarnessKind; label: string };

export function inboxHarnessOptions(
	capabilities: HarnessCapabilities,
): InboxHarnessOption[] {
	const resolutions = capabilities.features.inbox ?? {};
	return (Object.keys(resolutions) as HarnessKind[])
		.filter(
			(kind) =>
				kind !== legacyDefaultHarness && resolutions[kind]?.available === true,
		)
		.map((kind) => ({ kind, label: `Scan with ${harnessLabel(kind)}` }));
}
