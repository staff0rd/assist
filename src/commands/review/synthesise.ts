import { readFileSync } from "node:fs";
import type { ReviewPaths } from "./buildReviewPaths";
import { buildReviewSummary } from "./buildReviewSummary";
import { buildSynthesisStdin } from "./buildSynthesisStdin";
import { cachedReviewerResult } from "./cachedReviewerResult";
import type { MultiSpinner } from "./MultiSpinner";
import { resolveSynthesisHarness } from "./resolveSynthesisHarness";
import type { ReviewerResult } from "./runStreamingChild";
import { runSynthesisReviewer } from "./runSynthesisReviewer";

type SynthesiseOptions = {
	multi: MultiSpinner | undefined;
};

function printSummary(synthesisPath: string): void {
	const markdown = readFileSync(synthesisPath, "utf8");
	console.log("");
	console.log(buildReviewSummary(markdown));
	console.log("");
}

export async function synthesise(
	paths: ReviewPaths,
	options: SynthesiseOptions,
): Promise<ReviewerResult> {
	const cached = cachedReviewerResult("synthesis", paths.synthesisPath);
	if (cached) {
		printSummary(paths.synthesisPath);
		return cached;
	}
	const result = await runSynthesisReviewer({
		harness: resolveSynthesisHarness(),
		reviewDir: paths.reviewDir,
		stdin: buildSynthesisStdin(
			paths.requestPath,
			paths.claudePath,
			paths.codexPath,
		),
		outputPath: paths.synthesisPath,
		multi: options.multi,
	});
	if (result.exitCode === 0) printSummary(paths.synthesisPath);
	return result;
}
