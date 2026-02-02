import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "yaml";
import { getCurrentPrNumber, isGhNotInstalled } from "./shared";
import type { PrComment } from "./types";

type CacheData = {
	prNumber: number;
	fetchedAt: string;
	comments: PrComment[];
};

function loadCommentsCache(prNumber: number): CacheData | null {
	const cachePath = join(
		process.cwd(),
		".assist",
		`pr-${prNumber}-comments.yaml`,
	);
	if (!existsSync(cachePath)) {
		return null;
	}
	const content = readFileSync(cachePath, "utf-8");
	return parse(content) as CacheData;
}

export function resolve(commentId: number): void {
	const prNumber = getCurrentPrNumber();
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

	const mutation = `mutation($threadId: ID!) { resolveReviewThread(input: {threadId: $threadId}) { thread { isResolved } } }`;

	const queryFile = join(tmpdir(), `gh-mutation-${Date.now()}.graphql`);
	writeFileSync(queryFile, mutation);

	try {
		execSync(
			`gh api graphql -F query=@${queryFile} -f threadId="${comment.threadId}"`,
			{ stdio: "inherit" },
		);
		console.log("Thread resolved successfully.");
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		throw error;
	} finally {
		unlinkSync(queryFile);
	}
}
