import { isoWeekRange } from "./isoWeek";
import { loadBlogSkipWeeks } from "./loadBlogSkipWeeks";
import { loadDevWeeks } from "./loadDevWeeks";
import { displayNextEntry, logNoCommits } from "./next/displayNextEntry";
import { fetchCommitsAfter } from "./next/fetchCommitsAfter";
import { findTargetWeek, groupCommitsByWeek } from "./next/findTargetWeek";
import { getRepoName, loadConfig } from "./shared";
import { localToday } from "./localToday";

type NextOptions = {
	ignore?: string[];
	verbose?: boolean;
};

export function next(options: NextOptions): void {
	const config = loadConfig();
	const repoName = getRepoName();
	const ignore = options.ignore ?? config.devlog?.ignore ?? [];
	const lastWeek = loadDevWeeks(repoName).at(-1) ?? null;
	const afterDate = lastWeek ? isoWeekRange(lastWeek).end : null;
	const byWeek = groupCommitsByWeek(fetchCommitsAfter(ignore, afterDate));
	const week = findTargetWeek(byWeek.keys(), {
		lastWeek,
		skip: loadBlogSkipWeeks(repoName),
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
