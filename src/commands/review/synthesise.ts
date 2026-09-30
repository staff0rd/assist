import { readFileSync } from "node:fs";
import type { CodexModelOverride } from "../litellm/buildCodexProviderArgs";
import type { ReviewPaths } from "./buildReviewPaths";
import { buildReviewSummary } from "./buildReviewSummary";
import { buildSynthesisStdin } from "./buildSynthesisStdin";
import { cachedReviewerResult } from "./cachedReviewerResult";
import type { MultiSpinner, SpinnerHandle } from "./MultiSpinner";
import { reviewerLabel } from "./reviewerLabel";
import { runClaudeReviewer } from "./runClaudeReviewer";
import type { ReviewerResult } from "./runStreamingChild";

type SynthesiseOptions = {
	multi: MultiSpinner | undefined;
	override?: CodexModelOverride;
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
	const { multi, override } = options;
	const spinner: SpinnerHandle | undefined = multi?.create(
		`${reviewerLabel("synthesis", override?.model)} — starting`,
	);
	const result = await runClaudeReviewer({
		name: "synthesis",
		reviewDir: paths.reviewDir,
		stdin: buildSynthesisStdin(
			paths.requestPath,
			paths.claudePath,
			paths.codexPath,
		),
		outputPath: paths.synthesisPath,
		spinner,
		override,
	});
	if (result.exitCode === 0) printSummary(paths.synthesisPath);
	return result;
}
