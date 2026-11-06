import { evaluateHighLevelChecks } from "../../commands/review/highLevel/evaluateHighLevelChecks";
import type { HighLevelConfig } from "../../commands/review/highLevel/resolveHighLevelConfig";
import type {
	HighLevelCheckResult,
	HighLevelFile,
} from "../../commands/review/highLevel/types";
import type { CaptureHighLevelReviewStep } from "../captureSetupStepSchema";

export function captureHighLevelChecks(
	step: CaptureHighLevelReviewStep,
	files: HighLevelFile[],
	config: HighLevelConfig,
): HighLevelCheckResult[] {
	return evaluateHighLevelChecks({
		sliced: step.slices !== undefined,
		body: step.body,
		linkedIssues: step.linkedIssues ?? [],
		mergeable: "MERGEABLE",
		baseRef: "main",
		changedFiles: files.map((file) => file.path),
		config,
	});
}
