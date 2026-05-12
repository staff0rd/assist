import { writeFileSync } from "node:fs";
import { parseClaudeEvent } from "./parseClaudeEvent";
import { type ReviewerResult, runStreamingChild } from "./runStreamingChild";

type ClaudeReviewerSpec = {
	name: string;
	reviewDir: string;
	stdin: string;
	outputPath: string;
};

export async function runClaudeReviewer(
	spec: ClaudeReviewerSpec,
): Promise<ReviewerResult> {
	let finalText = "";
	const result = await runStreamingChild({
		name: spec.name,
		command: "claude",
		args: [
			"-p",
			"--add-dir",
			spec.reviewDir,
			"--output-format",
			"stream-json",
			"--verbose",
		],
		stdin: spec.stdin,
		onLine: (line) => {
			const event = parseClaudeEvent(line);
			if (event.kind === "tool_uses") {
				for (const use of event.toolUses) {
					const suffix = use.summary ? `: ${use.summary}` : "";
					console.log(`[${spec.name}] ${use.tool}${suffix}`);
				}
				return;
			}
			if (event.kind === "final") finalText = event.text;
		},
	});
	if (result.exitCode === 0 && finalText)
		writeFileSync(spec.outputPath, finalText);
	return {
		name: spec.name,
		outputPath: spec.outputPath,
		exitCode: result.exitCode,
		stderr: result.stderr,
	};
}
