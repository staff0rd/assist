import { buildShaRequest } from "./buildRequest";
import { buildReviewPaths, type ReviewPaths } from "./buildReviewPaths";
import { gatherShaContext, type ShaContext } from "./gatherShaContext";
import { prepareReviewDir } from "./prepareReviewDir";
import { runReviewPipeline } from "./runReviewPipeline";

type ReviewShaOptions = {
	sha: string;
	force?: boolean;
	verbose?: boolean;
};

function gatherShaChangedContext(ref: string): ShaContext {
	const context = gatherShaContext(ref);
	if (context.changedFiles.length > 0) return context;
	console.error(
		`Error: commit ${context.sha} has no changed files — nothing to review.`,
	);
	process.exit(1);
}

function setupShaReviewDir(
	repoRoot: string,
	context: ShaContext,
	force: boolean,
): ReviewPaths {
	const paths = buildReviewPaths(repoRoot, context.shortSha);
	prepareReviewDir(paths, buildShaRequest(context), force);
	console.log(`Review folder: ${paths.reviewDir}`);
	return paths;
}

export async function reviewSha(
	repoRoot: string,
	options: ReviewShaOptions,
): Promise<void> {
	const context = gatherShaChangedContext(options.sha);
	const paths = setupShaReviewDir(repoRoot, context, options.force ?? false);
	await runReviewPipeline(paths, { verbose: options.verbose ?? false });
	console.log(`Done. Review folder: ${paths.reviewDir}`);
}
