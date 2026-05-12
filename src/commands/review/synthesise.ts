import { readFileSync } from "node:fs";
import type { ReviewPaths } from "./buildReviewPaths";
import { buildReviewSummary } from "./buildReviewSummary";
import { buildSynthesisStdin } from "./buildSynthesisStdin";
import { cachedReviewerResult } from "./cachedReviewerResult";
import type { ReviewerResult } from "./runStreamingChild";
import { runSynthesis } from "./runSynthesis";
import { startHeartbeat } from "./startHeartbeat";

function printSummary(synthesisPath: string): void {
	const markdown = readFileSync(synthesisPath, "utf-8");
	console.log("");
	console.log(buildReviewSummary(markdown));
	console.log("");
}

export async function synthesise(paths: ReviewPaths): Promise<ReviewerResult> {
	const cached = cachedReviewerResult("synthesis", paths.synthesisPath);
	if (cached) {
		printSummary(paths.synthesisPath);
		return cached;
	}
	const stop = startHeartbeat("synthesis");
	let result: ReviewerResult;
	try {
		result = await runSynthesis(
			paths.reviewDir,
			paths.synthesisPath,
			buildSynthesisStdin(paths.requestPath, paths.claudePath, paths.codexPath),
		);
	} finally {
		stop();
	}
	if (result.exitCode === 0) printSummary(paths.synthesisPath);
	return result;
}
