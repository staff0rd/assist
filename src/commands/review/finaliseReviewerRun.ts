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
	model?: string;
	outputPath: string;
};

export function finaliseReviewerRun(
	spec: RunSpec,
	spinner: SpinnerHandle | undefined,
	result: RunOutcome,
): ReviewerResult {
	if (spinner)
		finaliseReviewerSpinner(spinner, {
			name: spec.name,
			model: spec.model,
			exitCode: result.exitCode,
			elapsedMs: result.elapsedMs,
			stderr: result.stderr,
		});
	return {
		name: spec.name,
		command: spec.command,
		model: spec.model,
		outputPath: spec.outputPath,
		exitCode: result.exitCode,
		stderr: result.stderr,
		stdout: result.stdout,
		elapsedMs: result.elapsedMs,
	};
}
