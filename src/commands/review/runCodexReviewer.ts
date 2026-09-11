import { existsSync, unlinkSync } from "node:fs";
import type { CodexModelOverride } from "./buildCodexModelArgs";
import { finaliseReviewerRun } from "./finaliseReviewerRun";
import type { SpinnerHandle } from "./MultiSpinner";
import { parseCodexEvent } from "./parseCodexEvent";
import { reportReviewerToolUse } from "./reportReviewerToolUse";
import { type ReviewerResult, runStreamingChild } from "./runStreamingChild";

type CodexReviewerSpec = {
	name: string;
	stdin: string;
	outputPath: string;
	override: CodexModelOverride;
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
	const { spinner, override } = spec;
	const command = "codex";
	const result = await runStreamingChild({
		name: spec.name,
		command,
		model: override.model,
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
	return finaliseReviewerRun(
		{
			name: spec.name,
			command,
			model: override.model,
			outputPath: spec.outputPath,
		},
		spinner,
		result,
	);
}
