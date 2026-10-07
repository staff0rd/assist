import { existsSync, unlinkSync } from "node:fs";
import { buildReviewerStdin } from "./buildReviewerStdin";
import type { ReviewPaths } from "./buildReviewPaths";
import type { MultiSpinner } from "./MultiSpinner";
import type { CodexPlan } from "./planCodexReviewer";
import type { ReviewerModels } from "./ReviewerModels";
import { runReviewers } from "./runReviewers";
import type { ReviewerResult } from "./runStreamingChild";
import { synthesise } from "./synthesise";
import { skipReason } from "./skipReason";

type Args = {
	paths: ReviewPaths;
	cachedClaude: ReviewerResult | null;
	codexPlan: CodexPlan;
	multi: MultiSpinner | undefined;
	models: ReviewerModels;
	strict: boolean;
};

type AndSynthesiseOutcome = {
	ok: boolean;
	failures: ReviewerResult[];
};

function failed(results: ReviewerResult[]): ReviewerResult[] {
	return results.filter((r) => r.exitCode !== 0);
}

export async function runAndSynthesise(
	args: Args,
): Promise<AndSynthesiseOutcome> {
	const { paths, multi } = args;
	const { results, anyFresh } = await runReviewers(
		paths.reviewDir,
		paths.claudePath,
		paths.codexPath,
		buildReviewerStdin(paths.requestPath),
		{
			multi,
			codexPlan: args.codexPlan,
			cachedClaude: args.cachedClaude,
			models: args.models,
		},
	);
	const failures = failed(results);
	const reason = skipReason(results, failures, args.strict);
	if (reason) {
		console.error(reason);
		return { ok: false, failures };
	}
	if (anyFresh && existsSync(paths.synthesisPath)) {
		unlinkSync(paths.synthesisPath);
	}
	const synthesisResult = await synthesise(paths, {
		multi,
		slot: args.models.synthesis,
	});
	if (synthesisResult.exitCode !== 0) failures.push(synthesisResult);
	return { ok: synthesisResult.exitCode === 0, failures };
}
