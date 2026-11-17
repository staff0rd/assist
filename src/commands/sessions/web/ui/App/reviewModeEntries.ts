import type { HarnessKind } from "../../../../../shared/harnesses";
import {
	type ReviewButtonMode,
	reviewButtonModes,
} from "../../../../../shared/reviewButtonModes";
import type { HarnessCapabilities } from "../parseHarnessCapabilities";
import { reviewHarnessChoices } from "./reviewHarnessChoices";

type HarnessAlternate = { harness: HarnessKind; args: string[] };

export type ReviewModeEntry = {
	label: string;
	args: string[];
	alternates: HarnessAlternate[];
	columns: HarnessKind[];
};

export function reviewModeEntries(
	capabilities: HarnessCapabilities,
	modes: ReviewButtonMode[] = reviewButtonModes,
	columnModes: ReviewButtonMode[] = modes,
): ReviewModeEntry[] {
	const columns = reviewHarnessChoices(capabilities, columnModes).slice(1);
	return modes.map((mode) => ({
		label: mode.label,
		args: mode.args,
		alternates: reviewHarnessChoices(capabilities, [mode])
			.slice(1)
			.map((harness) => ({
				harness,
				args: [...mode.args, "--harness", harness],
			})),
		columns,
	}));
}
