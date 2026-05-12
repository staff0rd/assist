import { existsSync, unlinkSync } from "node:fs";
import { buildReviewerStdin } from "./buildReviewerStdin";
import type { ReviewPaths } from "./buildReviewPaths";
import { runReviewers } from "./runReviewers";
import { synthesise } from "./synthesise";

export async function runReviewPipeline(paths: ReviewPaths): Promise<boolean> {
	const { results, anyFresh } = await runReviewers(
		paths.reviewDir,
		paths.claudePath,
		paths.codexPath,
		buildReviewerStdin(paths.requestPath),
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
	const synthesisResult = await synthesise(paths);
	return synthesisResult.exitCode === 0;
}
