import { findRepoRoot } from "../../shared/findRepoRoot";
import { buildRequest, gatherContext } from "./buildRequest";
import { buildReviewPaths } from "./buildReviewPaths";
import { postReviewToPr } from "./postReviewToPr";
import { prepareReviewDir } from "./prepareReviewDir";
import { runReviewPipeline } from "./runReviewPipeline";

export type ReviewOptions = {
	prompt?: boolean;
	submit?: boolean;
	force?: boolean;
};

function resolveRepoRoot(): string {
	const repoRoot = findRepoRoot(process.cwd());
	if (repoRoot) return repoRoot;
	console.error("Error: not inside a git repository.");
	process.exit(1);
}

export async function review(options: ReviewOptions = {}): Promise<void> {
	const repoRoot = resolveRepoRoot();
	const context = gatherContext();
	if (context.changedFiles.length === 0) {
		console.error(
			`Error: no changes between ${context.baseBranch} and HEAD — nothing to review.`,
		);
		process.exit(1);
	}
	const paths = buildReviewPaths(repoRoot, context.branch, context.shortSha);
	prepareReviewDir(paths, buildRequest(context), options.force ?? false);
	console.log(`Review folder: ${paths.reviewDir}`);
	const synthesisOk = await runReviewPipeline(paths);
	if (synthesisOk) {
		await postReviewToPr(paths.synthesisPath, {
			prompt: options.prompt ?? true,
			submit: options.submit ?? false,
		});
	}
	console.log(`Done. Review folder: ${paths.reviewDir}`);
}
