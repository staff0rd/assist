import { findRepoRoot } from "../../shared/findRepoRoot";
import { buildRequest, gatherContext } from "./buildRequest";
import { buildReviewPaths } from "./buildReviewPaths";
import { fetchExistingComments } from "./fetchExistingComments";
import { handlePostSynthesis } from "./handlePostSynthesis";
import { prepareReviewDir } from "./prepareReviewDir";
import { runApplySession } from "./runApplySession";
import { runReviewPipeline } from "./runReviewPipeline";

export type ReviewOptions = {
	prompt?: boolean;
	submit?: boolean;
	force?: boolean;
	refine?: boolean;
	apply?: boolean;
	verbose?: boolean;
};

function resolveRepoRoot(): string {
	const repoRoot = findRepoRoot(process.cwd());
	if (repoRoot) return repoRoot;
	console.error("Error: not inside a git repository.");
	process.exit(1);
}

function validateOptions(options: ReviewOptions): void {
	if (options.apply && options.refine) {
		console.error("Error: --apply cannot be combined with --refine.");
		process.exit(1);
	}
}

function logPriorComments(count: number): void {
	if (count === 0) return;
	console.log(`Including ${count} prior review comment(s) in request.md.`);
}

function gatherChangedContext(): ReturnType<typeof gatherContext> {
	const context = gatherContext();
	if (context.changedFiles.length > 0) return context;
	console.error(
		`Error: PR #${context.prNumber} has no changed files — nothing to review.`,
	);
	process.exit(1);
}

function setupReviewDir(
	repoRoot: string,
	context: ReturnType<typeof gatherContext>,
	force: boolean,
): ReturnType<typeof buildReviewPaths> {
	const paths = buildReviewPaths(repoRoot, context.branch, context.shortSha);
	const priorComments = fetchExistingComments();
	logPriorComments(priorComments?.length ?? 0);
	prepareReviewDir(paths, buildRequest(context, priorComments), force);
	console.log(`Review folder: ${paths.reviewDir}`);
	return paths;
}

async function runPostSynthesis(
	synthesisPath: string,
	options: ReviewOptions,
): Promise<void> {
	if (options.apply) {
		await runApplySession(synthesisPath);
		return;
	}
	await handlePostSynthesis(synthesisPath, {
		refine: options.refine ?? false,
		prompt: options.prompt ?? true,
		submit: options.submit ?? false,
	});
}

export async function review(options: ReviewOptions = {}): Promise<void> {
	validateOptions(options);
	const repoRoot = resolveRepoRoot();
	const context = gatherChangedContext();
	const paths = setupReviewDir(repoRoot, context, options.force ?? false);
	const synthesisOk = await runReviewPipeline(paths, {
		verbose: options.verbose ?? false,
	});
	if (synthesisOk) await runPostSynthesis(paths.synthesisPath, options);
	console.log(`Done. Review folder: ${paths.reviewDir}`);
}
