import { execSync } from "node:child_process";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import chalk from "chalk";
import { stringify } from "yaml";
import { isClaudeCode } from "../../lib/isClaudeCode";
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

type ThreadNode = {
	id: string;
	isResolved: boolean;
	comments: {
		nodes: Array<{ databaseId: number }>;
	};
};

type GraphQLResponse = {
	data: {
		repository: {
			pullRequest: {
				reviewThreads: {
					nodes: ThreadNode[];
				};
			};
		};
	};
};

type ThreadInfo = {
	threadMap: Map<number, string>;
	resolvedThreadIds: Set<string>;
};

function fetchThreadIds(
	org: string,
	repo: string,
	prNumber: number,
): ThreadInfo {
	const query = `query($owner: String!, $repo: String!, $prNumber: Int!) { repository(owner: $owner, name: $repo) { pullRequest(number: $prNumber) { reviewThreads(first: 100) { nodes { id isResolved comments(first: 100) { nodes { databaseId } } } } } } }`;

	const queryFile = join(tmpdir(), `gh-query-${Date.now()}.graphql`);
	writeFileSync(queryFile, query);

	try {
		const result = execSync(
			`gh api graphql -F query=@${queryFile} -F owner="${org}" -F repo="${repo}" -F prNumber=${prNumber}`,
			{ encoding: "utf-8" },
		);

		const response: GraphQLResponse = JSON.parse(result);
		const threadMap = new Map<number, string>();
		const resolvedThreadIds = new Set<string>();

		for (const thread of response.data.repository.pullRequest.reviewThreads
			.nodes) {
			if (thread.isResolved) {
				resolvedThreadIds.add(thread.id);
			}
			for (const comment of thread.comments.nodes) {
				threadMap.set(comment.databaseId, thread.id);
			}
		}

		return { threadMap, resolvedThreadIds };
	} finally {
		unlinkSync(queryFile);
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

export async function listComments(): Promise<PrComment[]> {
	try {
		const prNumber = getCurrentPrNumber();
		const { org, repo } = getRepoInfo();
		const allComments: PrComment[] = [];

		const { threadMap, resolvedThreadIds } = fetchThreadIds(
			org,
			repo,
			prNumber,
		);

		const reviewResult = execSync(
			`gh api repos/${org}/${repo}/pulls/${prNumber}/reviews`,
			{ encoding: "utf-8" },
		);

		if (reviewResult.trim()) {
			const reviews = JSON.parse(reviewResult);
			for (const review of reviews) {
				if (review.body) {
					allComments.push({
						type: "review",
						id: review.id,
						user: review.user.login,
						state: review.state,
						body: review.body,
					});
				}
			}
		}

		const lineResult = execSync(
			`gh api repos/${org}/${repo}/pulls/${prNumber}/comments`,
			{ encoding: "utf-8" },
		);

		if (lineResult.trim()) {
			const lineComments = JSON.parse(lineResult);
			for (const comment of lineComments) {
				const threadId = threadMap.get(comment.id) ?? "";
				if (resolvedThreadIds.has(threadId)) {
					continue;
				}
				allComments.push({
					type: "line",
					id: comment.id,
					threadId,
					user: comment.user.login,
					path: comment.path,
					line: comment.line,
					body: comment.body,
					diff_hunk: comment.diff_hunk,
					html_url: comment.html_url,
				});
			}
		}

		const hasLineComments = allComments.some((c) => c.type === "line");
		if (hasLineComments) {
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
