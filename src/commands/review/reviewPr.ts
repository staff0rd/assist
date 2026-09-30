import { gatherContext } from "./gatherContext";
import { handlePostSynthesis } from "./handlePostSynthesis";
import type { PrDiffRef } from "./postReviewToPr";
import type { ReviewerModels } from "./ReviewerModels";
import { runReviewPipeline } from "./runReviewPipeline";
import { attachReviewLog } from "./startReviewLog";
import { setupReviewDir } from "./setupReviewDir";

type ReviewPrOptions = {
	prompt?: boolean;
	submit?: boolean;
	force?: boolean;
	refine?: boolean;
	apply?: boolean;
	backlog?: boolean;
	verbose?: boolean;
	addressComments?: boolean;
	announce?: boolean;
	ci?: { models: ReviewerModels };
};

function gatherChangedContext(): ReturnType<typeof gatherContext> {
	const context = gatherContext();
	if (context.changedFiles.length > 0) return context;
	console.error(
		`Error: PR #${context.prNumber} has no changed files — nothing to review.`,
	);
	process.exit(1);
}

function runPostSynthesis(
	synthesisPath: string,
	prInfo: PrDiffRef,
	options: ReviewPrOptions,
): Promise<void> {
	return handlePostSynthesis(synthesisPath, prInfo, {
		refine: options.refine ?? false,
		apply: options.apply ?? false,
		backlog: options.backlog ?? false,
		prompt: options.prompt ?? true,
		submit: options.submit ?? false,
		addressComments: options.addressComments ?? false,
		announce: options.announce ?? false,
	});
}

export async function reviewPr(
	repoRoot: string,
	options: ReviewPrOptions,
): Promise<void> {
	const context = gatherChangedContext();
	const paths = setupReviewDir(repoRoot, context, options.force ?? false);
	attachReviewLog(paths.reviewDir);
	const synthesisOk = await runReviewPipeline(paths, {
		verbose: options.verbose ?? false,
		models: options.ci?.models,
		strict: options.ci !== undefined,
	});
	if (!synthesisOk && options.ci) {
		console.error("Review failed; nothing was posted.");
		process.exit(1);
	}
	if (synthesisOk)
		await runPostSynthesis(paths.synthesisPath, context, options);
	console.log(`Done. Review folder: ${paths.reviewDir}`);
}
