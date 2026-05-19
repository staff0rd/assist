import { writeFileSync } from "node:fs";
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
};

export async function runClaudeReviewer(
	spec: ClaudeReviewerSpec,
): Promise<ReviewerResult> {
	let finalText = "";
	const { spinner } = spec;
	const command = "claude";
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
		onLine: (line) => {
			const event = parseClaudeEvent(line);
			if (event.kind === "tool_uses") {
				for (const use of event.toolUses)
					reportReviewerToolUse(spec.name, use, spinner);
				return;
			}
			if (event.kind === "final") finalText = event.text;
		},
	});
	if (result.exitCode === 0 && finalText)
		writeFileSync(spec.outputPath, finalText);
	return finaliseReviewerRun({ ...spec, command }, spinner, result);
}
