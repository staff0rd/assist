import { finaliseReviewerSpinner } from "./finaliseReviewerSpinner";
import type { SpinnerHandle } from "./MultiSpinner";
import type { ReviewerResult } from "./runStreamingChild";

type RunOutcome = {
	exitCode: number;
	stderr: string;
	stdout: string;
	elapsedMs: number;
};

type RunSpec = {
	name: string;
	command?: string;
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
			result.stderr,
		);
	return {
		name: spec.name,
		command: spec.command,
		outputPath: spec.outputPath,
		exitCode: result.exitCode,
		stderr: result.stderr,
		stdout: result.stdout,
		elapsedMs: result.elapsedMs,
	};
}
