import { execSync } from "node:child_process";
import type { ThreadInfo } from "./fetchThreadIds";
import type { PrComment } from "./types";

export function fetchReviewComments(
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

export function fetchLineComments(
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
