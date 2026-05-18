import { existsSync, unlinkSync } from "node:fs";
import { buildReviewerStdin } from "./buildReviewerStdin";
import type { ReviewPaths } from "./buildReviewPaths";
import type { MultiSpinner } from "./MultiSpinner";
import type { CodexPlan } from "./planCodexReviewer";
import { runReviewers } from "./runReviewers";
import type { ReviewerResult } from "./runStreamingChild";
import { synthesise } from "./synthesise";

type Args = {
	paths: ReviewPaths;
	cachedClaude: ReviewerResult | null;
	codexPlan: CodexPlan;
	multi: MultiSpinner | undefined;
};

export async function runAndSynthesise(args: Args): Promise<boolean> {
	const { paths, multi } = args;
	const { results, anyFresh } = await runReviewers(
		paths.reviewDir,
		paths.claudePath,
		paths.codexPath,
		buildReviewerStdin(paths.requestPath),
		{ multi, codexPlan: args.codexPlan, cachedClaude: args.cachedClaude },
	);
	if (results.every((r) => r.exitCode !== 0)) {
		console.error(
			"Both reviewers failed; skipping synthesis. See review folder for stderr details.",
		);
		return false;
	}
	if (anyFresh && existsSync(paths.synthesisPath)) {
		unlinkSync(paths.synthesisPath);
	}
	const synthesisResult = await synthesise(paths, { multi });
	return synthesisResult.exitCode === 0;
}
