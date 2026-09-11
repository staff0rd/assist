import { existsSync, unlinkSync } from "node:fs";
import { buildCodexModelArgs } from "./buildCodexModelArgs";
import { finaliseReviewerRun } from "./finaliseReviewerRun";
import type { SpinnerHandle } from "./MultiSpinner";
import { parseCodexEvent } from "./parseCodexEvent";
import { reportReviewerToolUse } from "./reportReviewerToolUse";
import { type ReviewerResult, runStreamingChild } from "./runStreamingChild";

type CodexReviewerSpec = {
	name: string;
	stdin: string;
	outputPath: string;
	spinner?: SpinnerHandle;
};

function codexArgs(outputPath: string, modelArgs: string[]): string[] {
	return [
		"exec",
		...modelArgs,
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
	const command = "codex";
	const override = buildCodexModelArgs();
	const result = await runStreamingChild({
		name: spec.name,
		command,
		args: codexArgs(spec.outputPath, override.args),
		stdin: spec.stdin,
		quiet: Boolean(spinner),
		...(override.args.length > 0 ? { env: override.env } : {}),
		onLine: (line) => {
			const event = parseCodexEvent(line);
			if (event.kind !== "tool_use") return;
			reportReviewerToolUse(spec.name, event, spinner);
		},
	});
	if (result.exitCode !== 0 && existsSync(spec.outputPath)) {
		unlinkSync(spec.outputPath);
	}
	return finaliseReviewerRun({ ...spec, command }, spinner, result);
}
