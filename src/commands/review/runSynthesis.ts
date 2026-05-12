import { runClaudeReviewer } from "./runClaudeReviewer";
import type { ReviewerResult } from "./runStreamingChild";

export function runSynthesis(
	reviewDir: string,
	synthesisPath: string,
	stdinPrompt: string,
): Promise<ReviewerResult> {
	return runClaudeReviewer({
		name: "synthesis",
		reviewDir,
		stdin: stdinPrompt,
		outputPath: synthesisPath,
	});
}
