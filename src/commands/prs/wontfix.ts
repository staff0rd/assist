import { execSync } from "node:child_process";
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

function validateShaReferences(reason: string): void {
	// Match SHAs in markdown commit links: [7-char sha](https://github.com/owner/repo/commit/full-sha)
	const commitLinkPattern =
		/\[[0-9a-f]{7}\]\(https:\/\/github\.com\/[^/]+\/[^/]+\/commit\/([0-9a-f]{40})\)/gi;

	const shas = Array.from(reason.matchAll(commitLinkPattern), (m) => m[1]);

	if (shas.length === 0) {
		return;
	}

	const invalidShas: string[] = [];
	for (const sha of shas) {
		try {
			execSync(`git cat-file -t ${sha}`, { stdio: "pipe" });
		} catch {
			invalidShas.push(sha);
		}
	}

	if (invalidShas.length > 0) {
		console.error(
			`Error: The following SHA references do not exist in git: ${invalidShas.join(", ")}`,
		);
		process.exit(1);
	}
}

export function wontfix(commentId: number, reason: string): void {
	validateReason(reason);
	validateShaReferences(reason);

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
