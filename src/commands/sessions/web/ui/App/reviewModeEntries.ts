import type { HarnessKind } from "../../../../../shared/harnesses";
import {
	type ReviewButtonMode,
	reviewButtonModes,
} from "../../../../../shared/reviewButtonModes";
import type { HarnessCapabilities } from "../useHarnessCapabilities";

type ReviewModeEntry = {
	label: string;
	args: string[];
	onHarness: boolean;
	disabled: boolean;
};

export function reviewModeEntries(
	capabilities: HarnessCapabilities,
	modes: ReviewButtonMode[] = reviewButtonModes,
	harness: HarnessKind = capabilities.engine,
): ReviewModeEntry[] {
	return modes.map((mode) => {
		const onHarness = !!mode.featureId && harness !== capabilities.engine;
		if (!onHarness || !mode.featureId)
			return {
				label: mode.label,
				args: mode.args,
				onHarness: false,
				disabled: false,
			};
		const resolution = capabilities.features[mode.featureId]?.[harness];
		return {
			label: mode.label,
			args: [...mode.args, "--harness", harness],
			onHarness,
			disabled: resolution?.available !== true,
		};
	});
}
