import { basename } from "node:path";
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
		job: { repo: basename(repoRoot), prNumber: context.prNumber },
	});
	if (outcome.ok) await runPostSynthesis(paths.synthesisPath, context, options);
	console.log(`Done. Review folder: ${paths.reviewDir}`);
}
