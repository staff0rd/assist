import { writeFileSync } from "node:fs";
import type { CodexModelOverride } from "../litellm/buildCodexProviderArgs";
import { finaliseReviewerRun } from "./finaliseReviewerRun";
import type { SpinnerHandle } from "./MultiSpinner";
import { parseClaudeEvent } from "./parseClaudeEvent";
import { reportReviewerToolUse } from "./reportReviewerToolUse";
import { type ReviewerResult, runStreamingChild } from "./runStreamingChild";

type ClaudeReviewerSpec = {
	name: string;
	reviewDir: string;
	stdin: string;
	outputPath: string;
	spinner?: SpinnerHandle;
	override?: CodexModelOverride;
};

export async function runClaudeReviewer(
	spec: ClaudeReviewerSpec,
): Promise<ReviewerResult> {
	let finalText = "";
	const { spinner, override } = spec;
	const command = "claude";
	const result = await runStreamingChild({
		name: spec.name,
		command,
		model: override?.model,
		args: [
			"-p",
			"--add-dir",
			spec.reviewDir,
			"--output-format",
			"stream-json",
			"--verbose",
			...(override?.args ?? []),
		],
		stdin: spec.stdin,
		quiet: Boolean(spinner),
		...(override ? { env: override.env } : {}),
		onLine: (line) => {
			const event = parseClaudeEvent(line);
			if (event.kind === "tool_uses") {
				for (const use of event.toolUses)
					reportReviewerToolUse(spec.name, use, spinner, override?.model);
				return;
			}
			if (event.kind === "final") finalText = event.text;
		},
	});
	if (result.exitCode === 0 && finalText)
		writeFileSync(spec.outputPath, finalText);
	return finaliseReviewerRun(
		{ ...spec, command, model: override?.model },
		spinner,
		result,
	);
}
