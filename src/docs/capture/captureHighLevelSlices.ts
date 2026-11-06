import { listHighLevelHunks } from "../../commands/review/highLevel/listHighLevelHunks";
import { resolveHighLevelSlices } from "../../commands/review/highLevel/resolveHighLevelSlices";
import type {
	HighLevelFile,
	HighLevelSliceSet,
} from "../../commands/review/highLevel/types";
import type { CaptureHighLevelReviewStep } from "../captureSetupStepSchema";

export function captureHighLevelSlices(
	step: CaptureHighLevelReviewStep,
	files: HighLevelFile[],
): HighLevelSliceSet | undefined {
	if (!step.slices) return undefined;
	const { warnings, ...set } = resolveHighLevelSlices(
		{
			slices: step.slices,
			manualTesting: step.manualTesting ?? { setup: [], steps: [] },
		},
		listHighLevelHunks(files),
	);
	if (warnings.length > 0) throw new Error(warnings.join("\n"));
	return set;
}
