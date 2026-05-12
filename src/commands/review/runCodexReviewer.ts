import { existsSync, unlinkSync } from "node:fs";
import { parseCodexEvent } from "./parseCodexEvent";
import { type ReviewerResult, runStreamingChild } from "./runStreamingChild";

type CodexReviewerSpec = {
	name: string;
	reviewDir: string;
	stdin: string;
	outputPath: string;
};

export async function runCodexReviewer(
	spec: CodexReviewerSpec,
): Promise<ReviewerResult> {
	const result = await runStreamingChild({
		name: spec.name,
		command: "codex",
		args: [
			"exec",
			"--cd",
			spec.reviewDir,
			"--sandbox",
			"read-only",
			"--json",
			"--output-last-message",
			spec.outputPath,
		],
		stdin: spec.stdin,
		onLine: (line) => {
			const event = parseCodexEvent(line);
			if (event.kind !== "tool_use") return;
			console.log(`[${spec.name}] ${event.tool}: ${event.summary}`);
		},
	});
	if (result.exitCode !== 0 && existsSync(spec.outputPath)) {
		unlinkSync(spec.outputPath);
	}
	return {
		name: spec.name,
		outputPath: spec.outputPath,
		exitCode: result.exitCode,
		stderr: result.stderr,
	};
}
