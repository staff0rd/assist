import { gatherContext } from "./gatherContext";

export function gatherChangedContext(): ReturnType<typeof gatherContext> {
	const context = gatherContext();
	if (context.changedFiles.length > 0) return context;
	console.error(
		`Error: PR #${context.prNumber} has no changed files — nothing to review.`,
	);
	process.exit(1);
}
