import { deleteCommentsCache, loadCommentsCache } from "./loadCommentsCache";
import type { ThreadTarget } from "./threadTarget";
import type { LineComment, PrComment } from "./types";

function requireCache(org: string, repo: string, prNumber: number) {
	const cache = loadCommentsCache(org, repo, prNumber);
	if (!cache) {
		console.error(
			`Error: No cached comments found for PR #${prNumber}. Run "assist prs list-comments" first.`,
		);
		process.exit(1);
	}
	return cache;
}

function findLineComment(
	comments: PrComment[],
	commentId: number,
): PrComment | undefined {
	return comments.find((c) => c.type === "line" && c.id === commentId);
}

function requireLineComment(
	cache: NonNullable<ReturnType<typeof loadCommentsCache>>,
	commentId: number,
): LineComment {
	const comment = findLineComment(cache.comments, commentId);
	if (!comment || comment.type !== "line" || !comment.threadId) {
		console.error(
			`Error: Comment #${commentId} not found or has no thread ID.`,
		);
		process.exit(1);
	}
	return comment;
}

function cleanupCacheIfDone(
	cache: NonNullable<ReturnType<typeof loadCommentsCache>>,
	{ org, repo, prNumber }: ThreadTarget,
	commentId: number,
): void {
	const hasRemaining = cache.comments.some(
		(c) => c.type === "line" && c.id !== commentId,
	);
	if (!hasRemaining) deleteCommentsCache(org, repo, prNumber);
}

export function resolveCommentWithReply(
	target: ThreadTarget,
	commentId: number,
	message: string,
): void {
	const cache = requireCache(target.org, target.repo, target.prNumber);
	const comment = requireLineComment(cache, commentId);

	target.reply(comment, message);
	console.log("Reply posted successfully.");

	target.resolve(comment);
	console.log("Thread resolved successfully.");

	cleanupCacheIfDone(cache, target, commentId);
}
