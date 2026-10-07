import { readFileSync } from "node:fs";
import type { ReviewPaths } from "./buildReviewPaths";
import { buildReviewSummary } from "./buildReviewSummary";
import { buildSynthesisStdin } from "./buildSynthesisStdin";
import { cachedReviewerResult } from "./cachedReviewerResult";
import type { MultiSpinner, SpinnerHandle } from "./MultiSpinner";
import type { SlotModel } from "./ReviewerModels";
import { reviewerLabel } from "./reviewerLabel";
import { runSlot } from "./runSlot";
import type { ReviewerResult } from "./runStreamingChild";

type SynthesiseOptions = {
	multi: MultiSpinner | undefined;
	slot?: SlotModel;
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
	const { multi, slot } = options;
	const override = slot?.override;
	const spinner: SpinnerHandle | undefined = multi?.create(
		`${reviewerLabel("synthesis", override?.model)} — starting`,
	);
	const result = await runSlot(slot?.harness ?? "claude", {
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
