import { buildCodexModelArgs } from "./buildCodexModelArgs";
import type { MultiSpinner } from "./MultiSpinner";
import type { ReviewerHarness } from "./reviewerHarnesses";
import { reviewerLabel } from "./reviewerLabel";
import { runClaudeReviewer } from "./runClaudeReviewer";
import { runCodexReviewer } from "./runCodexReviewer";
import type { ReviewerResult } from "./runStreamingChild";

type SynthesisSpec = {
	harness: ReviewerHarness;
	reviewDir: string;
	stdin: string;
	outputPath: string;
	multi: MultiSpinner | undefined;
};

export function runSynthesisReviewer(
	spec: SynthesisSpec,
): Promise<ReviewerResult> {
	const name = "synthesis";
	if (spec.harness === "claude")
		return runClaudeReviewer({
			name,
			reviewDir: spec.reviewDir,
			stdin: spec.stdin,
			outputPath: spec.outputPath,
			spinner: spec.multi?.create("synthesis — starting"),
		});
	const override = buildCodexModelArgs();
	return runCodexReviewer({
		name,
		stdin: spec.stdin,
		outputPath: spec.outputPath,
		override,
		spinner: spec.multi?.create(
			`${reviewerLabel("synthesis", override.model ?? "codex")} — starting`,
		),
	});
}
