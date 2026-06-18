import type { ReviewPaths } from "./buildReviewPaths";
import { cachedReviewerResult } from "./cachedReviewerResult";
import { MultiSpinner, type SpinnerHandle } from "./MultiSpinner";
import { planCodexReviewer } from "./planCodexReviewer";
import { printReviewerFailures } from "./printReviewerFailures";
import { runAndSynthesise } from "./runAndSynthesise";
import type { ReviewerResult } from "./runStreamingChild";
import { useSpinnerUi } from "./useSpinnerUi";

type PipelineOptions = {
	verbose: boolean;
};

type PipelineUi = {
	multi: MultiSpinner | undefined;
	elapsed: SpinnerHandle | undefined;
	startedAt: number;
};

function createUi(spinnerUi: boolean): PipelineUi {
	const startedAt = Date.now();
	if (!spinnerUi) return { multi: undefined, elapsed: undefined, startedAt };
	const multi = new MultiSpinner();
	return { multi, elapsed: multi.addElapsed("total"), startedAt };
}

function finishUi(ui: PipelineUi, ok: boolean): void {
	if (!ui.elapsed) return;
	const seconds = Math.round((Date.now() - ui.startedAt) / 1000);
	const label = `total: ${seconds}s`;
	if (ok) ui.elapsed.succeed(label);
	else ui.elapsed.fail(label);
}

function reportFailures(
	failures: ReviewerResult[],
	usingSpinner: boolean,
): void {
	if (failures.length === 0) return;
	// In spinner mode failure detail is deferred so it survives the
	// in-place rendering; in non-spinner mode logChildClose has already
	// printed it inline as each reviewer exits.
	if (!usingSpinner) return;
	printReviewerFailures(failures);
}

export async function runReviewPipeline(
	paths: ReviewPaths,
	options: PipelineOptions,
): Promise<boolean> {
	const cachedClaude = cachedReviewerResult("claude", paths.claudePath);
	const codexPlan = await planCodexReviewer(paths.codexPath);
	const ui = createUi(useSpinnerUi(options.verbose));
	try {
		const outcome = await runAndSynthesise({
			paths,
			cachedClaude,
			codexPlan,
			multi: ui.multi,
		});
		finishUi(ui, outcome.ok);
		reportFailures(outcome.failures, ui.multi !== undefined);
		return outcome.ok;
	} catch (error) {
		ui.multi?.failRemaining();
		throw error;
	}
}
