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
		{ multi, codexPlan: args.codexPlan, cachedClaude: args.cachedClaude },
	);
	const failures = failed(results);
	if (results.every((r) => r.exitCode !== 0)) {
		console.error("Both reviewers failed; skipping synthesis.");
		return { ok: false, failures };
	}
	if (anyFresh && existsSync(paths.synthesisPath)) {
		unlinkSync(paths.synthesisPath);
	}
	const synthesisResult = await synthesise(paths, { multi });
	if (synthesisResult.exitCode !== 0) failures.push(synthesisResult);
	return { ok: synthesisResult.exitCode === 0, failures };
}
