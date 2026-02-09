import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "yaml";
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

type CacheData = {
	prNumber: number;
	fetchedAt: string;
	comments: PrComment[];
};

function getCachePath(prNumber: number): string {
	return join(process.cwd(), ".assist", `pr-${prNumber}-comments.yaml`);
}

function loadCommentsCache(prNumber: number): CacheData | null {
	const cachePath = getCachePath(prNumber);
	if (!existsSync(cachePath)) {
		return null;
	}
	const content = readFileSync(cachePath, "utf-8");
	return parse(content) as CacheData;
}

export function deleteCommentsCache(prNumber: number): void {
	const cachePath = getCachePath(prNumber);
	if (existsSync(cachePath)) {
		unlinkSync(cachePath);
		console.log("No more unresolved line comments. Cache dropped.");
	}
}

export function resolveCommentWithReply(
	commentId: number,
	message: string,
): void {
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
		console.error(`Error: Comment #${commentId} has no associated thread ID.`);
		process.exit(1);
	}

	replyToComment(org, repo, prNumber, commentId, message);
	console.log("Reply posted successfully.");

	resolveThread(comment.threadId);
	console.log("Thread resolved successfully.");

	const remainingLineComments = cache.comments.filter(
		(c) => c.type === "line" && c.id !== commentId,
	);
	if (remainingLineComments.length === 0) {
		deleteCommentsCache(prNumber);
	}
}
