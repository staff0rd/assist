import { existsSync, unlinkSync } from "node:fs";
import { finaliseReviewerRun } from "./finaliseReviewerRun";
import type { SpinnerHandle } from "./MultiSpinner";
import { parseCodexEvent } from "./parseCodexEvent";
import { reportReviewerToolUse } from "./reportReviewerToolUse";
import { type ReviewerResult, runStreamingChild } from "./runStreamingChild";

type CodexReviewerSpec = {
	name: string;
	reviewDir: string;
	stdin: string;
	outputPath: string;
	spinner?: SpinnerHandle;
};

function codexArgs(reviewDir: string, outputPath: string): string[] {
	return [
		"exec",
		"--cd",
		reviewDir,
		"--sandbox",
		"read-only",
		"--json",
		"--output-last-message",
		outputPath,
	];
}

export async function runCodexReviewer(
	spec: CodexReviewerSpec,
): Promise<ReviewerResult> {
	const { spinner } = spec;
	const result = await runStreamingChild({
		name: spec.name,
		command: "codex",
		args: codexArgs(spec.reviewDir, spec.outputPath),
		stdin: spec.stdin,
		quiet: Boolean(spinner),
		onLine: (line) => {
			const event = parseCodexEvent(line);
			if (event.kind !== "tool_use") return;
			reportReviewerToolUse(spec.name, event, spinner);
		},
	});
	if (result.exitCode !== 0 && existsSync(spec.outputPath)) {
		unlinkSync(spec.outputPath);
	}
	return finaliseReviewerRun(spec, spinner, result);
}
