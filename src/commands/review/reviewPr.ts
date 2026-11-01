import { basename } from "node:path";
import { writeJobSummary } from "./ci/writeJobSummary";
import { exitFailedCiReview } from "./exitFailedCiReview";
import type { ReviewPrOptions } from "./ReviewPrOptions";
import { runReviewPipeline } from "./runReviewPipeline";
import { attachReviewLog } from "./startReviewLog";
import { setupReviewDir } from "./setupReviewDir";
import { gatherChangedContext } from "./gatherChangedContext";
import { runPostSynthesis } from "./runPostSynthesis";

export async function reviewPr(
	repoRoot: string,
	options: ReviewPrOptions,
): Promise<void> {
	const context = gatherChangedContext();
	const paths = setupReviewDir(repoRoot, context, options.force ?? false);
	attachReviewLog(paths.reviewDir);
	const outcome = await runReviewPipeline(paths, {
		verbose: options.verbose ?? false,
		models: options.ci?.models,
		strict: options.ci !== undefined,
		job: options.ci
			? undefined
			: { repo: basename(repoRoot), prNumber: context.prNumber },
	});
	const synthesisOk = outcome.ok;
	if (!synthesisOk && options.ci)
		exitFailedCiReview(outcome.failures, options.ci);
	if (synthesisOk && options.ci)
		writeJobSummary(
			paths.synthesisPath,
			context,
			options.ci.summaryPath,
			outcome.slots,
		);
	if (synthesisOk)
		await runPostSynthesis(paths.synthesisPath, context, options);
	console.log(`Done. Review folder: ${paths.reviewDir}`);
}
