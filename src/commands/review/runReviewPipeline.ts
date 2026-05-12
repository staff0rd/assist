import { existsSync, unlinkSync } from "node:fs";
import { buildReviewerStdin } from "./buildReviewerStdin";
import type { ReviewPaths } from "./buildReviewPaths";
import { MultiSpinner, type SpinnerHandle } from "./MultiSpinner";
import { runReviewers } from "./runReviewers";
import { synthesise } from "./synthesise";
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
	const ui = createUi(useSpinnerUi(options.verbose));
	try {
		const { results, anyFresh } = await runReviewers(
			paths.reviewDir,
			paths.claudePath,
			paths.codexPath,
			buildReviewerStdin(paths.requestPath),
			{ multi: ui.multi },
		);
		if (results.every((r) => r.exitCode !== 0)) {
			console.error(
				"Both reviewers failed; skipping synthesis. See review folder for stderr details.",
			);
			finishUi(ui, false);
			return false;
		}
		if (anyFresh && existsSync(paths.synthesisPath)) {
			unlinkSync(paths.synthesisPath);
		}
		const synthesisResult = await synthesise(paths, { multi: ui.multi });
		const ok = synthesisResult.exitCode === 0;
		finishUi(ui, ok);
		return ok;
	} catch (err) {
		ui.multi?.failRemaining();
		throw err;
	}
}
