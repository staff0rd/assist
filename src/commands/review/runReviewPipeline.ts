import type { ReviewPaths } from "./buildReviewPaths";
import { cachedReviewerResult } from "./cachedReviewerResult";
import { MultiSpinner, type SpinnerHandle } from "./MultiSpinner";
import { planCodexReviewer } from "./planCodexReviewer";
import { runAndSynthesise } from "./runAndSynthesise";
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

export async function runReviewPipeline(
	paths: ReviewPaths,
	options: PipelineOptions,
): Promise<boolean> {
	const cachedClaude = cachedReviewerResult("claude", paths.claudePath);
	const codexPlan = await planCodexReviewer(paths.codexPath);
	const ui = createUi(useSpinnerUi(options.verbose));
	try {
		const ok = await runAndSynthesise({
			paths,
			cachedClaude,
			codexPlan,
			multi: ui.multi,
		});
		finishUi(ui, ok);
		return ok;
	} catch (err) {
		ui.multi?.failRemaining();
		throw err;
	}
}
