import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { stringify } from "yaml";
import { isClaudeCode } from "../../lib/isClaudeCode";
import { fetchThreadIds, type ThreadInfo } from "./fetchThreadIds.js";
import {
	deleteCommentsCache,
	getCurrentPrNumber,
	getRepoInfo,
	isGhNotInstalled,
	isNotFound,
} from "./shared";
import type { PrComment } from "./types";

function formatForHuman(comment: PrComment): string {
	if (comment.type === "review") {
		const stateColor =
			comment.state === "APPROVED"
				? chalk.green
				: comment.state === "CHANGES_REQUESTED"
					? chalk.red
					: chalk.yellow;
		return [
			`${chalk.cyan("Review")} by ${chalk.bold(comment.user)} ${stateColor(`[${comment.state}]`)}`,
			comment.body,
			"",
		].join("\n");
	}
	const location = comment.line ? `:${comment.line}` : "";
	return [
		`${chalk.cyan("Line comment")} by ${chalk.bold(comment.user)} on ${chalk.dim(`${comment.path}${location}`)}`,
		chalk.dim(comment.diff_hunk.split("\n").slice(-3).join("\n")),
		comment.body,
		"",
	].join("\n");
}

export function printComments(comments: PrComment[]): void {
	if (comments.length === 0) {
		console.log("No comments found.");
		return;
	}
	if (isClaudeCode()) {
		for (const comment of comments) {
			console.log(JSON.stringify(comment));
		}
	} else {
		for (const comment of comments) {
			console.log(formatForHuman(comment));
		}
	}
	const lineComments = comments.filter((c) => c.type === "line");
	if (lineComments.length === 0) {
		console.log("No line comments to process.");
	}
}

function writeCommentsCache(prNumber: number, comments: PrComment[]): void {
	const assistDir = join(process.cwd(), ".assist");
	if (!existsSync(assistDir)) {
		mkdirSync(assistDir, { recursive: true });
	}

	const cacheData = {
		prNumber,
		fetchedAt: new Date().toISOString(),
		comments,
	};

	const cachePath = join(assistDir, `pr-${prNumber}-comments.yaml`);
	writeFileSync(cachePath, stringify(cacheData));
}

function fetchReviewComments(
	org: string,
	repo: string,
	prNumber: number,
): PrComment[] {
	const result = execSync(
		`gh api repos/${org}/${repo}/pulls/${prNumber}/reviews`,
		{ encoding: "utf-8" },
	);
	if (!result.trim()) return [];
	const reviews = JSON.parse(result);
	return reviews
		.filter((r: { body: string }) => r.body)
		.map(
			(r: {
				id: number;
				user: { login: string };
				state: string;
				body: string;
			}): PrComment => ({
				type: "review",
				id: r.id,
				user: r.user.login,
				state: r.state,
				body: r.body,
			}),
		);
}

function fetchLineComments(
	org: string,
	repo: string,
	prNumber: number,
	threadInfo: ThreadInfo,
): PrComment[] {
	const result = execSync(
		`gh api repos/${org}/${repo}/pulls/${prNumber}/comments`,
		{ encoding: "utf-8" },
	);
	if (!result.trim()) return [];
	const comments = JSON.parse(result);
	return comments.map(
		(c: {
			id: number;
			user: { login: string };
			path: string;
			line: number;
			body: string;
			diff_hunk: string;
			html_url: string;
		}): PrComment => {
			const threadId = threadInfo.threadMap.get(c.id) ?? "";
			return {
				type: "line",
				id: c.id,
				threadId,
				user: c.user.login,
				path: c.path,
				line: c.line,
				body: c.body,
				diff_hunk: c.diff_hunk,
				html_url: c.html_url,
				resolved: threadInfo.resolvedThreadIds.has(threadId),
			};
		},
	);
}

export async function listComments(): Promise<PrComment[]> {
	try {
		const prNumber = getCurrentPrNumber();
		const { org, repo } = getRepoInfo();
		const threadInfo = fetchThreadIds(org, repo, prNumber);
		const allComments = [
			...fetchReviewComments(org, repo, prNumber),
			...fetchLineComments(org, repo, prNumber, threadInfo),
		];

		if (allComments.some((c) => c.type === "line")) {
			writeCommentsCache(prNumber, allComments);
		} else {
			deleteCommentsCache(prNumber);
		}

		return allComments;
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			return [];
		}
		if (isNotFound(error)) {
			console.error("Error: Pull request not found.");
			return [];
		}
		throw error;
	}
}
