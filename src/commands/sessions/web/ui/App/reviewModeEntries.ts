import {
	type ReviewButtonMode,
	reviewButtonModes,
} from "../../../../../shared/reviewButtonModes";
import { featureHarnessOptions } from "../../../../backlog/web/ui/components/featureHarnessOptions";
import type { HarnessCapabilities } from "../useHarnessCapabilities";

type ReviewModeEntry = {
	label: string;
	args: string[];
	onHarness: boolean;
};

export function reviewModeEntries(
	capabilities: HarnessCapabilities,
	modes: ReviewButtonMode[] = reviewButtonModes,
): ReviewModeEntry[] {
	return modes.flatMap((mode) => [
		{ label: mode.label, args: mode.args, onHarness: false },
		...(mode.featureId
			? featureHarnessOptions(capabilities, mode.featureId).map((option) => ({
					label: `${mode.label} ${option.label}`,
					args: [...mode.args, "--harness", option.kind],
					onHarness: true,
				}))
			: []),
	]);
}
