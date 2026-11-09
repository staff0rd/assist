import type { FeatureResolution } from "../../../shared/harnessAdapters/types";
import type { HarnessKind } from "../../../shared/harnesses";
import type { AssistConfig } from "../../../shared/types";

const OFF_SWITCHES: Partial<
	Record<HarnessKind, "exposeCodexActions" | "exposePiActions">
> = { codex: "exposeCodexActions", pi: "exposePiActions" };

export function harnessOffSwitch(
	kind: HarnessKind,
	config: AssistConfig["harness"],
): FeatureResolution | undefined {
	const key = OFF_SWITCHES[kind];
	if (!key || config[key] !== false) return undefined;
	return {
		available: false,
		reasons: [
			{
				capability: "harness.enabled",
				reason: `harness.${key} is false`,
				remediation: `assist config set harness.${key} true`,
			},
		],
	};
}
