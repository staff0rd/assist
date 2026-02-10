import { execSync } from "node:child_process";
import { unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deleteCommentsCache, loadCommentsCache } from "./loadCommentsCache";
import { getCurrentPrNumber, getRepoInfo } from "./shared";
import type { PrComment } from "./types";

function replyToComment(
	org: string,
	repo: string,
	prNumber: number,
	commentId: number,
	message: string,
): void {
	execSync(
		`gh api repos/${org}/${repo}/pulls/${prNumber}/comments -f body="${message.replace(/"/g, '\\"')}" -F in_reply_to=${commentId}`,
		{ stdio: "inherit" },
	);
}

function resolveThread(threadId: string): void {
	const mutation = `mutation($threadId: ID!) { resolveReviewThread(input: {threadId: $threadId}) { thread { isResolved } } }`;
	const queryFile = join(tmpdir(), `gh-mutation-${Date.now()}.graphql`);
	writeFileSync(queryFile, mutation);

	try {
		execSync(
			`gh api graphql -F query=@${queryFile} -f threadId="${threadId}"`,
			{ stdio: "inherit" },
		);
	} finally {
		unlinkSync(queryFile);
	}
}

function requireCache(prNumber: number) {
	const cache = loadCommentsCache(prNumber);
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
) {
	const comment = findLineComment(cache.comments, commentId);
	if (!comment || comment.type !== "line" || !comment.threadId) {
		console.error(
			`Error: Comment #${commentId} not found or has no thread ID.`,
		);
		process.exit(1);
	}
	return comment as PrComment & { threadId: string };
}

function cleanupCacheIfDone(
	cache: NonNullable<ReturnType<typeof loadCommentsCache>>,
	prNumber: number,
	commentId: number,
): void {
	const hasRemaining = cache.comments.some(
		(c) => c.type === "line" && c.id !== commentId,
	);
	if (!hasRemaining) deleteCommentsCache(prNumber);
}

export function resolveCommentWithReply(
	commentId: number,
	message: string,
): void {
	const prNumber = getCurrentPrNumber();
	const { org, repo } = getRepoInfo();
	const cache = requireCache(prNumber);
	const comment = requireLineComment(cache, commentId);

	replyToComment(org, repo, prNumber, commentId, message);
	console.log("Reply posted successfully.");

	resolveThread(comment.threadId);
	console.log("Thread resolved successfully.");

	cleanupCacheIfDone(cache, prNumber, commentId);
}
