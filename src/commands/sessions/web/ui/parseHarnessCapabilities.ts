import type { FeatureResolution } from "../../../../shared/harnessAdapters/types";
import type { HarnessKind } from "../../../../shared/harnesses";
import { legacyDefaultHarness } from "../../../../shared/harnessAdapters/harnessLabel";

export type HarnessCapabilities = {
	exposeCodexActions: boolean;
	exposePiActions: boolean;
	engine: HarnessKind;
	runHarness: HarnessKind;
	features: Record<string, Partial<Record<HarnessKind, FeatureResolution>>>;
};

export const noHarnessCapabilities: HarnessCapabilities = {
	exposeCodexActions: false,
	exposePiActions: false,
	engine: legacyDefaultHarness,
	runHarness: legacyDefaultHarness,
	features: {},
};

export function parseHarnessCapabilities(body: unknown): HarnessCapabilities {
	const value = (body ?? {}) as Partial<HarnessCapabilities>;
	return {
		exposeCodexActions: Boolean(value.exposeCodexActions),
		exposePiActions: Boolean(value.exposePiActions),
		engine: value.engine ?? legacyDefaultHarness,
		runHarness: value.runHarness ?? value.engine ?? legacyDefaultHarness,
		features: value.features ?? {},
	};
}
