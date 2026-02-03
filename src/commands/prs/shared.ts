import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "yaml";
import type { PrComment } from "./types";

export function isGhNotInstalled(error: unknown): boolean {
	if (error instanceof Error) {
		const msg = error.message.toLowerCase();
		return msg.includes("enoent") || msg.includes("command not found");
	}
	return false;
}

export function isNotFound(error: unknown): boolean {
	if (error instanceof Error) {
		return error.message.includes("HTTP 404");
	}
	return false;
}

export function getRepoInfo(): { org: string; repo: string } {
	const repoInfo = JSON.parse(
		execSync("gh repo view --json owner,name", { encoding: "utf-8" }),
	);
	return { org: repoInfo.owner.login, repo: repoInfo.name };
}

export function getCurrentPrNumber(): number {
	try {
		const prInfo = JSON.parse(
			execSync("gh pr view --json number", { encoding: "utf-8" }),
		);
		return prInfo.number;
	} catch (error) {
		if (error instanceof Error && error.message.includes("no pull requests")) {
			console.error("Error: No pull request found for the current branch.");
			process.exit(1);
		}
		throw error;
	}
}

export function replyToComment(
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

export function resolveThread(threadId: string): void {
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

export function loadCommentsCache(prNumber: number): CacheData | null {
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
