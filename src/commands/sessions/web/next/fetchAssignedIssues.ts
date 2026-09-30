import { ghJson } from "../releases/ghJson";
import { isOwnerEntry } from "./isOwnerEntry";
import type { NextIssue } from "./types";

type GhIssue = {
	number: number;
	title: string;
	url: string;
	createdAt: string;
	author?: { login?: string } | null;
	labels?: { name?: string }[] | null;
	repository?: { nameWithOwner?: string } | null;
};

const FIELDS = "number,title,url,createdAt,author,labels";

function listArgs(entry: string): string[] {
	if (isOwnerEntry(entry))
		return [
			"search",
			"issues",
			"--owner",
			entry,
			"--archived=false",
			"--json",
			`${FIELDS},repository`,
		];
	return ["issue", "list", "--repo", entry, "--json", FIELDS];
}

export async function fetchAssignedIssues(
	cwd: string,
	entry: string,
): Promise<NextIssue[]> {
	const issues = await ghJson<GhIssue[]>(cwd, [
		...listArgs(entry),
		"--assignee",
		"@me",
		"--state",
		"open",
		"--limit",
		"100",
	]);
	return issues.map((issue) => ({
		repo: issue.repository?.nameWithOwner ?? entry,
		number: issue.number,
		title: issue.title,
		url: issue.url,
		createdAt: issue.createdAt,
		author: issue.author?.login ?? "unknown",
		labels: (issue.labels ?? []).flatMap((label) =>
			label.name ? [label.name] : [],
		),
	}));
}
