import { execSync } from "node:child_process";
import { loadAllDevlogLatestDates } from "../loadDevlogEntries";
import { printReposTable } from "./printReposTable";
import type { RepoRow } from "./types";

type ReposOptions = {
	days?: number;
	all?: boolean;
};

type GitHubRepo = {
	name: string;
	pushedAt: string;
	isArchived: boolean;
};

const statusOrder = { missing: 0, outdated: 1, ok: 2 };

function getStatus(
	lastPush: string,
	lastDevlog: string | null,
): RepoRow["status"] {
	if (!lastDevlog) return "missing";
	return lastDevlog < lastPush ? "outdated" : "ok";
}

function fetchRepos(days: number, all: boolean): GitHubRepo[] {
	const json = execSync(
		"gh repo list staff0rd --json name,pushedAt,isArchived --limit 200",
		{ encoding: "utf-8" },
	);
	const allRepos: GitHubRepo[] = JSON.parse(json);

	const cutoff = new Date();
	cutoff.setDate(cutoff.getDate() - days);
	const cutoffStr = cutoff.toISOString().slice(0, 10);

	return allRepos.filter((r) => {
		if (r.isArchived) return false;
		if (all) return true;
		return r.pushedAt.slice(0, 10) >= cutoffStr;
	});
}

function toRow(repo: GitHubRepo, devlogDates: Map<string, string>): RepoRow {
	const lastPush = repo.pushedAt.slice(0, 10);
	const lastDevlog = devlogDates.get(repo.name) ?? null;
	return {
		name: repo.name,
		lastPush,
		lastDevlog,
		status: getStatus(lastPush, lastDevlog),
	};
}

function sortRows(rows: RepoRow[]): RepoRow[] {
	return rows.sort((a, b) => {
		const s = statusOrder[a.status] - statusOrder[b.status];
		if (s !== 0) return s;
		return b.lastPush.localeCompare(a.lastPush);
	});
}

export function repos(options: ReposOptions): void {
	const ghRepos = fetchRepos(options.days ?? 30, options.all ?? false);

	if (ghRepos.length === 0) {
		console.log("No repos with recent activity found.");
		return;
	}

	const devlogDates = loadAllDevlogLatestDates();
	const rows = ghRepos.map((repo) => toRow(repo, devlogDates));
	printReposTable(sortRows(rows));
}
