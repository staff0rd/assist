import { execSync } from "node:child_process";
import type { ThreadInfo } from "../fetchThreadIds";
import type { PrComment } from "../types";

function fetchJson(endpoint: string): unknown[] {
	const result = execSync(`gh api --paginate ${endpoint}`, {
		encoding: "utf-8",
	});
	if (!result.trim()) return [];
	return JSON.parse(result);
}

function mapReview(r: {
	id: number;
	user: { login: string };
	state: string;
	body: string;
}): PrComment {
	return {
		type: "review",
		id: r.id,
		user: r.user.login,
		state: r.state,
		body: r.body,
	};
}

export function fetchReviewComments(
	org: string,
	repo: string,
	prNumber: number,
): PrComment[] {
	const reviews = fetchJson(`repos/${org}/${repo}/pulls/${prNumber}/reviews`);
	return (reviews as Parameters<typeof mapReview>[0][])
		.filter((r) => r.body)
		.map(mapReview);
}

function mapLineComment(
	c: {
		id: number;
		user: { login: string };
		path: string;
		line: number;
		body: string;
		diff_hunk: string;
		html_url: string;
	},
	threadInfo: ThreadInfo,
): PrComment {
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
}

export function fetchLineComments(
	org: string,
	repo: string,
	prNumber: number,
	threadInfo: ThreadInfo,
): PrComment[] {
	const comments = fetchJson(`repos/${org}/${repo}/pulls/${prNumber}/comments`);
	return comments.map((c) =>
		mapLineComment(c as Parameters<typeof mapLineComment>[0], threadInfo),
	);
}
