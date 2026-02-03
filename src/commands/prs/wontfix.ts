import {
	deleteCommentsCache,
	getCurrentPrNumber,
	getRepoInfo,
	isGhNotInstalled,
	loadCommentsCache,
	replyToComment,
	resolveThread,
} from "./shared";

function validateReason(reason: string): void {
	const lowerReason = reason.toLowerCase();
	if (lowerReason.includes("claude") || lowerReason.includes("opus")) {
		console.error('Error: Reason must not contain "claude" or "opus"');
		process.exit(1);
	}
}

export function wontfix(commentId: number, reason: string): void {
	validateReason(reason);

	try {
		const prNumber = getCurrentPrNumber();
		const { org, repo } = getRepoInfo();

		const cache = loadCommentsCache(prNumber);
		if (!cache) {
			console.error(
				`Error: No cached comments found for PR #${prNumber}. Run "assist prs list-comments" first.`,
			);
			process.exit(1);
		}

		const comment = cache.comments.find(
			(c) => c.type === "line" && c.id === commentId,
		);
		if (!comment || comment.type !== "line") {
			console.error(`Error: Comment #${commentId} not found in cached data.`);
			process.exit(1);
		}

		if (!comment.threadId) {
			console.error(
				`Error: Comment #${commentId} has no associated thread ID.`,
			);
			process.exit(1);
		}

		replyToComment(org, repo, prNumber, commentId, reason);
		console.log("Reply posted successfully.");

		resolveThread(comment.threadId);
		console.log("Thread resolved successfully.");

		const remainingLineComments = cache.comments.filter(
			(c) => c.type === "line" && c.id !== commentId,
		);
		if (remainingLineComments.length === 0) {
			deleteCommentsCache(prNumber);
		}
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		throw error;
	}
}
