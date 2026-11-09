import type { ReviewPaths } from "./buildReviewPaths";
import { MultiSpinner, type SpinnerHandle } from "./MultiSpinner";
import { planReviewers } from "./planReviewers";
import { reviewerSlots } from "./reviewerSlots";
import type { ReviewJobTarget } from "./recordReviewerRuns";
import {
	type AndSynthesiseOutcome,
	runAndSynthesise,
} from "./runAndSynthesise";
import { useSpinnerUi } from "./useSpinnerUi";
import { reportFailures } from "./reportFailures";

type PipelineOptions = {
	verbose: boolean;
	job?: ReviewJobTarget;
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

export async function runReviewPipeline(
	paths: ReviewPaths,
	options: PipelineOptions,
): Promise<AndSynthesiseOutcome> {
	const reviewers = await planReviewers(reviewerSlots(paths));
	const ui = createUi(useSpinnerUi(options.verbose));
	try {
		const outcome = await runAndSynthesise({
			paths,
			reviewers,
			multi: ui.multi,
			job: options.job,
		});
		finishUi(ui, outcome.ok);
		reportFailures(outcome.failures, ui.multi !== undefined);
		return outcome;
	} catch (error) {
		ui.multi?.failRemaining();
		throw error;
	}
}
