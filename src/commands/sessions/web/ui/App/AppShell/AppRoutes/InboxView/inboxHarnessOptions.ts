import {
	harnessLabel,
	legacyDefaultHarness,
} from "../../../../../../../../shared/harnessLabel";
import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import type { HarnessCapabilities } from "../../../../useHarnessCapabilities";

export type InboxHarnessOption = {
	kind: HarnessKind;
	label: string;
	unavailable?: string;
};

export function inboxHarnessOptions(
	capabilities: HarnessCapabilities,
): InboxHarnessOption[] {
	const resolutions = capabilities.features.inbox ?? {};
	return (Object.keys(resolutions) as HarnessKind[])
		.filter((kind) => kind !== legacyDefaultHarness)
		.map((kind) => {
			const resolution = resolutions[kind];
			const label = `Scan with ${harnessLabel(kind)}`;
			return resolution?.available === false
				? {
						kind,
						label,
						unavailable: resolution.reasons.map((r) => r.reason).join("; "),
					}
				: { kind, label };
		});
}
