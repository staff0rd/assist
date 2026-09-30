import { buildRequest } from "./buildRequest";
import { buildReviewPaths, type ReviewPaths } from "./buildReviewPaths";
import { fetchExistingComments } from "./fetchExistingComments";
import type { gatherContext } from "./gatherContext";
import { prepareReviewDir } from "./prepareReviewDir";

export function setupReviewDir(
	repoRoot: string,
	context: ReturnType<typeof gatherContext>,
	force: boolean,
): ReviewPaths {
	const paths = buildReviewPaths(
		repoRoot,
		`${context.branch}-${context.shortSha}`,
	);
	const priorComments = fetchExistingComments();
	logPriorComments(priorComments?.length ?? 0);
	prepareReviewDir(paths, buildRequest(context, priorComments), force);
	console.log(`Review folder: ${paths.reviewDir}`);
	return paths;
}

function logPriorComments(count: number): void {
	if (count === 0) return;
	console.log(`Including ${count} prior review comment(s) in request.md.`);
}
