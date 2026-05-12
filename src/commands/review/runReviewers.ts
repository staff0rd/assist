import { cachedReviewerResult } from "./cachedReviewerResult";
import { runClaudeReviewer } from "./runClaudeReviewer";
import { runCodexReviewer } from "./runCodexReviewer";
import type { ReviewerResult } from "./runStreamingChild";
import { startHeartbeat } from "./startHeartbeat";

type ReviewersOutcome = {
	results: [ReviewerResult, ReviewerResult];
	anyFresh: boolean;
};

export async function runReviewers(
	reviewDir: string,
	claudePath: string,
	codexPath: string,
	stdinPrompt: string,
): Promise<ReviewersOutcome> {
	const cachedClaude = cachedReviewerResult("claude", claudePath);
	const cachedCodex = cachedReviewerResult("codex", codexPath);
	if (cachedClaude && cachedCodex) {
		return { results: [cachedClaude, cachedCodex], anyFresh: false };
	}
	const stop = startHeartbeat("review");
	try {
		const results = await Promise.all([
			cachedClaude
				? Promise.resolve(cachedClaude)
				: runClaudeReviewer({
						name: "claude",
						reviewDir,
						stdin: stdinPrompt,
						outputPath: claudePath,
					}),
			cachedCodex
				? Promise.resolve(cachedCodex)
				: runCodexReviewer({
						name: "codex",
						reviewDir,
						stdin: stdinPrompt,
						outputPath: codexPath,
					}),
		]);
		return { results, anyFresh: true };
	} finally {
		stop();
	}
}
