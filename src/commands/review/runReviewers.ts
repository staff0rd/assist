import { cachedReviewerResult } from "./cachedReviewerResult";
import type { MultiSpinner, SpinnerHandle } from "./MultiSpinner";
import { printReviewerFailures } from "./printReviewerFailures";
import { runClaudeReviewer } from "./runClaudeReviewer";
import { runCodexReviewer } from "./runCodexReviewer";
import type { ReviewerResult } from "./runStreamingChild";

type ReviewersOutcome = {
	results: [ReviewerResult, ReviewerResult];
	anyFresh: boolean;
};

type ReviewersOptions = {
	multi: MultiSpinner | undefined;
};

function spinnerFor(
	multi: MultiSpinner | undefined,
	name: string,
	cached: ReviewerResult | null,
): SpinnerHandle | undefined {
	if (cached || !multi) return undefined;
	return multi.create(`${name} — starting`);
}

export async function runReviewers(
	reviewDir: string,
	claudePath: string,
	codexPath: string,
	stdinPrompt: string,
	options: ReviewersOptions,
): Promise<ReviewersOutcome> {
	const cachedClaude = cachedReviewerResult("claude", claudePath);
	const cachedCodex = cachedReviewerResult("codex", codexPath);
	if (cachedClaude && cachedCodex) {
		return { results: [cachedClaude, cachedCodex], anyFresh: false };
	}
	const { multi } = options;
	const claudeSpinner = spinnerFor(multi, "claude", cachedClaude);
	const codexSpinner = spinnerFor(multi, "codex", cachedCodex);
	const results = await Promise.all([
		cachedClaude
			? Promise.resolve(cachedClaude)
			: runClaudeReviewer({
					name: "claude",
					reviewDir,
					stdin: stdinPrompt,
					outputPath: claudePath,
					spinner: claudeSpinner,
				}),
		cachedCodex
			? Promise.resolve(cachedCodex)
			: runCodexReviewer({
					name: "codex",
					reviewDir,
					stdin: stdinPrompt,
					outputPath: codexPath,
					spinner: codexSpinner,
				}),
	]);
	if (multi) printReviewerFailures(results);
	return { results, anyFresh: true };
}
