import { ghJson } from "../releases/ghJson";
import type { NextIssue } from "./types";

type GhIssue = {
	number: number;
	title: string;
	url: string;
	createdAt: string;
	author?: { login?: string } | null;
	labels?: { name?: string }[] | null;
};

export async function fetchAssignedIssues(cwd: string): Promise<NextIssue[]> {
	const issues = await ghJson<GhIssue[]>(cwd, [
		"issue",
		"list",
		"--assignee",
		"@me",
		"--state",
		"open",
		"--limit",
		"100",
		"--json",
		"number,title,url,createdAt,author,labels",
	]);
	return issues
		.map((issue) => ({
			number: issue.number,
			title: issue.title,
			url: issue.url,
			createdAt: issue.createdAt,
			author: issue.author?.login ?? "unknown",
			labels: (issue.labels ?? []).flatMap((label) =>
				label.name ? [label.name] : [],
			),
		}))
		.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
