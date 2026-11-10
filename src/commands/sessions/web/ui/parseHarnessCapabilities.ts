import type { FeatureResolution } from "../../../../shared/harnessAdapters/types";
import type { HarnessKind } from "../../../../shared/harnesses";

export type HarnessCapabilities = {
	exposeCodexActions: boolean;
	exposePiActions: boolean;
	engine: HarnessKind;
	features: Record<string, Partial<Record<HarnessKind, FeatureResolution>>>;
};

export const noHarnessCapabilities: HarnessCapabilities = {
	exposeCodexActions: false,
	exposePiActions: false,
	engine: "claude",
	features: {},
};

export function parseHarnessCapabilities(body: unknown): HarnessCapabilities {
	const value = (body ?? {}) as Partial<HarnessCapabilities>;
	return {
		exposeCodexActions: Boolean(value.exposeCodexActions),
		exposePiActions: Boolean(value.exposePiActions),
		engine: value.engine ?? "claude",
		features: value.features ?? {},
	};
}
