import { isCompletedWeek } from "./isoWeek";
import { printWeekHeader } from "./list/printWeekHeader";
import { loadBlogSkipWeeks } from "./loadBlogSkipWeeks";
import { loadDevEntry } from "./loadDevEntry";
import { localToday } from "./localToday";
import { fetchCommitsAfter } from "./next/fetchCommitsAfter";
import { groupCommitsByWeek } from "./next/findTargetWeek";
import { getRepoName, loadConfig, printCommitsWithFiles } from "./shared";
import { resolveListAfterDate } from "./list/resolveListAfterDate";

type ListOptions = {
	weeks?: number;
	ignore?: string[];
	reverse?: boolean;
	since?: string;
	verbose?: boolean;
};

export function list(options: ListOptions): void {
	const config = loadConfig();
	const ignore = options.ignore ?? config.devlog?.ignore ?? [];
	const repoName = getRepoName();
	const today = localToday();
	const skip = loadBlogSkipWeeks(repoName);
	const byWeek = groupCommitsByWeek(
		fetchCommitsAfter(ignore, resolveListAfterDate(options, today)),
	);

	const weeks = Array.from(byWeek.keys()).sort();
	if (!options.reverse) weeks.reverse();

	weeks.forEach((week, index) => {
		if (index > 0) console.log();
		printWeekHeader(week, {
			skipped: skip.has(week),
			inProgress: !isCompletedWeek(week, today),
			entry: loadDevEntry(repoName, week),
		});
		printCommitsWithFiles(
			byWeek.get(week) ?? [],
			ignore,
			options.verbose ?? false,
		);
	});
}
