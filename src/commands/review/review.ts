import { findRepoRoot } from "../../shared/findRepoRoot";
import { buildRequest, gatherContext } from "./buildRequest";
import { buildReviewPaths } from "./buildReviewPaths";
import { fetchExistingComments } from "./fetchExistingComments";
import { handlePostSynthesis } from "./handlePostSynthesis";
import { prepareReviewDir } from "./prepareReviewDir";
import { runReviewPipeline } from "./runReviewPipeline";

export type ReviewOptions = {
	prompt?: boolean;
	submit?: boolean;
	force?: boolean;
	refine?: boolean;
	verbose?: boolean;
};

function resolveRepoRoot(): string {
	const repoRoot = findRepoRoot(process.cwd());
	if (repoRoot) return repoRoot;
	console.error("Error: not inside a git repository.");
	process.exit(1);
}

function logPriorComments(count: number): void {
	if (count === 0) return;
	console.log(`Including ${count} prior review comment(s) in request.md.`);
}

export async function review(options: ReviewOptions = {}): Promise<void> {
	const repoRoot = resolveRepoRoot();
	const context = gatherContext();
	if (context.changedFiles.length === 0) {
		console.error(
			`Error: PR #${context.prNumber} has no changed files — nothing to review.`,
		);
		process.exit(1);
	}
	const paths = buildReviewPaths(repoRoot, context.branch, context.shortSha);
	const priorComments = fetchExistingComments();
	logPriorComments(priorComments?.length ?? 0);
	prepareReviewDir(
		paths,
		buildRequest(context, priorComments),
		options.force ?? false,
	);
	console.log(`Review folder: ${paths.reviewDir}`);
	const synthesisOk = await runReviewPipeline(paths, {
		verbose: options.verbose ?? false,
	});
	if (synthesisOk) {
		await handlePostSynthesis(paths.synthesisPath, {
			refine: options.refine ?? false,
			prompt: options.prompt ?? true,
			submit: options.submit ?? false,
		});
	}
	console.log(`Done. Review folder: ${paths.reviewDir}`);
}
