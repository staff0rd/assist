import type { HarnessKind } from "../../../../../shared/harnesses";
import {
	type ReviewButtonMode,
	reviewButtonModes,
} from "../../../../../shared/reviewButtonModes";
import type { HarnessCapabilities } from "../useHarnessCapabilities";
import { reviewHarnessChoices } from "./reviewHarnessChoices";

type HarnessAlternate = { harness: HarnessKind; args: string[] };

export type ReviewModeEntry = {
	label: string;
	args: string[];
	alternates: HarnessAlternate[];
};

export function reviewModeEntries(
	capabilities: HarnessCapabilities,
	modes: ReviewButtonMode[] = reviewButtonModes,
): ReviewModeEntry[] {
	return modes.map((mode) => ({
		label: mode.label,
		args: mode.args,
		alternates: reviewHarnessChoices(capabilities, [mode])
			.slice(1)
			.map((harness) => ({
				harness,
				args: [...mode.args, "--harness", harness],
			})),
	}));
}
