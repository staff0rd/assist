import { isoWeekRange } from "./isoWeek";
import { loadBlogSkipDays } from "./loadBlogSkipDays";
import { loadDevWeeks } from "./loadDevWeeks";
import { displayNextEntry, logNoCommits } from "./next/displayNextEntry";
import { fetchCommitsAfter } from "./next/fetchCommitsAfter";
import { findTargetWeek, groupCommitsByWeek } from "./next/findTargetWeek";
import { getRepoName, loadConfig, loadDevlogEntries } from "./shared";

type NextOptions = {
	ignore?: string[];
	verbose?: boolean;
};

function localToday(): string {
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function lastDailyDevlogDate(repoName: string): string | null {
	return Array.from(loadDevlogEntries(repoName).keys()).sort().at(-1) ?? null;
}

function resolveAfterDate(
	repoName: string,
	lastWeek: string | null,
): string | null {
	if (lastWeek) return isoWeekRange(lastWeek).end;
	return lastDailyDevlogDate(repoName);
}

export function next(options: NextOptions): void {
	const config = loadConfig();
	const repoName = getRepoName();
	const ignore = options.ignore ?? config.devlog?.ignore ?? [];
	const lastWeek = loadDevWeeks(repoName).at(-1) ?? null;
	const afterDate = resolveAfterDate(repoName, lastWeek);
	const byWeek = groupCommitsByWeek(fetchCommitsAfter(ignore, afterDate));
	const week = findTargetWeek(byWeek.keys(), {
		lastWeek,
		skip: loadBlogSkipDays(repoName),
		today: localToday(),
	});
	if (!week) {
		logNoCommits(lastWeek);
		return;
	}
	displayNextEntry(
		{ repoName, ignore, verbose: options.verbose ?? false },
		week,
		byWeek.get(week) ?? [],
	);
}
