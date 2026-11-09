import { fixConflictFeature } from "../shared/harnessAdapters/prFeatures";
import type { HarnessKind } from "../shared/harnesses";
import { launchPrSkill } from "./launchPrSkill";

type FixConflictOptions = {
	rebase?: boolean;
	resumeSessionId?: string;
	harness?: HarnessKind;
};

export function fixConflict(
	number?: string,
	options: FixConflictOptions = {},
): Promise<void> {
	return launchPrSkill({
		feature: fixConflictFeature,
		skill: "fix-conflict",
		args: options.rebase ? "--rebase" : undefined,
		number,
		harness: options.harness,
		resumeSessionId: options.resumeSessionId,
	});
}
