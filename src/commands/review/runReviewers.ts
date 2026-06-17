import type { MultiSpinner } from "./MultiSpinner";
import type { CodexPlan } from "./planCodexReviewer";
import { resolveClaude } from "./resolveClaude";
import { resolveCodex } from "./resolveCodex";
import type { ReviewerResult } from "./runStreamingChild";

type ReviewersOutcome = {
	results: [ReviewerResult, ReviewerResult];
	anyFresh: boolean;
};

type ReviewersOptions = {
	multi: MultiSpinner | undefined;
	codexPlan: CodexPlan;
	cachedClaude: ReviewerResult | null;
};

export async function runReviewers(
	reviewDir: string,
	claudePath: string,
	codexPath: string,
	stdinPrompt: string,
	options: ReviewersOptions,
): Promise<ReviewersOutcome> {
	const claudePromise = resolveClaude({
		reviewDir,
		claudePath,
		stdin: stdinPrompt,
		cached: options.cachedClaude,
		multi: options.multi,
	});
	const codexPromise = resolveCodex({
		codexPath,
		stdin: stdinPrompt,
		plan: options.codexPlan,
		multi: options.multi,
	});
	const results = await Promise.all([claudePromise, codexPromise]);
	const anyFresh =
		options.cachedClaude === null || options.codexPlan.kind !== "cached";
	return { results, anyFresh };
}
