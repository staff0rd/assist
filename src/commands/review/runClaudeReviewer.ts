import { writeFileSync } from "node:fs";
import { createClaudeLineHandler } from "./createClaudeLineHandler";
import { finaliseReviewerRun } from "./finaliseReviewerRun";
import type { SpinnerHandle } from "./MultiSpinner";
import { type ReviewerResult, runStreamingChild } from "./runStreamingChild";

type ClaudeReviewerSpec = {
	name: string;
	reviewDir: string;
	stdin: string;
	outputPath: string;
	spinner?: SpinnerHandle;
};

export async function runClaudeReviewer(
	spec: ClaudeReviewerSpec,
): Promise<ReviewerResult> {
	const { spinner } = spec;
	const command = "claude";
	const { state, onLine } = createClaudeLineHandler(spec.name, spinner);
	const result = await runStreamingChild({
		name: spec.name,
		command,
		args: [
			"-p",
			"--add-dir",
			spec.reviewDir,
			"--output-format",
			"stream-json",
			"--verbose",
		],
		stdin: spec.stdin,
		quiet: Boolean(spinner),
		onLine,
	});
	if (result.exitCode === 0 && state.finalText)
		writeFileSync(spec.outputPath, state.finalText);
	const finalised = finaliseReviewerRun({ ...spec, command }, spinner, result);
	return state.usage ? { ...finalised, usage: state.usage } : finalised;
}
