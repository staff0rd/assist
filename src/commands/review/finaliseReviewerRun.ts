import { finaliseReviewerSpinner } from "./finaliseReviewerSpinner";
import type { SpinnerHandle } from "./MultiSpinner";
import type { ReviewerResult } from "./runStreamingChild";

type RunOutcome = {
	exitCode: number;
	stderr: string;
	elapsedMs: number;
};

type RunSpec = {
	name: string;
	outputPath: string;
};

export function finaliseReviewerRun(
	spec: RunSpec,
	spinner: SpinnerHandle | undefined,
	result: RunOutcome,
): ReviewerResult {
	if (spinner)
		finaliseReviewerSpinner(
			spinner,
			spec.name,
			result.exitCode,
			result.elapsedMs,
		);
	return {
		name: spec.name,
		outputPath: spec.outputPath,
		exitCode: result.exitCode,
		stderr: result.stderr,
	};
}
